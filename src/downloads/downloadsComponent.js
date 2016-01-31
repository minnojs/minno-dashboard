import sortTable from 'utils/sortTable';
import formatDate from 'utils/formatDate';
import {recursiveGetAll, remove, create} from './downloadsActions';
export default downloadsComponent;

const downloadsComponent = {
	controller(){
		const ctrl = {
			list: m.prop([]),
			create: create,
			remove: remove,
			globalSearch: m.prop(''),
			sortBy: m.prop('studyId'),
			isDownloading: m.prop(false)
		};
		recursiveGetAll({list:ctrl.list, cancel: ctrl.isDownloading});

		return ctrl;
	},

	view(ctrl) {
		let list = ctrl.list;
		return m('.downloads', [
			m('h2', 'Downloads'),
			m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
				m('thead', [
					m('tr', [
						m('th', {colspan:7}, [
							m('input.form-control', {placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch)})
						])
					]),
					m('tr', [
						m('th.text-xs-center', {colspan:7}, [
							m('button.btn.btn-secondary', {onclick:ctrl.create.bind(null, list)}, [
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
					list().filter(studyFilter(ctrl)).map(download => m('tr', [
						// ### ID
						m('td', download.studyId),

						// ### Study url
						m('td',
							download.fileSize
								? m('a', {href:download.studyUrl, download:true, target: '_blank'}, 'Download')
								: m('i.text-muted', 'No Data')
						),

						// ### Database
						m('td', download.db),

						// ### Filesize
						m('td', download.fileSize),

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
	return study =>
		includes(study.studyId, ctrl.globalSearch()) ||
		includes(study.studyUrl, ctrl.globalSearch());

	function includes(val, search){
		return typeof val === 'string' && val.includes(search);
	}
}