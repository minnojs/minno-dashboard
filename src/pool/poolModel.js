import {fetchJson} from 'utils/modelHelpers';
const url = '/dashboard/StudyData';

export const STATUS_RUNNING = 'R';
export const STATUS_PAUSED = 'P';
export const STATUS_STOP = 'S';

export function create(study){
	let body = Object.assign({
		action:'insertRulesTable',
		creationDate: new Date(),
		studyStatus: STATUS_RUNNING
	}, study);

	return  fetchJson(url, {method: 'post', body: body});
}

export function updateStudy(study){
	let body = Object.assign({
		action:'updateRulesTable'
	}, study);

	return  fetchJson(url, {method: 'post',body:body});
}

export function updateStatus(study, status){
	return updateStudy(Object.assign({studyStatus:status}, study));
}

export function getAllPoolStudies(){
	return fetchJson(url, {method:'post', body: {action:'getAllPoolStudies'}});
}

export function getStudyId(study){
	let body = Object.assign({
		action:'getStudyId'
	}, study);

	return  fetchJson(url, {method: 'post',body:body});
}