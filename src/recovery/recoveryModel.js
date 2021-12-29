import {fetchJson} from 'utils/modelHelpers';
import {baseUrl} from 'modelUrls';

const recoveryUrl = `${baseUrl}/recovery`;


export let recovery = (username) => fetchJson(recoveryUrl, {
    method: 'post',
    body: {username}
});
