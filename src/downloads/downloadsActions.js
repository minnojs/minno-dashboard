import {getAllDownloads, removeDownload, createDownload, STATUS_RUNNING} from './downloadsModel';
import createMessage from './downloadsCreate';
import messages from 'utils/messagesComponent';

/**
 * Get all downloads
 */

export let recursiveGetAll = debounce(getAll, 5000);
export function getAll({list, cancel, error}){
    return getAllDownloads()
        .then(list)
        .then(response => {
            if (!cancel() && response.some(download => download.studyStatus === STATUS_RUNNING)) {
                recursiveGetAll({list, cancel, error});
            }
        })
        .catch(error)
        .then(m.redraw);
}


// debounce but call at first iteration
function debounce(func, wait) {
    let first = true;
    let timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (first) {
            func.apply(context, args);
            first = false;
        }
    };
}


/**
 * Remove download
 */

export function remove(download, list) {
    return messages.confirm({
        header: 'Delete Request:',
        content: [
            'Are you sure you want to delete this request from your queue?',
            m('.text-xs-center',
                m('small.muted-text','(Don\'t worry, the data will stay on our servers and you can request it again in the future)')
            )
        ]
    })
    .then(function(response){
        if (response) return doRemove(download, list);
    });
}

function doRemove(download, list){
    list(list().filter(el => el !== download));
    m.redraw();
    removeDownload(download)
        .catch(err => {
            list().push(download);
            return messages.alert({
                header: 'Delete Request',
                content: err.message
            });
        });
}

/**
 * Create download
 */

export function create(list, cancel){
    let output = m.prop();
    return createMessage({output})
        .then(response => {
            if (response){
                let download = unPropify(output());
                list().unshift(Object.assign({
                    studyStatus: STATUS_RUNNING,
                    creationDate: new Date()
                },download));
                cancel(true);
                return createDownload(download)
                    .then(() => {
                        cancel(false);
                        getAll({list, cancel});
                    })
                    .catch(reportError)
                    .then(cancel.bind(null, false));
            }
        });
}

let unPropify = obj => Object.keys(obj).reduce((result, key) => {
    result[key] = obj[key]();
    return result;
}, {});

let reportError = header => err => messages.alert({header, content: err.message});
