import messages from 'utils/messagesComponent';
export default args => m.component(rulesComponent, args);

let rulesComponent = {
    controller({visual, value, comments}){
        return {visual, value, edit, remove, addcomments};

        function edit(){
            window.open('../ruletable.html');
        }

        function remove(){
            visual('None');
            value('parent'); // this value is defined by the rule generator
        }

        function addcomments(){
            messages.prompt({
                prop: comments,
                header: 'Edit rule comments'
            });
        }
    },
    view: ({visual, value, edit, remove}) => {
        return m('div', [
            m('btn-toolbar', [
                m('.btn.btn-secondary.btn-sm', {onclick: edit},  [
                    m('i.fa.fa-edit'), ' Rule editor'
                ]),
                m('.btn.btn-secondary.btn-sm', {onclick: remove},  [
                    m('i.fa.fa-remove'), ' Clear rules'
                ])
            ]),
            m('#ruleGenerator.card.card-warning.m-t-1', {config: getInputs(visual, value)}, [
                m('.card-block', visual())
            ]),
            m('small.text-muted', ` Consider whether it makes sense for just any person from any country of any age to complete your study. If you want to create restrictions, use the Rules editor`)
        ]); 
    }
};

let getInputs = (visual, value) => (element, isInit) => {
    if (isInit) return true;
    element.ruleGeneratorVisual = visual;
    element.ruleGeneratorValue = value;
};

