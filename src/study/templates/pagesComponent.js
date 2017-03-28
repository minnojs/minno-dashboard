import {getListOfPages} from './translateModel';
import fullheight from 'utils/fullHeight';
import splitPane from 'utils/splitPane';
import {getStrings, saveStrings} from './translateModel';
import classNames from 'utils/classNames';

export default tagsComponent;

let tagsComponent = {
    controller(){
        const pageId = m.route.param('pageId');

        let ctrl = {
            pages:m.prop(),
            strings:m.prop(),
            loaded:false,
            error:m.prop(''),
            pageId,
            save
        };

        function load() {
            getListOfPages()
                .then(response => {
                    ctrl.pages(response.pages);
                    ctrl.loaded = true;
                })
                .catch(error => {
                    ctrl.error(error.message);
                }).then(m.redraw);
            if(pageId)
                getStrings(pageId)
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
            saveStrings(changed_studies, pageId)
                .then(()=>load());
        }
        load();
        return ctrl;
    },
    view({loaded, pages, strings, save, pageId}){
        return m('.study', {config: fullheight},  [
            !loaded ? m('.loader') : splitPane({
                leftWidth,
                left: m('.files', [
                    m('ul', pages().map(page =>m('li.file-node', [
                        m('a.wholerow',{
                            unselectable:'on',
                            class:classNames({
                                'current': page.pageId===pageId
                            }),
                            href: `/translate/${page.pageId}`, config: m.route }, ` ${page.pageName}`),
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
                                m('span.study-tag',  string.text)
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