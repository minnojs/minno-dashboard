import {fetchText} from 'utils/modelHelpers';
import {createFile} from './fileActions';
import messages from 'utils/messagesComponent';

// add trailing slash if needed, and then remove proceeding slash
// return prop
let pathProp = path => m.prop(path.replace(/\/?$/, '/').replace(/^\//, ''));

export let createFromTemplate = ({study, path, url, templateName}) => () => {
	let name = pathProp(path);
	let template = fetchText(url);

	return messages.prompt({
		header: `Create from "${templateName}"`,
		content: 'Please insert the file name:',
		prop: name
	})
		.then(response => {
			if (response) return template.then(content => createFile(study, name,() => content));
		})
		.catch(err => {
			let message = (err.response && err.response.status === 404)
				? `Template file not found at ${url}`
				: err.message;

			return messages.alert({
				header: `Create from "${templateName}" failed`,
				content: message
			});
		});
};
