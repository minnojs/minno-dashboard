import {getStrings, saveStrings} from './translateModel';

export default pageComponent;

let pageComponent = {
    controller(){
        const pageId = m.route.param('pageId');
        let ctrl = {
            strings:m.prop(),
            loaded:false,
            error:m.prop(''),
            pageId,
            save
        };

        function load(pageId) {
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

        load(m.route.param('pageId'));
        return ctrl;
    },
    view({loaded, strings, save}){
        if (!loaded) return m('.loader');
        return m('.container.translate-page', [
            m('.row',[
                m('.col-sm-7',
                    m('h3', 'Template Studies')
                )
            ]),
            !strings().length
            ? m('.alert.alert-info', 'You have no pages yet')
            :
            m('.row', [
                m('.list-group.col-sm-10', [
                    strings().map(string => m('.list-group-item', [
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
                    m('a.button.btn.btn-secondery.col-sm-1', {href: '/translate', config: m.route},'Back'),
                    m('button.btn.btn-primary.col-sm-1', {onclick: save},'Update')
                ])
            ])

        ]);
    }
};


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