import {fetchJson} from 'utils/modelHelpers';
import {baseUrl} from 'modelUrls';


function config_url()
{
    return `${baseUrl}/config`;
}

function gmail_url()
{
    return `${baseUrl}/config/gmail`;
}

function dbx_url()
{
    return `${baseUrl}/config/dbx`;
}


export let get_config = () => fetchJson(config_url(), {
    method: 'get'
});

export let set_gmail_params = (email, password) => fetchJson(gmail_url(), {
    body: {email, password},
    method: 'put'
});

export let unset_gmail_params = () => fetchJson(gmail_url(), {
    method: 'delete'
});


export let set_dbx_params = (client_id, client_secret) => fetchJson(dbx_url(), {
    body: {client_id, client_secret},
    method: 'put'
});

export let unset_dbx_params = () => fetchJson(dbx_url(), {
    method: 'delete'
});
