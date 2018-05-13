import {fetchJson} from 'utils/modelHelpers';
import {templatesUrl, studyUrl as baseUrl} from 'modelUrls';
import downloadUrl from 'utils/downloadUrl';


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

/*CRUD*/
export let load_studies = () => fetchJson(baseUrl);

export let load_templates = () => fetchJson(templatesUrl);

export let create_study = (study_name, type, template_id, reuse_id) => fetchJson(baseUrl, {
    method: 'post',
    body: {study_name, type, template_id, reuse_id}
});

export let get_exps = (study_id) => fetchJson(get_exps_url(study_id));

export let get_data = (study_id, exp_id, file_format, start_date, end_date) => fetchJson(get_exps_url(study_id), {
    method: 'post',
    body: {exp_id, file_format, start_date, end_date}
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


export let delete_study = (study_id) => fetchJson(get_url(study_id), {method: 'delete'});

