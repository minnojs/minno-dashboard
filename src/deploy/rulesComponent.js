import messages from 'utils/messagesComponent';
export default args => m.component(rulesComponent, args);

let rulesComponent = {
    controller({visual, value, comments, exist_rule_file}){
        return {visual, value, edit, remove, addcomments, exist_rule_file};

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
    view: ({visual, value, edit, remove, exist_rule_file}) => {
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
            exist_rule_file() ? m('small.text-muted', ['You already have rule file with the name ',exist_rule_file(), ', it will overridden by creating a new one by the rule editor.']) : ''
        ]);
    }
};

let getInputs = (visual, value) => (element, isInit) => {
    if (isInit) return true;
    element.ruleGeneratorVisual = visual;
    element.ruleGeneratorValue = value;
};

