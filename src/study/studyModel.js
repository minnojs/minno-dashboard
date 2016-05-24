import {fetchJson} from 'utils/modelHelpers';
const baseUrl = '/dashboard/dashboard/studies';

function get_url(study_id)
{
    return `${baseUrl}/${encodeURIComponent(study_id)}`;
}

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

export let load = () => {
    fetch('/dashboard/dashboard/studies', {credentials: 'same-origin'});
};