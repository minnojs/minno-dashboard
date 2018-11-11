import {get_pending_studies,
        use_code} from './messagesModel';
import {getAuth} from 'login/authModel';
import {do_create} from "../study/studyActions";
import {draw_menu} from "../study/studyMenu";

export default messagesComponent;

let messagesComponent = {
    controller(){
        const ctrl = {
            role:m.prop(''),
            pendings: m.prop(''),
            loaded: false,
            error: m.prop(''),
            do_use_code
        };
        getAuth().then((response) => {
            ctrl.role(response.role);
        });

        function do_use_code(code){
            use_code(code)
                .then(()=>ctrl.pendings(ctrl.pendings().filter(study=>study.accept!==code && study.reject!==code)))
                .then(m.redraw);
        }

        get_pending_studies()
        .then((response) => {
            ctrl.pendings(response.studies);
            console.log(response.studies);
            ctrl.loaded = true;
        })
        .catch(response => {
            ctrl.error(response.message);
        })
        .then(m.redraw);
        return ctrl;
    },
    view(ctrl){

        return  !ctrl.loaded
            ?
            m('.loader')
            :
            m('.container.studies', [
            m('.row.p-t-1', [
                m('.col-sm-4', [
                    m('h3', 'Sharing Invitations')
                ])]),
            m('.card.studies-card', [
                m('.card-block', [
                    m('.row', {key: '@@notid@@'}, [
                        m('.col-sm-3', [
                            m('.form-control-static',[
                                m('strong', 'Owner ')
                            ])
                        ]),
                        m('.col-sm-4', [
                            m('.form-control-static',[
                                m('strong', 'Study name ')
                            ])]),
                        m('.col-sm-2', [
                            m('.form-control-static',[
                                m('strong', 'Permission ')
                            ])
                        ]),
                        m('.col-sm-3', [
                            m('.form-control-static',[
                                m('strong', 'Action ')
                            ])
                        ])

                    ]),
                    ctrl.pendings().map(study =>
                        m('.row.study-row', [
                        m('.col-sm-3', [
                            m('.study-text', study.owner_name)
                        ]),
                        m('.col-sm-4', [
                            m('.study-text', study.study_name)
                        ]),
                        m('.col-sm-2', [
                            m('.study-text', study.permission)
                        ]),
                        m('.col-sm-3', [
                            m('.study-text', m('button.btn.btn-primary', {onclick:function() {ctrl.do_use_code(study.accept);}}, 'Accept'), ' | ',
                                m('button.btn.btn-danger', {onclick:function() {ctrl.do_use_code(study.reject);}}, 'Reject'))
                        ]),


                    ]))
                ])])]);


    }
};
