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
                        th_option(sortBy, 'studyName', 'studyName'),
                        !query.sorttask2() ? '' : th_option(sortBy, 'taskName', 'taskName'),
                        query.sorttime2()==='All' ? '' : th_option(sortBy, 'date', 'date'),
                        th_option(sortBy, 'starts', 'starts'),
                        th_option(sortBy, 'completes', 'completes'),
                        !query.sortgroup() ? '' : th_option(sortBy, 'schema', 'schema')
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
                        !query.sorttask2() ? '' : m('td', row.taskName),
                        query.sorttime2()==='All' ? '' : m('td', formatDate(new Date(row.date))),
                        m('td', row.starts),
                        m('td', row.completes),
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

