import statisticsComponent from './study/statistics/statisticsComponent';
import statistics_newComponent from './study/statistics_new/statisticsComponent';


import poolComponent from './pool/poolComponent';
import historyComponent from './pool/historyComponent';
import downloadsComponent from './downloads/downloadsComponent';
import downloadsAccessComponent from './downloadsAccess/downloadsAccessComponent';

import loginComponent from './login/loginComponent';
import filesComponent from './study/files/filesComponent';
import studiesComponent from './study/studiesComponent';


import deployListComponent from 'deploy/forms/deployList/deployListComponent';
import changeRequestListComponent from 'deploy/forms/changeRequestList/changeRequestListComponent';
import removalListComponent from 'deploy/forms/removalList/removalListComponent';

import deployComponent from './deploy/deployComponent';
import studyRemovalComponent from './deploy/studyRemovalComponent';
import studyChangeRequestComponent from './deploy/studyChangeRequestComponent';

import addUserComponent from './addUser/addUserComponent';
import settingsComponent from './changePassword/settingsComponent';
import massMailComponent from './massMail/massMailComponent';


import activationComponent from './activation/activationComponent';
import resetPasswordComponent from './changePassword/resetPasswordComponent';
import recoveryComponent from './recovery/recoveryComponent';

import sharingComponent from 'study/sharing/sharingComponent';
import tagsComponent from 'tags/tagsComponent';

export default routes;

let routes = {
    '/tags':  tagsComponent,
    '/recovery':  recoveryComponent,
    '/activation/:code':  activationComponent,
    '/change_password':  settingsComponent,
    '/reset_password/:code':  resetPasswordComponent,

    '/deployList': deployListComponent,
    '/removalList': removalListComponent,
    '/changeRequestList': changeRequestListComponent,
    '/addUser':  addUserComponent,
    '/massMail':  massMailComponent,

    '/studyChangeRequest/:studyId':  studyChangeRequestComponent,
    '/studyRemoval/:studyId':  studyRemovalComponent,
    '/deploy/:studyId': deployComponent,
    '/login': loginComponent,
    '/studies' : studiesComponent,
    '/studies/statistics' : statisticsComponent,
    '/studies/statistics_new' : statistics_newComponent,

    '/editor/:studyId': filesComponent,
    '/editor/:studyId/:resource/:fileId': filesComponent,
    '/pool': poolComponent,
    '/pool/history': historyComponent,
    '/downloads': downloadsComponent,
    '/downloadsAccess': downloadsAccessComponent,
    '/sharing/:studyId': sharingComponent
};

