import {formFactory, textInput, selectInput} from 'utils/formHelpers';
import inheritInput from './inheritInput';
export default taskComponent;

let taskComponent = {
    controller({output,close}){
        let form = formFactory();
        
        let type = m.prop('message');
        let common = {
            inherit: m.prop(''),
            name: m.prop(''),
            title: m.prop('')
        };
        let task = m.prop({});
            
        return {type, common, task, form, close, proceed};

        function proceed(){
            output(Object.assign({type}, common, task()));
            close(true)();
        }       

    },
    view({type, common, task, form, close, proceed}){
        return m('div', [   
            m('h4', 'Add task'),
            m('.card-block', [
                inheritInput({label:'inherit', prop:common.inherit, form, help: 'Base this element off of an element from a set'}),
                selectInput({label:'type', prop: type, form, values: {message: 'message', pip: 'pip', quest: 'quest'}}),
                textInput({label: 'name', prop: common.name, help: 'The name for the task',form}),
                textInput({label: 'title', prop: common.title, help: 'The title to be displayed in the browsers tab',form}),
                m.component(taskSwitch(type()), {task, form})
            ]),
            m('.text-xs-right.btn-toolbar',[
                m('a.btn.btn-secondary.btn-sm', {onclick:close(false)}, 'Cancel'),
                m('a.btn.btn-primary.btn-sm', {onclick:proceed}, 'Proceed')
            ])
        ]);
    }
};

function taskSwitch(type){
    switch (type) {
        case 'message' : return messageComponent;
        case 'pip' : return pipComponent;
        case 'quest' : return questComponent;
        default :
            throw new Error(`Unknown task type: ${type}`);
    }
}

let messageComponent = {
    controller({task}){
        task({
            piTemplate: m.prop(true),
            template: m.prop(''),
            templateUrl: m.prop('')
        });
    },
    view(ctrl, {task, form}){
        let props = task();
        return m('div', [
            selectInput({label:'piTemplate', prop: props.piTemplate, form, values: {'Active': true, 'Debriefing template': 'debrief', 'Don\'t use': false}, help: 'Use the PI style templates'}),
            textInput({label: 'templateUrl', prop: props.templateUrl, help: 'The URL for the task template file',form}),
            textInput({label: 'template', prop: props.template, rows:6,  form, isArea:true, help: m.trust('You can manually create your template here <strong>instead</strong> of using a url')})
        ]); 
    }
};

let pipComponent = {
    controller({task}){
        task({
            version: m.prop('0.3'),
            scriptUrl: m.prop('')
        });
    },
    view(ctrl, {task, form}){
        let props = task();
        return m('div', [
            textInput({label: 'scriptUrl', prop: props.scriptUrl, help: 'The URL for the task script file',form}),
            selectInput({label:'version', prop: props.version, form, values: {'0.3':0.3, '0.2':0.2}, help: 'The version of PIP that you want to use'})
        ]); 
    }
};

let questComponent = {
    controller({task}){
        task({
            scriptUrl: m.prop('')
        });
    },
    view(ctrl, {task, form}){
        let props = task();
        return m('div', [
            textInput({label: 'scriptUrl', prop: props.scriptUrl, help: 'The URL for the task script file',form})
        ]); 
    }
};
