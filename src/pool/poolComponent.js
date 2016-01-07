import classNames from '../classNames';
export default poolComponent;


const runningStatus = 'R';
const pausedStatus = 'P';
const stoppedStatus = 'S';

let poolComponent = {
	controller: () => {
		const ctrl = {
			play: (row) => ()=> console.log(row),
			pause: (row) => ()=> console.log(row),
			remove: (row) => ()=> console.log(row),
			studyArr: []
		};

		fetch('/admin/studyData', {method:'post'})
			.then(request => request.json())
			.then(json => ctrl.studyArr = json)
			.then(m.redraw);

			window.ctrl = ctrl;


		return ctrl;
	},
	view: ctrl => {
		return m('.pool', [
			m('h2', 'Study pool'),
			m('table', {class:'table table-striped table-hover'}, [
				// m('thead', [
				// 	m('tr', [
				// 		m('th')
				// 	])
				// ]),
				m('tbody', [
					ctrl.studyArr.map(row => m('tr', [
						m('td', row.studyId),
						m('td', [
							m('a', {href:row.studyUrl}, 'study')
						]),
						m('td', [
							m('a', {href:row.rulesUrl}, 'rules')
						]),
						m('td', row.creationDate),
						m('td', [
							{
								R: m('span.label.label-success', 'Running'),
								P: m('span.label.label-info', 'Paused'),
								S: m('span.label.label-danger', 'Stopped')
							}[row.studyStatus]
						]),
						m('td', [
							row.$pending
								?
								m('.loading')
								:
								[
									row.studyStatus === 'P' ? m('button.btn.btn-success', {onclick: ctrl.play(row)}, [
										m('i.fa.fa-play')
									]) : '',
									row.studyStatus === 'R' ? m('button.btn.btn-info', {onclick: ctrl.pause(row)}, [
										m('i.fa.fa-pause')
									]) : '',
									m('button.btn.btn-danger', {onclick: ctrl.pause(row)}, [
										m('i.fa.fa-close')
									])
								]
						])
					]))
				])
			])
		]);
	}

};



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
						<td>{{row.studyId}}</td>
						<td><a href="{{row.studyUrl}}">{{row.studyUrl}}</a></td>
						<td>{{row.rulesUrl}}</td>
						<td>{{row.creationDate | date:'short'}}</td>
						<td ng-switch="row.studyStatus">
							<span ng-switch-when="R" class="label label-success">Running</span>
							<span ng-switch-when="P" class="label label-warning">Paused</span>
							<span ng-switch-when="S" class="label label-danger">Stopped</span>
						</td>

						<td>
							<div ng-if="row.$pending" class="loader">Loading...</div>

							<div ng-if="!row.$pending">
								<span ng-switch="row.studyStatus">
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