import {STATUS_RUNNING, STATUS_COMPLETE, STATUS_ERROR} from './downloadsModel';
import sortTable from 'utils/sortTable';
import formatDate from 'utils/formatDate';
import {getAll, remove, create} from './downloadsActions';
export default downloadsComponent;

const TABLE_WIDTH = 7;
const statusLabelsMap = {}; // defined at the bottom of this file

const downloadsComponent = {
    controller(){
        let list = m.prop([]);
        let loaded = m.prop(false);

        let cancelDownload = m.prop(false);

        const ctrl = {
            loaded,
            list,
            cancelDownload,
            create,
            remove,
            globalSearch: m.prop(''),
            sortBy: m.prop('studyId'),
            onunload(){
                cancelDownload(true);
            },
            error: m.prop('')
        };

        getAll({list:ctrl.list, cancel: cancelDownload, error: ctrl.error, loaded:ctrl.loaded});
        return ctrl;
    },

    view(ctrl) {

        if (!ctrl.loaded())
            return m('.loader');

        let list = ctrl.list;

        if (ctrl.error()) return m('.downloads', [
            m('h3', 'Data Download'),
            m('.alert.alert-warning', [
                m('strong', 'Warning!! '), ctrl.error().message
            ])
        ]);

        return m('.downloads', [
            m('.row.m-b-1', [
                m('.col-sm-6', [
                    m('h3', 'Data Download')
                ]),
                m('.col-sm-3',[
                    m('button.btn.btn-secondary.pull-right', {onclick:ctrl.create.bind(null, list, ctrl.cancelDownload)}, [
                        m('i.fa.fa-plus'), ' Request Data'
                    ])
                ]),
                m('.col-sm-3',[
                    m('input.form-control', {placeholder: 'Search ...', oninput: m.withAttr('value', ctrl.globalSearch)})
                ])
            ]),

            m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                m('thead', [
                    m('tr', [
                        m('th', thConfig('studyId',ctrl.sortBy), 'ID'),
                        m('th', 'Data file'),
                        m('th', thConfig('db',ctrl.sortBy), 'Database'),
                        m('th', thConfig('fileSize',ctrl.sortBy), 'File Size'),
                        m('th', thConfig('creationDate',ctrl.sortBy), 'Date Added'),
                        m('th','Status'),
                        m('th','Actions')
                    ])
                ]),
                m('tbody', [
                    list().length === 0
                        ? m('tr.table-info', [
                            m('td.text-xs-center', {colspan: TABLE_WIDTH}, 'There are no downloads running yet')
                        ])
                        : list().filter(studyFilter(ctrl)).map(download => m('tr', [
                            // ### ID
                            m('td', download.studyId),

                            // ### Study url
                            m('td', download.studyStatus == STATUS_RUNNING
                                ? m('i.text-muted', 'Loading...')
                                : download.fileSize
                                    ? m('a', {href:download.studyUrl, download:download.studyId + '.zip', target: '_blank'}, 'Download')
                                    : m('i.text-muted', 'No Data')
                            ),

                            // ### Database
                            m('td', download.db),

                            // ### Filesize
                            m('td', download.fileSize !== 'unknown'
                                ? download.fileSize
                                : m('i.text-muted', 'Unknown')
                            ),

                            // ### Date Added
                            m('td', [
                                formatDate(new Date(download.creationDate)),
                                '  ',
                                m('i.fa.fa-info-circle'),
                                m('.info-box', [
                                    m('.card', [
                                        m('.card-header', 'Creation Details'),
                                        m('ul.list-group.list-group-flush',[
                                            m('li.list-group-item', [
                                                m('strong', 'Creation Date: '), formatDate(new Date(download.creationDate))
                                            ]),
                                            m('li.list-group-item', [
                                                m('strong', 'Start Date: '), formatDate(new Date(download.startDate))
                                            ]),
                                            m('li.list-group-item', [
                                                m('strong', 'End Date: '), formatDate(new Date(download.endDate))
                                            ])
                                        ])
                                    ])
                                ])
                            ]),

                            // ### Status
                            m('td', [
                                statusLabelsMap[download.studyStatus]
                            ]),

                            // ### Actions
                            m('td', [
                                m('.btn-group', [
                                    m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.remove.bind(null, download, list)}, [
                                        m('i.fa.fa-close')
                                    ])
                                ])
                            ])
                        ]))
                ])
            ])
        ]);
    }
};

// @TODO: bad idiom! should change things within the object, not the object itself.
let thConfig = (prop, current) => ({'data-sort-by':prop, class: current() === prop ? 'active' : ''});

function studyFilter(ctrl){
    let search = ctrl.globalSearch();
    return study =>
        includes(study.studyId, search) ||
        includes(study.studyUrl, search);

    function includes(val, search){
        return typeof val === 'string' && val.includes(search);
    }
}

statusLabelsMap[STATUS_COMPLETE] = m('span.label.label-success', 'Complete');
statusLabelsMap[STATUS_RUNNING] = m('span.label.label-info', 'Running');
statusLabelsMap[STATUS_ERROR] = m('span.label.label-danger', 'Error');
