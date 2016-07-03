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
            !exist_rule_file() ? '' : m('.small.text-muted', [
                'You already have a rule file by the name of "',
                exist_rule_file(),
                '", it will be overwritten if you create a new one.'
            ]),
            m('.btn-group', [
                m('.btn.btn-secondary.btn-sm', {onclick: edit},  [
                    m('i.fa.fa-edit'), ' Rule editor'
                ]),
                m('.btn.btn-secondary.btn-sm', {onclick: remove},  [
                    m('i.fa.fa-remove'), ' Clear rules'
                ])
            ]),
            m('#ruleGenerator.card', {config: getInputs(visual, value)}, [
                m('.card-block', visual())
            ])
        ]);
    }
};

let getInputs = (visual, value) => (element, isInit) => {
    if (isInit) return true;
    element.ruleGeneratorVisual = visual;
    element.ruleGeneratorValue = value;
};

