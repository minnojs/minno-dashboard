import {set_password, set_email, update_details, get_email, check_if_dbx_synchronized, check_if_present_templates , set_present_templates} from './settingsModel';
import {getAuth} from 'login/authModel';

import fullHeight from 'utils/fullHeight';
import {draw_menu} from './settingsMenu';
// import {gdrive_body} from './connect2GdriveView';

export default changePasswordComponent;

let changePasswordComponent = {
    controller(){

        const ctrl = {
            role:m.prop(''),
            external:m.prop(true),
            password:m.prop(''),
            confirm:m.prop(''),
            is_dbx_synchronized: m.prop(),
            is_gdrive_synchronized: m.prop(),
            present_templates: m.prop(),
            dbx_auth_link: m.prop(''),
            gdrive_auth_link: m.prop(''),
            synchronization_error: m.prop(''),
            present_templates_error: m.prop(''),
            email: m.prop(''),
            prev_email: m.prop(''),
            password_error: m.prop(''),
            password_changed:false,
            email_error: m.prop(''),
            email_changed:false,
            update_all_details,
            do_set_password,
            do_set_email,
            do_set_templete

        };
        getAuth().then((response) => {``;
            ctrl.role(response.role);
        });

        get_email()
            .then((response) => {
                ctrl.email(response.email);
                ctrl.prev_email(response.email);
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

        // check_if_gdrive_synchronized()
        //     .then((response) => {
        //         ctrl.is_gdrive_synchronized(response.is_synchronized);
        //         ctrl.gdrive_auth_link(response.auth_link);
        //     })
        //     .catch(response => {
        //         ctrl.synchronization_error(response.message);
        //     })
        //     .then(m.redraw);

        check_if_present_templates()
            .then((response) => {
                ctrl.present_templates(response.present_templates);
            })
            .catch(response => {
                ctrl.present_templates_error(response.message);
            })
            .then(m.redraw);
        return ctrl;

        function update_all_details(){

            ctrl.password_changed = false;
            ctrl.email_changed    = false;
            ctrl.password_error('');
            ctrl.email_error('');

            let params = {};
            if(ctrl.password() || ctrl.confirm()){
                params.password = ctrl.password();
                params.confirm = ctrl.confirm();
            }
            if(ctrl.email() !== ctrl.prev_email())
            {
                ctrl.prev_email(ctrl.email());
                params.email = ctrl.email();
            }
            if(Object.keys(params).length > 0)
                update_details(params)
                    .then(response => {
                        ctrl.password_error(response.password ? response.password.error : '');
                        ctrl.email_error(response.email ? response.email.error : '');
                        ctrl.password_changed = response.password && !response.password.error;
                        ctrl.email_changed    = response.email && !response.email.error;


                    })
                    .then(m.redraw);
        }

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
        function do_set_templete(value){
            set_present_templates(value)
                .then(() => {
                    ctrl.present_templates(value);
                })
                .catch(response => {
                    ctrl.present_templates_error(response.message);
                })
                .then(m.redraw);
        }
    },
    view(ctrl){
        return m('.activation.centrify', {config:fullHeight},[
            draw_menu(ctrl),
            m('.card-block',

                m('button.btn.btn-primary.btn-block', {onclick: ctrl.update_all_details},'Update')
            ),
            !ctrl.password_changed ? '' : m('.alert.alert-success', m('strong', 'Password successfully updated')),
            !ctrl.email_changed ? '' : m('.alert.alert-success', m('strong', 'Email successfully updated'))
        ]);
    }
};
