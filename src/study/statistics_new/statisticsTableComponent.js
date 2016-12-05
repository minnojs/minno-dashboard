import sortTable from 'utils/sortTable';
import formatDate from 'utils/formatDate';

export default statisticsTable;

let statisticsTable = args => m.component(statisticsTableComponent, args);

let statisticsTableComponent = {
    controller(){
        return {sortBy: m.prop()};
    },
    view({sortBy}, {tableContent, query}){
        let content = tableContent();
        if (!content) return m('div');
        if (!content.data) return m('.col-sm-12', [
            m('.alert.alert-info', 'There was no data found for this request')
        ]);

        let list = m.prop(content.data);

        return m('.col-sm-12', [
            m('table.table.table-sm', {onclick: sortTable(list, sortBy)}, [
                m('thead', [
                    m('tr.table-default', [
                        th_option(sortBy, 'studyName', 'Study Name'),
                        !query.sorttask_sent() ? '' : th_option(sortBy, 'taskName', 'Task Name'),
                        query.sorttime_sent()==='All' ? '' : th_option(sortBy, 'date', 'Date'),
                        th_option(sortBy, 'starts', 'Starts'),
                        th_option(sortBy, 'completes', 'Completes'),
                        th_option(sortBy, 'completion_rate', 'Completion Rate %'),
                        !query.sortgroup() ? '' : th_option(sortBy, 'schema', 'Schema')
                    ])
                ]),
                m('tbody', [
                    list().map(row =>
                        query.showEmpty() && row.starts===0
                    ?
                    ''
                    :
                    m('tr.table-default', [
                        m('td', row.studyName),
                        !query.sorttask_sent() ? '' : m('td', row.taskName),
                        query.sorttime_sent()==='All' ? '' : m('td', formatDate(new Date(row.date))),
                        m('td', row.starts),
                        m('td', row.completes),
                        m('td', row.completion_rate = row.starts===0 ? 0 : (row.completes/row.starts).toFixed(2)),
                        !query.sortgroup() ? '' : m('td', row.schema)
                    ])
                    )

                ])
            ])
        ]);
    }
};

let th_option = (sortBy, sortByTxt, text) => m('th', {
    'data-sort-by':sortByTxt, class: sortBy() === sortByTxt ? 'active' : ''
}, text);

