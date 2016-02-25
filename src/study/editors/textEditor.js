import {save} from '../sidebar/fileActions';
import ace from './ace/aceComponent';

import syntaxComponent from './ace/syntaxComponent';
import validatorComponent from './ace/validatorComponent';

import textMenu from './textMenu';

export default textEditor;

let textEditor = args => m.component(textEditorComponent, args);

let textEditorComponent = {
	controller: function({file}){
		file.loaded || file.get()
			.then(m.redraw)
			.catch(m.redraw);

		let ctrl = {mode:m.prop('edit')};

		return ctrl;
	},

	view: function(ctrl, {file}){

		if (!file.loaded) return m('.loader');

		if (file.error) return m('div', {class:'alert alert-danger'}, [
			m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
			`The file "${file.path}" was not found`
		]);

		return m('.editor', [
			textMenu({mode: ctrl.mode, file}),
			textContent(ctrl, {file})
		]);
	}
};

let textContent = (ctrl, {file}) => {
	let textMode = modeMap[file.type] || 'javascript';
	switch (ctrl.mode()){
	case 'edit' : return ace({content:file.content, settings: {onSave: save, mode: textMode}});
	case 'validator': return validatorComponent({file});
	case 'syntax': return syntaxComponent({file});
	}
};

let modeMap = {
	js: 'javascript',
	jst: 'ejs',
	html: 'ejs',
	htm: 'ejs',
	xml: 'xml'
};