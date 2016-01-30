import studiesComponent from './study/studiesComponent';
import studyComponent from './study/studyComponent';
import poolComponent from './pool/poolComponent';
import downloadsComponent from './downloads/downloadsComponent';
export default routes;

let routes = {
	'studies' : studiesComponent,
	'/editor/:studyID': studyComponent,
	'/editor/:studyID/:fileID': studyComponent,
	'/pool': poolComponent,
	'/downloads': downloadsComponent
};

