import {play, save} from '../sidebar/fileActions';

export default textMenuView;

let textMenuView = ({mode, file}) => {
	let setMode = value => () => mode(value);
	let modeClass = value => mode() === value ? 'active' : '';
	let isJs = file.type === 'js';

	return m('.btn-toolbar.editor-menu', [
		m('.file-name',
			file.hasChanged() ? m('span.text-danger','* ') : '',
			file.path
		),
		m('.btn-group.btn-group-sm', [
			!isJs ? '' :  m('a.btn.btn-secondary', {onclick: play(file), title:'Play this task'},[
				m('strong.fa.fa-play')
			]),

			m('a.btn.btn-secondary', {onclick: save(file), title:'Save (ctrl+s)',class: file.hasChanged() ? 'btn-danger-outline' : ''},[
				m('strong.fa.fa-save')
			])
		]),
		!isJs ? '' : m('.btn-group.btn-group-sm.pull-xs-right', [
			m('a.btn.btn-secondary', {onclick: setMode('edit'), class: modeClass('edit')},[
				m('strong','Edit')
			]),
			m('a.btn.btn-secondary', {onclick: setMode('syntax'), class: modeClass('syntax')},[
				m('strong','Syntax')
			]),
			m('a.btn.btn-secondary', {onclick: setMode('validator'), class: modeClass('validator')},[
				m('strong','Validator')
			])
		])
	]);
};

