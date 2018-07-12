import {emil_body} from './changeEmailView';
import {password_body} from './changePasswordView';
import {dropbox_body} from './connect2dropboxView';
import {templates_body} from './templateStudiesView';

const settings = {'password':[],
    'emil':[],
    'dropbox':[],
    'templates':[]
};

const settings_hash = {
    password: password_body,
    emil: emil_body,
    dropbox: dropbox_body,
    templates: templates_body
};

export let draw_menu = (ctrl) => {
    return Object.keys(settings).map(feature=>
        settings_hash[feature](ctrl));
};

