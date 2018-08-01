import {fetchJson} from 'utils/modelHelpers';
import {templatesUrl, studyUrl as baseUrl} from 'modelUrls';


function get_url(study_id) {
    return `${baseUrl}/${encodeURIComponent(study_id)}`;
}

function get_duplicate_url(study_id) {
    return `${baseUrl}/${encodeURIComponent(study_id)}/copy`;
}


function get_exps_url(study_id) {
    return `${baseUrl}/${encodeURIComponent(study_id)}/experiments`;
}

function get_lock_url(study_id , lock) {

    if (lock)
        return `${baseUrl}/${encodeURIComponent(study_id)}/lock`;
    return `${baseUrl}/${encodeURIComponent(study_id)}/unlock`;
}

function get_publish_url(study_id) {
    return `${baseUrl}/${encodeURIComponent(study_id)}/publish`;
}

/*CRUD*/
export let load_studies = () => fetchJson(baseUrl);

export let load_templates = () => fetchJson(templatesUrl);

export let create_study = body => fetchJson(baseUrl, { method: 'post', body });

export let get_exps = (study_id) => fetchJson(get_exps_url(study_id));

export let get_data = (study_id, exp_id, version_id, file_format, file_split, start_date, end_date) => fetchJson(get_exps_url(study_id), {
    method: 'post',
    body: {exp_id, version_id, file_format, file_split, start_date, end_date}
})
;

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

export let publish_study = (study_id, publish, update_url) => fetchJson(get_publish_url(study_id), {
    method: 'post',
    body: {publish, update_url}
});

export let delete_study = (study_id) => fetchJson(get_url(study_id), {method: 'delete'});

