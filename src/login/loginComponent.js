import {login} from './authModel';
export default loginComponent;

let loginComponent = {
	controller(){
		const username = m.prop('');
		const password = m.prop('');
		const ctrl = {
			username,
			password,
			error: m.prop(''),
			login: loginAction.bind(null, username, password)
		};

		return ctrl;

		function loginAction(username, password){
			login(username, password)
				.then(() => {
					m.route('/');
				})
				.catch(response => {
					ctrl.error(response.message);
					m.redraw();
				});
		}
	},
	view(ctrl){
		return m('.login.centrify', [
			m('.card.card-inverse.col-md-4', [
				m('.card-block',[
					m('h4', 'Please sign in'),

					m('input.form-control', {
						type:'username',
						placeholder: 'Username / Email',
						value: ctrl.username(),
						onkeyup: m.withAttr('value', ctrl.username)
					}),

					m('input.form-control', {
						type:'password',
						placeholder: 'Password',
						value: ctrl.password(),
						onkeyup: m.withAttr('value', ctrl.password)
					}),

					ctrl.error() ? m('.alert.alert-warning', m('strong', 'Warning!! '), ctrl.error()) : '',

					m('button.btn.btn-primary.btn-block', {onclick: ctrl.login},'Sign in'),

					// m('p.text-center',
					// 	m('a', m('small.text-muted','Lost your password?'))
					// )
				])
			])
		]);
	}
};