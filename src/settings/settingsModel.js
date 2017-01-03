import {fetchJson} from 'utils/modelHelpers';
import {baseUrl} from 'modelUrls';

const change_password_url = `${baseUrl}/change_password`;
const change_email_url = `${baseUrl}/change_email`;
const dropbox_url = `${baseUrl}/dropbox`;

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

export let check_if_synchronized = () => fetchJson(dropbox_url, {
    method: 'get'
});

export let stop_synchronized = () => fetchJson(dropbox_url, {
    method: 'delete'
});