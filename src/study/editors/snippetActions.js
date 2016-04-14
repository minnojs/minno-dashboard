import messages from 'utils/messagesComponent';
import {print} from 'utils/prettyPrint';
import pageComponent from './snippets/page';

export let  snippetRunner = component => observer => () => {
	let content = m.prop('');
	messages
		.custom({
			content: m.component(component, {content, close}),
			wide: true
		})
		.then(isOk => isOk && observer.trigger('paste', print(content())));

	function close(value) {return () => messages.close(value);}
};

export let pageSnippet = snippetRunner(pageComponent);

