import mainComponent from './mainComponent';
import editorLayoutComponent from './study/studyComponent';

m.route(document.body, 'studies', {

	'studies' : mainComponent,
	'/editor/:studyID': editorLayoutComponent,
	'/editor/:studyID/:fileID': editorLayoutComponent
});