import {formFactory, textInput, checkboxInput, arrayInput, selectInput, maybeInput} from 'utils/formHelpers';
import inheritInput from './inheritInput';
export default questComponent;

let questComponent = {
	controller({output,close}){
		let form = formFactory();
		let type = m.prop('text');
		let common = {
			inherit: m.prop(''),
			name: m.prop(''),
			stem: m.prop(''),
			required: m.prop(false),
			errorMsg: {
				required: m.prop('')
			}
		};
		let quest = m.prop({});
		output(quest);

		return {type, common, quest,form, close, proceed};

		function proceed(){
			let script = output(Object.assign({type}, common, quest()));
			if (!script.required()) script.required = script.errorMsg = undefined;
			if (!script.help || !script.help()) script.help = script.helpText = undefined;
			
			close(true)();
		}		

	},
	view({type, common, quest,form,close, proceed}){
		return m('div', [	
			m('h4', 'Add Question'),
			m('.card-block', [
				selectInput({label:'type', prop: type, form, values: typeMap}),
				inheritInput({label:'inherit', prop:common.inherit, form, help: 'Base this element off of an element from a set'}),
				textInput({label: 'name', prop: common.name, help: 'The name by which this question will be recorded',form}),
				textInput({label: 'stem', prop: common.stem, help: 'The question text',form}),
				m.component(question(type()), {type,quest,form,common}),
				checkboxInput({label: 'required', prop: common.required, description: 'Require this question to be answered', form}),
				common.required()
					? textInput({label:'requiredText',  help: 'The error message for when the question has not been answered', prop: common.errorMsg.required ,form})
					: ''
			]),
			m('.text-xs-right.btn-toolbar',[
				m('a.btn.btn-secondary.btn-sm', {onclick:close(false)}, 'Cancel'),
				m('a.btn.btn-primary.btn-sm', {onclick:proceed}, 'Proceed')
			])
		]);
	}
};

let typeMap = {Text: 'text', 'Text Area': 'textarea', 'Select One': 'selectOne', 'Select Multiple': 'selectMulti', Slider: 'slider'};

let question = type => {
	switch (type) {
		case 'text' : return textComponent;
		case 'textarea' : return textareaComponent;
		case 'selectOne' : return selectOneComponent;
		case 'selectMulti' : return selectOneComponent;
		case 'slider' : return sliderComponent;
		default:
			throw new Error('Unknown question type');
	}
};

let textComponent = {
	controller({quest, common}){
		common.errorMsg.required('This text field is required');
		// setup unique properties
		quest({
			autoSubmit: m.prop(false)
		});
	},
	view(ctrl, {quest, form}){
		let props = quest();
		return m('div', [
			checkboxInput({label: 'autoSubmit', prop: props.autoSubmit, description: 'Submit on enter', form})
		]);	
	}
};

let textareaComponent = {
	controller({quest, common}){
		common.errorMsg.required('This text field is required');
		// setup unique properties
		quest({
			rows: m.prop(3),
			columns: m.prop('')
		});
	},
	view(ctrl, {quest, form}){
		let props = quest();
		return m('div', [
			textInput({label: 'rows', prop: props.rows, help: 'The number of visible text lines', form})
		]);	

	}
};

let selectOneComponent = {
	controller({quest,common}){
		common.errorMsg.required('Please select an answer, or click \'decline to answer\'');
		// setup unique properties
		quest({
			autoSubmit: m.prop(true),
			answers: m.prop([
				'Very much',
				'Somewhat',
				'Undecided',
				'Not realy',
				'Not at all'
			]),
			numericValues:true,
			help: m.prop(false),
			helpText: m.prop('Tip: For quick response, click to select your answer, and then click again to submit.')
		});
	},
	view(ctrl, {quest, form}){
		let props = quest();
		return m('div', [
			checkboxInput({label: 'autoSubmit', prop: props.autoSubmit, description: 'Submit on double click', form}),
			arrayInput({label: 'answers', prop: props.answers, rows:7,  form, isArea:true, help: 'Each row here represents an answer option', required:true}),
			maybeInput({label:'help', help: 'If and when to display the help text (use templates to control the when part)', prop: props.help,form, dflt: '<%= pagesMeta.number < 3 %>'}),
			props.help()
				? textInput({label:'helpText',  help: 'The instruction text for using this type of question', prop: props.helpText,form, isArea: true})
				: ''
		]);	
	}
};

let sliderComponent = {
	controller({quest,common}){
		common.errorMsg.required('Please select an answer, or click \'decline to answer\'');
		// setup unique properties
		quest({
			min: m.prop(0),
			max: m.prop(100),
			steps: m.prop(''),
			hidePips: m.prop(false), 
			highlight: m.prop(true),
			labels : m.prop(['Low', 'Medium', 'High']),
			help: m.prop(false),
			helpText: m.prop('Click on the gray line to indicate your judgment. After clicking the line, you can slide the circle to choose the exact judgment.')
		});
	},
	view(ctrl, {quest, form}){
		let props = quest();
		return m('div', [
			textInput({label: 'min', prop: props.min, help: 'The minimum value for the slider',form}),
			textInput({label: 'max', prop: props.max, help: 'The maximum value for the slider',form}),
			textInput({label: 'steps', prop: props.steps, help: 'Break the slider continuum to individual steps. Set to an integer or empty for a continuous slider',form}),
			props.steps()
				? '' 
				: checkboxInput({label: 'hidePips', prop: props.hidePips, description: 'Hide the markers for the individual steps',form}),
			arrayInput({label:'labels', prop: props.labels, help: 'A list of labels for the slider range', isArea: true, rows:5, form}),
			maybeInput({label:'help', help: 'If and when to display the help text (use templates to control the when part)', prop: props.help,form, dflt: '<%= pagesMeta.number < 3 %>'}),
			props.help()
				? textInput({label:'helpText',  help: 'The instruction text for using this type of question', prop: props.helpText,form, isArea: true})
				: ''
		]);	
	}
};
