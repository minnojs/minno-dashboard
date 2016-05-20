import {fetchJson,fetchVoid} from 'utils/modelHelpers';

const change_password_url = '/dashboard/dashboard/change_password';

function apiURL(code)
{   
    return `${change_password_url}/${encodeURIComponent(code)}`;
}

export let is_recovery_code = (code) => fetchJson(apiURL(code), {
    method: 'get'
});


export let set_password = (code, password, confirm) => fetchJson(apiURL(code), {
    method: 'post',
    body: {password, confirm}
});
