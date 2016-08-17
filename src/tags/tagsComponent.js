import {get_tags, remove_tag, add_tag, edit_tag} from './tagsModel';
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
                content: m.component({view: () => m('p', [
                    m('input.form-control', {placeholder: 'tag_text', value: ctrl.tag_text(), oninput: m.withAttr('value', ctrl.tag_text)}),

                    m('p',[
                        m('span',  {style: {'background-color': '#E7E7E7', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('E7E7E7');}}, ' A '),
                        m('span',  {style: {'background-color': '#B6CFF5', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('B6CFF5');}}, ' A '),
                        m('span',  {style: {'background-color': '#98D7E4', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('98D7E4');}}, ' A '),
                        m('span',  {style: {'background-color': '#E3D7FF', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('E3D7FF');}}, ' A '),
                        m('span',  {style: {'background-color': '#FBD3E0', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FBD3E0');}}, ' A '),
                        m('span',  {style: {'background-color': '#F2B2A8', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('F2B2A8');}}, ' A ')
                    ]),
                    m('p',[
                        m('span',  {style: {'background-color': '#C2C2C2', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('C2C2C2');}}, ' A '),
                        m('span',  {style: {'background-color': '#4986E7', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('4986E7');}}, ' A '),
                        m('span',  {style: {'background-color': '#2DA2BB', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('2DA2BB');}}, ' A '),
                        m('span',  {style: {'background-color': '#B99AFF', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('B99AFF');}}, ' A '),
                        m('span',  {style: {'background-color': '#F691B2', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('F691B2');}}, ' A '),
                        m('span',  {style: {'background-color': '#FB4C2F', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FB4C2F');}}, ' A ')
                    ]),
                    m('p',[
                        m('span',  {style: {'background-color': '#FFC8AF', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FFC8AF');}}, ' A '),
                        m('span',  {style: {'background-color': '#FFDEB5', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FFDEB5');}}, ' A '),
                        m('span',  {style: {'background-color': '#FBE9E7', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FBE9E7');}}, ' A '),
                        m('span',  {style: {'background-color': '#FDEDC1', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FDEDC1');}}, ' A '),
                        m('span',  {style: {'background-color': '#B3EFD3', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('B3EFD3');}}, ' A '),
                        m('span',  {style: {'background-color': '#A2DCC1', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('A2DCC1');}}, ' A ')
                    ]),
                    m('p',[
                        m('span',  {style: {'background-color': '#FF7537', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FF7537');}}, ' A '),
                        m('span',  {style: {'background-color': '#FFAD46', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FFAD46');}}, ' A '),
                        m('span',  {style: {'background-color': '#EBDBDE', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('EBDBDE');}}, ' A '),
                        m('span',  {style: {'background-color': '#CCA6AC', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('CCA6AC');}}, ' A '),
                        m('span',  {style: {'background-color': '#42D692', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('42D692');}}, ' A '),
                        m('span',  {style: {'background-color': '#16A765', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('16A765');}}, ' A ')
                    ]),

                    m('span.h3',  {style: {'background-color': '#' + ctrl.tag_color()}}, ctrl.tag_text()),

                    m('p', {class: ctrl.error()? 'alert alert-danger' : ''}, ctrl.error())
                ])
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
            ctrl.tag_color('FFFFFF');
            messages.confirm({
                header:'Add a new tag',
                content: m.component({view: () => m('p', [
                    m('input.form-control', {placeholder: 'tag_text', value: ctrl.tag_text(), oninput: m.withAttr('value', ctrl.tag_text)}),
                    m('p',[
                        m('span',  {style: {'background-color': '#E7E7E7', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('E7E7E7');}}, ' A '),
                        m('span',  {style: {'background-color': '#B6CFF5', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('B6CFF5');}}, ' A '),
                        m('span',  {style: {'background-color': '#98D7E4', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('98D7E4');}}, ' A '),
                        m('span',  {style: {'background-color': '#E3D7FF', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('E3D7FF');}}, ' A '),
                        m('span',  {style: {'background-color': '#FBD3E0', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FBD3E0');}}, ' A '),
                        m('span',  {style: {'background-color': '#F2B2A8', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('F2B2A8');}}, ' A ')
                    ]),
                    m('p',[
                        m('span',  {style: {'background-color': '#C2C2C2', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('C2C2C2');}}, ' A '),
                        m('span',  {style: {'background-color': '#4986E7', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('4986E7');}}, ' A '),
                        m('span',  {style: {'background-color': '#2DA2BB', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('2DA2BB');}}, ' A '),
                        m('span',  {style: {'background-color': '#B99AFF', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('B99AFF');}}, ' A '),
                        m('span',  {style: {'background-color': '#F691B2', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('F691B2');}}, ' A '),
                        m('span',  {style: {'background-color': '#FB4C2F', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FB4C2F');}}, ' A ')
                    ]),
                    m('p',[
                        m('span',  {style: {'background-color': '#FFC8AF', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FFC8AF');}}, ' A '),
                        m('span',  {style: {'background-color': '#FFDEB5', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FFDEB5');}}, ' A '),
                        m('span',  {style: {'background-color': '#FBE9E7', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FBE9E7');}}, ' A '),
                        m('span',  {style: {'background-color': '#FDEDC1', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FDEDC1');}}, ' A '),
                        m('span',  {style: {'background-color': '#B3EFD3', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('B3EFD3');}}, ' A '),
                        m('span',  {style: {'background-color': '#A2DCC1', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('A2DCC1');}}, ' A ')
                    ]),
                    m('p',[
                        m('span',  {style: {'background-color': '#FF7537', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FF7537');}}, ' A '),
                        m('span',  {style: {'background-color': '#FFAD46', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FFAD46');}}, ' A '),
                        m('span',  {style: {'background-color': '#EBDBDE', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('EBDBDE');}}, ' A '),
                        m('span',  {style: {'background-color': '#CCA6AC', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('CCA6AC');}}, ' A '),
                        m('span',  {style: {'background-color': '#42D692', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('42D692');}}, ' A '),
                        m('span',  {style: {'background-color': '#16A765', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('16A765');}}, ' A ')
                    ]),

                    m('span.h3',  {style: {'background-color': '#' + ctrl.tag_color()}}, ctrl.tag_text()),

                    m('p', {class: ctrl.error()? 'alert alert-danger' : ''}, ctrl.error())
                ])
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
                            m('td.h3', m('span.strong',  {style: {'background-color': '#'+tag.color, 'border': '1px solid'}}, tag.text)),
                            m('td', m('button.btn.btn-secondary', {onclick:function() {ctrl.edit(tag.id, tag.text, tag.color);}}, 'Edit')),
                            m('td', m('button.btn.btn-danger', {onclick:function() {ctrl.remove(tag.id);}}, 'Remove'))
                        ]))

                    ])
                ])
            ]);
    }
};