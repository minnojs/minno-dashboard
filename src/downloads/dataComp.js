export default args => m.component(createMessage, args);
import {dateRangePicker} from 'utils/dateRange';
import {get_exps, get_data} from "../study/studyModel";
import {baseUrl} from 'modelUrls';
import downloadUrl from 'utils/downloadUrl';

let createMessage = {
    controller({tags, exps, dates, study_id}){
        let exp_id = m.prop('');
        let all_exps = m.prop('');
        let file_format = m.prop('csv');
        let loaded = m.prop(false);
        let error = m.prop(null);
        dates ={
            startDate: m.prop(daysAgo(3650)),
            endDate: m.prop(new Date())
        };
        get_exps(study_id)
            .then(response => {exps(response.experiments); all_exps(exps().map(exp=>exp.id)); exp_id(all_exps())})
            .catch(error)
            .then(loaded.bind(null, true))
            .then(m.redraw);

        return {study_id, exp_id, file_format, exps, all_exps, loaded, error, dates};
    },
    view: ({study_id, exp_id, file_format, exps, all_exps, loaded, error, dates}) => m('div', [
        m('.card-block', [

            m('.row', [
                m('.col-sm-5', [
                    m('.input-group', [
                    m('select.c-select.form-control',{onchange: e => exp_id(e.target.value)}, [
                        m('option', {value:all_exps()}, 'Show all my experiments'),
                        exps().map(exp=> m('option', {value:exp.id}, exp.descriptive_id))
                    ])
                ])]),
                m('.col-sm-5', [
                    m('.input-group', [
                    m('select.c-select.form-control',{onchange: e => file_format(e.target.value)}, [
                        m('option', {value:'csv'}, 'csv'),
                        m('option', {value:'tsv'}, 'tsv')
                    ])
                ])])
            ]),
            m('.row', [
                m('.col-sm-12', [
                    m('.form-group', [
                        dateRangePicker(dates),
                        m('p.text-muted.btn-toolbar', [
                            dayButtonView(dates, 'Last 7 Days', 7),
                            dayButtonView(dates, 'Last 30 Days', 30),
                            dayButtonView(dates, 'Last 90 Days', 90),
                            dayButtonView(dates, 'All time', 3650)
                        ])
                    ])
                ])
            ])
        ]),
        loaded() ? '' : m('.loader'),
        error() ? m('.alert.alert-warning', error().message): '',
        loaded() && !exps().length ? m('.alert.alert-info', 'You have no experiments yet') : '',
        m('.text-xs-right.btn-toolbar',[
            m('a.btn.btn-secondary.btn-sm', {onclick:''}, 'Cancel'),
            m('a.btn.btn-primary.btn-sm', {onclick:()=>{ask_get_data(study_id, exp_id, file_format, dates, error);}}, 'OK')
        ])

    ])
};

function ask_get_data(study_id, exp_id, file_format, dates, error){
    if(!Array.isArray(exp_id()))
        exp_id(exp_id().split(','));

    return get_data(study_id, exp_id(), file_format(), dates.startDate(), dates.endDate())
        .then(response => {var file_data = response.data_file;
                            downloadUrl(`${baseUrl}/download?path=${file_data}`, file_data)
                            })
        .catch(error)
        .then(m.redraw);
}

let focusConfig = (element, isInitialized) => {
    if (!isInitialized) element.focus();
};

// helper functions for the day buttons
let daysAgo = (days) => {
    let d = new Date();
    d.setDate(d.getDate() - days);
    return d;
};
let equalDates = (date1, date2) => date1.getDate() === date2.getDate();
let activeDate = ({startDate, endDate}, days) => equalDates(startDate(), daysAgo(days)) && equalDates(endDate(), new Date());

let dayButtonView = (dates, name, days) => m('button.btn.btn-secondary.btn-sm', {
    class: activeDate(dates, days)? 'active' : '',
    onclick: () => {
        dates.startDate(daysAgo(days));
        dates.endDate(new Date());
    }
}, name);
