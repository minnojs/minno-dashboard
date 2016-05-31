import {fetchJson} from 'utils/modelHelpers';
const baseUrl = '/dashboard/dashboard/studies';

function get_url(study_id)
{
    return `${baseUrl}/${encodeURIComponent(study_id)}`;
}

function get_collaborate_url(study_id)
{
    return `${baseUrl}/${encodeURIComponent(study_id)}/collaborate`;

}

/*CRUD*/

export let load = () => {
    fetch('/dashboard/dashboard/studies', {credentials: 'same-origin'});
};

export let create_study = (ctrl) => fetchJson(baseUrl, {
    method: 'post',
    body: {study_name: ctrl.study_name}
});

export let rename_study = (study_id, ctrl) => fetchJson(get_url(study_id), {
    method: 'put',
    body: {study_name: ctrl.study_name}
});


export let delete_study = (study_id) => fetchJson(get_url(study_id), {
    method: 'delete'});

/*collaboration*/
export let add_collaboration = (study_id, ctrl) => fetchJson(get_collaborate_url(study_id), {
    method: 'post',
    body: {user_name: ctrl.user_name}
});



export let get_collaboration= (study_id) => fetchJson(get_collaborate_url(study_id), {
    method: 'get'
});
