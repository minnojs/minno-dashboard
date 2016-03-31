import {print, indent} from 'utils/prettyPrint';

export default function ratingWizard({basicPage, basicSelect, questionList, sequence}){
	const NEW_LINE = '\n';
	let content = [
		`var API = new Quest();`,

		``,
		`// The structure for the basic questionnaire page`,
		`API.addPagesSet('basicPage', ${print(basicPage)});`,

		``,
		`// The structure for the basic question	`,
		`API.addQuestionsSet('basicSelect', ${print(basicSelect)});`,

		`// This is the question pool, the sequence picks the questions from here`,
		`API.addQuestionSet('questionList', ${print(questionList)}`,
		``,

		`// This is the sequence of questions`,
		`API.addSequence(${print(sequence)})`,

		``,
		`return API.script;`
	].join(NEW_LINE);

	return `define(['questAPI'], function(Quest){\n${indent(content)}\n});`;
}


/*
define(['questAPI'], function(Quest){

	var API = new Quest();
	
	// The structure for the basic questionnaire page
	API.addPagesSet('basicPage', {
		header: '<%= header %>',
		autoFocus:true,
		questions: [
			{inherit: {type:'exRandom', set:'questionList'}}
		]
	});

	// The structure for the basic question	
	API.addQuestionsSet('basicSelect',{
		type: 'selectOne',
		autoSubmit: '<%= autoSubmit ? "true" : "false" %>',
		numericValues:true,
		help: '<%= pagesMeta.number < 3 %>',
		helpText: 'Selecting an answer once colors it blue.<br/>You can change your answer by selecting another option.<br/>To confirm, click the selected (blue) button a second time.'
	});

	// This is the question pool, the sequence picks the questions from here
	API.addQuestionSet('questionList', [
		{inherit:'basicSelect', name: 'n001', stem:'How are you?'}
	]);

	// This is the sequence of questions
	API.addSequence([
		{
			mixer: 'repeat',
			times: 10,
			data: [
				{inherit:'basicPage'}
			]
		}
	]);

	return API.script;
});
*/
