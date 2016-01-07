export default editorLayoutComponent;
import studyModel from './studyModel';
import editorComponent from './editorComponent';
import sidebarComponent from './sidebarComponent';
import contextMenu from '../contextMenuComponent';
import messages from '../messagesComponent';

let study;

let editorLayoutComponent = {
	controller: ()=>{
		let id = m.route.param('studyID');
		if (!study || (study.id !== id)){
			study = new studyModel(id);
			study
				.get()
				.then(m.redraw);
		}

		let ctrl = {study};

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

			m.component(contextMenu), // register context menu
			m.component(messages)
		]);
	}
};