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
    view: ({template_id, templates, loaded, error}) => m('div.space', [
        loaded() ? '' : m('.loader'),
        error() ? m('.alert.alert-warning', error().message): '',
        loaded() && !templates().length ? m('.alert.alert-info', 'There is no templates yet') : '',
        m('select.form-control', {value:template_id(), onchange: m.withAttr('value',template_id)}, [
            m('option',{value:'', disabled: true}, 'Select template'),
            templates().filter(ownerFilter()).sort(sort_studies).map(study =>
            m('option',{value:study.id}, study.name))
        ])
    ])
};

function sort_studies(study_1, study_2){return study_1.name.toLowerCase() === study_2.name.toLowerCase() ? 0 : study_1.name.toLowerCase() > study_2.name.toLowerCase() ? 1 : -1;}

let ownerFilter = () => study => {
    return study.permission == 'owner';
};
