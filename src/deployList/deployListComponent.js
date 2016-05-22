import {get_study_list} from './deployListModel';
import sortTable from 'utils/sortTable';

const TABLE_WIDTH = 8;

export default deployComponent;
let thConfig = (prop, current) => ({'data-sort-by':prop, class: current() === prop ? 'active' : ''});

let deployComponent = {
    controller(){
        let ctrl = {
            list: m.prop(''),
            sortBy: m.prop('CREATION_DATE')
        };
        get_study_list()
            .then(response =>{ctrl.list(response.requests);
            })
            .catch(error => {
                throw error;
            })
            .then(m.redraw);
        return {ctrl};
    },
    view({ctrl}){
        let list = ctrl.list;
        return m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
            m('thead', [
                m('tr', [
                    m('th', thConfig('CREATION_DATE',ctrl.sortBy), 'Creation date'),
                    m('th', thConfig('FOLDER_LOCATION',ctrl.sortBy), 'Folder location'),
                    m('th', thConfig('RULE_FILE',ctrl.sortBy), 'Rule file'),
                    m('th', thConfig('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                    m('th', thConfig('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                    m('th', thConfig('TARGET_NUMBER',ctrl.sortBy), 'Target number'),
                    m('th', thConfig('APPROVED_BY_A_REVIEWER',ctrl.sortBy), 'Approved by a reviewer'),
                    m('th', thConfig('EXPERIMENT_FILE',ctrl.sortBy), 'Experiment file'),
                    m('th', thConfig('LAUNCH_CONFIRMATION',ctrl.sortBy), 'Launch confirmation'),
                    m('th', thConfig('COMMENTS',ctrl.sortBy), 'Comments')
                ])
            ]),
            m('tbody', [
                ctrl.list().length === 0
                ?
                m('tr.table-info',
                    m('td.text-xs-center', {colspan: TABLE_WIDTH},
                        m('strong', 'Heads up! '), 'There are no pool requests yet'
                    )
                )
                :
                ctrl.list().map(study => m('tr', [
                    m('td', study.CREATION_DATE),
                    m('td', m('a', {href:study.FOLDER_LOCATION}, study.FOLDER_LOCATION)),
                    m('td', study.RULE_FILE),
                    m('td', m('a', {href:'mailto:' + study.RESEARCHER_EMAIL}, study.RESEARCHER_EMAIL)),
                    m('td', study.RESEARCHER_NAME),
                    m('td', study.TARGET_NUMBER),
                    m('td', study.APPROVED_BY_A_REVIEWER),
                    m('td', study.EXPERIMENT_FILE),
                    m('td', study.LAUNCH_CONFIRMATION),
                    m('td', study.COMMENTS)
                ]))
            ])
        ]);
    }
};
