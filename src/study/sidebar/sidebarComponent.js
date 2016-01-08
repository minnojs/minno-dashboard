import filesComponent from './filesComponent';
import messages from '../../messagesComponent';
export default sidebarComponent;

let sidebarComponent = {
	controller: study => {
		return {
			create: create
		};

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
	view: (ctrl , study) => {
		return m('.editor-sidebar', [
			m('h5', [
				study.id
			]),

			m('.btn-group',[
				m('.btn.btn-sm.pull.btn-secondary', {onclick:ctrl.create}, [
					m('i.fa.fa-plus'), ' New'
				])
			]),

			m.component(filesComponent, study)
		]);
	}
};