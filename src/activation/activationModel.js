import {fetchJson} from 'utils/modelHelpers';
import {activationUrl as activation1_url} from 'modelUrls';

function apiURL(code)
{   
    return `${activation1_url}/${encodeURIComponent(code)}`;
}

export let is_activation_code = (code) => fetchJson(apiURL(code), {
    method: 'get'
});

export let set_password = (code, password, confirm) => fetchJson(apiURL(code), {
    method: 'post',
    body: {password, confirm}
});
