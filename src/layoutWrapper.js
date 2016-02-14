import contextMenu from 'utils/contextMenuComponent';
import messages from 'utils/messagesComponent';
import spinner from 'utils/spinnerComponent';
import {authorize, isLoggedIn} from 'login/authModel';
export default layout;

let layout = route => {
	return {
		controller(){
			authorize();
			if (!isLoggedIn() && m.route() !== '/login') m.route('/login');
			if (isLoggedIn() && m.route() === '/login') m.route('/');
		},
		view(){
			return  m('.dashboard-root', {class: window.top!=window.self ? 'is-iframe' : ''}, [
				m('nav.navbar.navbar-dark.navbar-fixed-top', [
					m('a.navbar-brand', {href:'/dashboard/dashboard'}, 'Dashboard'),
					m('ul.nav.navbar-nav',[
						// m('li.nav-item',[
						// 	m('a.nav-link',{href:'/studies', config:m.route},'Studies')
						// ]),
						m('li.nav-item',[
							m('a.nav-link',{href:'/pool', config:m.route},'Pool')
						]),
						m('li.nav-item',[
							m('a.nav-link',{href:'/downloads', config:m.route},'Downloads')
						])
					])
				]),

				m('.container-fluid', [
					route
				]),

				m.component(contextMenu), // register context menu
				m.component(messages), // register modal
				m.component(spinner) // register spinner
			]);
		}
	};

};