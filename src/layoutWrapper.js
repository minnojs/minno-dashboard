import contextMenu from './contextMenuComponent';
import messages from './messagesComponent';
export default layout;

let layout = route => {
	return {
		view: () => {
			return  m('div', [
				m('nav.navbar.navbar-dark.navbar-fixed-top', [
					m('a.navbar-brand', 'Dashboard'),
					m('ul.nav.navbar-nav',[
						m('li.nav-item',[
							m('a.nav-link',{href:'/studies', config:m.route},'Studies')
						]),
						m('li.nav-item',[
							m('a.nav-link',{href:'/pool', config:m.route},'Pool')
						])
					])
				]),

				m('.container-fluid', {style:{marginTop:'70px'}},[
					route
				]),

				m.component(contextMenu), // register context menu
				m.component(messages)
			]);
		}
	};

};