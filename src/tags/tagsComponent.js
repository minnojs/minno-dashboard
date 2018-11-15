import {get_tags, remove_tag, add_tag, edit_tag} from './tagsModel';
import {editTag} from './tagsActions';
import messages from 'utils/messagesComponent';

export default tagsComponent;

let tagsComponent = {
    controller(){
        let ctrl = {
            tags:m.prop(),
            tag_text:m.prop(''),
            tag_color:m.prop(''),
            loaded:false,
            error:m.prop(''),
            remove,
            add,
            edit
        };

        function load() {
            get_tags()
                .then(response => {
                    ctrl.tags(response.tags);
                    ctrl.loaded = true;
                })
                .catch(error => {
                    ctrl.error(error.message);
                }).then(m.redraw);
        }

        function remove(tag_id){
            return () => messages.confirm({header:'Delete tag', content:'Are you sure?'})
                .then(response => {
                    if (response)
                        remove_tag(tag_id)
                            .then(load)
                            .catch(error => {
                                ctrl.error(error.message);
                            })
                            .then(m.redraw);
                });
        }

        function edit(tag_id, tag_text, tag_color){
            return () => {
                ctrl.tag_text(tag_text);
                ctrl.tag_color(tag_color);

                messages.confirm({
                    header:'Edit tag',
                    content: editTag(ctrl)
                })
                    .then(response => {
                        if (response)
                            edit_tag(tag_id, ctrl.tag_text, ctrl.tag_color)
                                .then(()=>{
                                    ctrl.error('');
                                    ctrl.tag_text('');
                                    ctrl.tag_color('');
                                    load();
                                })
                                .catch(error => {
                                    ctrl.error(error.message);
                                    edit_tag(tag_id, ctrl.tag_text, ctrl.tag_color);
                                })
                                .then(m.redraw);
                    });
            };
        }

        function add(){
            ctrl.tag_text('');
            ctrl.tag_color('E7E7E7');
            messages.confirm({
                header:'Add a new tag',
                content: editTag(ctrl)
            })
                .then(response => {
                    if (response) add_tag(ctrl.tag_text, ctrl.tag_color)
                        .then(()=>{
                            ctrl.error('');
                            ctrl.tag_text('');
                            ctrl.tag_color('');
                            load();
                        })
                        .catch(error => {
                            ctrl.error(error.message);
                            add(); // retry
                        })
                        .then(m.redraw);
                });
        }

        load();
        return ctrl;
    },
    view({loaded, add, tags,edit,remove}){
        if (!loaded) return m('.loader');

        return m('.container.tags-page', [
            m('.row',[
                m('.col-sm-7', [
                    m('h3', 'Tags')
                ]),
                m('.col-sm-5', [
                    m('button.btn.btn-success.btn-sm.pull-right', {onclick:add}, [
                        m('i.fa.fa-plus'), '  Create new tag'
                    ])
                ])
            ]),

            !tags().length
                ? m('.alert.alert-info', 'You have no tags yet') 
                : m('.row', [
                    m('.list-group.col-sm-6', [
                        tags().map(tag => m('.list-group-item', [
                            m('.row', [
                                m('.col-sm-6', [
                                    m('span.study-tag',  {style: {'background-color': '#'+tag.color}}, tag.text)
                                ]),
                                m('.col-sm-6', [
                                    m('btn-group', [
                                        m('a.btn.btn-sm.btn-secondary', {onclick:edit(tag.id, tag.text, tag.color)}, [
                                            m('i.fa.fa-edit'),
                                            ' Edit'
                                        ]),
                                        m('a.btn.btn-sm.btn-secondary', {onclick:remove(tag.id)}, [
                                            m('i.fa.fa-remove'),
                                            ' Remove'
                                        ])
                                    ])
                                ])
                            ])
                        ]))
                    ])
                ])
        ]);
    }
};
