import File from './fileModel';
import editorComponent from './editorComponent';
import syntaxComponent from './syntaxComponent';
import validatorComponent from './validatorComponent';

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

		return m('.container', [
			m('h2', 'Edit ', [m('small', file.url)]),

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
							m('li', {class: activeTab() == 'edit' ? 'active' : ''}, [
								m('a[data-tab="edit"]', {onclick:m.withAttr('data-tab', activeTab)}, 'Edit')
							]),
							m('li', {class: activeTab() == 'syntax' ? 'active' : ''}, [
								m('a[data-tab="syntax"]', {onclick:m.withAttr('data-tab', activeTab)}, [
									'Syntax ',
									m('span.badge.alert-danger',file.syntaxValid ? '' : file.syntaxData.errors.length)
								])
							]),
							m('li', {class: activeTab() == 'validate' ? 'active' : ''}, [
								m('a[data-tab="validate"]', {onclick:m.withAttr('data-tab', activeTab)}, 'Validate')
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