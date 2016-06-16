import {getStatistics} from './statisticsModel';
import statisticsForm from './statisticsFormComponent';
import statisticsTable from './statisticsTableComponent';
import statisticsInstructions from './instructions';
export default statisticsComponent;

let statisticsComponent = {
    controller(){
        let displayHelp = m.prop(false);
        let tableContent = m.prop();
        let query = {
            source: m.prop('Research:Current'),
            startDate: m.prop(new Date()),
            endDate: m.prop(new Date()),
            study: m.prop(''),
            task: m.prop(''),
            studyType: m.prop('Both'),
            studydb: m.prop('Any'),
            sortstudy: m.prop(false),
            sorttask: m.prop(false),
            sortgroup: m.prop(false),
            sorttime: m.prop('None'),
            showEmpty: m.prop(false),
            firstTask: m.prop(''),
            lastTask: m.prop('')
        };

        return {query, submit, displayHelp, tableContent};

        function submit(){
            getStatistics(query)
                .then(tableContent)
                .then(m.redraw);
        }
    },
    view: ({query, tableContent, submit, displayHelp}) => m('.container.statistics', [
        m('h3', 'Statistics'),
        m('.row', [
            statisticsForm({query})
        ]),
        m('.row', [
            m('.col-sm-12',[
                m('button.btn.btn-secondary.btn-sm', {onclick: ()=>displayHelp(!displayHelp())}, ['Toggle help ', m('i.fa.fa-question-circle')]),
                m('a.btn.btn-primary.pull-right', {onclick:submit}, 'Submit'),
                !tableContent() ? '' : m('a.btn.btn-secondary.pull-right.m-r-1', {config:downloadFile(`${tableContent().study}.csv`, tableContent().file)}, 'Download CSV')
            ])
        ]),
        !displayHelp() ? '' : m('.row', [
            m('.col-sm-12.p-a-2', statisticsInstructions())
        ]),
        m('.row', [
            statisticsTable({tableContent})
        ])
    ])
};

let downloadFile = (filename, text) => element => {
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
};
