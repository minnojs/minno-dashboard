import {stop_dbx_synchronized, stop_gdrive_synchronized} from './settingsModel';

export function stop_dbx_sync(ctrl){
    stop_dbx_synchronized()
        .then(m.route('/settings'))
        .catch(response => {
            ctrl.synchronization_error(response.message);
        });
}export function stop_gdrive_sync(ctrl){
    stop_gdrive_synchronized()
        .then(m.route('/settings'))
        .catch(response => {
            ctrl.synchronization_error(response.message);
        });
}