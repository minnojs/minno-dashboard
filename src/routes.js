import studiesComponent from './study/studiesComponent';
import studyComponent from './study/studyComponent';
import poolComponent from './pool/poolComponent';
import historyComponent from './pool/historyComponent';
import downloadsComponent from './downloads/downloadsComponent';
import loginComponent from './login/loginComponent';
export default routes;

let routes = {
	'/login': loginComponent,
	'/studies' : studiesComponent,
	'/editor/:studyID': studyComponent,
	'/editor/:studyID/:fileID': studyComponent,
	'/pool': poolComponent,
	'/pool/history': historyComponent,
	'/downloads': downloadsComponent
};

