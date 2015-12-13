import File from './fileModel';
import editorComponent from './editorComponent';
import syntaxComponent from './syntaxComponent';
import validatorComponent from './validatorComponent';
import classNames from '../classNames';
export default fileEditorComponent;

let fileEditorComponent = {
	controller: function() {
		var url = m.route.param('url');
		var file = new File(url);
		file.load();

		var ctrl = {
			file: file,
			activeTab: m.prop('edit')
		};

		return ctrl;
	},

	view: ctrl => {
		var file = ctrl.file;
		var activeTab = ctrl.activeTab;

		return m('div', [
			!file.loaded
				?
				m('.loader')
				:
				file.error
					?
					m('div', {class:'alert alert-danger'}, [
						m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
						`The file "${file.url}" was not found`
					])
					:
					[
						m('ul.nav.nav-tabs',[
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
					]
		]);
	}
};