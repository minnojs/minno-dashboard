import {formFactory, textInput, checkboxInput, maybeInput, radioInput} from 'utils/formHelpers';
import {Study_change_request, get_study_prop} from 'deploy/deployModel';

import fullHeight from 'utils/fullHeight';
export default StudychangeRequestComponent;

let StudychangeRequestComponent = {
    controller(){
        let form = formFactory();
        let ctrl = {
            researcher_name: m.prop(''),
            researcher_email: m.prop(''),            
            target_sessions: m.prop(''),
            study_showfiles_link: m.prop(''),
            status: m.prop(''),
            file_names: m.prop(''),
            comments: m.prop('')

        }
        get_study_prop(m.route.param('studyId'))
            .then(response =>{
                    ctrl.researcher_name(response.researcher_name);
                    ctrl.researcher_email(response.researcher_email);
//                    messages.alert({header:'Error', content:'yey'});

                })
            .catch(error => {
                throw error;
            }).then(m.redraw);

        return {ctrl, form, submit};
        function submit(){

            form.showValidation(true);
            if (!form.isValid())
            {
                console.log("xx");
//                messages.alert({header:'Error', content:'not valid'});
                return;
            }
            
            Study_change_request(m.route.param('studyId'), ctrl.file_names, ctrl.researcher_email, ctrl.researcher_name, ctrl.target_sessions, ctrl.study_showfiles_link, ctrl.status, ctrl.comments)
            .then(response =>{
//                    ctrl.researcher_name(response.researcher_name);
//                    ctrl.researcher_email(response.researcher_email);
                })
            .catch(error => {
                throw error;
            }).then(m.redraw);

            console.log('submit!');
        };

    },
    view({form, ctrl, submit}){
        return  m('.StudyChangeRequest.container', [
                m('h1', 'Study Change Request'),
                textInput({label: m('span', ['Researcher name', m('span.text-danger', ' *')]),  placeholder: 'Researcher name', prop: ctrl.researcher_name, form, required:true}),
                textInput({label: m('span', ['Researcher email address', m('span.text-danger', ' *')]),  placeholder: 'esearcher email address', prop: ctrl.researcher_email, form, required:true}),
                textInput({label: m('span', ['Target number of additional sessions (In addition to the sessions completed so far)', m('span.text-danger', ' *')]),  placeholder: 'Target number of additional sessions', prop: ctrl.target_sessions, form, required:true}),

                m('p', 'What\'s the current status of your study?*'),
                radioInput({description: 'Currently collecting data and does not need to be unpaused', prop: ctrl.status, form, name: 'status'}),                
                radioInput({description: 'Manually paused and needs to be unpaused', prop: ctrl.status, form, name: 'status'}),                
                radioInput({description: 'Auto-paused due to low completion rates or meeting target N.', prop: ctrl.status, form, name: 'status'}),                

                textInput({label:  m('span', ['Study showfiles link', m('span.text-danger', ' *')]), placeholder: 'Study showfiles link', help: m('span', 'For example: http://app-prod-03.implicit.harvard.edu/implicit/showfiles.jsp?user=rhershman&study=examplestudy'),prop: ctrl.study_showfiles_link, form}),,
                
                textInput({isArea: true, label: m('span', ['Change Request', m('span.text-danger', ' *')]), help: 'List all file names involved in the change request. Specify for each file whether file is being updated or added to production.)',  placeholder: 'Change Request', prop: ctrl.file_names, form, required:true}),
                textInput({isArea: true, label: m('span', 'Additional comments'),  placeholder: 'Additional comments', prop: ctrl.comments, form}),



                m('button.btn.btn-primary', {onclick: submit}, 'Submit'), 

        ]);


     }
};
