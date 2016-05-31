import {fetchJson} from 'utils/modelHelpers';
const baseUrl = '/dashboard/dashboard/studies';


function collaboration_url(study_id)
{   
    return `${baseUrl}/${encodeURIComponent(study_id)}/collaboration`;
}


export let get_collaborations = (study_id) => fetchJson(collaboration_url(study_id), {
    method: 'get'
});

export let remove_collaboration = (study_id, user_id) => fetchJson(collaboration_url(study_id), {
    method: 'delete',
    body: {user_id: user_id}
});

export let add_collaboration = (study_id, user_name) => fetchJson(collaboration_url(study_id), {
    method: 'post',
    body: {user_name}
});