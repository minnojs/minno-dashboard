import {createEmpty} from './fileActions';
export default sidebarButtons;

let sidebarButtons = {
    controller: ({study}) => {
        let ctrl = {
            newOpen: false,
            toggleNew: () => ctrl.newOpen = !ctrl.newOpen,
            createEmpty: createEmpty(study)
        };

        return ctrl;
    },

    view: ctrl => {
        return m('.btn-group', {class: ctrl.newOpen ? 'open' : ''}, [
            m('.btn.btn-sm.btn-secondary', {onclick:ctrl.createEmpty}, [
                m('i.fa.fa-plus'), ' New'
            ]),
            m('.btn.btn-sm.btn-secondary.dropdown-toggle', {onclick:ctrl.toggleNew}),
            m('.dropdown-menu', {onclick: ctrl.toggleNew}, [
        //      m('a.dropdown-item', {onclick: ctrl.createPIP}, 'piPlayer'),
        //      m('a.dropdown-item', {onclick: ctrl.createQuest}, 'piQuest'),
        //      m('a.dropdown-item', {onclick: ctrl.createManager}, 'piManager')
            ])
        ]);
    }
};
