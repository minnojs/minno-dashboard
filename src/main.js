import mainComponent from './mainComponent';
import validatorComponent from './validator/validatorComponent';

m.route(document.body, '', {
	'' : mainComponent,
	'/validator/:url...': validatorComponent
});