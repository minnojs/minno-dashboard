import messages from 'utils/messagesComponent';
import {lock_study, duplicate_study, create_study, delete_study, rename_study, load_templates} from './studyModel';
import studyTemplatesComponent from './templates/studyTemplatesComponent';
import studyTagsComponent from '../tags/studyTagsComponent';
import {update_tags_in_study} from '../tags/tagsModel';

export let do_create = (type) => {
    let study_name = m.prop('');
    let templates = m.prop([]);
    let template_id = m.prop('');

    let error = m.prop('');



    let ask = () => messages.confirm({
        header:type == 'regular' ? 'New Study' : 'New Template Study',
        content: m.component({view: () => m('p', [
            m('p', 'Enter Study Name:'),
            m('input.form-control',  {oninput: m.withAttr('value', study_name)}),
            !error() ? '' : m('p.alert.alert-danger', error()),
            m('p', type == 'regular' ? '' : studyTemplatesComponent({load_templates, templates, template_id}))
        ])
    })}).then(response => response && create());

    let create = () => create_study(study_name, type, template_id)
        .then(response => m.route(type == 'regular' ? `/editor/${response.study_id}` : `/translate/${response.study_id}`))
        .catch(e => {
            error(e.message);
            ask();
        });
    ask();
};

export let do_tags = ({study_id, loadTags, callback}) => e => {
    e.preventDefault();
    let  filter_tags = ()=>{return tag => tag.changed;};
    let tags = m.prop([]);
    messages.confirm({header:'Tags', content: studyTagsComponent({loadTags, tags, study_id, callback})})
        .then(function (response) {
            if (response)
                update_tags_in_study(study_id, tags().filter(filter_tags()).map(tag=>(({id: tag.id, used: tag.used})))).then(callback);
        });
};


export let do_delete = (study_id, callback) => e => {
    e.preventDefault();
    return messages.confirm({header:'Delete study', content:'Are you sure?'})
        .then(response => {
            if (response) delete_study(study_id)
                .then(callback)
                .then(m.redraw)
                .catch(error => messages.alert({header: 'Delete study', content: m('p.alert.alert-danger', error.message)}))
                .then(m.redraw);
        });
};


export let do_rename = (study_id, name, callback) => e => {
    e.preventDefault();
    let study_name = m.prop(name);
    let error = m.prop('');

    let ask = () => messages.confirm({
        header:'New Name',
        content: m('div', [
            m('input.form-control', {placeholder: 'Enter Study Name', value: study_name(), onchange: m.withAttr('value', study_name)}),
            !error() ? '' : m('p.alert.alert-danger', error())
        ])
    }).then(response => response && rename());

    let rename = () => rename_study(study_id, study_name)
        .then(callback.bind(null, study_name()))
        .then(m.redraw)
        .catch(e => {
            error(e.message);
            ask();
        });

    // activate creation
    ask();
};

export let do_duplicate= (study_id, name, type) => e => {
    e.preventDefault();
    let study_name = m.prop(name);
    let error = m.prop('');

    let ask = () => messages.confirm({
        header:'New Name',
        content: m('div', [
            m('input.form-control', {placeholder: 'Enter Study Name', value: '', onchange: m.withAttr('value', study_name)}),
            !error() ? '' : m('p.alert.alert-danger', error())
        ])
    }).then(response => response && duplicate());

    let duplicate= () => duplicate_study(study_id, study_name, type)
        .then(response => m.route( type==='regular' ? `/editor/${response.study_id}`: `/editor/${response.study_id}` ))
        .then(m.redraw)
        .catch(e => {
            error(e.message);
            ask();
        });
    ask();
};

export let do_lock = (study) => e => {
    e.preventDefault();
    let error = m.prop('');

    let ask = () => messages.confirm({okText: ['Yes, ', study.is_locked ? 'unlock' : 'lock' , ' the study'], cancelText: 'Cancel', header:'Are you sure?', content:m('p', [m('p', study.is_locked
        ?
        'Unlocking the study will let you modifying the study. When a study is Unlocked, you can add files, delete files, rename files, edit files, rename the study, or delete the study.'
        :
        'Are you sure you want to lock the study? This will prevent you from modifying the study until you unlock the study again. When a study is locked, you cannot add files, delete files, rename files, edit files, rename the study, or delete the study.'),
        !error() ? '' : m('p.alert.alert-danger', error())])
    })

    .then(response => response && lock());

    let lock= () => lock_study(study.id, !study.is_locked)
        .then(study.is_locked = !study.is_locked)
        .catch(e => {
            error(e.message);
            ask();
        })
        .then(m.redraw);
    ask();
};
