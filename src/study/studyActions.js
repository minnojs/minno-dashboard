import messages from 'utils/messagesComponent';

import {lock_study, publish_study, duplicate_study, create_study, delete_study, rename_study, update_study, load_templates} from './studyModel';
import studyTemplatesComponent from './templates/studyTemplatesComponent';
import studyTagsComponent from '../tags/studyTagsComponent';
import createMessage from '../downloads/dataComp';


import {update_tags_in_study} from '../tags/tagsModel';
import {make_pulic} from './sharing/sharingModel';
import copyUrl from 'utils/copyUrl';

export let do_create = (type, studies) => {
    const study_name = m.prop('');
    const description = m.prop('');
    let templates = m.prop([]);
    let template_id = m.prop('');
    let reuse_id = m.prop('');
    let error = m.prop('');
    const isOpenServer = true;
    const study_type = m.prop('minno02');
    const isTemplate = type !== 'regular';

    let ask = () => messages.confirm({
        header: isTemplate ? 'New Template Study' : 'New Study',
        content: m.component({
            view: () => m('p', [
                m('.form-group', [
                    m('label', 'Enter Study Name:'),
                    m('input.form-control',  {oninput: m.withAttr('value', study_name)})
                ]),
                m('.form-group', [
                    m('label', 'Enter Study Description:'),
                    m('textarea.form-control',  {oninput: m.withAttr('value', description)})
                ]),
                isTemplate || !isOpenServer ? '' : m('.form-group', [
                    m('label', 'Pick Study Player:'),
                    m('select.c-select.form-control', { onchange: m.withAttr('value', study_type)}, [
                        m('option', {value:'minno02'}, 'MinnoJS v0.2'),
                        m('option', {value:'html'}, 'JSPysch (run any HTML)')
                    ])
                ]),
                !error() ? '' : m('p.alert.alert-danger', error()),
                !isTemplate ? '' : m('p', studyTemplatesComponent({load_templates, studies, reuse_id, templates, template_id}))
            ])
        })
    }).then(response => response && create());

    let create = () => create_study({study_name, study_type, description, type, template_id, reuse_id})
        .then(response => m.route(type == 'regular' ? `/editor/${response.study_id}` : `/translate/${response.study_id}`))
        .catch(e => {
            error(e.message);
            ask();
        });
    ask();
};

export const do_tags = (study) => e => {
    e.preventDefault();
    const study_id = study.id;
    const filter_tags = ()=>{return tag => tag.changed;};
    const tags = m.prop([]);
    messages.confirm({header:'Tags', content: studyTagsComponent({tags, study_id})})
        .then(function (response) {
            if (response){
                const new_tags = tags().filter(tag=> tag.used);
                study.tags = new_tags;
                tags(tags().filter(filter_tags()).map(tag=>(({text: tag.text, id: tag.id, used: tag.used}))));
                return update_tags_in_study(study_id, tags);
            }
        })
        .then(m.redraw);
};

export let do_data = (study) => e => {
    e.preventDefault();
    // let exps = get_exps[]);
    // console.log(exps);

    let study_id = study.id;
    let versions = study.versions;
    let exps = m.prop([]);
    let tags = m.prop([]);
    let dates = m.prop();

    let close = messages.close;
    messages.custom({header:'Data download', content: createMessage({tags, exps, dates, study_id, versions, close})})
        .then(m.redraw);
};


