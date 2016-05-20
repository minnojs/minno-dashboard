import {get_change_request_list} from './changeRequestListModel';
import sortTable from 'utils/sortTable';
const TABLE_WIDTH = 8;
export default changeRequestListComponent;
let thConfig = (prop, current) => ({'data-sort-by':prop, class: current() === prop ? 'active' : ''});
let changeRequestListComponent = {
    controller(){
        let form = formFactory();
        
        let ctrl = {
            list: m.prop(''),
            sortBy: m.prop('CREATION_DATE'),
        };
        get_change_request_list()
          .then(response =>{ctrl.list(response.requests);
                sortTable(ctrl.list, ctrl.sortBy);
            })
            .catch(error => {
                throw error;
            })
            .then(m.redraw);
        return {ctrl, form};
    },

    view({form, ctrl}){
        let list = ctrl.list;

        return m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
            m('thead', [
                m('tr', [
                    m('th', thConfig('CREATION_DATE',ctrl.sortBy), 'Creation date'),
                    m('th', thConfig('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                    m('th', thConfig('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                    m('th', thConfig('FILE_NAMES',ctrl.sortBy), 'File names'),
                    m('th', thConfig('TARGET_SESSIONS',ctrl.sortBy), 'Target sessions'),
                    m('th', thConfig('STUDY_SHOWFILES_LINK',ctrl.sortBy), 'Study showfiles link'),
                    m('th', thConfig('STATUS',ctrl.sortBy), 'Status'),
                    m('th', thConfig('COMMENTS',ctrl.sortBy), 'Comments'),
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
                    m('td', m('a', {href:"mailto:"+study.RESEARCHER_EMAIL}, study.RESEARCHER_EMAIL)),
                    m('td', study.RESEARCHER_NAME),
                    m('td', study.FILE_NAMES),
                    m('td', study.TARGET_SESSIONS),
                    m('td', m('a', {href:study.STUDY_SHOWFILES_LINK}, study.STUDY_SHOWFILES_LINK)),
                    m('td', study.STATUS),
                    m('td', study.COMMENTS)
                ]))
            ])
        ]);
     }
};