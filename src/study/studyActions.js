import messages from 'utils/messagesComponent';

import {lock_study, duplicate_study, create_study, delete_study, rename_study, load_templates, get_exps} from './studyModel';
import studyTemplatesComponent from './templates/studyTemplatesComponent';
import studyTagsComponent from '../tags/studyTagsComponent';
import createMessage from '../downloads/dataComp';


import {update_tags_in_study} from '../tags/tagsModel';
import {getAll} from "../downloads/downloadsActions";
import {createDownload, STATUS_RUNNING} from "../downloads/downloadsModel";

export let do_create = (type, studies) => {
    let study_name = m.prop('');
    let templates = m.prop([]);
    let template_id = m.prop('');
    let reuse_id = m.prop('');
    let error = m.prop('');

    let ask = () => messages.confirm({
        header:type == 'regular' ? 'New Study' : 'New Template Study',
        content: m.component({view: () => m('p', [
            m('p', 'Enter Study Name:'),
            m('input.form-control',  {oninput: m.withAttr('value', study_name)}),
            !error() ? '' : m('p.alert.alert-danger', error()),
            m('p', type == 'regular' ? '' : studyTemplatesComponent({load_templates, studies, reuse_id, templates, template_id}))
        ])
    })}).then(response => response && create());

    let create = () => create_study(study_name, type, template_id, reuse_id)
        .then(response => m.route(type == 'regular' ? `/editor/${response.study_id}` : `/translate/${response.study_id}`))
        .catch(e => {
            error(e.message);
            ask();
        });
    ask();
};

export let do_tags = (study) => e => {
    e.preventDefault();
    let study_id = study.id;
    let  filter_tags = ()=>{return tag => tag.changed;};
    let tags = m.prop([]);
    messages.confirm({header:'Tags', content: studyTagsComponent({tags, study_id})})
        .then(function (response) {
            if (response){
                var new_tags = tags().filter(tag=> tag.used);
                study.tags = new_tags;
                tags(tags().filter(filter_tags()).map(tag=>(({text: tag.text, id: tag.id, used: tag.used}))));
                return update_tags_in_study(study_id, tags);
            }
        })
        .then(m.redraw);
};

export let do_data = (study) => e => {
    e.preventDefault();
    let output = m.prop();
    // let exps = get_exps[]);
    // console.log(exps);
    let study_id = study.id;
    let exps = m.prop([]);
    let tags = m.prop([]);
    let dates = m.prop();

    let close = messages.close;
    messages.custom({header:'Data download', content: createMessage({tags, exps, dates, study_id, close})})
        .then(function (response) {
            if (response){
                console.log(dates());
                // var new_tags = tags().filter(tag=> tag.used);
                // study.tags = new_tags;
                // tags(tags().filter(filter_tags()).map(tag=>(({text: tag.text, id: tag.id, used: tag.used}))));
                // return update_tags_in_study(study_id, tags);
            }
        })
        .then(m.redraw);
};


export let do_delete = (study) => e => {
    e.preventDefault();
    return messages.confirm({header:'Delete study', content:'Are you sure?'})
        .then(response => {
            if (response) delete_study(study.id)
                .then(()=>study.deleted=true)
                .catch(error => messages.alert({header: 'Delete study', content: m('p.alert.alert-danger', error.message)}))
                .then(m.redraw)
                .then(m.route('./'))
                ;

        });
};


export let do_rename = (study) => e => {
    e.preventDefault();
    let study_name = m.prop('');
    let error = m.prop('');

    let ask = () => messages.confirm({
        header:'New Name',
        content: m('div', [
            m('input.form-control',  {placeholder: 'Enter Study Name', onchange: m.withAttr('value', study_name)}),

            !error() ? '' : m('p.alert.alert-danger', error())
        ])
    }).then(response => response && rename());

    let rename = () => rename_study(study.id, study_name)
        .then(()=>study.name=study_name())
        .then(m.redraw)
        .catch(e => {
            error(e.message);
            ask();
        }).then(m.redraw);
    ask();
};

export let do_duplicate= (study, callback) => e => {
    e.preventDefault();
    let study_name = m.prop(study.name);
    let error = m.prop('');

    let ask = () => messages.confirm({
        header:'New Name',
        content: m('div', [
            m('input.form-control', {placeholder: 'Enter Study Name', onchange: m.withAttr('value', study_name)}),
            !error() ? '' : m('p.alert.alert-danger', error())
        ])
    }).then(response => response && duplicate());

    let duplicate= () => duplicate_study(study.id, study_name)
        .then(response => m.route( study.type=='regular' ? `/editor/${response.study_id}`: `/editor/${response.study_id}` ))
        .then(callback)
        .then(m.redraw)
        .catch(e => {
            error(e.message);
            ask();
        });
    ask();
};

export let do_lock = (study, callback) => e => {
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
        .then(study.isReadonly = study.is_locked)
        .then(callback)

        .catch(e => {
            error(e.message);
            ask();
        })
        .then(m.redraw);
    ask();
};



export let do_copy_url = (study) => e => {
    e.preventDefault();
    let copyFail = m.prop(false);
    let autoCopy = () => copy(study.base_url).catch(() => copyFail(true)).then(m.redraw);
    let ask = () => messages.alert({
        header: 'Copy URL',
        content: m('.card-block', [
            m('.form-group', [
                m('label', 'Copy Url by clicking Ctrl + C, or click the copy button.'),
                m('label.input-group',[
                    m('.input-group-addon', {onclick: autoCopy}, m('i.fa.fa-fw.fa-copy')),
                    m('input.form-control', { config: el => el.select(), value: study.base_url })
                ]),
                !copyFail() ? '' : m('small.text-muted', 'Auto copy will not work on your browser, you need to manually copy this url')
            ])
        ]),
        okText: 'Done'
    });
    ask();
};


function copy(text){
    return new Promise((resolve, reject) => {
        let input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();

        try {
            document.execCommand('copy');
        } catch(err){
            reject(err);
        }

        input.parentNode.removeChild(input);
    });
}
