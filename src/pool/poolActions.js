import {updateStudy, updateStatus, STATUS_RUNNING, STATUS_PAUSED, STATUS_STOP} from './poolModel';
import messages from 'utils/messagesComponent';
import editComponent from './poolEditComponent';

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
			return updateStatus(study, STATUS_RUNNING)
				.then(()=>study.studyStatus = STATUS_RUNNING);
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
			return updateStatus(study, STATUS_PAUSED)
				.then(()=>study.studyStatus = STATUS_PAUSED);
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

export let remove  = (study, list) => {
	return messages.confirm({
		header: 'Remove Study:',
		content: `Are you sure you want to remove "${study.studyId}" from the pool?`
	})
	.then(response => {
		if(response) {
			studyPending(study, true);
			return updateStatus(study, STATUS_STOP)
				// we can't flatten the promise chain here, because we don't want this to happen on a cancel...
				.then(() => {
					list(list().filter(el => el !== study));
					m.redraw();
				});
		}
	})
	.catch(error => {
		studyPending(study, false);
		return messages.alert({
			header: 'Remove Study:',
			content: error.message
		});
	});
};

export let edit  = (oldStudy) => {
	let newStudy = m.prop();
	return messages.custom({
		content: m.component(editComponent, {oldStudy, newStudy, close:messages.close}),
		wide: true
	})
	.then(response => {
		if (response) {
			studyPending(oldStudy, true);
			let study = Object.assign({}, oldStudy, unPropify(newStudy()));
			return updateStudy(study)
				.then(() => {
					Object.assign(oldStudy, study);
					studyPending(oldStudy, false);
				});
		}
	})
	.catch(error => {
		studyPending(oldStudy, false);
		return messages.alert({
			header: 'Study Editor:',
			content: error.message
		});
	});
};

export let create = (study) => {
	console.log(study);
};

let unPropify = obj => Object.keys(obj).reduce((result, key) => {
	console.log(key)
	result[key] = obj[key]();
	return result;
}, {});
