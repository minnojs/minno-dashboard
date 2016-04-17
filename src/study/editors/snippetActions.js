import messages from 'utils/messagesComponent';
import {print} from 'utils/prettyPrint';
import pageComponent from './snippets/page';
import questComponent from './snippets/quest';

export let  snippetRunner = component => observer => () => {
	let output = m.prop();
	messages
		.custom({
			content: m.component(component, {output, close}),
			wide: true
		})
		.then(isOk => isOk && observer.trigger('paste', print(output())));

	function close(value) {return () => messages.close(value);}
};

export let pageSnippet = snippetRunner(pageComponent);
export let questSnippet = snippetRunner(questComponent);

