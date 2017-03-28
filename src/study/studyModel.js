import {fetchJson} from 'utils/modelHelpers';
import {studyUrl as baseUrl} from 'modelUrls';


function get_url(study_id) {
    return `${baseUrl}/${encodeURIComponent(study_id)}`;
}

function get_duplicate_url(study_id) {
    return `${baseUrl}/${encodeURIComponent(study_id)}/copy`;
}
function get_lock_url(study_id , lock) {

    if (lock)
        return `${baseUrl}/${encodeURIComponent(study_id)}/lock`;
    return `${baseUrl}/${encodeURIComponent(study_id)}/unlock`;
}

/*CRUD*/
export let load_studies = () => fetchJson(baseUrl, {credentials: 'same-origin'});

export let create_study = (study_name, is_international) => fetchJson(baseUrl, {
    method: 'post',
    body: {study_name, is_international}
});

export let rename_study = (study_id, study_name) => fetchJson(get_url(study_id), {
    method: 'put',
    body: {study_name}
});

export let duplicate_study = (study_id, study_name) => fetchJson(get_duplicate_url(study_id), {
    method: 'put',
    body: {study_name}
});

export let lock_study = (study_id, lock) => fetchJson(get_lock_url(study_id, lock), {
    method: 'post'
});


export let delete_study = (study_id) => fetchJson(get_url(study_id), {method: 'delete'});

