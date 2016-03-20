import studiesComponent from './study/studiesComponent';
import studyComponent from './study/studyComponent';
import wizardComponent from './study/wizardComponent';
import poolComponent from './pool/poolComponent';
import historyComponent from './pool/historyComponent';
import downloadsComponent from './downloads/downloadsComponent';
import loginComponent from './login/loginComponent';
export default routes;

let routes = {
	'/login': loginComponent,
	'/studies' : studiesComponent,
	'/editor/:studyId': studyComponent,
	'/editor/:studyId/file/:fileID': studyComponent,
	'/editor/:studyId/wizard/:wizardType': wizardComponent,
	'/pool': poolComponent,
	'/pool/history': historyComponent,
	'/downloads': downloadsComponent
};

