import {stop_dbx_synchronized, stop_gdrive_synchronized} from './settingsModel';
import messages from 'utils/messagesComponent';

export function start_dbx_sync(ctrl){
    let error = m.prop('');
    // ctrl.dbx_auth_link()
    messages.confirm({okText: 'Continue', cancelText: 'Cancel', header:'Synchronization with Dropbox', content:m('p', [
        m('p','This feature creates a backup for all your studies by copying all your study files to your Dropbox account. Every time you change a file here, on the Dashboard, it will send that update to your Dropbox account. Using the Dropbox website, you will be able to see previous versions of all the files you changed.'),
        m('ul',
            [
                m('li', 'Dropbox will create a folder under Apps/minno.js/username and will copy all your studies under that folder.'),
                m('li', 'We will not have access to any of your files on other folders.'),
                m('li', [m('span' ,'This feature is only for backup. If you edit or delete your study files on your computer\'s file-system, these edits will not be synchronized with the study files on this website. '), m('strong', 'Updates work only in one direction: from this website to your Dropbox, not from your Dropbox to this website.')]),
                m('li', 'If you want to see an older version of any of your study files, you can go to Dropbox and request to see previous versions of the file. If you want to restore an older version of a file, you will need to copy and paste its text to the Dashboard\'s editor on this website, or to download the old file to your computer and upload it to this website.')
            ]
        ),
        !error() ? '' : m('p.alert.alert-danger', error())])
    })
    .then(function (response) {
        console.log(ctrl.dbx_auth_link());
        if (response)
            window.location = ctrl.dbx_auth_link();
    });

}

export function stop_dbx_sync(ctrl){
    stop_dbx_synchronized()
        .then(m.route('/settings'))
        .catch(response => {
            ctrl.synchronization_error(response.message);
        });
}


export function stop_gdrive_sync(ctrl){
    stop_gdrive_synchronized()
        .then(m.route('/settings'))
        .catch(response => {
            ctrl.synchronization_error(response.message);
        });
}

