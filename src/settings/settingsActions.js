import {stop_synchronized} from './settingsModel';

export function stop_sync(ctrl){
    stop_synchronized()
        .then(() => {
            ctrl.is_synchronized(false);
        })
        .catch(response => {
            ctrl.synchronization_error(response.message);
        })
        .then(m.route('/settings'));
}

