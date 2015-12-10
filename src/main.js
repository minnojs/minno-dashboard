import mainComponent from './mainComponent';
import fileEditorComponent from './editor/fileEditorComponent';

m.route(document.body, '', {
	'' : mainComponent,
	'/file/:url...': fileEditorComponent
});