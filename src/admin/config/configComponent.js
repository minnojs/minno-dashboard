import {get_config, set_gmail_params, unset_gmail_params, set_dbx_params, unset_dbx_params} from './configModel';

import messages from 'utils/messagesComponent';
import {copyUrlContent} from 'utils/copyUrl';

import addComponent from '../../addUser/addUserComponent';
import {set_password} from "../../settings/settingsModel";


export default configComponent;

let configComponent = {
    controller(){
        let ctrl = {
            loaded:m.prop(false),
            dbx: {
                setted: m.prop(false),
                enable: m.prop(false),
                client_id:m.prop(''),
                client_secret:m.prop(''),
                error:m.prop('')
            },
            gmail: {
                setted: m.prop(false),
                enable: m.prop(false),
                email:m.prop(''),
                password:m.prop(''),
                error:m.prop('')
            },

            toggle_visibility,
            set_gmail,
            unset_gmail,
            set_dbx,
            unset_dbx
        };


        function set_values(response){
            if(response.config.gmail)
                ctrl.gmail.setted(true) && ctrl.gmail.enable(true) && ctrl.gmail.email(response.config.gmail.email) && ctrl.gmail.password(response.config.gmail.password);
            if(response.config.dbx)
                ctrl.dbx.setted(true) && ctrl.dbx.enable(true) && ctrl.dbx.client_id(response.config.dbx.client_id) && ctrl.dbx.client_secret(response.config.dbx.client_secret);
        }

        function toggle_visibility(varable, state){
            ctrl[varable].error('');
            ctrl[varable].enable(state);
        }

        function load() {
            get_config()
                .then(response => set_values(response))
                .then(()=>ctrl.loaded(true))
                .catch(error => {
                    ctrl.col_error(error.message);
                }).then(m.redraw);
        }


        function set_gmail() {
            ctrl.gmail.error('');
            set_gmail_params(ctrl.gmail.email, ctrl.gmail.password)
                .catch(error => {
                    ctrl.gmail.error(error.message);
                })
                .then(ctrl.gmail.setted(true))
                .then(ctrl.gmail.enable(true))
                .then(m.redraw);
        }

        function unset_gmail() {
            ctrl.gmail.error('');
            unset_gmail_params()
                .catch(error => {
                    ctrl.gmail.error(error.message);
                })
                .then(ctrl.gmail.setted(false))
                .then(ctrl.gmail.enable(false))
                .then(ctrl.gmail.email(''))
                .then(ctrl.gmail.password(''))
                .then(m.redraw);
        }

        function set_dbx() {
            ctrl.dbx.error('');
            set_dbx_params(ctrl.dbx.client_id, ctrl.dbx.client_secret)
                .catch(error => {
                    ctrl.dbx.error(error.message);
                })
                .then(ctrl.dbx.setted(true))
                .then(ctrl.dbx.enable(true))
                .then(m.redraw);
        }

        function unset_dbx() {
            unset_dbx_params()
                .catch(error => {
                    ctrl.dbx.error(error.message);
                })
                .then(ctrl.dbx.setted(false))
                .then(ctrl.dbx.enable(false))
                .then(ctrl.dbx.client_id(''))
                .then(ctrl.dbx.client_secret(''))
                .then(m.redraw);
        }

        load();
        return ctrl;
    },
    view(ctrl){
        return  !ctrl.loaded()
            ?
            m('.loader')
            :
                m('.container.sharing-page', [
                    m('.row',[
                        m('.col-sm-10', [
                            m('h3', 'Edit configuration')
                        ])
                    ]),

                    m('.row.centrify',
                        [m('.card.card-inverse.col-md-5.centrify', [

                            !ctrl.gmail.enable() ?
                                m('a', {onclick: ()=>ctrl.toggle_visibility('gmail', true)},
                                    m('button.btn.btn-primary.btn-block', [
                                        m('i.fa.fa-fw.fa-envelope'), ' Enable support with email'
                                    ])
                                )
                                :
                                m('.card-block',[
                                m('h4', 'Enter details for Gmail accont'),
                                m('form', [
                                    m('input.form-control', {
                                        type:'input',
                                        placeholder: 'Gmail accont',
                                        value: ctrl.gmail.email(),
                                        oninput: m.withAttr('value', ctrl.gmail.email),
                                        onchange: m.withAttr('value', ctrl.gmail.email),
                                    }),

                                    m('input.form-control', {
                                        type:'input',
                                        placeholder: 'password',
                                        value: ctrl.gmail.password(),
                                        oninput: m.withAttr('value', ctrl.gmail.password),
                                        onchange: m.withAttr('value', ctrl.gmail.password),
                                    })
                                ]),
                                ctrl.gmail.setted() ? ''  : m('button.btn.btn-secondery.btn-block', {onclick: ()=>ctrl.toggle_visibility('gmail', false)},'Cancel'),
                                m('button.btn.btn-primary.btn-block', {onclick: ctrl.set_gmail},'Update'),
                                !ctrl.gmail.setted() ? '' : m('button.btn.btn-danger.btn-block', {onclick: ctrl.unset_gmail},'remove'),
                                !ctrl.gmail.error() ? '' : m('p.alert.alert-danger', ctrl.gmail.error()),
                                ])
                        ])

                        ]),
                    m('.row.centrify',
                        m('.card.card-inverse.col-md-5.centrify', [
                            !ctrl.dbx.enable() ?
                                m('a', {onclick: ()=>ctrl.toggle_visibility('dbx', true)},
                                    m('button.btn.btn-primary.btn-block', [
                                        m('i.fa.fa-fw.fa-envelope'), ' Enable support with dropbox'
                                    ])
                                )
                                :
                                m('.card-block',[
                                m('h4', 'Enter details for Dropbox application'),
                                m('form', [
                                    m('input.form-control', {
                                        type:'input',
                                        placeholder: 'client id',
                                        value: ctrl.dbx.client_id(),
                                        oninput: m.withAttr('value', ctrl.dbx.client_id),
                                        onchange: m.withAttr('value', ctrl.dbx.client_id),
                                    }),

                                    m('input.form-control', {
                                        type:'input',
                                        placeholder: 'client secret',
                                        value: ctrl.dbx.client_secret(),
                                        oninput: m.withAttr('value', ctrl.dbx.client_secret),
                                        onchange: m.withAttr('value', ctrl.dbx.client_secret),
                                    })
                                ]),
                                    ctrl.dbx.setted() ? ''  : m('button.btn.btn-secondery.btn-block', {onclick: ()=>ctrl.toggle_visibility('dbx', false)},'Cancel'),
                                    m('button.btn.btn-primary.btn-block', {onclick: ctrl.set_dbx},'Update'),
                                    !ctrl.dbx.setted() ? '' : m('button.btn.btn-danger.btn-block', {onclick: ctrl.unset_dbx},'remove'),
                                    !ctrl.dbx.error() ? '' : m('p.alert.alert-danger', ctrl.dbx.error()),
                            ])
                        ])
                    ),
            ]);
    }
};