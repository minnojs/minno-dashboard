import sortTable from 'utils/sortTable';
import formatDate from 'utils/formatDate';
import {fetchJson} from 'utils/modelHelpers';
export default downloadsComponent;
let dud = a=> () => console.log(a);

const downloadsComponent = {
	controller(){
		const ctrl = {
			list: m.prop([]),
			create: dud('create'),
			remove: dud('remove'),
			globalSearch: m.prop(''),
			sortBy: m.prop('studyId')
		};

		fetchJson('/dashboard/DashboardData', {method:'post', body: {action:'getAllDownloads'}})
			.then(ctrl.list)
			.then(m.redraw);

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
					list().filter(studyFilter(ctrl)).map(study => m('tr', [
						// ### ID
						m('td', study.studyId),

						// ### Study url
						m('td',
							study.fileSize
								? m('a', {href:study.studyUrl, download:true, target: '_blank'}, 'Download')
								: m('i.text-muted', 'No Data')
						),

						// ### Database
						m('td', study.db),

						// ### Filesize
						m('td', study.fileSize),

						// ### Date Added
						m('td', [
							formatDate(new Date(study.creationDate)),
							'  ',
							m('i.fa.fa-info-circle'),
							m('.card.info-box', [
								m('.card-header', 'Creation Details'),
								m('ul.list-group.list-group-flush',[
									m('li.list-group-item', [
										m('strong', 'Creation Date: '), formatDate(new Date(study.creationDate))
									]),
									m('li.list-group-item', [
										m('strong', 'Start Date: '), formatDate(new Date(study.startDate))
									]),
									m('li.list-group-item', [
										m('strong', 'End Date: '), formatDate(new Date(study.endDate))
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
							}[study.studyStatus]
						]),

						// ### Actions
						m('td', [
							m('.btn-group', [
								m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.remove.bind(null, study, list)}, [
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