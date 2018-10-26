export default args => m.component(createMessage, args);
import {dateRangePicker} from 'utils/dateRange';
import {get_exps, get_data} from '../study/studyModel';
import {baseUrl} from 'modelUrls';

let createMessage = {
    controller({exps, dates, study_id, versions, close}){
        let exp_id = m.prop('');
        let version_id = m.prop('');
        let all_exp_ids = m.prop('');
        let all_versions = m.prop('');
        let file_format = m.prop('csv');
        let file_split = m.prop('taskName');

        let loaded     = m.prop(false);
        let downloaded = m.prop(true);
        let link = m.prop('');
        let error = m.prop(null);
        dates ={
            startDate: m.prop(daysAgo(3650)),
            endDate: m.prop(daysAgo(-1))
        };

        get_exps(study_id)
            .then(response => {
                let all_exps = m.prop('');

                exps(response.experiments);
                all_exp_ids(exps().map(exp=>exp.id));
                exp_id(all_exp_ids());
                let tmp_exps = [];
                exps().forEach(exp=>{
                    !tmp_exps.find(exp2find=>exp2find.descriptive_id === exp.descriptive_id)
                    ?
                        tmp_exps.push({ids:[exp.id], descriptive_id:exp.descriptive_id})
                    :
                        tmp_exps.map(exp2update=>exp2update.descriptive_id === exp.descriptive_id ? exp2update.ids.push(exp.id) : exp2update);
                    exps(tmp_exps);
                });
            })
            .then(()=> {all_versions(versions.map(version=>version.id)); version_id(all_versions())})
            .catch(error)
            .then(loaded.bind(null, true))
            .then(m.redraw);

        return {study_id, exp_id, version_id, file_format, exps, versions, file_split, all_exp_ids, all_versions, loaded, downloaded, link, error, dates, close};
    },
    view: ({study_id, exp_id, version_id, file_format, file_split, exps, versions, all_exp_ids, all_versions, loaded, downloaded, link, error, dates, close}) => m('div', [

        m('.card-block', [
            m('.row', [
                m('.col-sm-4', [
                    m('.input-group', [m('strong', 'Experimant id'),
                        m('select.c-select.form-control',{onchange: e => exp_id(e.target.value)}, [
                            exps().length<=1 ? '' : m('option', {selected:true, value:all_exp_ids()}, 'All experiments'),
                            exps().map(exp=> m('option', {value:exp.ids} , exp.descriptive_id))
                        ])
                    ])
                ]),
                m('.col-sm-5', [
                    m('.input-group', [m('strong', 'Version id'),
                        m('select.c-select.form-control',{onchange: e => version_id(e.target.value)}, [
                            versions.length<=1 ? '' : m('option', {selected:true, value:all_versions()}, 'All versions'),
                            versions.map(version=> m('option', {value:version.id}, `${version.version} (${version.state})`))
                        ])
                    ])
                ]),
                m('p',exp_id),
                m('.col-sm-3', [
                    m('.input-group', [m('strong', 'Output type'),
                        m('select.c-select.form-control',{onchange: e => file_format(e.target.value)}, [
                            m('option', {value:'csv'}, 'csv'),
                            m('option', {value:'tsv'}, 'tsv'),
                            m('option', {value:'json'}, 'json')
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
            m('a.btn.btn-primary.btn-sm', {onclick:()=>{ask_get_data(study_id, exp_id, version_id, file_format, file_split, dates, downloaded, link, error); }}, 'OK')
        ])
    ])
};

function ask_get_data(study_id, exp_id, version_id, file_format, file_split, dates, downloaded, link, error){
    error('');
    if(exp_id() =='')
        return error('Please select experiment id');

    if(!Array.isArray(exp_id()))
        exp_id(exp_id().split(','));
    downloaded(false);

    return get_data(study_id, exp_id(), version_id(), file_format(), file_split(), dates.startDate(), dates.endDate())
        .then(response => {
            const file_data = response.data_file;
            if (file_data == null) return Promise.reject('There was a problem creating your file, please contact your administrator');
            link(`${baseUrl}/download?path=${file_data}`, file_data);
        })
        .catch(err=>error(err.message))
        .then(()=>downloaded(true))

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
