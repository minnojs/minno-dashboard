export default editorLayoutComponent;
import studyModel from './studyModel';
import editorComponent from './editorComponent';
import sidebarComponent from './sidebarComponent';
import contextMenu from '../contextMenuComponent';

let editorLayoutComponent = {
	controller: ()=>{
		let study = new studyModel(m.route.param('studyID'));
		let ctrl = {study};

		m.startComputation();
		study
			.get()
			.then(m.endComputation);

		return ctrl;
	},
	view: ctrl => {
		let study = ctrl.study;
		return  m('div', [
			m('nav.navbar.navbar-dark.navbar-fixed-top', [
				m('a.navbar-brand', 'Dashboard'),
				m('ul.nav.navbar-nav',[
					m('li.nav-item',[
						m('a.nav-link',{href:'/studies', config:m.route},'Studies')
					])
				])
			]),

			m('.container-fluid', {style:{marginTop:'70px'}},[
				study.loaded
					?
					m('.row', [
						m('.sidebar.col-md-2', [
							m.component(sidebarComponent, study)
						]),
						m('.main.col-md-10',[
							m.component(editorComponent, study)
						])
					])
					:
					''
			]),

			m.component(contextMenu) // register context menu
		]);
	}
};