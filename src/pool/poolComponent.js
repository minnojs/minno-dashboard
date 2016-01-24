import {getAllPoolStudies, STATUS_PAUSED, STATUS_RUNNING} from './poolModel';
import {play, pause, remove, edit, create} from './poolActions';
// import classNames from 'utils/classNames';
import sortTable from './sortTable';
export default poolComponent;


let poolComponent = {
	controller: () => {
		const ctrl = {
			play: play,
			pause: pause,
			remove: remove,
			edit: edit,
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
						m('th', {colspan:7}, [
							m('input.form-control', {placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch)})
						])
					]),
					m('tr', [
						m('th', thConfig('studyId',ctrl.sortBy), 'ID'),
						m('th', thConfig('studyUrl',ctrl.sortBy), 'URL'),
						m('th', thConfig('rulesUrl',ctrl.sortBy), 'rules'),
						m('th', thConfig('completedSessions',ctrl.sortBy), 'Completed'),
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
							m('a', {href:study.studyUrl}, 'study')
						]),

						// ### Rules url
						m('td', [
							m('a', {href:study.rulesUrl}, 'rules')
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
						m('td', new Date(study.creationDate).toDateString()),

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




`


		<div class="container" ng-controller="dataCtrl">
			<h2>Admin - running studies</h2>

			<table st-table="displayedCollection" st-safe-src="rowCollection" class="table table-striped table-hover" ng-controller="tableCtrl" st-set-filter="stCustomFilter">
				<thead>
					<tr>
						<th colspan="2"><input st-search="" class="form-control" placeholder="global search ..." type="text"/></th>
						<th colspan="4" class="form-inline" st-between-dates="creationDate">
							After: <input type="text" class="form-control" ng-model="afterDate" ui-mask="99/99/9999" placeholder="MM/DD/YYYY" model-view-value="true"/>
							Before: <input type="text" class="form-control" ng-model="beforeDate" ui-mask="99/99/9999" placeholder="MM/DD/YYYY" model-view-value="true"/>
						</th>
					</tr>
					<tr ng-controller="addStudyCtrl" class="info">
						<th colspan="6" class="text-center">
							<div ng-if="pending" class="loader">Loading...</div>
							<button ng-if="!pending" class="btn btn-default" type="button" ng-click="add()">
								<span class="glyphicon glyphicon-plus"></span> Add new study
							</button>
						</th>
					</tr>
					<tr ng-if="!displayedCollection.length" class="info">
						<th colspan="6" class="text-center"><i>There are no studies defined yet</i></th>
					</tr>
					<tr>
						<th st-sort="studyId">ID</th>
						<th st-sort="studyUrl">URL</th>
						<th st-sort="rulesUrl">rules</th>
						<th st-sort="creationDate">Date Added</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr ng-repeat="row in displayedCollection">
						<td>{{study.studyId}}</td>
						<td><a href="{{study.studyUrl}}">{{study.studyUrl}}</a></td>
						<td>{{study.rulesUrl}}</td>
						<td>{{study.creationDate | date:'short'}}</td>
						<td ng-switch="study.studyStatus">
							<span ng-switch-when="R" class="label label-success">Running</span>
							<span ng-switch-when="P" class="label label-warning">Paused</span>
							<span ng-switch-when="S" class="label label-danger">Stopped</span>
						</td>

						<td>
							<div ng-if="study.$pending" class="loader">Loading...</div>

							<div ng-if="!study.$pending">
								<span ng-switch="study.studyStatus">
									<button ng-switch-when="P" class="btn btn-success" type="button" ng-click="play(row)">
										<span class="glyphicon glyphicon-play"></span>
									</button>

									<button ng-switch-when="R" class="btn btn-info" type="button" ng-click="pause(row)">
										<span class="glyphicon glyphicon-pause"></span>
									</button>
								</span>

								<button class="btn btn-danger" type="button" ng-click="remove(row)">
									<span class="glyphicon glyphicon-remove"></span>
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
`;