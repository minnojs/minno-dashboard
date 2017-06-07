import {get_collaborations, remove_collaboration, add_collaboration, make_pulic, add_link, edit_link} from './sharingModel';
import messages from 'utils/messagesComponent';

export default collaborationComponent;

let collaborationComponent = {
    controller(){
        let ctrl = {
            users:m.prop(),
            is_public:m.prop(),

            link_data:m.prop(),
            link:m.prop(''),
            link_type:m.prop(''),
            link_list:m.prop([]),
            link_add_list:m.prop([]),
            link_remove_list:m.prop([]),
            study_name:m.prop(),
            user_name:m.prop(''),
            permission:m.prop(''),
            loaded:false,
            col_error:m.prop(''),
            pub_error:m.prop(''),
            remove,
            do_add_collaboration,
            do_add_link,
            do_edit_link,
            view_link,
            add_to_link,
            remove_from_link,
            do_make_public
        };
        function load() {
            get_collaborations(m.route.param('studyId'))
                .then(response =>{ctrl.users(response.users);
                    ctrl.is_public(response.is_public);
                    ctrl.study_name(response.study_name);
                    ctrl.link(response.link_data.link);
                    ctrl.link_type(response.link_data.link_type);
                    ctrl.link_list(response.link_data.link_list);

                    ctrl.loaded = true;})
                .catch(error => {
                    ctrl.col_error(error.message);
                }).then(m.redraw);

        }
        function remove(user_id){
            messages.confirm({header:'Delete collaboration', content:'Are you sure?'})
                .then(response => {
                    if (response)
                        remove_collaboration(m.route.param('studyId'), user_id)
                            .then(()=> {
                                load();
                            })
                            .catch(error => {
                                ctrl.col_error(error.message);
                            })
                            .then(m.redraw);
                });
        }

        function do_add_collaboration()
        {
            messages.confirm({
                header:'Add a Collaborator',
                content: m.component({view: () => m('p', [
                    m('p', 'Enter collaborator\'s user name:'),
                    m('input.form-control', {placeholder: 'User name', value: ctrl.user_name(), onchange: m.withAttr('value', ctrl.user_name)}),
                    m('select.form-control', {value:ctrl.permission(), onchange: m.withAttr('value',ctrl.permission)}, [
                        m('option',{value:'', disabled: true}, 'Permission'),
                        m('option',{value:'can edit', selected: ctrl.permission() === 'can edit'}, 'Can edit'),
                        m('option',{value:'read only', selected: ctrl.permission() === 'read only'}, 'Read only')
                    ]),
                    m('p', {class: ctrl.col_error()? 'alert alert-danger' : ''}, ctrl.col_error())
                ])
                })})
                .then(response => {
                    if (response)
                        add_collaboration(m.route.param('studyId'), ctrl.user_name, ctrl.permission)
                            .then(()=>{
                                ctrl.col_error('');
                                load();
                            })
                            .catch(error => {
                                ctrl.col_error(error.message);
                                do_add_collaboration();
                            })
                            .then(m.redraw);
                });
        }



        function add_to_link(user_name)
        {
            if(!user_name)
                return;
            ctrl.link_list().push(user_name);
            ctrl.link_list(ctrl.link_list().filter(uniqueFilter));

            ctrl.link_add_list().push(user_name);
            ctrl.link_add_list(ctrl.link_add_list().filter(uniqueFilter));
            ctrl.link_remove_list(ctrl.link_remove_list().filter(removeFilter));
        }

        function remove_from_link(user_name)
        {
            if(!ctrl.link_add_list().find(function(e){return e==user_name;}))
            {
                ctrl.link_remove_list().push(user_name);
                ctrl.link_remove_list(ctrl.link_remove_list().filter(uniqueFilter));
            }
            ctrl.link_add_list(ctrl.link_add_list().filter(removeFilter(user_name)));
            ctrl.link_list(ctrl.link_list().filter(removeFilter(user_name)));
        }

        let removeFilter = (user_name) => string => {
            return string!=user_name;
        };

        function uniqueFilter(value, index, self) {
            return self.indexOf(value) === index;
        }

        function do_add_link() {
            add_link(m.route.param('studyId'))
                .then(response =>{ctrl.link(response.link);})
                .catch(error => {
                    ctrl.col_error(error.message);
                }).then(m.redraw);
        }

        function do_edit_link() {
            return edit_link(m.route.param('studyId'), ctrl.link_add_list, ctrl.link_remove_list, ctrl.link_type)
                .then(response =>{ctrl.link(response.link);})
                .catch(error => {
                    ctrl.col_error(error.message);
                });
        }


        function view_link(){
            messages.confirm({
                header:'Access link',
                content: m.component({view: () => m('p', [
                    m('button.btn.btn-secondary.btn-sm.m-r-1', {onclick:ctrl.do_add_link},
                        'Create / Re-create link'
                    ),
                    m('label.input-group',[
                        m('.input-group-addon', m('i.fa.fa-fw.fa-copy')),
                        m('input.form-control', { value: ctrl.link(), onchange: m.withAttr('value', ctrl.link)})
                    ]),
                    m('.custom-control.custom-checkbox', [
                        m('input.custom-control-input', {
                            type: 'radio',
                            name:'template',
                            checked:ctrl.link_type()=='Public',
                            onclick: function(){
                                ctrl.link_type('Public');
                            }
                        }),
                        m('span.custom-control-indicator'),
                        m('span.custom-control-description.m-l-1', 'Public')
                    ]),
                    m('.custom-control.custom-checkbox', [
                        m('input.custom-control-input', {
                            type: 'radio',
                            name:'template',
                            checked:ctrl.link_type()=='Private',
                            onclick: function(){
                                ctrl.link_type('Private');
                            }
                        }),
                        m('span.custom-control-indicator'),
                        m('span.custom-control-description.m-l-1', 'Private')
                    ]),
                    ctrl.link_type()!='Private'
                    ?
                    ''
                    :
                    m('p', [
                        ctrl.link_list().map(user=>m('.small',{onclick:function(){ctrl.remove_from_link(user);}}, [m('i.fa.fa-times', {

                        }), ` ${user}  `])),
                        m('p', 'Enter collaborator\'s user name:'),
                        m('input.form-control', {placeholder: 'User name', value: ctrl.user_name(), onchange: m.withAttr('value', ctrl.user_name)}),
                        m('button.btn.btn-success.btn-sm', {onclick:function(){ctrl.add_to_link(ctrl.user_name()); ctrl.user_name('');}}, 'Add')
                    ]),
                    m('p', {class: ctrl.col_error()? 'alert alert-danger' : ''}, ctrl.col_error())
                ])
                })})
                .then(response => {
                    if (response)
                        do_edit_link()
                            .then(()=>{
                                ctrl.col_error('');
                                load();
                            })
                            .catch(error => {
                                ctrl.col_error(error.message);
                                view_link();
                            })
                            .then(m.redraw);
                });
        }
        function do_make_public(is_public){
            messages.confirm({okText: ['Yes, make ', is_public ? 'public' : 'private'], cancelText: ['No, keep ', is_public ? 'private' : 'public' ], header:'Are you sure?', content:m('p', [m('p', is_public
                                                                                ?
                                                                                'Making the study public will allow everyone to view the files. It will NOT allow others to modify the study or its files.'
                                                                                :
                                                                                'Making the study private will hide its files from everyone but you.'),
                m('span', {class: ctrl.pub_error()? 'alert alert-danger' : ''}, ctrl.pub_error())])})
                .then(response => {
                    if (response) make_pulic(m.route.param('studyId'), is_public)
                        .then(()=>{
                            ctrl.pub_error('');
                            load();
                        })
                        .catch(error => {
                            ctrl.pub_error(error.message);
                            do_make_public(is_public);
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
            m('.container.sharing-page', [
                m('.row',[
                    m('.col-sm-6', [
                        m('h3', [ctrl.study_name(), ': Sharing'])
                    ]),
                    m('.col-sm-6', [
                        m('button.btn.btn-secondary.btn-sm.m-r-1', {onclick:ctrl.view_link}, [
                            m('i.fa.fa-plus'), '  Access link'
                        ]),
                        m('button.btn.btn-secondary.btn-sm.m-r-1', {onclick:ctrl.do_add_collaboration}, [
                            m('i.fa.fa-plus'), '  Add a new collaborator'
                        ]),
                        m('button.btn.btn-secondary.btn-sm', {onclick:function() {ctrl.do_make_public(!ctrl.is_public());}}, ['Make ', ctrl.is_public() ? 'Private' : 'Public'])
                    ])
                ]),
                
                m('table', {class:'table table-striped table-hover'}, [
                    m('thead', [
                        m('tr', [
                            m('th', 'User name'),
                            m('th',  'Permission'),
                            m('th',  'Remove')
                        ])
                    ]),
                    m('tbody', [
                        ctrl.users().map(user => m('tr', [
                            m('td', user.USERNAME),
                            m('td', user.PERMISSION),
                            m('td', m('button.btn.btn-secondary', {onclick:function() {ctrl.remove(user.USER_ID);}}, 'Remove'))
                        ]))

                    ])
                ])
            ]);
    }
};