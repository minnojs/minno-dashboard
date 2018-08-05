import {fetchJson} from 'utils/modelHelpers';
import {baseUrl} from 'modelUrls';


function users_url()
{
    return `${baseUrl}/users`;
}


export let get_users = () => fetchJson(users_url(), {
    method: 'get'
});

export let remove_user = (user_id) => fetchJson(users_url(), {
    body: {user_id},
    method: 'delete'
});

export let update_role= (user_id, role) => fetchJson(users_url(), {
    body: {user_id, role},
    method: 'put'
});