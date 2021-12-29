import {fetchJson, fetchVoid} from 'utils/modelHelpers';
import {downloadsUrl as url} from 'modelUrls';

export const STATUS_RUNNING = 'R';
export const STATUS_COMPLETE = 'C';
export const STATUS_ERROR = 'X';

export let getAllDownloads = () => fetchJson(url, {
    method:'post',
    body: {action:'getAllDownloads'}
}).then(interceptErrors);

export let removeDownload = download => fetchVoid(url, {
    method:'post',
    body: Object.assign({action:'removeDownload'}, download)
}).then(interceptErrors);

export let createDownload = download => fetchVoid(url, {
    method: 'post',
    body: Object.assign({action:'download'}, download)
}).then(interceptErrors);

function interceptErrors(response){
    if (!response || !response.error){
        return response;
    }

    return Promise.reject({message: response.msg});
}
