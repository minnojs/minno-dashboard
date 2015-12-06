import mainComponent from './mainComponent';
import editorComponent from './editor/editorComponent';
import validatorComponent from './validator/validatorComponent';

m.route(document.body, '/editor', {
	'' : mainComponent,
	'/editor/:url...': editorComponent,
	'/validator/:url...': validatorComponent
});