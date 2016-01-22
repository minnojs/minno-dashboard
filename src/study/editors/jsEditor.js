import editorComponent from './ace/editorComponent';
import syntaxComponent from './ace/syntaxComponent';
import validatorComponent from './ace/validatorComponent';
import classNames from 'utils/classNames';

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
			!file.loaded ? '' : m('ul.nav.nav-tabs',[
				m('li.nav-item', [
					m('a[data-tab="edit"].nav-link', {onclick:m.withAttr('data-tab', activeTab), class: classNames({active: activeTab() == 'edit'})}, 'Edit')
				]),
				m('li.nav-item', [
					m('a[data-tab="syntax"].nav-link', {onclick:m.withAttr('data-tab', activeTab), class: classNames({active: activeTab() == 'syntax'})}, [
						'Syntax ',
						m('span.badge.alert-danger',file.syntaxValid ? '' : file.syntaxData.errors.length)
					])
				]),
				m('li.nav-item', [
					m('a[data-tab="validate"].nav-link', {onclick:m.withAttr('data-tab', activeTab), class: classNames({active: activeTab() == 'validate'})}, 'Validate')
				])
			]),
			m('.tab-content', [
				activeTab() == 'edit' ? m.component(editorComponent, {file:file}) : '',
				activeTab() == 'syntax' ? m.component(syntaxComponent, {file:file}) : '',
				activeTab() == 'validate' ? m.component(validatorComponent, {file:file}) : ''
			])
		]);
	}
};