import {login, isLoggedIn} from './authModel';
import fullHeight from 'utils/fullHeight';
export default loginComponent;

let loginComponent = {
	controller(){
		const username = m.prop('');
		const password = m.prop('');
		const ctrl = {
			username,
			password,
			isLoggedIn,
			error: m.prop(''),
			login: loginAction
		};

		return ctrl;

		function loginAction(){
			console.log('va', username(), password())
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
		return m('.login.centrify', {config:fullHeight},[
			isLoggedIn()
				?
				[
					m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
					m('h5', 'You are already logged in!')
				]
				:
				m('.card.card-inverse.col-md-4', [
					m('.card-block',[
						m('h4', 'Please sign in'),

						m('form', {onsubmit:ctrl.login}, [
							m('input.form-control', {
								type:'username',
								placeholder: 'Username / Email',
								value: ctrl.username(),
								onkeyup: m.withAttr('value', ctrl.username),
								config: getStartValue(ctrl.username)
							}),

							m('input.form-control', {
								type:'password',
								placeholder: 'Password',
								value: ctrl.password(),
								onkeyup: m.withAttr('value', ctrl.password),
								config: getStartValue(ctrl.password)
							})
						]),

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

function getStartValue(prop){
	console.log('horrible hack to manage chrome pw autocomplete')
	return (element, isInit) => {// !isInit && prop(element.value);
		if (!isInit) setTimeout(()=>prop(element.value), 30);
	}
}