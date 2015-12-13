export default editorLayoutComponent;
import fileEditorComponent from './fileEditorComponent';
import sidebarComponent from './sidebarComponent';
import contextMenu from '../contextMenuComponent';

let editorLayoutComponent = {
	view: () => {
		return  m('div', [
			m('nav.navbar.navbar-dark.navbar-fixed-top', [
				m('a.navbar-brand', 'Dashboard')
			]),

			m('.container-fluid', {style:{marginTop:'70px'}},[
				m('.row', [
					m('.sidebar.col-md-2', [
						m.component(sidebarComponent)
					]),
					m('.main.col-md-10',[
						m.component(fileEditorComponent)
					])
				])
			]),

			m.component(contextMenu) // register context menu
		]);
	}
};