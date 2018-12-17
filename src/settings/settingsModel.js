import {fetchJson} from 'utils/modelHelpers';
import {baseUrl} from 'modelUrls';

const change_password_url = `${baseUrl}/change_password`;
const change_email_url = `${baseUrl}/change_email`;
const update_details_url = `${baseUrl}/settings`;
const present_templates_url = `${baseUrl}/present_templates`;
const dropbox_url = `${baseUrl}/dropbox`;
const gdrive_url = `${baseUrl}/gdrive`;

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


export let update_details = (params) => fetchJson(update_details_url, {
    method: 'post',
    body: {params}
});


export let get_email = () => fetchJson(change_email_url, {
    method: 'get'
});


export let check_if_present_templates = () => fetchJson(present_templates_url, {
    method: 'get'
});

export let set_present_templates = (value) => {
    if (value)
        return do_present_templates();
    return do_hide_templates();
};



export let do_present_templates = () => fetchJson(present_templates_url, {
    method: 'post'
});

export let do_hide_templates = () => fetchJson(present_templates_url, {
    method: 'delete'
});

export let check_if_dbx_synchronized = () => fetchJson(dropbox_url, {
    method: 'get'
});

export let check_if_gdrive_synchronized = () => fetchJson(gdrive_url, {
    method: 'get'
});

export let stop_gdrive_synchronized = () => fetchJson(gdrive_url, {
    method: 'delete'
});

export let stop_dbx_synchronized = () => fetchJson(dropbox_url, {
    method: 'delete'
});