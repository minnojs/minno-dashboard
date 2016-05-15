import contextMenu from 'utils/contextMenuComponent';
import messages from 'utils/messagesComponent';
import spinner from 'utils/spinnerComponent';
import {authorize, isLoggedIn, logout} from 'login/authModel';
export default layout;

let layout = route => {
	return {
		controller(){
			authorize();

			if (!isLoggedIn() && m.route() !== '/login' && m.route() !== '/recovery' && m.route() !== '/activation/'+ m.route.param("code") && m.route() !== '/change_password/'+ m.route.param("code")) 
                            m.route('/login');

			return {doLogout};

			function doLogout(){
				logout().then(() => m.route('/login'));
			}
		},
		view(ctrl){
			return  m('.dashboard-root', {class: window.top!=window.self ? 'is-iframe' : ''}, [
				m('nav.navbar.navbar-dark.navbar-fixed-top', [
					m('a.navbar-brand', {href:'/dashboard/dashboard'}, 'Dashboard'),
					m('ul.nav.navbar-nav',[
						m('li.nav-item',[
							m('a.nav-link',{href:'/studies', config:m.route},'Studies')
						]),
						m('li.nav-item',[
							m('a.nav-link',{href:'/pool', config:m.route},'Pool')
						]),
						m('li.nav-item',[
							m('a.nav-link',{href:'/downloads', config:m.route},'Downloads')
						]),
//						m('li.nav-item',[
//							m('a.nav-link',{href:'/deploy', config:m.route},'Deploy')
//						]),
//						m('li.nav-item',[
//							m('a.nav-link',{href:'/studyRemoval', config:m.route}, 'Study Removal')
//						]),
//						m('li.nav-item',[
//							m('a.nav-link',{href:'/StudyChangeRequest', config:m.route}, 'Study Change Request')
//						]),
						m('li.nav-item',[
							m('a.nav-link',{href:'/addUser', config:m.route}, 'Add User')
						]),
						m('li.nav-item',[
							m('a.nav-link',{href:'/change_password', config:m.route}, 'Change password')
						]),
						m('li.nav-item.pull-xs-right',
                                                isLoggedIn()
				?
                                                        [
							m('button.btn.btn-info', {onclick:ctrl.doLogout}, [
								m('i.fa.fa-sign-out'), '  Logout'
							])
						]:[])
					])
				]),

				m('.main-content.container-fluid', [
					route
				]),

				m.component(contextMenu), // register context menu
				m.component(messages), // register modal
				m.component(spinner) // register spinner
			]);
		}
	};

};
