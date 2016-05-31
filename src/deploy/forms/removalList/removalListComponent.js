import {get_removal_list} from './removalListModel';
import sortTable from 'utils/sortTable';

const TABLE_WIDTH = 8;
export default removalListComponent;
let thConfig = (prop, current) => ({'data-sort-by':prop, class: current() === prop ? 'active' : ''});

let removalListComponent = {
    controller(){
        let ctrl = {
            list: m.prop(''),
            sortBy: m.prop('CREATION_DATE')
        };
        get_removal_list()
          .then(response =>{ctrl.list(response.requests);
              sortTable(ctrl.list, ctrl.sortBy);
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
                    m('th', thConfig('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                    m('th', thConfig('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                    m('th', thConfig('STUDY_NAME',ctrl.sortBy), 'Study name'),
                    m('th', thConfig('COMPLETED_N',ctrl.sortBy), 'Completed n'),
                    m('th', thConfig('COMMENTS',ctrl.sortBy), 'Comments')
                ])
            ]),
            m('tbody', [
                ctrl.list().length === 0
                ?
                m('tr.table-info',
                    m('td.text-xs-center', {colspan: TABLE_WIDTH},
                        m('strong', 'Heads up! '), 'There are no pool studies yet'
                    )
                )
                :
                ctrl.list().map(study => m('tr', [
                    m('td', study.CREATION_DATE),
                    m('td', m('a', {href:'mailto:' + study.RESEARCHER_EMAIL}, study.RESEARCHER_EMAIL)),
                    m('td', study.RESEARCHER_NAME),
                    m('td', study.STUDY_NAME),
                    m('td', study.COMPLETED_N),
                    m('td', study.COMMENTS)
                ]))
            ])
        ]);
    }
};