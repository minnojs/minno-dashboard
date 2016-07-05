import {is_activation_code, set_password} from './activationModel';
import fullHeight from 'utils/fullHeight';
import {password_body} from 'changePassword/changePasswordView';

export default activationComponent;

let activationComponent = {
    controller(){
        const ctrl = {
            password: m.prop(''),
            confirm: m.prop(''),
            error: m.prop(''),
            activated:false,
            do_set_password
        };
       
        is_activation_code(m.route.param('code'))
        .catch(() => {
            m.route('/');
        })
        .then(m.redraw);
        return ctrl;

        function do_set_password(){
            set_password(m.route.param('code'), ctrl.password, ctrl.confirm)
                .then(() => {
                    ctrl.activated = true;
                })
                .catch(response => {
                    ctrl.error(response.message);
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
