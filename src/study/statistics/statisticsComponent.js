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
            timeDay: m.prop(),
            timeWeek: m.prop(),
            timeMonth: m.prop(),
            timeYear: m.prop(),
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
                    m('button.btn.btn-success', {class: filters.timeDay() || filters.timeWeek() || filters.timeMonth() || filters.timeYear() ? 'active' : ''}, 'Time'),
                    m('.info-box', [
                        m('.card', [
                            m('.card-header', 'Time filters'),
                            m('.card-block.c-inputs-stacked', [
                                checkbox(filters.timeDay, 'Days'),
                                checkbox(filters.timeWeek, 'Weeks'),
                                checkbox(filters.timeMonth, 'Months'),
                                checkbox(filters.timeYear, 'Years')
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
        ])
    ])
};


let button = (prop, text, title = '') => m('a.btn.btn-success', {
    class: prop() ? 'active' : '',
    onclick: () => prop(!prop()),
    title
}, text);

let checkbox = (prop, text) => m('label.c-input.c-checbkox', [
    m('input.form-control[type=checkbox]', {
        onclick: m.withAttr('checked', prop),
        checked: prop()
    }),
    m('span.c-indicator'),
    text
]);
