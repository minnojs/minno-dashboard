import {formFactory, textInput, radioInput} from 'utils/formHelpers';
import {study_removal, get_study_prop} from 'deploy/deployModel';
import messages from 'utils/messagesComponent';

export default StudyRemovalComponent;
const ASTERIX = m('span.text-danger', '*');

let StudyRemovalComponent = {
    controller(){
        let form = formFactory();
        let ctrl = {
            sent:false,
            researcher_name: m.prop(''),
            researcher_email: m.prop(''),
            study_name: m.prop(''),
            study_names: m.prop(''),
            completed_n: m.prop(''),
            comments: m.prop('')
        };
        get_study_prop(m.route.param('studyId'))
            .then(response =>{
                ctrl.researcher_name(response.researcher_name);
                ctrl.researcher_email(response.researcher_email);
                ctrl.study_names(response.experiment_file.reduce((obj, row) => {
                    obj[row.file_id] = row.file_id;
                    return obj;
                }, {}));
            })
            .catch(error => {
                m.route('/');
                throw error;
            })
            .then(m.redraw);
        function submit(){
            form.showValidation(true);
            if (!form.isValid())
            {
                messages.alert({header:'Error', content:'not valid'});
                return;
            }
            study_removal(m.route.param('studyId'), ctrl)
                .then(() => {
                    ctrl.sent = true;
                })
                .catch(error => {
                    throw error;
                })
                .then(m.redraw);
        }
        return {ctrl, form, submit};
    },
    view({form, ctrl, submit}){
        return ctrl.sent
        ?
        m('.deploy.centrify',[
            m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
            m('h5', ['The removal form was sent successfully ', m('a', {href:'./removalList'}, 'View removal requests')])
        ])
        :
        m('.StudyRemoval.container', [
            m('h1', 'Study Removal'),
            m('p', 'Researcher name: ', ctrl.researcher_name()),                
            m('p', 'Researcher email address: ', ctrl.researcher_email()),                
            radioInput({
                label:m('span', ['Study name', ASTERIX]), 
                prop: ctrl.study_name, 
                values:ctrl.study_names(),
                help: 'This is the name you submitted to the RDE (e.g., colinsmith.elmcogload) ',
                form, isStack:true
            }),
            textInput({label: m('span', ['Please enter your completed n below ', m('span.text-danger', ' *')]), help: m('span', ['you can use the following link: ', m('a', {href:'https://app-prod-03.implicit.harvard.edu/implicit/research/pitracker/PITracking.html#3'}, 'https://app-prod-03.implicit.harvard.edu/implicit/research/pitracker/PITracking.html#3')]),  placeholder: 'completed n', prop: ctrl.completed_n, form, required:true, isStack:true}),
            textInput({isArea: true, label: m('span', 'Additional comments'), help: '(e.g., anything unusual about the data collection, consistent participant comments, etc.)',  placeholder: 'Additional comments', prop: ctrl.comments, form, isStack:true}),
            m('button.btn.btn-primary', {onclick: submit}, 'Submit')
        ]);
    }
};