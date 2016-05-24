import {getAllOpenRequests, STATUS_APPROVED, STATUS_SUBMITTED} from './downloadsAccessModel';
import {play, pause, remove, edit, create, grant, revoke, reset} from './downloadsAccessActions';
import {getRole} from 'login/authModel';
import sortTable from 'utils/sortTable';
import formatDate from 'utils/formatDate';
export default downloadsAccessComponent;

const PRODUCTION_URL = 'https://implicit.harvard.edu/implicit/';
const TABLE_WIDTH = 6;

let downloadsAccessComponent = {
	controller: () => {
		const ctrl = {
			play: play,
			remove: remove,
			create: create,
			grant: grant,
			revoke: revoke,
			list: m.prop([]),
			globalSearch: m.prop(''),
			sortBy: m.prop(),
			error: m.prop(''),
			isAdmin: () => getRole() === 'SU',
		};

		getAllOpenRequests()
			.then(ctrl.list)
			.catch(ctrl.error)
			.then(m.redraw);

		return ctrl;
	},
	view: ctrl => {
		let list = ctrl.list;
		return m('.downloadAccess', [
			m('h2', 'Data Download Access Requests'),
			ctrl.error()
				?
				m('.alert.alert-warning',
					m('strong', 'Warning!! '), ctrl.error().message
				)
				:
				m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
					m('thead', [
						
						m('tr', [m('th.text-xs-left', {colspan:1}, [
								ctrl.isAdmin()? '' : m('button.btn.btn-secondary', {onclick:ctrl.create.bind(null, list)}, [
									m('i.fa.fa-plus'), '  Request Access From Admin'
								])
							]),
							m('th.text-xs-left', {colspan:1}, [
															m('button.btn.btn-secondary', {onclick:ctrl.grant.bind(null, list)}, [
																m('i.fa.fa-plus'), '  Grant Access'
															])
														])
							,m('th.text-xs-left', {colspan:1}, [
								ctrl.isAdmin()? m('button.btn.btn-secondary', {onclick:ctrl.revoke.bind(null, list)}, [
									m('i.fa.fa-plus'), '  Revoke Access'
								]) : ''
							]),m('th', {colspan:TABLE_WIDTH-2}, [
								m('input.form-control', {placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch)})
							]),
						
						]),
						
						m('tr', [
							m('th', thConfig('studyId',ctrl.sortBy), 'ID'),
							m('th', thConfig('username',ctrl.sortBy), 'Username'),
							m('th', thConfig('email',ctrl.sortBy), 'Email'),
							m('th', thConfig('creationDate',ctrl.sortBy), 'Date'),
							m('th','Status'),
							m('th','Actions')
						])
					]),
					m('tbody', [
						list().length === 0
							?
							m('tr.table-info',
								m('td.text-xs-center', {colspan: TABLE_WIDTH},
									m('strong', 'Heads up! '), 'There are no requests yet'
								)
							)
							:
							list().filter(dataRequestFilter(ctrl)).map(dataRequest => m('tr', [
								// ### ID
								m('td', dataRequest.studyId),
								
								// ### USERNAME
								m('td', dataRequest.username),
								
								// ### EMAIL
								m('td', dataRequest.email),

								// ### Date
								m('td', formatDate(new Date(dataRequest.creationDate))),
								dataRequest.approved=== STATUS_APPROVED
									?
									m('td', {style:'color:green'},'access granted')
									:
									m('td', {style:'color:red'},'access pending')

								// ### Actions
								,m('td', [
										m('.btn-group', [
											dataRequest.canApprove && dataRequest.approved === STATUS_SUBMITTED ? m('button.btn.btn-sm.btn-secondary', {title:'Approve request, and auto email requester',onclick: ctrl.play.bind(null, dataRequest,list)}, [
												m('i.fa.fa-play')
											]) : '',
											dataRequest.canDelete ? m('button.btn.btn-sm.btn-secondary', {title:'Delete request.  If this is a granted request owner will lose access to it',onclick: ctrl.remove.bind(null, dataRequest, list)}, [
												m('i.fa.fa-close')
											]) : ''
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

function dataRequestFilter(ctrl){
	return dataRequest =>
		includes(dataRequest.studyId, ctrl.globalSearch()) ||
		includes(dataRequest.username, ctrl.globalSearch()) ||
		includes(dataRequest.email, ctrl.globalSearch());

	function includes(val, search){
		return typeof val === 'string' && val.includes(search);
	}
}