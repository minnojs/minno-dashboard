import sortTable from 'utils/sortTable';
import formatDate from 'utils/formatDate';
import {getAll, remove, create} from './downloadsActions';
export default downloadsComponent;

const TABLE_WIDTH = 7;

const downloadsComponent = {
	controller(){
		let list = m.prop([]);
		let cancelDownload = m.prop(false);

		const ctrl = {
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

		getAll({list:ctrl.list, cancel: cancelDownload, error: ctrl.error});

		return ctrl;
	},

	view(ctrl) {
		let list = ctrl.list;
		return m('.downloads', [
			m('h2', 'Downloads'),
			ctrl.error()
				?
				m('.alert.alert-warning',
					m('strong', 'Warning!! '), ctrl.error().message
				)
				:
				m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
					m('thead', [
						m('tr', [
							m('th', {colspan:TABLE_WIDTH}, [
								m('input.form-control', {placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch)})
							])
						]),
						m('tr', [
							m('th.text-xs-center', {colspan:TABLE_WIDTH}, [
								m('button.btn.btn-secondary', {onclick:ctrl.create.bind(null, list, ctrl.cancelDownload)}, [
									m('i.fa.fa-plus'), '  Download request'
								])
							])
						]),
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
							?
							m('tr.table-info',
								m('td.text-xs-center', {colspan: TABLE_WIDTH},
									m('strong', 'Heads up! '), 'There are no downloads running yet'
								)
							)
							:

							list().filter(studyFilter(ctrl)).map(download => m('tr', [
								// ### ID
								m('td', download.studyId),

								// ### Study url
								m('td',
									download.fileSize && download.studyUrl
										? m('a', {href:download.studyUrl, download:true, target: '_blank'}, 'Download')
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
									m('.card.info-box', [
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
								]),

								// ### Status
								m('td', [
									{
										C: m('span.label.label-success', 'Complete'),
										R: m('span.label.label-info', 'Running'),
										X: m('span.label.label-danger', 'Error')
									}[download.studyStatus]
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