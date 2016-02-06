import {getAllPoolStudies, STATUS_PAUSED, STATUS_RUNNING} from './poolModel';
import {play, pause, remove, edit, create, reset} from './poolActions';
// import classNames from 'utils/classNames';
import sortTable from 'utils/sortTable';
import formatDate from 'utils/formatDate';
export default poolComponent;

const PRODUCTION_URL = 'https://implicit.harvard.edu/implicit/';

let poolComponent = {
	controller: () => {
		const ctrl = {
			play: play,
			pause: pause,
			remove: remove,
			edit: edit,
			reset: reset,
			create: create,
			list: m.prop([]),
			globalSearch: m.prop(''),
			sortBy: m.prop()
		};

		getAllPoolStudies()
			.then(ctrl.list)
			.then(m.redraw);

		return ctrl;
	},
	view: ctrl => {
		let list = ctrl.list;
		return m('.pool', [
			m('h2', 'Study pool'),
			m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
				m('thead', [
					m('tr', [
						m('th', {colspan:8}, [
							m('input.form-control', {placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch)})
						])
					]),
					m('tr', [
						m('th.text-xs-center', {colspan:8}, [
							m('button.btn.btn-secondary', {onclick:ctrl.create.bind(null, list)}, [
								m('i.fa.fa-plus'), '  Add new study'
							])
						])
					]),
					m('tr', [
						m('th', thConfig('studyId',ctrl.sortBy), 'ID'),
						m('th', thConfig('studyUrl',ctrl.sortBy), 'Study'),
						m('th', thConfig('rulesUrl',ctrl.sortBy), 'Rules'),
						m('th', thConfig('autopauseUrl',ctrl.sortBy), 'Autopause'),
						m('th', thConfig('completedSessions',ctrl.sortBy), 'Completion'),
						m('th', thConfig('creationDate',ctrl.sortBy), 'Date'),
						m('th','Status'),
						m('th','Actions')
					])
				]),
				m('tbody', [
					list().filter(studyFilter(ctrl)).map(study => m('tr', [
						// ### ID
						m('td', study.studyId),

						// ### Study url
						m('td', [
							m('a', {href:PRODUCTION_URL + study.studyUrl, target: '_blank'}, 'Study')
						]),

						// ### Rules url
						m('td', [
							m('a', {href:PRODUCTION_URL + study.rulesUrl, target: '_blank'}, 'Rules')
						]),

						// ### Autopause url
						m('td', [
							m('a', {href:PRODUCTION_URL + study.autopauseUrl, target: '_blank'}, 'Autopause')
						]),

						// ### Completions
						m('td', [
							(100 * study.completedSessions / study.targetCompletions).toFixed(1) + '% ',
							m('i.fa.fa-info-circle'),
							m('.card.info-box', [
								m('.card-header', 'Completion Details'),
								m('ul.list-group.list-group-flush',[
									m('li.list-group-item', [
										m('strong', 'Target Completions: '), study.targetCompletions
									]),
									m('li.list-group-item', [
										m('strong', 'Started Sessions: '), study.startedSessions
									]),
									m('li.list-group-item', [
										m('strong', 'Completed Sessions: '), study.completedSessions
									])
								])
							])
						]),

						// ### Date
						m('td', formatDate(new Date(study.creationDate))),

						// ### Status
						m('td', [
							{
								R: m('span.label.label-success', 'Running'),
								P: m('span.label.label-info', 'Paused'),
								S: m('span.label.label-danger', 'Stopped')
							}[study.studyStatus]
						]),

						// ### Actions
						m('td', [
							study.$pending
								?
								m('.l', 'Loading...')
								:
								m('.btn-group', [
									study.studyStatus === STATUS_PAUSED ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.play.bind(null, study)}, [
										m('i.fa.fa-play')
									]) : '',
									study.studyStatus === STATUS_RUNNING ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.pause.bind(null, study)}, [
										m('i.fa.fa-pause')
									]) : '',
									m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.edit.bind(null, study)}, [
										m('i.fa.fa-edit')
									]),
									m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.reset.bind(null, study)}, [
										m('i.fa.fa-refresh')
									]),
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
		includes(study.studyUrl, ctrl.globalSearch()) ||
		includes(study.rulesUrl, ctrl.globalSearch());

	function includes(val, search){
		return typeof val === 'string' && val.includes(search);
	}
}