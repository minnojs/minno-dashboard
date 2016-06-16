import sortTable from 'utils/sortTable';
export default statisticsTable;

let statisticsTable = args => m.component(statisticsTableComponent, args);

let statisticsTableComponent = {
    controller(){
        return {sortBy: m.prop()};
    },
    view({sortBy}, {tableContent}){
        let content = tableContent();
        if (!content) return m('.row'); 

        let list = m.prop(content.data);
        
        return m('.row.m-t-1', [
            m('.col-sm-12', [
                m('table.table.table-sm', {onclick: sortTable(list, sortBy)}, [
                    m('thead', [
                        m('tr.table-default', tableContent().headers.map((header,index) => m('th',{'data-sort-by':index, class: sortBy() === index ? 'active' : ''}, header)))
                    ]),
                    m('tbody', tableContent().data.map(row => m('tr', row.map(column => m('td', column)))))
                ])
            ])
        ]);
    }
};
