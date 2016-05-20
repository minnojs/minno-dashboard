import {deploy, get_study_prop} from './deployModel';
import messages from 'utils/messagesComponent';
import {formFactory, textInput, checkboxInput, radioInput} from 'utils/formHelpers';
import rulesEditor from './rulesComponent';
export default deployComponent;

const ASTERIX = m('span.text-danger', '*');

let deployComponent = {
    controller(){
        let form = formFactory();
        let ctrl = {
            sent:false,
            folder_location: m.prop(''),
            researcher_email: m.prop(''),
            researcher_name: m.prop(''),
            target_number: m.prop(''),
            
            rulesValue: m.prop('parent'), // this value is defined by the rule generator
            rulesVisual: m.prop('None'),
            rulesComments: m.prop(''),
            rule_file: m.prop(''),

            approved_by_a_reviewer: m.prop(''),
            zero_unnecessary_files: m.prop(''),

            // unnecessary
            completed_checklist: m.prop(''),
            approved_by_irb: m.prop(''),
            valid_study_name: m.prop(''),
            realstart: m.prop(''),

            experiment_file: m.prop(''),
            experiment_files: m.prop(''),
            launch_confirmation: m.prop(''),
            comments: m.prop('')   
            
        };
        get_study_prop(m.route.param('studyId'))
            .then(response =>{
                ctrl.researcher_name(response.researcher_name);
                ctrl.researcher_email(response.researcher_email);
                ctrl.folder_location(response.folder);
                ctrl.experiment_files(response.experiment_file.reduce((obj, row) => {obj[row.file_name] = row.file_name;
                                                                                        return obj;
                                                                                    }, {}));
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
            deploy(m.route.param('studyId'), ctrl)
            .then((response) => {
                ctrl.rule_file(response.rule_file);
                ctrl.sent = true;
            })
            .catch(error => {
                throw error;
            })
            .then(m.redraw);
        }
    },
    view({form, ctrl, submit}){
        return ctrl.sent
        ?
        m('.deploy.centrify',[
            m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
            m('h5', ['The Deploy form was sent successfully ', m('a', {href:'./deployList'}, 'View Deploy Requests')]),
            m('h5', ['Rule File: ', 'editor/', m.route.param('studyId') ,'/file/', ctrl.rule_file()])
        ])
        :
        m('.deploy.container', [
            m('h3', 'Deploy'),
            m('p', 'Researcher name: ', ctrl.researcher_name()),
            m('p', 'Researcher email address: ', ctrl.researcher_email()),
            m('p', 'Study folder location: ', ctrl.folder_location()),
            radioInput({
                label:m('span', ['Name of experiment file', ASTERIX]),
                prop: ctrl.experiment_file,
                values:ctrl.experiment_files(),
                form, isStack:true
            }),

            textInput({help: 'For private studies (not in the Project Implicit research pool), enter n/a', label:['Target number of completed study sessions', ASTERIX],  placeholder: 'Target number of completed study sessions', prop: ctrl.target_number, form, required:true, isStack:true}),

            m('h4', 'Participant restrictions'),
                rulesEditor({value:ctrl.rulesValue, visual: ctrl.rulesVisual, comments: ctrl.rulesComments}),

            m('h4', 'Acceptance checklist'),
            checkboxInput({description: ['Did you make sure your study-id starts with your user name', ASTERIX], prop: ctrl.valid_study_name, form, required:true, isStack:true}),
            checkboxInput({
                description: m('span', [ 'This study has been approved by the appropriate IRB ', m('span.text-danger', '*') ]),
                prop: ctrl.approved_by_irb,
                required:true,
                form, isStack:true
            }),
            checkboxInput({
                description: m('span', [ 'All items on "Study Testing" and "Study Approval" from Project Implicit Study Development Checklist completed (items 9 - 17) ', ASTERIX]),
                help: m('span', ['The checklist is available at ', m('a', {href:'http://peoplescience.org/node/105'}, 'http://peoplescience.org/node/105')]),
                prop: ctrl.completed_checklist,
                form, isStack:true,
                required:true
            }),
            checkboxInput({
                description: m('span', ['My study folder includes ZERO files that aren\'t necessary for the study  ', ASTERIX]),
                help: 'e.g., word documents, older versions of files, items that were dropped from the final version',
                prop: ctrl.zero_unnecessary_files,
                required:true,
                form, isStack:true
            }),
            checkboxInput({description: ['Did you use a realstart and lastpage task?', ASTERIX], prop: ctrl.realstart, form, required:true, isStack:true}),

            radioInput({
                label:m('span', ['Study approved by a *User Experience* Reviewer (Calvin Lai):', ASTERIX]),
                prop: ctrl.approved_by_a_reviewer,
                values: {
                    'No, this study is not for the Project Implicit pool.' : 'No, this study is not for the Project Implicit pool.',
                    'Yes' : 'Yes'
                },
                form, isStack:true
            }),

            radioInput({
                label: m('span', ['Has this study been confirmed for launch?', ASTERIX]),
                help: m('span', ['If you are building this study for another researcher (e.g. a contract study), has the researcher received the standard final launch confirmation email and confirmed that the study is ready to be launched? The standard email can be found ', m('a', {href:'http://peoplescience.org/node/135'}, 'here'), '.']),
                prop: ctrl.launch_confirmation,
                values: {
                    'No,this study is mine': 'No,this study is mine',
                    'Yes' : 'Yes'
                },
                form, isStack:true
            }),

            textInput({isArea: true, label: m('span', 'Additional comments'),  placeholder: 'Additional comments', prop: ctrl.comments, form, isStack:true}),
            m('button.btn.btn-primary', {onclick: submit}, 'Deploy')
        ]);
     }
};