import classNames from '../../classNames';
import fileContext from './fileContext';
export default filesComponent;

let filesComponent = {
	view: (ctrl, study) => {
		let files = study.files();
		return m('.files', [
			m('ul', files.map(file => m.component(nodeComponent, {file, study})))
		]);
	}
};

let nodeComponent = {
	controller: ({file}) => {
		return {
			isDir: file.isDir,
			isOpen: false,
			isCurrent: m.route.param('fileID') === file.id
		};

	},
	view: (ctrl, {file, study}) => {
		return m('li.file-node',
			{
				key: file.id,
				class: classNames({
					open : ctrl.isOpen
				}),
				onclick: choose(file),
				oncontextmenu: fileContext(file, study)
			},
			[
				m('a.wholerow', {
					unselectable:'on',
					class:classNames({
						'current': ctrl.isCurrent
					})
				}, m.trust('&nbsp;')),

				m('i.fa.fa-fw', {
					class: classNames({
						'fa-caret-right' : ctrl.isDir && !ctrl.isOpen,
						'fa-caret-down': ctrl.isDir && ctrl.isOpen
					}),
					onclick: ctrl.isDir ? (() => ctrl.isOpen = !ctrl.isOpen) : null
				}),

				m('a', [
					m('i.fa.fa-fw.fa-file-o', {
						class: classNames({
							'fa-file-code-o': /(js)$/.test(file.type),
							'fa-file-text-o': /(jst|html|xml)$/.test(file.type),
							'fa-file-image-o': /(jpg|png|bmp)$/.test(file.type),
							'fa-file-pdf-o': /(pdf)$/.test(file.type),
							'fa-folder-o': file.isDir
						})
					}),
					` ${file.name}`
				])
			]
		);
	}
};

let choose = file => e => {
	e.preventDefault();
	m.route(`/editor/${file.studyID}/${file.id}`);
};
