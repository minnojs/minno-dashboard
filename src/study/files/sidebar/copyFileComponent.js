import {load_studies} from 'study/studyModel';

export default args => m.component(copyFileComponent, args);

let copyFileComponent = {
    controller({new_study_id, study_id}){
        let studies = m.prop([]);
        let loaded = m.prop(false);
        let error = m.prop(null);
        load_studies()
            .then(response => studies(response.studies))
            .catch(error)
            .then(loaded.bind(null, true))
            .then(m.redraw);
        return {studies, study_id, new_study_id, loaded, error};
    },
    view: ({studies, study_id, new_study_id, loaded, error}) => m('div', [
        loaded() ? '' : m('.loader'),
        error() ? m('.alert.alert-warning', error().message): '',

        loaded() && !studies().length ? m('.alert.alert-info', 'You have no studies yet') : '',

        m('select.form-control', {value:new_study_id(), onchange: m.withAttr('value',new_study_id)}, [
            m('option',{value:'', disabled: true}, 'Select Study'),
            studies().filter(study => !study.is_locked && !study.is_public && study.permission!=='read only' && study.id!=study_id()).map(study =>
            m('option',{value:study.id, selected: new_study_id() === study.id}, study.name))
        ])
    ])
};

