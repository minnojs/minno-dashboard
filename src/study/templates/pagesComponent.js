import {getListOfPages} from './translateModel';
import fullheight from 'utils/fullHeight';
import splitPane from 'utils/splitPane';
import {getStrings, saveStrings} from './translateModel';
import classNames from 'utils/classNames';

export default pagesComponent;

let pagesComponent = {
    controller(){
        const templateId = m.route.param('templateId');
        const pageId = m.route.param('pageId');

        let ctrl = {
            pages:m.prop(),
            strings:m.prop(),
            loaded:false,
            error:m.prop(''),
            pageId,
            templateId,
            save
        };

        function load() {
            getListOfPages(templateId)
                .then(response => {
                    ctrl.pages(response.pages);
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
            let changed_studies = ctrl.strings().filter(changedFilter());
            if(!changed_studies.length)
                return;
            saveStrings(changed_studies, templateId, pageId)
                .then(()=>load());
        }
        load();
        return ctrl;
    },
    view({loaded, pages, strings, save, templateId, pageId}){
        return m('.study', {config: fullheight},  [
            !loaded ? m('.loader') : splitPane({
                leftWidth,
                left: m('.files', [
                    m('ul', pages().map(page =>m('li.file-node', [
                        m('a.wholerow',{
                            unselectable:'on',
                            class:classNames({
                                'current': page.pageName===pageId
                            }),
                            href: `/translate/${templateId}/${page.pageName}/`, config: m.route }, ` ${page.pageName}`),
                        m('i.fa fa-fw')

                    ])))]),
                right:  !strings()
                    ?  m('.centrify', [
                        m('i.fa.fa-smile-o.fa-5x'),
                        m('h5', 'Please select a page to start working')
                    ])
                    :[strings().map(string => m('.list-group-item', [
                        m('.row', [
                            m('.col-sm-6', [
                                m('span.templae_text',  string.text)
                            ]),
                            m('.col-sm-6', [
                                m('input.form-control', {
                                    type:'text',
                                    placeholder: 'translation',
                                    value: string.translation(),
                                    oninput: m.withAttr('value', function(value){string.translation(value); string.changed=true;}),
                                    onchange: m.withAttr('value', function(value){string.translation(value); string.changed=true;}),
                                    config: getStartValue(string.translation)
                                })

                            ])
                        ])
                    ])),

            m('button.btn.btn-primary.col-sm-1', {onclick: save},'Update')
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

function getStartValue(prop){
    return (element, isInit) => {// !isInit && prop(element.value);
        if (!isInit) setTimeout(()=>prop(element.value), 30);
    };
}

let changedFilter = () => string => {
    return string.changed==true;
};