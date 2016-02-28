import fullHeight from 'utils/fullHeight';
import imgEditor from './editors/imgEditor';
import pdfEditor from './editors/pdfEditor';
import unknowEditor from './editors/unknownEditor';
import textEditor from './editors/textEditor';

export default fileEditorComponent;

let editors = {
	js: textEditor,
	html: textEditor,
	htm: textEditor,
	jst: textEditor,
	xml: textEditor,

	jpg: imgEditor,
	bmp: imgEditor,
	png: imgEditor,

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
		let editor = file && editors[file.type] || unknowEditor;

		return m('div', {config:fullHeight}, [
			file
				? editor({file:file, settings: args.settings})
				: m('.centrify', [
					m('i.fa.fa-smile-o.fa-5x'),
					m('h5', 'Please select a file to start working')
				])
		]);
	}
};