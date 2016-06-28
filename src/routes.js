import studiesComponent from './study/studiesComponent';
import statisticsComponent from './study/statistics/statisticsComponent';
import filesComponent from './study/files/filesComponent';
import poolComponent from './pool/poolComponent';
import historyComponent from './pool/historyComponent';
import downloadsComponent from './downloads/downloadsComponent';
import downloadsAccessComponent from './downloadsAccess/downloadsAccessComponent';
import loginComponent from './login/loginComponent';
import deployListComponent from 'deploy/forms/deployList/deployListComponent';
import changeRequestListComponent from 'deploy/forms/changeRequestList/changeRequestListComponent';
import removalListComponent from 'deploy/forms/removalList/removalListComponent';
import deployComponent from './deploy/deployComponent';
import studyRemovalComponent from './deploy/studyRemovalComponent';
import studyChangeRequestComponent from './deploy/studyChangeRequestComponent';
import addUserComponent from './addUser/addUserComponent';
import activationComponent from './activation/activationComponent';
import changePasswordComponent from './changePassword/changePasswordComponent';
import recoveryComponent from './recovery/recoveryComponent';
import sharingComponent from 'study/sharing/sharingComponent';
export default routes;

let routes = { 
    '/recovery':  recoveryComponent,
    '/activation/:code':  activationComponent,
    '/change_password':  changePasswordComponent,
    '/change_password/:code':  changePasswordComponent,
    '/addUser':  addUserComponent,
    '/studyChangeRequest/:studyId':  studyChangeRequestComponent,
    '/studyRemoval/:studyId':  studyRemovalComponent,
    '/deploy/:studyId': deployComponent,
    '/deployList': deployListComponent,
    '/removalList': removalListComponent,
    '/changeRequestList': changeRequestListComponent,
    '/login': loginComponent,
    '/studies' : studiesComponent,
    '/studies/statistics' : statisticsComponent,
    '/editor/:studyId': filesComponent,
    '/editor/:studyId/:resource/:fileID': filesComponent,
    '/pool': poolComponent,
    '/pool/history': historyComponent,
    '/downloads': downloadsComponent,
    '/downloadsAccess': downloadsAccessComponent,
    '/sharing/:studyId': sharingComponent
};

