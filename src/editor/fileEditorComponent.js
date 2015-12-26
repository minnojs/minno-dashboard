import File from './fileModel';
import jsEditor from './jsEditor';
import imgEditor from './imgEditor';
export default fileEditorComponent;

let editors = {
	js: jsEditor,
	jpg: imgEditor,
	bmp: imgEditor,
	png: imgEditor
}

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
						m.component(editors[file.type], {file:file})
					]
		]);
	}
};