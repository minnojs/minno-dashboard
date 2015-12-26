import editorComponent from './editorComponent';
import classNames from '../classNames';

export default jsEditor;

let jsEditor = {
	controller: args => {
		return {
			file: args.file,
			activeTab: m.prop('edit')
		};
	},
	view: ctrl => {
		let file = ctrl.file;
		let activeTab = ctrl.activeTab;
		return m('div',[
			m('ul.nav.nav-tabs',[
				m('li.nav-item', [
					m('a[data-tab="edit"].nav-link', {onclick:m.withAttr('data-tab', activeTab), class: classNames({active: activeTab() == 'edit'})}, 'Edit')
				]),
				m('li.nav-item',[
					m('a.nav-link.disabled', 'Syntax')
				]),
				m('li.nav-item',[
					m('a.nav-link.disabled', 'Vaildate')
				])
			]),
			m('.tab-content', [
				activeTab() == 'edit' ? m.component(editorComponent, {file:file, settings: {mode:'ejs'}}) : ''
			])
		]);
	}
};