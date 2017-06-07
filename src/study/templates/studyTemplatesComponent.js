import {} from '../studyModel';
export default args => m.component(studyTemplatesComponent, args);

let studyTemplatesComponent = {
    controller({load_templates, templates, template_id}){
        let loaded = m.prop(false);
        let error = m.prop(null);
        load_templates()
            .then(response => templates(response.templates))
            .catch(error)
            .then(loaded.bind(null, true))
            .then(m.redraw);
        return {template_id, templates, loaded, error};
    },
    view: ({template_id, templates, loaded, error}) => m('div', [
        loaded() ? '' : m('.loader'),
        error() ? m('.alert.alert-warning', error().message): '',
        loaded() && !templates().length ? m('.alert.alert-info', 'You have no tags yet') : '',
        m('.custom-controls-stacked.pre-scrollable', templates().filter(ownerFilter()).sort(sort_studies).map(study => m('label.custom-control.custom-checkbox', [
            m('input.custom-control-input', {
                type: 'radio',
                name:'template',
                onclick: function(){
                    template_id(study.id);
                }
            }),
            m('span.custom-control-indicator'),
            m('span.custom-control-description.m-l-1', study.name)
        ])))
    ])
};

function sort_studies(study_1, study_2){return study_1.name.toLowerCase() === study_2.name.toLowerCase() ? 0 : study_1.name.toLowerCase() > study_2.name.toLowerCase() ? 1 : -1;}

let ownerFilter = () => study => {
    return study.permission == 'owner';
};
