import {formFactory, textInput, checkboxInput, arrayInput, selectInput} from 'utils/formHelpers';
export default questComponent;

let questComponent = {
	controller({output,close}){
		let form = formFactory();
		let type = m.prop('text');
		let common = {
			name: m.prop(''),
			stem: m.prop('')
		};
		let quest = m.prop({});
		output(quest);

		return {type, common, quest,form, close, proceed};

		function proceed(){
			output(Object.assign({type}, common, quest()));
			close(true)();
		}		

	},
	view({type, common, quest,form,close, proceed}){
		return m('div', [	
			m('h4', 'Add Question'),
			m('.card-block', [
				selectInput({label:'type', prop: type, form, values: {text: 'Text', selectOne: 'Select One',selectMulti: 'Select Multiple'}}),
				textInput({label: 'name', prop: common.name, help: 'The name by which this question will be recorded',form}),
				textInput({label: 'stem', prop: common.stem, help: 'The question text',form}),
				m.component(question(type()), {quest,form})
			]),
			m('.text-xs-right.btn-toolbar',[
				m('a.btn.btn-secondary.btn-sm', {onclick:close(false)}, 'Cancel'),
				m('a.btn.btn-primary.btn-sm', {onclick:proceed}, 'Proceed')
			])
		]);
	}
};

let question = type => {
	switch (type) {
		case 'text' : return textComponent;
		case 'selectOne' : return selectOneComponent;
		case 'selectMulti' : return selectOneComponent;
		default:
			throw new Error('Unknown question type');
	}
};

let textComponent = {
	controller({quest}){
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

let selectOneComponent = {
	controller({quest}){
		// setup unique properties
		quest({
			autoSubmit: m.prop(false),
			answers: m.prop([
				'Very much',
				'Somewhat',
				'Undecided',
				'Not realy',
				'Not at all'
			]) 
		});
	},
	view(ctrl, {quest, form}){
		let props = quest();
		return m('div', [
			checkboxInput({label: 'autoSubmit', prop: props.autoSubmit, description: 'Submit on double click', form}),
			arrayInput({label: 'answers', prop: props.answers, rows:7,  form, isArea:true, help: 'Each row here represents an answer option', required:true})
		]);	
	}
};
