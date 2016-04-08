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
		`API.addQuestionsSet('questionList', ${print(questionList)});`,
		``,

		`// This is the sequence of questions`,
		`// Note that you may want to update the "times" property if you change the number of questions`,
		`API.addSequence(${print(sequence)});`,

		``,
		`return API.script;`
	].join(NEW_LINE);

	return `define(['questAPI'], function(Quest){\n${indent(content)}\n});`;
}
