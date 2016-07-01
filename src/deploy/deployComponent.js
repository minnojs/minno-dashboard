import {deploy, get_study_prop} from './deployModel';
import {formFactory, textInput, checkboxInput, radioInput} from 'utils/formHelpers';
import rulesEditor from './rulesComponent';
export default deployComponent;

const ASTERIX = m('span.text-danger', '*');

let deployComponent = {
    controller(){
        let form = formFactory();
        let ctrl = {
            sent:false,
            error: m.prop(''),
            folder_location: m.prop(''),
            researcher_email: m.prop(''),
            researcher_name: m.prop(''),
            target_number: m.prop(''),
            
            rulesValue: m.prop('parent'), // this value is defined by the rule generator
            rulesVisual: m.prop('None'),
            rulesComments: m.prop(''),
            rule_file: m.prop(''),
            exist_rule_file: m.prop(''),

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
                ctrl.exist_rule_file(response.have_rule_file ? response.study_name+'.rules.xml' : '');
                ctrl.study_name = response.study_name;
                ctrl.researcher_name(response.researcher_name);
                ctrl.researcher_email(response.researcher_email);
                ctrl.folder_location(response.folder);
                ctrl.experiment_files(response.experiment_file.reduce((obj, row) => {obj[row.file_name] = row.file_name;
                    return obj;
                }, {}));
            })
            .catch(error => {
                throw error;
            })
            .then(m.redraw);
    
        return {ctrl, form, submit};
        function submit(){
            form.showValidation(true);
            if (!form.isValid())
            {
                ctrl.error('Missing parameters');
                return;
            }
            deploy(m.route.param('studyId'), ctrl)
            .then((response) => {
                ctrl.rule_file(response.rule_file);
                ctrl.sent = true;
            })
            .catch(response => {
                ctrl.error(response.message);
            })
            .then(m.redraw);
        }
    },
    view({form, ctrl, submit}){
        if (ctrl.sent) return m('.deploy.centrify',[
            m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
            m('h5', ['The Deploy form was sent successfully ', m('a', {href:'/deployList', config: m.route}, 'View Deploy Requests')]),
            ctrl.rule_file() !='' ? m('h5', ['Rule File: ', m('a', {href: `/editor/${m.route.param('studyId')}/file/${ctrl.rule_file()}.xml`, config: m.route}, ctrl.rule_file())]) : ''
        ]);
        
        return m('.deploy.container', [
            m('h3', [
                'Request Deploy ',
                m('small', ctrl.study_name)
            ]),

            m('.card.card-inverse.card-info', [
                m('.card-block', [
                    m('.row', [
                        m('.col-sm-5', m('strong', 'Researcher Name: ')),
                        m('.col-sm-5', ctrl.researcher_name())
                    ]),
                    m('.row', [
                        m('.col-sm-5', m('strong', 'Researcher Email Address: ')),
                        m('.col-sm-5', ctrl.researcher_email())
                    ]),
                    m('.row', [
                        m('.col-sm-5', m('strong', 'Study Folder Location: ')),
                        m('.col-sm-5', ctrl.folder_location())
                    ])
                ])
            ]),

            radioInput({
                label:m('span', ['Name of Experiment File', ASTERIX]),
                prop: ctrl.experiment_file,
                values:ctrl.experiment_files(),
                form, required:true, isStack:true
            }),

            textInput({help: 'For private studies (not in the Project Implicit research pool), enter n/a', label:['Target Number of Completed Study Sessions', ASTERIX],  placeholder: 'Target Number of Completed Study Sessions', prop: ctrl.target_number, form, required:true}),

            m('h4', 'Participant Restrictions'),
            rulesEditor({value:ctrl.rulesValue, visual: ctrl.rulesVisual, comments: ctrl.rulesComments, exist_rule_file: ctrl.exist_rule_file}),
            m('h4', 'Checklist'),
            checkboxInput({description: ['The study\'s study-id starts with my user name', ASTERIX], prop: ctrl.valid_study_name, form, required:true, isStack:true}),
            checkboxInput({
                description: m('span', [ 'This study has been approved by the appropriate IRB ', m('span.text-danger', '*') ]),
                prop: ctrl.approved_by_irb,
                required:true,
                form, isStack:true
            }),
            checkboxInput({
                description: m('span', [ 'All items on "Study Testing" and "Study Approval" from Project Implicit Study Development Checklist completed (items 9 - 17) ', ASTERIX]),
                help: m('span', ['The checklist is available at ', m('a', {href:'http://peoplescience.org/node/105', target:'_blank'}, 'http://peoplescience.org/node/105')]),
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
            checkboxInput({description: ['I used a realstart and lastpage tasks', ASTERIX], prop: ctrl.realstart, form, required:true, isStack:true}),

            radioInput({
                label:m('span', ['Study approved by a *User Experience* Reviewer (Calvin Lai):', ASTERIX]),
                prop: ctrl.approved_by_a_reviewer,
                values: {
                    'No, this study is not for the Project Implicit pool.' : 'No, this study is not for the Project Implicit pool.',
                    'Yes' : 'Yes'
                },
                form, required:true, isStack:true
            }),

            radioInput({
                label: m('span', ['If you are building this study for another researcher (e.g. a contract study), has the researcher received the standard final launch confirmation email and confirmed that the study is ready to be launched?', ASTERIX]),
                prop: ctrl.launch_confirmation,
                values: {
                    'No,this study is mine': 'No,this study is mine',
                    'Yes' : 'Yes'
                },
                form, required:true, isStack:true
            }),

            textInput({isArea: true, label: m('span', 'Additional comments'),  placeholder: 'Additional comments', prop: ctrl.comments, form, isStack:true}),
            ctrl.error() ? m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()) : '',
            m('button.btn.btn-primary', {onclick: submit}, 'Deploy')
        ]);
    }
};
