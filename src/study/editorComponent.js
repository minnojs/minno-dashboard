import fullHeight from 'utils/fullHeight';
import jsEditor from './editors/jsEditor';
import jstEditor from './editors/jstEditor';
import xmlEditor from './editors/xmlEditor';
import imgEditor from './editors/imgEditor';
import pdfEditor from './editors/pdfEditor';
import unknowEditor from './editors/unknownEditor';

export default fileEditorComponent;

let editors = {
	js: jsEditor,

	jpg: imgEditor,
	bmp: imgEditor,
	png: imgEditor,

	html: jstEditor,
	jst: jstEditor,
	xml: xmlEditor,

	pdf: pdfEditor
};

let fileEditorComponent = {
	controller: function({study}) {
		var id = m.route.param('fileID');
		var file = study.getFile(id);
		var ctrl = {
			file: file
		};

		return ctrl;
	},

	view: (ctrl, args = {}) => {
		let file = ctrl.file;
		let editor = editors[file.type] || unknowEditor;

		return m('div', {config:fullHeight}, [
			file
				? m.component(editor, {file:file, settings: args.settings})
				: m('.centrify', [
					m('i.fa.fa-smile-o.fa-5x'),
					m('h5', 'Please select a file to start working')
				])
		]);
	}
};