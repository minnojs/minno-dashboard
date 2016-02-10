import {login} from './authModel';
export default loginComponent;

let loginComponent = {
	controller(){
		const email = m.prop('');
		const password = m.prop('');
		const ctrl = {
			email,
			password,
			login: login.bind(null, {email, password})
		};

		return ctrl;
	},
	view(ctrl){
		return m('.login.centrify', [
			m('h2', 'Page not found'),
			m('p','Login page not activated yet. ', m('a',{href:'/dashboard/dashboard'},'click here to login')),
			// m('.card.card-inverse.col-md-4', [
			// 	m('.card-block',[
			// 		m('h4', 'Please sign in'),

			// 		m('input.form-control', {
			// 			type:'email',
			// 			placeholder: 'Email',
			// 			value: ctrl.email(),
			// 			onkeyup: m.withAttr('value', ctrl.email)
			// 		}),

			// 		m('input.form-control', {
			// 			type:'password',
			// 			placeholder: 'Password',
			// 			value: ctrl.password(),
			// 			onkeyup: m.withAttr('value', ctrl.password)
			// 		}),

			// 		m('button.btn.btn-primary.btn-block', {onclick: ctrl.login},'Sign in'),

			// 		// m('p.text-center',
			// 		// 	m('a', m('small.text-muted','Lost your password?'))
			// 		// )
			// 	])
			// ])
		]);
	}
};

