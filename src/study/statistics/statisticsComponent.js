import {dateRangePicker} from 'utils/dateRange';
import {formFactory, textInput} from 'utils/formHelpers';
import sourceComponent from './sourceComponent';
import {getStatistics} from './statisticsModel';
import statisticsInstructions from './instructions';
import sortTable from 'utils/sortTable';
export default statisticsComponent;

let statisticsComponent = {
    controller(){
        let form = formFactory();
        let displayHelp = m.prop(false);
        let vars = {
            startDate: m.prop(new Date()),
            endDate: m.prop(new Date()),
            study: m.prop(''),
            task: m.prop(''),
            studyType: m.prop('Both'),
            studydb: m.prop('Any')
        };
        let query = {};
        let tableContent = m.prop();

        let filters = {
            study: m.prop(),
            task: m.prop(),
            group: m.prop(),
            showEmpty: m.prop(),
            time: m.prop('None'),
            firstTask: m.prop(''),
            lastTask: m.prop('')
        };
        submit();
        return {form, vars, filters, submit, displayHelp, tableContent};

        function submit(){
            getStatistics(query)
                .then(tableContent)
                .then(m.redraw);
        }
    },
    view: ({form, vars, filters, tableContent, submit, displayHelp}) => m('.statistics', [
        m('h3', 'Statistics'),
        m('.row', [
            m('.col-sm-6', [
                sourceComponent({label:'Source', studyType: vars.studyType, studyDb: vars.studyDb, form}),
                textInput({label:'Study', prop: vars.study , form}),
                textInput({label:'Task', prop: vars.task , form}),
                m('.form-group.row', [
                    m('.col-sm-2', [
                        m('label.form-control-label', 'Categories')
                    ]),
                    m('.col-sm-10.pull-right', [
                        m('.btn-group.btn-group-sm', [
                            button(filters.study, 'Study'),
                            button(filters.task, 'Task'),
                            m('button.btn.btn-secondary', {class: filters.time() !== 'None' ? 'active' : ''}, 'Time'),
                            m('.info-box', [
                                m('.card', [
                                    m('.card-header', 'Time filter'),
                                    m('.card-block.c-inputs-stacked', [
                                        radioButton(filters.time, 'None'),
                                        radioButton(filters.time, 'Days'),
                                        radioButton(filters.time, 'Weeks'),
                                        radioButton(filters.time, 'Months'),
                                        radioButton(filters.time, 'Years')
                                    ])
                                ])
                            ]),
                            button(filters.group, 'Data Group'),
                            button(filters.showEmpty, 'Hide empty', 'Hide Rows with Zero Started Sessions')
                        ])
                    ])
                ]),
                m('.form-group.row', [
                    m('.col-sm-2', [
                        m('label.form-control-label', 'Compute completions')
                    ]),
                    m('.col-sm-10.pull-right', [
                        m('.btn-group.btn-group-sm', [
                            m('.form-inline', [
                                m('.form-group', [
                                    m('label', 'From'),
                                    m('input.form-control', {placeholder: 'First task', value: filters.firstTask(), onchange: m.withAttr('value', filters.firstTask)})
                                ]),
                                m('.form-group', [
                                    m('label', 'To'),
                                    m('input.form-control', {placeholder: 'Last task', value: filters.lastTask(), onchange: m.withAttr('value', filters.lastTask)})
                                ])
                            ])
                        ])
                    ])
                ])
            ]),
            m('.col-sm-6', [
                dateRangePicker({startDate:vars.startDate, endDate: vars.endDate})
            ])
        ]),
        m('.row', [
            m('.col-sm-12',[
                m('button.btn.btn-secondary.btn-sm', {onclick: ()=>displayHelp(!displayHelp())}, 'Toggle help'),
                m('button.btn.btn-primary.pull-right', {onclick:submit}, 'Submit'),
                m('button.btn.btn-secondary.pull-right.m-r-1', {onclick:submit}, 'Download CSV')
            ])
        ]),
        !displayHelp() ? '' : m('.row', [
            m('.col-sm-12.p-a-2', statisticsInstructions())
        ]),
        m('.row', [
            m.component(statisticsTableComponent, {tableContent})
        ])
    ])
};

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

let button = (prop, text, title = '') => m('a.btn.btn-secondary', {
    class: prop() ? 'active' : '',
    onclick: () => prop(!prop()),
    title
}, text);

let radioButton = (prop, text) => m('label.c-input.c-radio', [
    m('input.form-control[type=radio]', {
        onclick: prop.bind(null, text),
        checked: prop() == text
    }),
    m('span.c-indicator'),
    text
]);
