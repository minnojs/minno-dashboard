import mainComponent from './mainComponent';
import editorLayoutComponent from './editor/editorLayoutComponent';

m.route(document.body, '', {
	'' : mainComponent,
	'/file/:url...': editorLayoutComponent
});