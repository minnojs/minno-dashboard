import {fetchJson} from 'utils/modelHelpers';
import {studyUrl as baseUrl} from 'modelUrls';


function get_url(study_id) {
    return `${baseUrl}/${encodeURIComponent(study_id)}`;
}

/*CRUD*/
export let load_studies = () => fetchJson(baseUrl, {credentials: 'same-origin'});

export let create_study = (study_name) => fetchJson(baseUrl, {
    method: 'post',
    body: {study_name}
});

export let rename_study = (study_id, study_name) => fetchJson(get_url(study_id), {
    method: 'put',
    body: {study_name}
});


export let delete_study = (study_id) => fetchJson(get_url(study_id), {method: 'delete'});
    
