import {formFactory, textInput, checkboxInput, maybeInput} from 'utils/formHelpers';
export default pageComponent;

let pageComponent = {
	controller({output,close}){
		let form = formFactory();
		let page = {
			header: m.prop(''),
			decline: m.prop(false),
			progressBar: m.prop('<%= pagesMeta.number %> out of <%= pagesMeta.outOf%>'),
			autoFocus: true,
			questions: []
		};
		output(page);

		return {page,form, close};

	},
	view({page,form,close}){
		return m('div', [	
			m('h4', 'Add Page'),
			m('.card-block', [
				textInput({label: 'header', prop: page.header, help: 'The header for the page',form}),
				checkboxInput({label: 'decline', description: 'Allow declining to answer', prop: page.decline,form}),
				maybeInput({label:'progressBar', help: 'If and when to display the  progress bar (use templates to control the when part)', prop: page.progressBar,form})
			]),
			m('.text-xs-right.btn-toolbar',[
				m('a.btn.btn-secondary.btn-sm', {onclick:close(false)}, 'Cancel'),
				m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, 'Proceed')
			])
		]);
	}
};

