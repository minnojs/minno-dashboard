import messages from '../../messagesComponent';
import pipWizard from './wizards/pipWizard';
export default sidebarButtons;

let sidebarButtons = {
	controller: ({study}) => {
		let ctrl = {
			newOpen: false,
			toggleNew: () => ctrl.newOpen = !ctrl.newOpen,
			createEmpty: createEmpty,
			createPIP: createPIP
		};

		return ctrl;

		function create(name, content){
			return response => {
				if (response) {
					study.create(name(), content())
						.then(m.redraw)
						.catch(response => messages.alert({
							heaser: 'Failed to create file:',
							content: response.message
						}));
				}
			};
		}

		function createEmpty(){
			let name = m.prop();
			let content = ()=>'';

			messages.prompt({
				header: 'Create file',
				content: 'Please insert the file name:',
				prop: name
			}).then(create(name,content));
		}

		function createPIP(){
			let name = m.prop();
			let content = m.prop();
			pipWizard({name, content}).then(create(name, content));
		}
	},

	view: ctrl => {
		return m('.btn-group', {class: ctrl.newOpen ? 'open' : ''}, [
			m('.btn.btn-sm.btn-secondary', {onclick:ctrl.createEmpty}, [
				m('i.fa.fa-plus'), ' New'
			]),
			m('.btn.btn-sm.btn-secondary.dropdown-toggle', {onclick:ctrl.toggleNew}),
			m('.dropdown-menu', {onclick: ctrl.toggleNew}, [
				m('a.dropdown-item', {onclick: ctrl.createPIP}, 'piPlayer'),
				m('a.dropdown-item', 'piQuest'),
				m('a.dropdown-item', 'piManager')
			])
		]);
	}
};