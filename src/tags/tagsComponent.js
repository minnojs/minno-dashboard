import {get_tags, remove_tag, add_tag, edit_tag, view_create} from './tagsModel';
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
            messages.confirm({header:'Delete tag', content:'Are you sure?'})
                .then(response => {
                    if (response)
                        remove_tag(tag_id)
                            .then(()=> {
                                load();
                            })
                            .catch(error => {
                                ctrl.error(error.message);
                            })
                            .then(m.redraw);
                });
        }

        function edit(tag_id, tag_text, tag_color){
            ctrl.tag_text(tag_text);
            ctrl.tag_color(tag_color);

            messages.confirm({

                header:'Edit tag',
                content: m.component({view: () => view_create(ctrl)
                })})
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
        }

        function add(){
            ctrl.tag_text('');
            ctrl.tag_color('FFFFFF');
            messages.confirm({
                header:'Add a new tag',
                content: m.component({view: () => view_create(ctrl)
                })})
                .then(response => {
                    if (response)
                        add_tag(ctrl.tag_text, ctrl.tag_color)
                            .then(()=>{
                                ctrl.error('');
                                ctrl.tag_text('');
                                ctrl.tag_color('');
                                load();
                            })
                            .catch(error => {
                                ctrl.error(error.message);
                                add();
                            })
                            .then(m.redraw);
                });
        }
        load();
        return ctrl;
    },
    view(ctrl){
        return  !ctrl.loaded
            ?
            m('.loader')
            :
            m('.container', [
                m('.row',[
                    m('.col-sm-7', [
                        m('h3', 'Tags')
                    ]),
                    m('.col-sm-1', [
                        m('button.btn.btn-success.btn-sm.m-r-1', {onclick:ctrl.add}, [
                            m('i.fa.fa-plus'), '  Add new tag'
                        ])
                    ])
                ]),
                
                m('table', {class:'table table-striped table-hover'}, [
                    m('tbody', [
                        ctrl.tags().map(tag => m('tr', [
                            m('td.h3', m('button.strong',  {style: {'background-color': '#'+tag.color, 'border': '1px solid'}}, tag.text)),
                            m('td', m('button.btn.btn-secondary', {onclick:function() {ctrl.edit(tag.id, tag.text, tag.color);}}, 'Edit')),
                            m('td', m('button.btn.btn-danger', {onclick:function() {ctrl.remove(tag.id);}}, 'Remove'))
                        ]))

                    ])
                ])
            ]);
    }
};