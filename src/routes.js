import studiesComponent from './study/studiesComponent';
import studyComponent from './study/studyComponent';
import poolComponent from './pool/poolComponent';
import historyComponent from './pool/historyComponent';
import downloadsComponent from './downloads/downloadsComponent';
import downloadsAccessComponent from './downloadsAccess/downloadsAccessComponent';
import loginComponent from './login/loginComponent';
import deployComponent from './deploy/deployComponent';
import StudyRemovalComponent from './studyRemoval/studyRemovalComponent';
import StudyChangeRequestComponent from './StudyChangeRequest/StudyChangeRequestComponent';
import addUserComponent from './addUser/addUserComponent';
import activationComponent from './activation/activationComponent';
import changePasswordComponent from './changePassword/changePasswordComponent';
import recoveryComponent from './recovery/recoveryComponent';
export default routes;

let routes = {
	'/recovery':  recoveryComponent,
	'/activation/:code':  activationComponent,
	'/change_password':  changePasswordComponent,
	'/change_password/:code':  changePasswordComponent,
	'/addUser':  addUserComponent,
	'/StudyChangeRequest/:studyId':  StudyChangeRequestComponent,
	'/studyRemoval/:studyId':  StudyRemovalComponent,
	'/deploy/:studyId': deployComponent,
	'/login': loginComponent,
	'/studies' : studiesComponent,
	'/editor/:studyId': studyComponent,
	'/editor/:studyId/:resource/:fileID': studyComponent,
	'/pool': poolComponent,
	'/pool/history': historyComponent,
	'/downloads': downloadsComponent,
	'/downloadsAccess': downloadsAccessComponent
};

