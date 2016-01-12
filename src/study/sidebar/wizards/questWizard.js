import messages from '../../../messagesComponent';
export default questWizard;
let questWizard = ({name, content}) => {
	return messages.prompt({
		header: 'Create piQuest',
		content: 'Please insert the file name:',
		prop: name
	})
	.then(response => {
		if (response) {
			content(template());
		}
		return response;
	});
};

let template = () => `define(['questAPI'], function(Quest){

	var API = new Quest();

	API.addSequence([
		{
			header: 'Hello World',
			questions: [
				{
					type: 'selectOne',
					stem: 'What is you favorite color?',
					answers: ['red', 'blue', 'green']
				}
			]
		}
	]);

	return API.script;
});`;
