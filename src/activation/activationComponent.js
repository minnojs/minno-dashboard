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
            error:m.prop(''),
            do_set_password
        };
       
        is_activation_code(m.route.param('code'))
        .catch(err => ctrl.error(err.message))
        .then(m.redraw);

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
        console.log(ctrl.error());
        return m('.activation.centrify', {config:fullHeight},[
            ctrl.error() ?
                m('p.text-center',
                    m('.alert.alert-danger', m('strong', 'Error: '), ctrl.error())) :
                ctrl.activated
                    ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', 'Password successfully updated!'),
                        m('p.text-center', m('small.text-muted',  m('a', {href:'./'}, 'Take me to the login page!')))
                    ]
                    :
                    password_body(ctrl)]);
    }
};
