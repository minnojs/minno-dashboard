import {set_password, set_email, get_email, check_if_dbx_synchronized, check_if_gdrive_synchronized} from './settingsModel';

import fullHeight from 'utils/fullHeight';
import {password_body} from './changePasswordView';
import {emil_body} from './changeEmailView';
import {dropbox_body} from './connect2dropboxView';
// import {gdrive_body} from './connect2GdriveView';

export default changePasswordComponent;

let changePasswordComponent = {
    controller(){

        const ctrl = {
            password:m.prop(''),
            confirm:m.prop(''),
            is_dbx_synchronized: m.prop(),
            is_gdrive_synchronized: m.prop(),
            dbx_auth_link: m.prop(''),
            gdrive_auth_link: m.prop(''),
            synchronization_error: m.prop(''),
            email: m.prop(''),
            password_error: m.prop(''),
            password_changed:false,
            email_error: m.prop(''),
            email_changed:false,
            do_set_password,
            do_set_email

        };

        get_email()
        .then((response) => {
            ctrl.email(response.email);
        })
        .catch(response => {
            ctrl.email_error(response.message);
        })
        .then(m.redraw);

        check_if_dbx_synchronized()
        .then((response) => {
            ctrl.is_dbx_synchronized(response.is_synchronized);
            ctrl.dbx_auth_link(response.auth_link);
        })
        .catch(response => {
            ctrl.synchronization_error(response.message);
        })
        .then(m.redraw);

        check_if_gdrive_synchronized()
            .then((response) => {
                ctrl.is_gdrive_synchronized(response.is_synchronized);
                ctrl.gdrive_auth_link(response.auth_link);
            })
            .catch(response => {
                ctrl.synchronization_error(response.message);
            })
            .then(m.redraw);

        return ctrl;


        function do_set_password(){
            set_password('', ctrl.password, ctrl.confirm)
                .then(() => {
                    ctrl.password_changed = true;
                })
                .catch(response => {
                    ctrl.password_error(response.message);
                })
                .then(m.redraw);
        }

        function do_set_email(){
            set_email(ctrl.email)
                .then(() => {
                    ctrl.email_changed = true;
                })
                .catch(response => {
                    ctrl.email_error(response.message);
                })
                .then(m.redraw);
        }
    },
    view(ctrl){
        return m('.activation.centrify', {config:fullHeight},[
            ctrl.password_changed
            ?
                [
                    m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                    m('h5', 'Password successfully updated!')
                ]
            :
            ctrl.email_changed
            ?
                [
                    m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                    m('h5', 'Email successfully updated!')
                ]
            :
                [
                    password_body(ctrl),
                    emil_body(ctrl),
                    dropbox_body(ctrl)
                    // ,gdrive_body(ctrl)
                ]
        ]);
    }
};
