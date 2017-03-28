import statisticsComponent from './study/statistics/statisticsComponent';
import statistics_oldComponent from './study/statistics_old/statisticsComponent';


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
import settingsComponent from './settings/settingsComponent';
import massMailComponent from './massMail/massMailComponent';


import activationComponent from './activation/activationComponent';
import resetPasswordComponent from './settings/resetPasswordComponent';
import recoveryComponent from './recovery/recoveryComponent';

import sharingComponent from 'study/sharing/sharingComponent';
import tagsComponent from 'tags/tagsComponent';
import translateComponent from 'study/templates/pagesComponent';

export default routes;

let routes = {
    '/tags':  tagsComponent,
    '/translate':  translateComponent,
    '/translate/:pageId':  translateComponent,
    '/template_studies' : studiesComponent,


    '/recovery':  recoveryComponent,
    '/activation/:code':  activationComponent,
    '/settings':  settingsComponent,
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
    '/studies/statistics_old' : statistics_oldComponent,
    '/studies/statistics' : statisticsComponent,

    '/editor/:studyId': filesComponent,
    '/editor/:studyId/:resource/:fileId': filesComponent,
    '/pool': poolComponent,
    '/pool/history': historyComponent,
    '/downloads': downloadsComponent,
    '/downloadsAccess': downloadsAccessComponent,
    '/sharing/:studyId': sharingComponent
};

