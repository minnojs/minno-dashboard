import {dateRangePicker} from 'utils/dateRange';
import {formFactory, textInput, selectInput} from 'utils/formHelpers';
export default statisticsForm;

let statisticsForm = args => m.component(statisticsFormComponent, args);
const SOURCES = {
    'Research pool - Current studies'   : 'Research:Current',
    'Research pool - Past studies'      : 'Research:History',
    'Research pool - All studies'       : 'Research:Any',
    'Demo studies'                      : 'Demo:Any',
    'All studies'                       : 'Both:Any'
};

let statisticsFormComponent = {
    controller(){
        let form = formFactory();

        return {form};
    },
    view({form}, {query}){
        return m('.row', [
            m('.col-sm-6', [
                //sourceComponent({label:'Source', studyType: query.studyType, studyDb: query.studyDb, form}),
                selectInput({label: 'Source', prop: query.source, values: SOURCES, form}),
                textInput({label:'Study', prop: query.study , form}),
                textInput({label:'Task', prop: query.task , form}),
                m('.form-group.row', [
                    m('.col-sm-2', [
                        m('label.form-control-label', 'Categories')
                    ]),
                    m('.col-sm-10.pull-right', [
                        m('.btn-group.btn-group-sm', [
                            button(query.sortstudy, 'Study'),
                            button(query.sorttask, 'Task'),
                            m('button.btn.btn-secondary', {class: query.sorttime() !== 'None' ? 'active' : ''}, 'Time'),
                            m('.info-box', [
                                m('.card', [
                                    m('.card-header', 'Time filter'),
                                    m('.card-block.c-inputs-stacked', [
                                        radioButton(query.sorttime, 'None'),
                                        radioButton(query.sorttime, 'Days'),
                                        radioButton(query.sorttime, 'Weeks'),
                                        radioButton(query.sorttime, 'Months'),
                                        radioButton(query.sorttime, 'Years')
                                    ])
                                ])
                            ]),
                            button(query.sortgroup, 'Data Group'),
                            button(query.showEmpty, 'Hide empty', 'Hide Rows with Zero Started Sessions')
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
                                    m('input.form-control', {placeholder: 'First task', value: query.firstTask(), onchange: m.withAttr('value', query.firstTask)})
                                ]),
                                m('.form-group', [
                                    m('label', 'To'),
                                    m('input.form-control', {placeholder: 'Last task', value: query.lastTask(), onchange: m.withAttr('value', query.lastTask)})
                                ])
                            ])
                        ])
                    ])
                ])
            ]),
            m('.col-sm-6', [
                dateRangePicker({startDate:query.startDate, endDate: query.endDate})
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
