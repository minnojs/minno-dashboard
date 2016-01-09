import filesComponent from './filesComponent';
import messages from '../../messagesComponent';
export default sidebarComponent;

let sidebarComponent = {
	view: (ctrl , study) => {
		return m('.editor-sidebar', [
			m('h5', [
				study.id
			]),

			m.component(sidebarButtons, {study}),
			m.component(filesComponent, study)
		]);
	}
};

let sidebarButtons = {
	controller: ({study}) => {
		let ctrl = {
			newOpen: false,
			toggleNew: () => ctrl.newOpen = !ctrl.newOpen,
			create: create
		};

		return ctrl;

		function create(){
			let name = m.prop();

			messages.prompt({
				header: 'Create file',
				content: 'Please insert the file name:',
				prop: name
			})
			.then(response => {
				if (response) {
					study.create(name())
						.then(m.redraw)
						.catch(response => messages.alert({
							heaser: 'Failed to create file:',
							content: response.message
						}));
				}
			});
		}
	},
	view: ctrl => {
		return m('.btn-group', {class: ctrl.newOpen ? 'open' : ''}, [
			m('.btn.btn-sm.btn-secondary', {onclick:ctrl.create}, [
				m('i.fa.fa-plus'), ' New'
			]),
			m('.btn.btn-sm.btn-secondary.dropdown-toggle', {onclick:ctrl.toggleNew}),
			m('.dropdown-menu',[
				m('a.dropdown-item', 'piPlayer'),
				m('a.dropdown-item', 'piQuest'),
				m('a.dropdown-item', 'piManager')
			])
		]);
	}
};