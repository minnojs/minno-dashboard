import {getListOfPages} from './translateModel';
import fullheight from 'utils/fullHeight';
import splitPane from 'utils/splitPane';
import {getStrings, saveStrings} from './translateModel';
import classNames from 'utils/classNames';
import textareaAutoresize from 'utils/textareaAutoresize';

export default pagesComponent;

let pagesComponent = {
    controller(){
        const templateId = m.route.param('templateId');
        const pageId = m.route.param('pageId');
        let ctrl = {
            pages:m.prop(),
            study_name:m.prop(),
            strings:m.prop(),
            loaded:false,
            has_changed:m.prop(false),
            error:m.prop(''),
            pageId,
            templateId,
            save,
            onunload
        };

        function load() {
            getListOfPages(templateId)
                .then(response => {
                    ctrl.pages(response.pages);
                    ctrl.study_name(response.study_name);
                    ctrl.loaded = true;
                })
                .catch(error => {
                    ctrl.error(error.message);
                }).then(m.redraw);
            if(pageId)
                getStrings(templateId, pageId)
                    .then(response => {
                        ctrl.strings(response.strings.map(propifyTranslation).map(propifyChanged));
                        ctrl.loaded = true;

                    })
                    .catch(error => {
                        ctrl.error(error.message);
                    }).then(m.redraw);

        }
        function save() {
            ctrl.has_changed(false);
            let changed_studies = ctrl.strings().filter(changedFilter());
            if(!changed_studies.length)
                return;
            saveStrings(changed_studies, templateId, pageId)
                .then(()=>load());
        }
        load();

        function beforeunload(event) {
            if (ctrl.has_changed())
                event.returnValue = 'You have unsaved data are you sure you want to leave?';
        }

        function onunload(e){
            if (ctrl.has_changed() && !window.confirm('You have unsaved data are you sure you want to leave?')){
                e.preventDefault();
            } else {
                window.removeEventListener('beforeunload', beforeunload);
            }
        }
        return ctrl;
    },
    view({loaded, pages, strings, save, templateId, pageId, study_name, has_changed}){
        return m('.study',  [
            !loaded ? m('.loader') : splitPane({
                leftWidth,
                left:m('div.translate-page', [
                    m('h5', m('a.no-decoration',  ` ${study_name()}`)),
                    m('.files', [
                        m('ul', pages().map(page =>m('li.file-node',{onclick: select(templateId, page)}, [
                            m('a.wholerow',{
                                unselectable:'on',
                                class:classNames({
                                    'current': page.pageName===pageId
                                })
                            }, m.trust('&nbsp;')),

                            m('a', {class:classNames({'text-primary': /\.expt\.xml$/.test(page.pageName)})}, [
                                // icon
                                m('i.fa.fa-fw.fa-file-o.fa-files-o', {
                                }),
                                // page name
                                m('span', ` ${page.pageName}`)
                            ])
                        ])))
                    ])
                ]),
                right:  !strings()
                    ?  m('.centrify', [
                        m('i.fa.fa-smile-o.fa-5x'),
                        m('h5', 'Please select a page to start working')
                    ])
                    :
                    [
                        m('.study',
                        m('.editor',
                        m('.btn-toolbar.editor-menu', [
                            m('.file-name', {class: has_changed() ? 'text-danger' : ''},
                                m('span',{class: has_changed() ? '' : 'invisible'}, '*'),
                                pageId
                            ),
                            m('.btn-group.btn-group-sm.pull-xs-right', [
                                m('a.btn.btn-secondary', { title:'Save', onclick:save
                                    , class: classNames({'btn-danger-outline' : has_changed(), 'disabled': !has_changed()})
                                },[
                                    m('strong.fa.fa-save')
                                ])]
                        )]))),
                        m('div.translate-page', {config: fullheight},
                        [strings().map(string => m('.list-group-item', [
                            m('.row', [
                                m('.col-sm-5', [
                                    m('span',  string.text),
                                    m('p.small.text-muted.m-y-0', string.comment)
                                ]),
                                m('.col-sm-7', [
                                    m('textarea.form-control', {
                                        placeholder: 'translation',
                                        oninput: m.withAttr('value', function(value){string.translation(value); has_changed(true); string.changed=true; }),
                                        onchange: m.withAttr('value', function(value){string.translation(value); has_changed(true); string.changed=true; }),
                                        config: textareaAutoresize
                                    }, string.translation())
                                ])

                                // ,m('.col-sm-6', [
                                //     m('input.form-control', {
                                //         type:'text',
                                //         placeholder: 'translation',
                                //         value: string.translation(),
                                //         oninput: m.withAttr('value', function(value){string.translation(value); string.changed=true; has_changed(true);}),
                                //         onchange: m.withAttr('value', function(value){string.translation(value); string.changed=true; has_changed(true);}),
                                //         config: getStartValue(string.translation)
                                //     })
                                // ])
                            ])
                        ]))
                ])

                    ]
            })
        ]);
    }
};

// a clone of m.prop that users localStorage so that width changes persist across sessions as well as files.
// Essentially this is a global variable
function leftWidth(val){
    if (arguments.length) localStorage.fileSidebarWidth = val;
    return localStorage.fileSidebarWidth;
}
// function do_onchange(string){
//     m.withAttr('value', string.translation);
// }


function propifyTranslation(obj){
    obj = Object.assign({}, obj); // copy obj
    obj.translation = m.prop(obj.translation);
    return obj;
}

function propifyChanged(obj) {
    obj.changed = false;
    return obj;
}


let changedFilter = () => string => {
    return string.changed==true;
};

const select = (templateId, page) => e => {
    e.stopPropagation();
    e.preventDefault();
    m.route(`/translate/${templateId}/${page.pageName}`);
};
