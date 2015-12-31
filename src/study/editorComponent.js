import fullHeight from './fullHeight';
import jsEditor from './editors/jsEditor';
import jstEditor from './editors/jstEditor';
import imgEditor from './editors/imgEditor';
import pdfEditor from './editors/pdfEditor';

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
	controller: function(study) {
		var id = m.route.param('fileID');
		var file = study.getFile(id);

		var ctrl = {
			file: file
		};

		return ctrl;
	},

	view: (ctrl, args = {}) => {
		var file = ctrl.file;

		return m('div', {config:fullHeight}, [
			file
				? editors[file.type]
					? m.component(editors[file.type], {file:file, settings: args.settings})
					: m('.centrify', [
						m('i.fa.fa-file.fa-5x'),
						m('h5', 'Unknow file type')
					])
				: m('.centrify', [
					m('i.fa.fa-smile-o.fa-5x'),
					m('h5', 'Please select a file to start working')
				])
		]);
	}
};