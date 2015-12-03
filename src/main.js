import validatorComponent from './validator/validatorComponent';

m.route(document.body, '', {
	'' : {view:() => m('a[href="/validator//test/carlee.js"]', {config: m.route}, 'cool anchor')},
	'/validator/:url...': validatorComponent
});