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

	return fetchJson(url, {method: 'post', body: body})
		.then(interceptErrors);
}

export function updateStudy(study){
	let body = Object.assign({
		action:'updateRulesTable'
	}, study);

	return  fetchJson(url, {method: 'post',body:body})
		.then(interceptErrors);
}

export function updateStatus(study, status){
	return updateStudy(Object.assign({studyStatus:status}, study))
		.then(interceptErrors);
}

export function getAllPoolStudies(){
	return fetchJson(url, {method:'post', body: {action:'getAllPoolStudies'}})
		.then(interceptErrors);
}

export function getStudyId(study){
	let body = Object.assign({
		action:'getStudyId'
	}, study);

	return  fetchJson(url, {method: 'post',body:body})
		;
}

function interceptErrors(response){
	if (!response.error){
		return response;
	}

	let errors = {
		1: 'This ID already exists.',
		2: 'The study could not be found.',
		3: 'The rule file could not be found.',
		4: 'The rules file does not fit the "research" schema.'
	};

	return Promise.reject({message: errors[response.error]});
}