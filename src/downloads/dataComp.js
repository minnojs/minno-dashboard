export default args => m.component(createMessage, args);
import {dateRangePicker} from 'utils/dateRange';
import {get_exps, get_data} from '../study/studyModel';
import {baseUrl} from 'modelUrls';

let createMessage = {
    controller({tags, exps, dates, study_id, close}){
        let exp_id = m.prop('');
        let all_exps = m.prop('');
        let file_format = m.prop('csv');
        let file_split = m.prop('taskName');

        let loaded     = m.prop(false);
        let downloaded = m.prop(true);
        let link = m.prop('');
        let error = m.prop(null);
        dates ={
            startDate: m.prop(daysAgo(3650)),
            endDate: m.prop(new Date())
        };
        get_exps(study_id)
            .then(response => {exps(response.experiments); all_exps(exps().map(exp=>exp.id));})
            .catch(error)
            .then(loaded.bind(null, true))
            .then(m.redraw);

        return {study_id, exp_id, file_format, exps, file_split, all_exps, loaded, downloaded, link, error, dates, close};
    },
    view: ({study_id, exp_id, file_format, file_split, exps, all_exps, loaded, downloaded, link, error, dates, close}) => m('div', [
        m('.card-block', [
            m('.row', [
                m('.col-sm-5', [
                    m('.input-group', [
                        m('select.c-select.form-control',{onchange: e => exp_id(e.target.value)}, [
                            m('option', {value:'', disabled:true, selected:true}, 'Select experiment'),
                            exps().length<=1 ? '' : m('option', {value:all_exps()}, 'All experiments'),
                            exps().map(exp=> m('option', {value:exp.id}, exp.descriptive_id))
                        ])
                    ])
                ]),
                m('p',exp_id),
                m('.col-sm-3', [
                    m('.input-group', [
                        m('select.c-select.form-control',{onchange: e => file_format(e.target.value)}, [
                            m('option', {value:'csv'}, 'csv'),
                            m('option', {value:'tsv'}, 'tsv')
                        ])
                    ])
                ])
            ]),
            m('.row.space', [
                m('.col-sm-9', [
                    m('span', 'Split to files by (clear text to download in one file):'),
                    m('input.form-control', {
                        placeholder: 'File split variable',
                        value: file_split(),
                        oninput: m.withAttr('value', file_split)
                    })
                ])

            ]),
            m('.row.space', [
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
        error() ? m('.alert.alert-warning', error()): '',
        !loaded() && exps().length<1 ? m('.alert.alert-info', 'You have no experiments yet') : '',

        !link() ? '' : m('input-group-addon', ['Your file is ready for downloading: ', m('a', {href: link()}, link())]),

        downloaded() ? '' : m('.loader'),
        m('.text-xs-right.btn-toolbar',[
            m('a.btn.btn-secondary.btn-sm', {onclick:()=>{close(null);}}, 'Cancel'),
            m('a.btn.btn-primary.btn-sm', {onclick:()=>{ask_get_data(study_id, exp_id, file_format, file_split, dates, downloaded, link, error); }}, 'OK')
        ])
    ])
};

function ask_get_data(study_id, exp_id, file_format, file_split, dates, downloaded, link, error){
    error('');
    if(exp_id() =='')
        return error('Please select experiment id');

    if(!Array.isArray(exp_id()))
        exp_id(exp_id().split(','));
    downloaded(false);

    return get_data(study_id, exp_id(), file_format(), file_split(), dates.startDate(), dates.endDate())
        .then(response => {
            var file_data = response.data_file;
            link(`${baseUrl}/download?path=${file_data}`, file_data);
            downloaded(true);
        })
        .catch(error)
        .then(m.redraw);
}

// helper functions for the day buttons
let daysAgo = (days) => {
    let d = new Date();
    d.setDate(d.getDate() - days);
    return d;
};
let equalDates = (date1, date2) => date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth();
let activeDate = ({startDate, endDate}, days) => equalDates(startDate(), daysAgo(days)) && equalDates(endDate(), new Date());
let dayButtonView = (dates, name, days) => m('button.btn.btn-secondary.btn-sm', {

    class: activeDate(dates, days)? 'active' : '',
    onclick: () => {
        dates.startDate(daysAgo(days));
        dates.endDate(new Date());
    }
}, name);
