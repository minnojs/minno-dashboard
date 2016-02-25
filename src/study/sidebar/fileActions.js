import messages from 'utils/messagesComponent';
import pipWizard from './wizards/pipWizard';
import questWizard from './wizards/questWizard';
import managerWizard from './wizards/managerWizard';

export let uploadFiles = (path,study) => files => {
	study
		.uploadFiles(path, files)
		.catch(response => messages.alert({
			header: 'Upload File',
			content: response.message
		}))
		.then(m.redraw);
};


export let moveFile = (file,study) => () => {
	let newPath = m.prop(file.path);
	return messages.prompt({
		header: 'Move/Rename File',
		prop: newPath
	})
		.then(response => {
			if (response) return moveAction(file,study);
		});

	function moveAction(file,study){
		let def = file
			.move(newPath(),study) // the actual movement
			.catch(response => messages.alert({
				header: 'Move/Rename File',
				content: response.message
			}))
			.then(m.redraw); // redraw after server response

		m.redraw();
		return def;
	}
};

export let play = file => () => {
	let playground;

	playground = window.open('playground.html', 'Playground');

	playground.onload = function(){
		// first set the unload listener
		playground.addEventListener('unload', function() {
			// get focus back here
			window.focus();
		});

		// then activate the player (this ensures that when )
		playground.activate(file);
		playground.focus();
	};
};

export let save = file => () => {
	file.save().catch(err => messages.alert({
		header: 'Error Saving:',
		content: err.message
	}));
};

function create(study, name, content){
	return response => {
		if (response) {
			study.createFile(name(), content())
				.then(response => {
					m.route(`/editor/${study.id}/${encodeURIComponent(response.id)}`);
					return response;
				})
				.catch(err => messages.alert({
					header: 'Failed to create file:',
					content: err.message
				}));
		}
	};
}

export let createEmpty = (study, path = '') => () => {
	let name = m.prop(path);
	let content = ()=>'';

	messages.prompt({
		header: 'Create file',
		content: 'Please insert the file name:',
		prop: name
	}).then(create(study, name,content));
};

export let createPIP = (study, path = '') => () => {
	let name = m.prop(path);
	let content = m.prop();
	pipWizard({ name, content}).then(create(study, name, content));
};

export let createQuest = (study, path = '') => () => {
	let name = m.prop(path);
	let content = m.prop();
	questWizard({ name, content}).then(create(study, name, content));
};

export let createManager = (study, path = '') => () => {
	let name = m.prop(path);
	let content = m.prop();
	managerWizard({ name, content}).then(create(study, name, content));
};