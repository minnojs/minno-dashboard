export default fab;

let fab = args => m.component(fabComponent, args);

let fabComponent = {
    view: (ctrl, {studyId}) => m('.fab-container', [
        m('.fab-buttons', [
            m('a.fab-button', {tooltip:'Request Removal', href: `/studyRemoval/${studyId}`, config:m.route}, m('i.fa.fa-remove')),
            m('a.fab-button', {tooltip:'Request Change', href: `/studyChangeRequest/${studyId}`, config:m.route}, 'C'),
            m('a.fab-button', {tooltip:'Request Deploy', href: `/deploy/${studyId}`, config:m.route}, 'D'),
            m('a.fab-button', {tooltip:'Edit', href: `/editor/${studyId}`, config:m.route}, m('i.fa.fa-edit'))
        ]),  
        m('.fab-button.fab-main', {tooltip:'Actions'}, m('i.fa.fa-lg.fa-bolt'))  
    ])
};
