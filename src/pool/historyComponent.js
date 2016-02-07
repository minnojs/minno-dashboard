import {getLast100PoolUpdates} from './poolModel';
import sortTable from 'utils/sortTable';
import formatDate from 'utils/formatDate';
export default poolComponent;

let poolComponent = {
	controller: () => {
		const ctrl = {
			list: m.prop([]),
			globalSearch: m.prop(''),
			sortBy: m.prop()
		};

		getLast100PoolUpdates()
			.then(ctrl.list)
			.then(m.redraw);

		return ctrl;
	},
	view: ctrl => {
		let list = ctrl.list;
		return m('.pool', [
			m('h2', 'Pool history'),
			m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
				m('thead', [
					m('tr', [
						m('th', {colspan:8}, [
							m('input.form-control', {placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch)})
						])
					]),
					m('tr', [
						m('th', thConfig('studyId',ctrl.sortBy), 'ID'),
						m('th', thConfig('updaterId',ctrl.sortBy), 'Updater'),
						m('th', thConfig('creationDate',ctrl.sortBy), 'Creation Date'),
						m('th','New Status')
					])
				]),
				m('tbody', [
					list().filter(studyFilter(ctrl)).map(study => m('tr', [
						// ### ID
						m('td', study.studyId),

						m('td', study.updaterId),

						// ### Date
						m('td', formatDate(new Date(study.creationDate))),

						// ### Status
						m('td', [
							{
								R: m('span.label.label-success', 'Running'),
								P: m('span.label.label-info', 'Paused'),
								S: m('span.label.label-danger', 'Stopped')
							}[study.newStatus]
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
		includes(study.updaterId, ctrl.globalSearch()) ||
		includes(study.rulesUrl, ctrl.globalSearch());

	function includes(val, search){
		return typeof val === 'string' && val.includes(search);
	}
}