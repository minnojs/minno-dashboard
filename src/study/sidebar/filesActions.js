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