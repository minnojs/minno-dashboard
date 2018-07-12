import {getAllPoolStudies, STATUS_PAUSED, STATUS_RUNNING} from './poolModel';
import {play, pause, remove, edit, create, reset} from './poolActions';
import {getAuth} from 'login/authModel';
import sortTable from 'utils/sortTable';
import formatDate from 'utils/formatDate';
export default poolComponent;

const PRODUCTION_URL = 'https://implicit.harvard.edu/implicit/';
const TABLE_WIDTH = 8;

let poolComponent = {
    controller: () => {
        const ctrl = {
            play, pause, remove, edit, reset, create,
            canCreate: false,
            list: m.prop([]),
            globalSearch: m.prop(''),
            sortBy: m.prop(),
            error: m.prop(''),
            loaded: m.prop()
        };

        getAuth().then((response) => {ctrl.canCreate = response.role === 'SU';});
        getAllPoolStudies()
            .then(ctrl.list)
            .then(ctrl.loaded)
            .catch(ctrl.error)
            .then(m.redraw);
        return ctrl;
    },
    view: ctrl => {
        let list = ctrl.list;
        return m('.pool', [
            m('h2', 'Study pool'),
            ctrl.error()
                ?
                m('.alert.alert-warning',
                    m('strong', 'Warning!! '), ctrl.error().message
                )
                :
                m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                    m('thead', [
                        m('tr', [
                            m('th', {colspan:TABLE_WIDTH - 1}, [
                                m('input.form-control', {placeholder: 'Global Search ...', oninput: m.withAttr('value', ctrl.globalSearch)})
                            ]),
                            m('th', [
                                m('a.btn.btn-secondary', {href:'/pool/history', config:m.route}, [
                                    m('i.fa.fa-history'), '  History'
                                ])
                            ])
                        ]),
                        ctrl.canCreate ? m('tr', [
                            m('th.text-xs-center', {colspan:TABLE_WIDTH}, [
                                m('button.btn.btn-secondary', {onclick:ctrl.create.bind(null, list)}, [
                                    m('i.fa.fa-plus'), '  Add new study'
                                ])
                            ])
                        ]) : '',
                        m('tr', [
                            m('th', thConfig('studyId',ctrl.sortBy), 'ID'),
                            m('th', thConfig('studyUrl',ctrl.sortBy), 'Study'),
                            m('th', thConfig('rulesUrl',ctrl.sortBy), 'Rules'),
                            m('th', thConfig('autopauseUrl',ctrl.sortBy), 'Autopause'),
                            m('th', thConfig('completedSessions',ctrl.sortBy), 'Completion'),
                            m('th', thConfig('creationDate',ctrl.sortBy), 'Date'),
                            m('th','Status'),
                            m('th','Actions')
                        ])
                    ]),
                    m('tbody', [
                        list().length === 0
                            ?
                            m('tr.table-info',
                                m('td.text-xs-center', {colspan: TABLE_WIDTH},
                                    m('strong', 'Heads up! '), 
                                    ctrl.loaded()
                                        ? 'None of your studies is in the Research Pool right now'
                                        : 'Loading...'
                                )
                            )
                            :
                            list().filter(studyFilter(ctrl)).map(study => m('tr', [
                                // ### ID
                                m('td', study.studyId),

                                // ### Study url
                                m('td', [
                                    m('a', {href:PRODUCTION_URL + study.studyUrl, target: '_blank'}, 'Study')
                                ]),

                                // ### Rules url
                                m('td', [
                                    m('a', {href:PRODUCTION_URL + study.rulesUrl, target: '_blank'}, 'Rules')
                                ]),

                                // ### Autopause url
                                m('td', [
                                    m('a', {href:PRODUCTION_URL + study.autopauseUrl, target: '_blank'}, 'Autopause')
                                ]),

                                // ### Completions
                                m('td', [
                                    study.startedSessions ? (100 * study.completedSessions / study.startedSessions).toFixed(1) + '% ' : 'n/a ',
                                    m('i.fa.fa-info-circle'),
                                    m('.info-box', [
                                        m('.card', [
                                            m('.card-header', 'Completion Details'),
                                            m('ul.list-group.list-group-flush',[
                                                m('li.list-group-item', [
                                                    m('strong', 'Target Completions: '), study.targetCompletions
                                                ]),
                                                m('li.list-group-item', [
                                                    m('strong', 'Started Sessions: '), study.startedSessions
                                                ]),
                                                m('li.list-group-item', [
                                                    m('strong', 'Completed Sessions: '), study.completedSessions
                                                ])
                                            ])
                                        ])
                                    ])
                                ]),

                                // ### Date
                                m('td', formatDate(new Date(study.creationDate))),

                                // ### Status
                                m('td', [
                                    {
                                        R: m('span.label.label-success', 'Running'),
                                        P: m('span.label.label-info', 'Paused'),
                                        S: m('span.label.label-danger', 'Stopped')
                                    }[study.studyStatus]
                                ]),

                                // ### Actions
                                m('td', [
                                    study.$pending
                                        ?
                                        m('.l', 'Loading...')
                                        :
                                        m('.btn-group', [
                                            study.canUnpause && study.studyStatus === STATUS_PAUSED ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.play.bind(null, study)}, [
                                                m('i.fa.fa-play')
                                            ]) : '',
                                            study.canPause && study.studyStatus === STATUS_RUNNING ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.pause.bind(null, study)}, [
                                                m('i.fa.fa-pause')
                                            ]) : '',
                                            study.canReset ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.edit.bind(null, study)}, [
                                                m('i.fa.fa-edit')
                                            ]): '',
                                            study.canReset ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.reset.bind(null, study)}, [
                                                m('i.fa.fa-refresh')
                                            ]) : '',
                                            study.canStop ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.remove.bind(null, study, list)}, [
                                                m('i.fa.fa-close')
                                            ]) : ''
                                        ])
                                ])
                            ]))
                    ])
                ])
        ]);
    }
};

// @TODO: bad idiom! should change things within the object, not the object itself.
let thConfig = (prop, current) => ({'data-sort-by':prop, class: current() === prop ? 'active' : ''});

function studyFilter(ctrl){
    return study =>
        includes(study.studyId, ctrl.globalSearch()) ||
        includes(study.studyUrl, ctrl.globalSearch()) ||
        includes(study.rulesUrl, ctrl.globalSearch());

    function includes(val, search){
        return typeof val === 'string' && val.includes(search);
    }
}
