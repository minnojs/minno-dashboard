import {dateRangePicker} from 'utils/dateRange';
import {formFactory, textInput, selectInput} from 'utils/formHelpers';
export default statisticsForm;

let statisticsForm = args => m.component(statisticsFormComponent, args);
const colWidth = 3;
const SOURCES = {
    'Research pool - Current studies'   : 'Research:Current',
//    'Research pool - Past studies'      : 'Research:History',
    'All research - Pool and lab'       : 'Research:Any',
    'Demo studies'                      : 'Demo:Any',
    'All studies'                       : 'Both:Any'
};

let statisticsFormComponent = {
    controller(){
        let form = formFactory();

        return {form};
    },
    view({form}, {query}){
        return m('.col-sm-12', [
            selectInput({label: 'Source', prop: query.source, values: SOURCES, form, colWidth}),
            textInput({label:'Study', prop: query.study , form, colWidth}),
            m('div', {style: 'padding: .375rem .75rem'}, dateRangePicker({startDate:query.startDate, endDate: query.endDate})),
            m('.form-group.row', [
                m('.col-sm-3', [
                    m('label.form-control-label', 'Show by')
                ]),
                m('.col-sm-9.pull-right', [
                    m('.btn-group.btn-group-sm', [
                        button(query.sortstudy, 'Study'),
                        button(query.sorttask, 'Task'),
                        m('a.btn.btn-secondary.statistics-time-button', {class: query.sorttime() !== 'All' ? 'active' : ''}, [
                            'Time',
                            m('.time-card', [
                                m('.card', [
                                    m('.card-header', 'Time filter'),
                                    m('.card-block.c-inputs-stacked', [
                                        radioButton(query.sorttime, 'All'),
                                        radioButton(query.sorttime, 'Days'),
                                        radioButton(query.sorttime, 'Weeks'),
                                        radioButton(query.sorttime, 'Months'),
                                        radioButton(query.sorttime, 'Years')
                                    ])
                                ])
                            ])
                        ]),
                    ]),
                    m('.btn-group.btn-group-sm.pull-right', [
                        button(query.showEmpty, 'Hide Empty', 'Hide Rows with Zero Started Sessions'),
                        button(query.sortgroup, 'Show Data Group')

                    ])
                ])
            ]),
            m('.form-group.row', [
                m('.col-sm-3', [
                    m('label.form-control-label', 'Compute completions')
                ]),
                m('.col-sm-9', [
                    m('.row', [
                        m('.col-sm-5', [
                            m('input.form-control', {placeholder: 'First task', value: query.firstTask(), onchange: m.withAttr('value', query.firstTask)})
                        ]),
                        m('.col-sm-1', [
                            m('.form-control-static', 'to')
                        ]),
                        m('.col-sm-5', [
                            m('input.form-control', {placeholder: 'Last task', value: query.lastTask(), onchange: m.withAttr('value', query.lastTask)})
                        ])
                    ])
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
