import {set_password, is_recovery_code} from './settingsModel';

import fullHeight from 'utils/fullHeight';
import {password_body} from './changePasswordView';

export default resetPasswordComponent;

let resetPasswordComponent = {
    controller(){
        const ctrl = {
            password:m.prop(''),
            confirm:m.prop(''),
            password_error: m.prop(''),
            password_changed:false,
            external: m.prop(false),

            code: m.prop(''),
            do_set_password
        };
        ctrl.code(m.route.param('code')!== undefined ? m.route.param('code') : '');
        is_recovery_code(ctrl.code())
            .catch(() => {
                m.route('/');
            })
            .then(() => {
                m.redraw();
            });

        return ctrl;
        
        function do_set_password(){
            set_password(ctrl.code(), ctrl.password, ctrl.confirm)
                .then(() => {
                    ctrl.password_changed = true;
                })
                .catch(response => {
                    ctrl.password_error(response.message);
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
                    m('h5', 'Password successfully updated!'),
                    m('p.text-center',
                        m('small.text-muted',  m('a', {href:'./'}, 'Take me to my studies!'))
                    )
                ]
                :
                password_body(ctrl)
        ]);
    }
};
