import {stop_synchronized} from './settingsModel';

export function stop_sync(ctrl){
    stop_synchronized()
        .then(m.route('/settings'))
        .catch(response => {
            ctrl.synchronization_error(response.message);
        });
}

