import {updateStudy, updateStatus, getStudyId, STATUS_RUNNING, STATUS_PAUSED, STATUS_STOP} from './poolModel';
import messages from 'utils/messagesComponent';
import editMessage from './poolEditComponent';
import createMessage from './poolCreateComponent';

export function play(study){
	return messages.confirm({
		header: 'Continue Study:',
		content: `Are you sure you want to continue "${study.studyId}"?`
	})
	.then(response => {
		if(response) {
			studyPending(study, true)();
			return updateStatus(study, STATUS_RUNNING)
				.then(()=>study.studyStatus = STATUS_RUNNING)
				.catch(reportError('Continue Study'))
				.then(studyPending(study, false));
		}
	});
}

export function pause(study){
	return messages.confirm({
		header: 'Pause Study:',
		content: `Are you sure you want to pause "${study.studyId}"?`
	})
	.then(response => {
		if(response) {
			studyPending(study, true)();
			return updateStatus(study, STATUS_PAUSED)
				.then(()=>study.studyStatus = STATUS_PAUSED)
				.catch(reportError('Pause Study'))
				.then(studyPending(study, false));
		}
	});
}

export let remove  = (study, list) => {
	return messages.confirm({
		header: 'Remove Study:',
		content: `Are you sure you want to remove "${study.studyId}" from the pool?`
	})
	.then(response => {
		if(response) {
			studyPending(study, true)();
			return updateStatus(study, STATUS_STOP)
				.then(() => list(list().filter(el => el !== study)))
				.catch(reportError('Remove Study'))
				.then(studyPending(study, false));
		}
	});
};

export let edit  = (oldStudy) => {
	let newStudy = m.prop();
	return editMessage({oldStudy, newStudy})
		.then(response => {
			if (response) {
				studyPending(oldStudy, true)();
				let study = Object.assign({}, oldStudy, unPropify(newStudy()));
				return updateStudy(study)
					.then(() => Object.assign(oldStudy, study)) // update study in view
					.catch(reportError('Study Editor'))
					.then(studyPending(oldStudy, false));
			}
		});
};

export let create = (list) => {
	let newStudy = m.prop();
	return createMessage({newStudy})
		.then(response => {
			if (response) getStudyId(newStudy())
				.then(response => Object.assign(unPropify(newStudy()), response)) // add response data to "newStudy"
				.then(editNewStudy);
		});

	function editNewStudy(oldStudy){
		let newStudy = m.prop();
		return editMessage({oldStudy, newStudy})
			.then(response => {
				if (response) {
					let study = Object.assign({
						startedSessions: 0,
						completedSessions: 0,
						creationDate:new Date(),
						studyStatus: STATUS_RUNNING
					}, oldStudy, unPropify(newStudy()));
					return updateStudy(study)
						.then(() => list().push(study))
						.then(m.redraw)
						.catch(reportError('Create Study'));
				}
			});
	}
};

let reportError = header => err => messages.alert({header, content: err.message});

let studyPending = (study, state) => () => {
	study.$pending = state;
	m.redraw();
};

let unPropify = obj => Object.keys(obj).reduce((result, key) => {
	result[key] = obj[key]();
	return result;
}, {});
