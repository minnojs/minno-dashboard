import {dateRangePicker} from 'utils/dateRange';
import {formFactory, textInput} from 'utils/formHelpers';
import sourceComponent from './sourceComponent';
import dropdown from 'utils/dropdown';
export default statisticsComponent;

let statisticsComponent = {
    controller(){
        let form = formFactory();
        let vars = {
            startDate: m.prop(new Date()),
            endDate: m.prop(new Date()),
            study: m.prop(''),
            task: m.prop(''),
            studyType: m.prop('Both'),
            studydb: m.prop('Any')
        };

        let filters = {
            study: m.prop(),
            task: m.prop(),
            group: m.prop(),
            showEmpty: m.prop(),
            time: m.prop('None'),
            firstTask: m.prop(''),
            lastTask: m.prop('')
        };

        return {form, vars, filters};
    },
    view: ({form, vars, filters}) => m('.statistics', [
        m('h3', 'Statistics'),
        m('.row', [
            m('.col-sm-5', [
                sourceComponent({label:'Source', studyType: vars.studyType, studyDb: vars.studyDb, form}),
                textInput({label:'Study', prop: vars.study , form}),
                textInput({label:'Task', prop: vars.task , form}),
                m('h6', 'Filters:'),
                m('.btn-group', [
                    button(filters.study, 'study'),
                    button(filters.task, 'Task'),
                    m('button.btn.btn-success', {class: filters.time() !== 'None' ? 'active' : ''}, 'Time'),
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
                ]),
                m('h6', 'Compute completion'),
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
            ]),
            m('.col-sm-7', [
                dateRangePicker({startDate:vars.startDate, endDate: vars.endDate})
            ])
        ]),
        m('.row', [
            m('table', [
                m('thead', [
                    m('tr', [
                        m('th', 'Study'),
                        m('th', 'Data '),
                        m('th', 'Group'),
                        m('th', 'Started'),
                        m('th', 'Completed'),
                        m('th', 'CR%')
                    ])
                ]),
                m('tbody', [
                    [].map(task => m('tr', [
                        m('td', task.study),
                        m('td', task.data),
                        m('td', task.group),
                        m('td', task.started),
                        m('td', task.completed),
                        m('td', task.cr)
                    ]))
                ])
            ])
        ])
    ])
};


let button = (prop, text, title = '') => m('a.btn.btn-success', {
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
