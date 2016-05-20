import {is_activation_code, set_password} from './activationModel';
import fullHeight from 'utils/fullHeight';
import {body} from 'changePassword/changePasswordView';

export default activationComponent;

let activationComponent = {
    controller(){
        const password = m.prop('');
        const confirm = m.prop('');
        const iscu = m.prop(false);
        const ctrl = {
            password,
            confirm,
            error: m.prop(''),
            activated:false,
            set_password: update
        };
       
        is_activation_code(m.route.param('code'))
        .catch(response => {
            m.route('/');
        })
        .then(() => {
            m.redraw();
        });
        return ctrl;

        function update(){
            set_password(m.route.param('code'), password, confirm)
                .then(() => {
                    ctrl.activated = true;
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
            ctrl.activated
            ?
            [
                m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                m('h5', 'Password successfully updated!')
            ]
            :
            body(ctrl)]);
    }
};
