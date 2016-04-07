import {play, save} from '../sidebar/fileActions';

export default textMenuView;

let textMenuView = ({mode, file, study, observer}) => {
	let setMode = value => () => mode(value);
	let modeClass = value => mode() === value ? 'active' : '';
	let isJs = file.type === 'js';
	let isExpt = /\.expt\.xml$/.test(file.path);

	return m('.btn-toolbar.editor-menu', [
		m('.file-name', {class: file.hasChanged() ? 'text-danger' : ''},
			m('span',{class: file.hasChanged() ? '' : 'invisible'}, '*'),
			file.path
		),

		!isJs ? '' : m('.btn-group.btn-group-sm.pull-xs-right', [
			m('a.btn.btn-secondary', {onclick: setMode('edit'), class: modeClass('edit')},[
				m('strong','Edit')
			]),
			m('a.btn.btn-secondary', {onclick: setMode('syntax'), class: modeClass('syntax')},[
				m('strong',
					'Syntax ',
					file.syntaxValid
						? m('i.fa.fa-check-square.text-success')
						: m('span.label.label-danger', file.syntaxData.errors.length)
				)
			])
			//m('a.btn.btn-secondary', {onclick: setMode('validator'), class: modeClass('validator')},[
			//	m('strong','Validator')
			//])
		]),
		m('.btn-group.btn-group-sm.pull-xs-right', [
			m('a.btn.btn-secondary', {onclick:() => observer.trigger('paste', '<%= %>'), title:'Paste a template wizard'},[
				m('strong.fa.fa-percent')
			])
		]),
		m('.btn-group.btn-group-sm.pull-xs-right', [
			!isJs ? '' :  m('a.btn.btn-secondary', {onclick: play(file,study), title:'Play this task'},[
				m('strong.fa.fa-play')
			]),
			
			!isExpt ? '' :  m('a.btn.btn-secondary', {href: `https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=${file.url.replace(/^.*?\/implicit\//, '')}`, target: '_blank', title:'Play this task'},[
				m('strong.fa.fa-play')
			]),

			m('a.btn.btn-secondary', {onclick: save(file), title:'Save (ctrl+s)',class: file.hasChanged() ? 'btn-danger-outline' : ''},[
				m('strong.fa.fa-save')
			])
		])
	]);
};