export let do_make_public = (study) => e =>
{
    e.preventDefault();
    let error = m.prop('');
    return messages.confirm({okText: ['Yes, make ', !study.is_public ? 'public' : 'private'], cancelText: ['No, keep ', !study.is_public ? 'private' : 'public' ], header:'Are you sure?', content:m('p', [m('p', !study.is_public
            ?
            'Making the study public will allow everyone to view the files. It will NOT allow others to modify the study or its files.'
            :
            'Making the study private will hide its files from everyone but you.'),
            m('span', {class: error() ? 'alert alert-danger' : ''}, error())])})
        .then(response => {
            if (response) make_pulic(study.id, !study.is_public)
                .then(study.is_public = !study.is_public)
                .then(m.redraw);
        });

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

export const update_study_description = (study) => e => {
    e.preventDefault();
    const study_description = m.prop(!study.description ? '' : study.description);
    const error = m.prop();

    const ask = () => messages.confirm({
        header:'Study Description',
        content: {
            view(){
                return m('div', [
                    m('textarea.form-control',  {placeholder: 'Enter description', value: study_description(), onchange: m.withAttr('value', study_description)}),
                    !error() ? '' : m('p.alert.alert-danger', error())
                ]);
            }
        }
    }).then(response => response && rename());

    const rename = () => update_study(study.id, {description:study_description()})
        .then(()=>study.description=study_description())
        .catch(e => {
            error(e.message);
            ask();
        })
        .then(m.redraw);

    ask();
};

export const do_rename = (study) => e => {
    e.preventDefault();
    let study_name = m.prop(study.name);
    let error = m.prop('');

    let ask = () => messages.confirm({
        header:'New Name',
        content: {
            view(){
                return m('div', [
                    m('input.form-control',  {placeholder: 'Enter Study Name', value: study_name(), onchange: m.withAttr('value', study_name)}),
                    !error() ? '' : m('p.alert.alert-danger', error())
                ]);
            }
        }
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
        !study.is_published
            ?
            'Unlocking the study will let you modifying the study. When a study is Unlocked, you can add files, delete files, rename files, edit files, rename the study, or delete the study.'
            :
            [
                m('p','Unlocking the study will let you modifying the study. When a study is Unlocked, you can add files, delete files, rename files, edit files, rename the study, or delete the study.'),
                m('p','However, the study is currently published so you might want to make sure participants are not taking it. We recommend unlocking a published study only if you know that participants are not taking it while you modify the files, or if you know exactly what you are going to change and you are confident that you will not make mistakes that will break the study.')
            ]
        :
        'Are you sure you want to lock the study? This will prevent you from modifying the study until you unlock the study again. When a study is locked, you cannot add files, delete files, rename files, edit files, rename the study, or delete the study.'),
        !error() ? '' : m('p.alert.alert-danger', error())])
    })

    .then(response => response && lock());

    const lock= () => lock_study(study.id, !study.is_locked)
        .then(() => study.is_locked = !study.is_locked)
        .then(() => study.isReadonly = study.is_locked)
        .then(callback)

        .catch(e => {
            error(e.message);
            ask();
        })
        .then(m.redraw);
    ask();
};

export let do_publish = (study, callback) => e => {
    e.preventDefault();
    let error = m.prop('');
    let update_url =m.prop('update');

    let ask = () => messages.confirm({okText: ['Yes, ', study.is_published ? 'Unpublish' : 'Publish' , ' the study'], cancelText: 'Cancel', header:[study.is_published ? 'Unpublish' : 'Publish', ' the study?'],
        content:m('p',
            [m('p', study.is_published
                ?
                'The launch URL participants used to run the study will be removed. Participants using this link will see an error page. Use it if you completed running the study, or if you want to pause the study and prevent participants from taking it for a while. You will be able to publish the study again, if you want.'
                :
                [
                    m('p', 'This will create a link that participants can use to launch the study.'),
                    m('p', 'Publishing locks the study for editing to prevent you from modifying the files while participants take the study. To make changes to the study, you will be able to unpublish it later.'),
                    m('p', 'Although it is strongly not recommended, you can also unlock the study after it is published by using Unlock Study in the Study menu.'),
                    m('p', 'After you publish the study, you can obtain the new launch URL by right clicking on the experiment file and choosing Experiment options->Copy Launch URL')

                    ,m('.input-group', [
                        m('select.c-select.form-control',{onchange: e => update_url(e.target.value)}, [
                            m('option', {value:'update', selected:true}, 'Update the launch URL'),
                            m('option', {value:'keep'}, 'Keep the launch URL'),
                            study.versions.length<2 ? '' : m('option', {value:'reuse'}, 'Use the launch URL from the previous published version')
                        ])
                    ])
                ]),
                !error() ? '' : m('p.alert.alert-danger', error())])
    })

        .then(response => response && publish());

    let publish= () => publish_study(study.id, !study.is_published, update_url)
        .then(res=>study.versions.push(res))
        .then(study.is_published = !study.is_published)
        .then(study.is_locked = study.is_published || study.is_locked)
        .then(study.isReadonly = study.is_locked)
        .then(callback)

        .catch(e => {
            error(e.message);
            ask();
        })
        .then(m.redraw);
    ask();
};

export const do_copy_url = study => copyUrl(study.base_url);
