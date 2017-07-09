import {fetchJson} from 'utils/modelHelpers';
import {collaborationUrl as collaboration_url} from 'modelUrls';

function apiURL(code)
{   
    return `${collaboration_url}/${encodeURIComponent(code)}`;
}

export let is_collaboration_code = (code) => fetchJson(apiURL(code), {
    method: 'get'
});

export let set_password = (code, password, confirm) => fetchJson(apiURL(code), {
    method: 'post',
    body: {password, confirm}
});
