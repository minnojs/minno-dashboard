import {deploy, get_study_prop} from './deployModel';
import {toJSON, checkStatus} from 'utils/modelHelpers';

import messages from 'utils/messagesComponent';

import {formFactory, textInput, checkboxInput, maybeInput, radioInput} from 'utils/formHelpers';
import fullHeight from 'utils/fullHeight';
export default deployComponent;

let deployComponent = {
    controller(){
        let form = formFactory();
        let ctrl = {
            folder_location: m.prop(''),
            researcher_email: m.prop(''),
            researcher_name: m.prop(''),
            target_number: m.prop(''),

            approved_by_a_reviewer: m.prop(''),
            zero_unnecessary_files: m.prop(''),

            // unnecessary
            completed_checklist: m.prop(''),
            approved_by_irb: m.prop(''),
            valid_study_name: m.prop(''),
            realstart: m.prop(''),

            experiment_file: m.prop(''),
            launch_confirmation: m.prop(''),
            comments: m.prop('')   
        };
        get_study_prop(m.route.param('studyId'))
            .then(response =>{
                    ctrl.researcher_name(response.researcher_name);
                    ctrl.researcher_email(response.researcher_email);
                    ctrl.folder_location(response.folder);
                    ctrl.experiment_file(response.experiment_file[0].file_name);

                messages.alert({header:'Select expt file', 
                        content:response.experiment_file.map(function (experiment_file) {
                        return radioInput({description: experiment_file.file_name, prop: ctrl.experiment_file, form, name: 'experiment_file_name'});
                    })});
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
            deploy(m.route.param('studyId'), ctrl.folder_location,ctrl.researcher_email, ctrl.researcher_name, ctrl.target_number, ctrl.approved_by_a_reviewer, ctrl.experiment_file, ctrl.launch_confirmation, ctrl.comments)
            .then(response =>{

            })
            .catch(error => {
                throw error;
            }).then(m.redraw);

            console.log('submit!');
        };
    },
    view({form, ctrl, submit}){
        return  m('.deploy.container', [
                m('h1', 'Deploy'),
                textInput({label:'Researcher name',  placeholder: 'Researcher name', prop: ctrl.researcher_name, form, required:true}),
                textInput({label:'Researcher email address',  placeholder: 'Researcher email address', prop: ctrl.researcher_email, form, required:true}),
                textInput({label:'Study folder location',  placeholder: 'Study folder location', prop: ctrl.folder_location, form, required:true}),
                textInput({label:'Name of experiment file',  placeholder: 'Name of experiment file', prop: ctrl.experiment_file, form, required:true}),
                textInput({help: 'For private studies (not in the Project Implicit research pool), enter n/a', label:'Target number of completed study sessions',  placeholder: 'Target number of completed study sessions', prop: ctrl.target_number, form, required:true}),
                m('h4', 'Participant restrictions'),
                m('p', 'Consider whether it makes sense for any person from any country of any age to complete your study.'),
                m('p', 'List selection restrictions on your sample (e.g., "exclude age >60", "American citizens/residents only").'),
                m('p', 'Also include other study IDs from the pool that should disqualify participants from being assigned to your study.'),
                m('p', 'Type "None" if you want any person from any country of any age to complete your study.'),
                m('p', ['See ', m('a', {href:'http://peoplescience.org/node/104'}, 'http://peoplescience.org/node/104'), ' for more information on this item. ']),
                m('p', 'Type \'n/a\' for private studies (not in the Project Implicit research pool).'),
                m('p', 'To create restrictions, open the rules generator. Open the rule generator'),
                
                checkboxInput({description: 'Did you make sure your study-id starts with your user name', prop: ctrl.valid_study_name, form, required:true}),                
                checkboxInput({description: m('span', ['This study has been approved by the appropriate IRB ', m('span.text-danger', '*')]), prop: ctrl.approved_by_irb, form, required:true}),                
                checkboxInput({description: m('span', ['All items on "Study Testing" and "Study Approval" from Project Implicit Study Development Checklist completed (items 9 - 17) ', m('span.text-danger', '*')]), help: m('span', ['The checklist is available at ', m('a', {href:'http://peoplescience.org/node/105'}, 'http://peoplescience.org/node/105')]), prop: ctrl.completed_checklist, form, required:true}),                
                checkboxInput({description: m('span', ['My study folder includes ZERO files that aren\'t necessary for the study (e.g., word documents, older versions of files, items that were dropped from the final version) ', m('span.text-danger', '*')]), prop: ctrl.zero_unnecessary_files, form, required:true}),                
                
                m('p', m('span', ['Study approved by a *User Experience* Reviewer (Calvin Lai) ', m('span.text-danger', '*')])),
                radioInput({description: 'Yes', prop: ctrl.approved_by_a_reviewer, form, name: 'approved_by_a_reviewer'}),                
                radioInput({description: 'No, this study is not for the Project Implicit pool.', prop: ctrl.approved_by_a_reviewer, form, name: 'approved_by_a_reviewer'}),
                
                m('p', m('span', ['If you are building this study for another researcher (e.g. a contract study), has the researcher received the standard final launch confirmation email and confirmed that the study is ready to be launched? *) ', m('span.text-danger', '*')])),
                m('p', ['The standard email can be found here: ', m('a', {href:'http://peoplescience.org/node/135'}, 'http://peoplescience.org/node/135')]),
                radioInput({description: 'Yes', prop: ctrl.launch_confirmation, form, name: 'launch_confirmation'}),                
                radioInput({description: 'No,this study is mine.', prop: ctrl.launch_confirmation, form, name: 'launch_confirmation'}),                
                checkboxInput({description: 'Did you use a realstart and lastpage task?', prop: ctrl.realstart, form, required:true}),                
                textInput({isArea: true, label: m('span', 'Additional comments'),  placeholder: 'Additional comments', prop: ctrl.comments, form}),
//                    console.log(ctrl.experiment_file().1);
                
                m('button.btn.btn-primary', {onclick: submit}, 'Deploy'), 
        ]);
     }
};
