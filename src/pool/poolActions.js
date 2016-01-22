import {updateStatus, STATUS_RUNNING, STATUS_PAUSED} from './poolModel';
import messages from 'utils/messagesComponent';

let studyPending = (study, state) => {
	study.$pending = state;
	m.redraw();
};

export function play(study){
	return messages.confirm({
		header: 'Continue Study:',
		content: `Are you sure you want to continue "${study.studyId}"?`
	})
	.then(response => {
		if(response) {
			studyPending(study, true);
			return updateStatus(study, STATUS_RUNNING);
		}
	})
	.then(studyPending.bind(null, study, false))
	.catch(error => {
		studyPending(study, false);
		return messages.alert({
			header: 'Continue Study:',
			content: error.message
		});
	});
}

export function pause(study){
	return messages.confirm({
		header: 'Pause Study:',
		content: `Are you sure you want to pause "${study.studyId}"?`
	})
	.then(response => {
		if(response) {
			studyPending(study, true);
			return updateStatus(study, STATUS_PAUSED);
		}
	})
	.then(studyPending.bind(null, study, false))
	.catch(error => {
		studyPending(study, false);
		return messages.alert({
			header: 'Pause Study:',
			content: error.message
		});
	});
}

export let remove  = (study) => {
	console.log(study);
};

export let edit  = (study) => {
	console.log(study);
};

export let create = (study) => {
	console.log(study);
};
