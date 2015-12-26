import File from './fileModel';
import jsEditor from './jsEditor';
import jstEditor from './jstEditor';
import imgEditor from './imgEditor';
import pdfEditor from './pdfEditor';

export default fileEditorComponent;

let editors = {
	js: jsEditor,
	jpg: imgEditor,
	bmp: imgEditor,
	png: imgEditor,
	html: jstEditor,
	jst: jstEditor,
	pdf: pdfEditor
};

let fileEditorComponent = {
	controller: function() {
		var url = m.route.param('url');
		var file = new File(url);
		file.load();

		var ctrl = {
			file: file
		};

		return ctrl;
	},

	view: (ctrl, args = {}) => {
		var file = ctrl.file;

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
					m.component(editors[file.type], {file:file, settings: args.settings})

		]);
	}
};