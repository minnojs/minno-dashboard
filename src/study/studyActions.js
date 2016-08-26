import messages from 'utils/messagesComponent';
import {create_study, delete_study, rename_study} from './studyModel';
import {get_tags_for_study, toogle_tag_to_study} from '../tags/tagsModel';

export let do_create = () => {
    let study_name = m.prop('');
    let error = m.prop('');

    let ask = () => messages.prompt({
        header:'New Study', 
        content: m('div', [
            m('p', 'Enter Study Name:'),
            !error() ? '' : m('p.alert.alert-danger', error())
        ]),
        prop: study_name
    }).then(response => response && create());
    
    let create = () => create_study(study_name)
        .then(response => m.route('/editor/'+response.study_id))
        .catch(e => {
            error(e.message);
            ask();
        });

    // activate creation
    ask();
};




export let do_tags = (study_id, callback) => () =>
{
    let tags = m.prop([]);
    get_tags_for_study(study_id)
        .then(response => {
            tags(response.tags);
            messages.alert({header:'Tags', content:[
                m('input.form-control', {placeholder: 'Search ...'}),
                m('button.btn.btn-success.btn-sm', [
                    m('i.fa.fa-plus'), '  Add new tad'
                ]),
                tags().sort(function (tag_1, tag_2){return tag_1.text.toLowerCase() === tag_2.text.toLowerCase() ? 0 : tag_1.text.toLowerCase() > tag_2.text.toLowerCase() ? 1 : -1;}).map(tag =>
                    [
                        m('p',
                            [m('input', {
                                type: 'checkbox',
                                checked: tag.used,
                                onclick: function(){
                                    tag.used = !tag.used;
                                    toogle_tag_to_study(study_id, tag.id, tag.used)
                                    .then(callback);
                                }

                            }), tag.text])
                    ]
                )
            ]});
        });
};

export let do_delete = (study_id, callback) => () => messages.confirm({header:'Delete study', content:'Are you sure?'})
    .then(response => {
        if (response) delete_study(study_id)
            .then(callback)
            .then(m.redraw)
            .catch(error => messages.alert({header: 'Delete study', content: m('p.alert.alert-danger', error.message)}))
            .then(m.redraw);
    });


export let do_rename = (study_id, name, callback) => () => {
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