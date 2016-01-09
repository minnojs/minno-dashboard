import messages from '../../../messagesComponent';
export default pipWizard;
let pipWizard = ({name, content}) => {
	return messages.prompt({
		header: 'Create file',
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

let template = () => `define(['pipAPI','pipScorer'], function(APIConstructor,Scorer) {

	var API = new APIConstructor();
	var scorer = new Scorer();

	// add something to the current object
	API.addCurrent({});

	// set the base urls for images and templates
	API.addSettings('base_url',{
		image : '/my/folder/images',
		template : '/my/folder/templates'
	});

	// base trial
	API.addTrialSets('base',{
		input: [
			{handle:'space',on:'space'}
		],

		stimuli: [
			{media: 'Hellow World!!'}
		],

		interactions: [
			{
				conditions: [
					{type:'begin'}
				],
				actions: [
					{type:'showStim',handle:'All'}
				]
			},
			{
				conditions: [
					{type:'inputEquals',value:'space'}
				],
				actions: [
					{type:'endTrial'}
				]
			}
		]
	});

	API.addSequence([
		{
			mixer: 'randomize',
			data: [
				{
					mixer: 'repeat',
					times: 10,
					data: [
						{inherit:'base'}
					]
				}
			]
		}
	]);

	return API.script;
});`
