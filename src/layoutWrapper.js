import contextMenu from 'utils/contextMenuComponent';
import messages from 'utils/messagesComponent';
import spinner from 'utils/spinnerComponent';
import {isLoggedIn} from 'login/authModel';
export default layout;

let layout = route => {
	return {
		controller(){
			if (!isLoggedIn() && m.route() !== '/login') m.route('login');
		},
		view(){
			return  m('div', [
				m('nav.navbar.navbar-dark.navbar-fixed-top', [
					m('a.navbar-brand', 'Dashboard'),
					m('ul.nav.navbar-nav',[
						m('li.nav-item',[
							m('a.nav-link',{href:'/studies', config:m.route},'Studies')
						]),
						m('li.nav-item',[
							m('a.nav-link',{href:'/pool', config:m.route},'Pool')
						]),
						m('li.nav-item',[
							m('a.nav-link',{href:'/downloads', config:m.route},'Downloads')
						])
					])
				]),

				m('.container-fluid', {style:{marginTop:'70px'}},[
					route
				]),

				m.component(contextMenu), // register context menu
				m.component(messages),
				m.component(spinner)
			]);
		}
	};

};