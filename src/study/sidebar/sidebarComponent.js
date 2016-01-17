import filesComponent from './filesComponent';
import sidebarButtons from './sidebarButtons';
export default sidebarComponent;

let sidebarComponent = {
	view: (ctrl , study) => {
		return m('.sidebar', [
			m('h5', [
				study.id
			]),

			m.component(sidebarButtons, {study}),
			m.component(filesComponent, study)
		]);
	}
};