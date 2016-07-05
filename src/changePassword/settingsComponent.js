import {set_password, set_email, get_email} from './settingsModel';

import fullHeight from 'utils/fullHeight';
import {password_body} from './changePasswordView';
import {emil_body} from './changeEmailView';

export default changePasswordComponent;

let changePasswordComponent = {
    controller(){

        const ctrl = {
            password:m.prop(''),
            confirm:m.prop(''),
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
                    emil_body(ctrl)
                ]
        ]);
    }
};
