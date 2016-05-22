import {dateRangePicker} from 'utils/dateRange';
import {formFactory, textInput} from 'utils/formHelpers';
import sourceComponent from './sourceComponent';
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
                sourceComponent({label:'Source', studyType: vars.studyType, studyDb: vars.studyDb, form}),
                textInput({label:'Study', prop: vars.study , form}),
                textInput({label:'Task', prop: vars.task , form})
            ]),
            m('.col-sm-7', [
                dateRangePicker({startDate:vars.startDate, endDate: vars.endDate})
            ])
        ])
    ])
};
