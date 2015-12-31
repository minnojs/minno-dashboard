import classNames from '../classNames';
import contextMenu from '../contextMenuComponent';
export default sidebarComponent;

let sidebarComponent = {
	view: (ctrl , study) => {
		return m('div', [
			m('h5', study.id),
			m.component(filesComponent, study)
		]);
	}
};

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
		return m('li.file',
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
							'fa-file-text-o': /(jst|thml)$/.test(file.type),
							'fa-file-image-o': /(jpg|png|bmp)$/.test(file.type),
							'fa-file-pdf-o': /(pdf)$/.test(file.type)
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

let fileContext = (file, study) => {
	let menu = [
		{icon:'fa-plus', text:'New File', action: () => alert('new')},
		{icon:'fa-copy', text:'Duplicate', action: () => alert('Duplicate')},
		{separator:true},
		{icon:'fa-download', text:'Download', action: () => {
			let link = document.createElement('a');
			link.href = file.url;
			link.download = file.name;
			link.target = '_blank';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}},
		// {icon:'fa-clipboard', text:'Copy Url', action: () => alert('copy')},
		{icon:'fa-close', text:'Delete', action: () => study.del(file.id)}

	];
	return contextMenu.open(menu);
};