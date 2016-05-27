import {dateRangePicker} from 'utils/dateRange';
import {formFactory, textInput} from 'utils/formHelpers';
import inputWrapper from 'utils/forms/inputWrapper';
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

        return {form, vars};
    },
    view: ({form, vars}) => m('.statistics', [
        
        m('h3', 'Statistics'),
        m('.row', [
            m('.col-sm-5', [
                m.component(sourceComponent, {label:'Source', studyType: vars.studyType, studyDb: vars.studyDb, form}),
                textInput({label:'Study', prop: vars.study , form}),
                textInput({label:'Task', prop: vars.task , form})
            ]),
            m('.col-sm-7', [
                dateRangePicker({startDate:vars.startDate, endDate: vars.endDate})
            ])
        ])
    ])
};

const STUDYTYPES = ['Research', 'Demo', 'Both'];
const STUDYDBS = ['Any', 'Current', 'History'];
let sourceComponent = {
    view: inputWrapper((ctrl, {studyType, studyDb}) => {
        return m('.form-inline', [
            m('select.c-select', {
                onchange: m.withAttr('value', studyType)
            }, STUDYTYPES.map(key => m('option', {value:key, selected: key === studyType()},key))),
            studyType() !== 'Research' 
                ? ''
                : m('select.c-select', {
                    onchange: m.withAttr('value', studyDb)
                }, STUDYDBS.map(key => m('option', {value:key},key)))
        ]);
    })
};
