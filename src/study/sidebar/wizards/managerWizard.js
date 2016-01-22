import messages from 'utils/messagesComponent';
export default managerWizard;
let managerWizard = ({name, content}) => {
	return messages.prompt({
		header: 'Create piManager',
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

let template = () => `define(['managerAPI'], function(Manager){

    var API = new Manager();

    API.addSequence([
        {type:'message', template:'<h1>Hellow world</h1>', keys: ' '}
    ]);

    return API.script;
});`;
