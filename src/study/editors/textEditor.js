import {save} from '../sidebar/fileActions';
import ace from './ace/aceComponent';
import observerFactory from 'utils/observer';

import jshintOptions from './jshintOptions';
import syntaxComponent from './ace/syntaxComponent';
import validatorComponent from './ace/validatorComponent';

import textMenu from './textMenu';

export default textEditor;

let textEditor = args => m.component(textEditorComponent, args);

let textEditorComponent = {
	controller: function({file,study}){
		file.loaded || file.get()
			.then(m.redraw)
			.catch(m.redraw);

		let ctrl = {mode:m.prop('edit'), observer: observerFactory(), study};

		return ctrl;
	},

	view: function(ctrl, {file,study}){
		let observer = ctrl.observer;

		if (!file.loaded) return m('.loader');

		if (file.error) return m('div', {class:'alert alert-danger'}, [
			m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
			`The file "${file.path}" was not found`
		]);

		return m('.editor', [
			textMenu({mode: ctrl.mode, file, study, observer}),
			textContent(ctrl, {file,observer})
		]);
	}
};

let textContent = (ctrl, {file, observer}) => {
	let textMode = modeMap[file.type] || 'javascript';
	switch (ctrl.mode()){
		case 'edit' : return ace({content:file.content, observer, settings: {onSave: save(file), mode: textMode, jshintOptions}});
		case 'validator': return validatorComponent({file});
		case 'syntax': return syntaxComponent({file});
	}
};

let modeMap = {
	js: 'javascript',
	jsp: 'jsp',
	jst: 'ejs',
	html: 'ejs',
	htm: 'ejs',
	xml: 'xml'
};
