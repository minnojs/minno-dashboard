import {fetchJson} from 'utils/modelHelpers';

const baseUrl = '/dashboard/dashboard/studies';


function get_prop_url(study_id)
{	
    return `${baseUrl}/${encodeURIComponent(study_id)}/prop`;
}

function deploy_url(study_id)
{	
    return `${baseUrl}/${encodeURIComponent(study_id)}/deploy`;
}


export function get_study_prop(study_id){
    var url = get_prop_url(study_id);
    return fetchJson(url);
}

export let deploy = (study_id, folder_location,researcher_email, researcher_name, target_number, approved_by_a_reviewer, experiment_file, launch_confirmation, comments) => fetchJson(deploy_url(study_id), {
	method: 'post',
	body: {folder_location,researcher_email, researcher_name, target_number, approved_by_a_reviewer, experiment_file, launch_confirmation, comments}
});

export let study_removal = (study_id, study_name, researcher_email, researcher_name, completed_n, comments) => fetchJson(deploy_url(study_id), {
	method: 'delete',
	body: {study_name, researcher_email, researcher_name, completed_n, comments}
});

export let Study_change_request = (study_id, file_names, researcher_email, researcher_name, target_sessions, study_showfiles_link, status, comments) => fetchJson(deploy_url(study_id), {
	method: 'put',
	body: {file_names, researcher_email, researcher_name, target_sessions, study_showfiles_link, status, comments}
});