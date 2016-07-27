import {fetchJson} from 'utils/modelHelpers';
import {studyUrl} from 'modelUrls';


function collaboration_url(study_id)
{
    return `${studyUrl}/${encodeURIComponent(study_id)}/collaboration`;
}


function public_url(study_id)
{
    return `${studyUrl}/${encodeURIComponent(study_id)}/public`;
}

export let get_collaborations = (study_id) => fetchJson(collaboration_url(study_id), {
    method: 'get'
});

export let remove_collaboration = (study_id, user_id) => fetchJson(collaboration_url(study_id), {
    method: 'delete',
    body: {user_id: user_id}
});


export let add_collaboration = (study_id, user_name, permission) => fetchJson(collaboration_url(study_id), {
    method: 'post',
    body: {user_name, permission}
});


export let make_pulic = (study_id, is_public) => fetchJson(public_url(study_id), {
    method: 'post',
    body: {is_public}
});