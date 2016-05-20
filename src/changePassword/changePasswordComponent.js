import {set_password, is_recovery_code} from './changePasswordModel';

import fullHeight from 'utils/fullHeight';
import {body} from './changePasswordView';

export default changePasswordComponent;

let changePasswordComponent = {
    controller(){
        const password = m.prop('');
        const confirm = m.prop('');
        const ctrl = {
            password,
            confirm,
            error: m.prop(''),
            changed:false,
            set_password: update
        };
        var code = m.route.param('code')!== undefined ? m.route.param('code') : "";
        is_recovery_code(code)
        .catch(response => {
            m.route('/');
        })
        .then(() => {
            m.redraw();
        });    
        return ctrl;
        
        function update(){
            set_password(code, password, confirm)
                .then(() => {
                    ctrl.changed = true;
                })
                .catch(response => {
                        ctrl.error(response.message);
                        m.redraw();
                })
                .then(() => {
                        m.redraw();
                });
        }
    },
    view(ctrl){
        return m('.activation.centrify', {config:fullHeight},[
            
                ctrl.changed
            ?
            [
                m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                m('h5', 'Password successfully updated!')
            ]
            :
            body(ctrl)]);
    }
};
