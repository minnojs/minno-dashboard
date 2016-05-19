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

export let deploy = (study_id, ctrl) => fetchJson(deploy_url(study_id), {
	method: 'post',
	body: {target_number: ctrl.target_number, approved_by_a_reviewer: ctrl.approved_by_a_reviewer, experiment_file: ctrl.experiment_file, launch_confirmation: ctrl.launch_confirmation, comments: ctrl.comments, rulesValue: ctrl.rulesValue}
}); 

export let study_removal = (study_id, ctrl) => fetchJson(deploy_url(study_id), {
	method: 'delete',
	body: {study_name: ctrl.study_name, completed_n: ctrl.completed_n, comments: ctrl.comments}
});

export let Study_change_request = (study_id, ctrl) => fetchJson(deploy_url(study_id), {
	method: 'put',
	body: {file_names: ctrl.file_names, target_sessions: ctrl.target_sessions, status: ctrl.status, comments: ctrl.comments}
});


//                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
//                        m('h5', ['The Deploy form was sent successfully ', m('a', {href:'deployList'}, 'View Deploy Requests')]'])
//                        m('h5', 'No Rule File'])
