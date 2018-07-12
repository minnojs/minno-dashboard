import messages from 'utils/messagesComponent';

import {lock_study, publish_study, duplicate_study, create_study, delete_study, rename_study, load_templates} from './studyModel';
import studyTemplatesComponent from './templates/studyTemplatesComponent';
import studyTagsComponent from '../tags/studyTagsComponent';
import createMessage from '../downloads/dataComp';


import {update_tags_in_study} from '../tags/tagsModel';

export let do_create = (type, studies) => {
    let study_name = m.prop('');
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
                isTemplate || !isOpenServer ? '' : m('.form-group', [
                    m('label', 'Pick Study Player:'),
                    m('select.c-select.form-control', { onchange: m.withAttr('value', study_type)}, [
                        m('option', {value:'minno02'}, 'MinnoJS v0.2'),
                        m('option', {value:'html'}, 'Custom (run any HTML)')
                    ])
                ]),
                !error() ? '' : m('p.alert.alert-danger', error()),
                !isTemplate ? '' : m('p', studyTemplatesComponent({load_templates, studies, reuse_id, templates, template_id}))
            ])
        })
    }).then(response => response && create());

    let create = () => create_study({study_name, study_type, type, template_id, reuse_id})
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
    // let exps = get_exps[]);
    // console.log(exps);
    let study_id = study.id;
    let exps = m.prop([]);
    let tags = m.prop([]);
    let dates = m.prop();

    let close = messages.close;
    messages.custom({header:'Data download', content: createMessage({tags, exps, dates, study_id, close})})
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
