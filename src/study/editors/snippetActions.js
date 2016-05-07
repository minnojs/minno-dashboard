import messages from 'utils/messagesComponent';
import {print} from 'utils/prettyPrint';
import taskComponent from './snippets/task';
import pageComponent from './snippets/page';
import questComponent from './snippets/quest';

export let  snippetRunner = component => observer => () => {
	let output = m.prop();
	messages
		.custom({
			preventEnterSubmits: true,
			content: m.component(component, {output, close}),
			wide: true
		})
		.then(isOk => isOk && observer.trigger('paste', print(clearUnused(output()))));

	function close(value) {return () => messages.close(value);}
};

export let taskSnippet = snippetRunner(taskComponent);
export let pageSnippet = snippetRunner(pageComponent);
export let questSnippet = snippetRunner(questComponent);

function clearUnused(obj){
	return Object.keys(obj).reduce((result, key) => {
		let value = obj[key];
		if (typeof value === 'function' && value.toJSON) value = value();
		
		// check if is empty
		if (value === '' || value === undefined) return result;
		if (Array.isArray(value) && !value.length) return result;

		result[key] = value;
		return result;
	}, {});
}
