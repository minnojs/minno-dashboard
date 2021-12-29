import {is_activation_code, set_password} from './activationModel';
import fullHeight from 'utils/fullHeight';
import {password_body} from 'settings/changePasswordView';

export default activationComponent;

let activationComponent = {
    controller(){
        const ctrl = {
            password: m.prop(''),
            confirm: m.prop(''),
            password_error: m.prop(''),
            activated:false,
            do_set_password
        };
       
        is_activation_code(m.route.param('code'))
        .catch(() => {
            m.route('/');
        });

        return ctrl;

        function do_set_password(){
            set_password(m.route.param('code'), ctrl.password, ctrl.confirm)
                .then(() => {
                    ctrl.activated = true;
                })
                .catch(response => {
                    ctrl.password_error(response.message);
                })
                .then(m.redraw);
        }
    },
    view(ctrl){
        return m('.activation.centrify', {config:fullHeight},[
            ctrl.activated
            ?
                [
                    m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                    m('h5', 'Password successfully updated!')
                ]
            :
            password_body(ctrl)]);
    }
};
