import sortTable from 'utils/sortTable';
export default statisticsTable;

let statisticsTable = args => m.component(statisticsTableComponent, args);

let statisticsTableComponent = {
    controller(){
        return {sortBy: m.prop()};
    },
    view({sortBy}, {tableContent}){
        let content = tableContent();
        if (!content) return m('div'); 
        if (!content.data) return m('.col-sm-12', [
            m('.alert.alert-info', 'There was no data found for this request')
        ]);

        let list = m.prop(content.data);
        console.log(list());
        list().map(row => console.log(row));
        return m('.col-sm-12', [
            m('table.table.table-sm', {onclick: sortTable(list, sortBy)}, [
                m('thead', [
                    m('tr.table-default', [
                        m('th',{'data-sort-by':'studyName', class: sortBy() === 'studyName' ? 'active' : ''}, 'studyName'),
                        m('th',{'data-sort-by':'taskName', class: sortBy() === 'taskName' ? 'active' : ''}, 'taskName'),
                        m('th',{'data-sort-by':'date', class: sortBy() === 'date' ? 'active' : ''}, 'date'),
                        m('th',{'data-sort-by':'starts', class: sortBy() === 'starts' ? 'active' : ''}, 'starts'),
                        m('th',{'data-sort-by':'completes', class: sortBy() === 'completes' ? 'active' : ''}, 'completes'),
                        m('th',{'data-sort-by':'schema', class: sortBy() === 'schema' ? 'active' : ''}, 'schema')
                    ])
                ]),
                m('tbody', [
                    list().map(row =>
                    m('tr.table-default', [
                        m('td', row.studyName),
                        m('td', row.taskName),
                        m('td', row.date),
                        m('td', row.starts),
                        m('td', row.completes),
                        m('td', row.schema)
                    ])
                    )

                ]),
            ])
        ]);
    }
};
