import {fetchJson} from 'utils/modelHelpers';

const change_password_url = '/dashboard/dashboard/change_password';
const change_email_url = '/dashboard/dashboard/change_email';

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

export let set_email = (email) => fetchJson(change_email_url, {
    method: 'post',
    body: {email}
});

export let get_email = () => fetchJson(change_email_url, {
    method: 'get'
});
