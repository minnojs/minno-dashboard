import messages from 'utils/messagesComponent';

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

let playground;
export let play = file => () => {
	// this is important, if we don't close the original window we get problems with onload
	if (playground && !playground.closed) playground.close();

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
	file.save()
		.then(m.redraw)
		.catch(err => messages.alert({
			header: 'Error Saving:',
			content: err.message
		}));
};

export let copyUrl = file => () => {
	let input = document.createElement('input');
	input.value = file.url;
	document.body.appendChild(input);
	input.select();
	if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)){
		messages.alert({
			header: 'Copy URL',
			content: m('.card-block', [
				m('.form-group', [
					m('label', 'Copy Url by clicking Ctrl + C'),
					m('input.form-control', {
						config: el => el.select(),
						value: file.url
					})
				])
			])
		});
	}

	try {
		document.execCommand('copy');
	} catch(err){
		messages.alert({
			header: 'Copy URL',
			content: 'Copying the URL has failed.'
		});
	}

	input.parentNode.removeChild(input);
};


// add trailing slash if needed, and then remove proceeding slash
// return prop
let pathProp = path => m.prop(path.replace(/\/?$/, '/').replace(/^\//, ''));

export let  createFile = (study, name, content) => {
	study.createFile({name:name(), content:content()})
		.then(response => {
			m.route(`/editor/${study.id}/file/${encodeURIComponent(response.id)}`);
			return response;
		})
		.catch(err => messages.alert({
			header: 'Failed to create file:',
			content: err.message
		}));
};

export let createDir = (study, path='') => () => {
	let name = pathProp(path);

	messages.prompt({
		header: 'Create Directory',
		content: 'Please insert directory name',
		prop: name
	})
		.then(response => {
			if (response) return study.createFile({name:name(), isDir:true});
		})
		.then(m.redraw)
		.catch(err => messages.alert({
			header: 'Failed to create directory:',
			content: err.message
		}));
};

export let createEmpty = (study, path = '') => () => {
	let name = pathProp(path);
	let content = ()=>'';

	messages.prompt({
		header: 'Create file',
		content: 'Please insert the file name:',
		prop: name
	}).then(response => {
		if (response) return createFile(study, name,content);
	});
};
