import {formFactory, textInput, checkboxInput, maybeInput} from 'utils/formHelpers';
import {study_removal, get_study_prop} from 'deploy/deployModel';

import fullHeight from 'utils/fullHeight';
export default StudyRemovalComponent;

let StudyRemovalComponent = {
    controller(){
        let form = formFactory();
        let ctrl = {
            researcher_name: m.prop(''),
            researcher_email: m.prop(''),
            study_name: m.prop(''),
            completed_n: m.prop(''),
            comments: m.prop('')
        }
        get_study_prop(m.route.param('studyId'))
            .then(response =>{
                    ctrl.researcher_name(response.researcher_name);
                    ctrl.researcher_email(response.researcher_email);
                    ctrl.study_name(response.experiment_file[0].file_id );
//                    console.log(response.experiment_file[0].file_name);
//                    messages.alert({header:'Select expt file', content:radioInput({description: 'experiment_file_name', prop: ctrl.experiment_file, form, name: 'experiment_file_name'})});
                })
            .catch(error => {
                throw error;
            }).then(m.redraw);

        return {ctrl, form, submit};
        function submit(){

            form.showValidation(true);
            if (!form.isValid())
            {
                messages.alert({header:'Error', content:'not valid'});
                return;
            }
            
            study_removal(m.route.param('studyId'), ctrl.study_name,ctrl.researcher_email, ctrl.researcher_name, ctrl.completed_n, ctrl.comments)
            .then(response =>{
//                    ctrl.researcher_name(response.researcher_name);
//                    ctrl.researcher_email(response.researcher_email);
//                    ctrl.folder_location(response.folder);
                })
            .catch(error => {
                throw error;
            }).then(m.redraw);

            console.log('submit!');
        };

    },
    view({form, ctrl, submit}){
        return  m('.StudyRemoval.container', [
                m('h1', 'Study Removal'),
                textInput({label: m('span', ['Researcher name', m('span.text-danger', ' *')]),  placeholder: 'Researcher name', prop: ctrl.researcher_name, form, required:true}),
                textInput({label: m('span', ['Researcher email address', m('span.text-danger', ' *')]),  placeholder: 'esearcher email address', prop: ctrl.researcher_email, form, required:true}),
                textInput({label: m('span', ['Study name', m('span.text-danger', ' *')]), help: 'This is the name you submitted to the RDE (e.g., colinsmith.elmcogload) ',  placeholder: 'Study name', prop: ctrl.study_name, form, required:true}),
                textInput({label: m('span', ['Please enter your completed n below ', m('span.text-danger', ' *')]), help: m('span', ['you can use the following link: ', m('a', {href:'https://app-prod-03.implicit.harvard.edu/implicit/research/pitracker/PITracking.html#3'}, 'https://app-prod-03.implicit.harvard.edu/implicit/research/pitracker/PITracking.html#3')]),  placeholder: 'completed n', prop: ctrl.completed_n, form, required:true}),
//            m('span', ['you can use the following link ',m('a', {href:'https://app-prod-03.implicit.harvard.edu/implicit/research/pitracker/PITracking.html#3'})])
                textInput({isArea: true, label: m('span', 'Additional comments'), help: '(e.g., anything unusual about the data collection, consistent participant comments, etc.)',  placeholder: 'Additional comments', prop: ctrl.comments, form}),
                m('button.btn.btn-primary', {onclick: submit}, 'Submit'), 

        ]);


     }
};
