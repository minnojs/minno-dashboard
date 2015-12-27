import File from './fileModel';
import classNames from '../classNames';
import contextMenu from '../contextMenuComponent';
export default sidebarComponent;

let sidebarComponent = {
	controller: () => {
		let ctrl = {
			fileArr: [
				new File('/test/aaa.pdfs'),
				new File('/test/templates/left.jst'),
				new File('/test/example.js'),
				new File('/test/images/bf14_nc.jpg')
			]
		};

		return ctrl;
	},
	view: ctrl => {
		return m('div', [
			m('h5', 'Files'),
			m.component(filesComponent, ctrl.fileArr)
		]);
	}
};

let filesComponent = {
	view: (ctrl, files) => {
		return m('.files', [
			m('ul', files.map(node => m.component(nodeComponent, node, files)))
		]);
	}
};

let nodeComponent = {
	controller: (file) => {
		return {
			isDir: file.isDir,
			isOpen: false,
			isCurrent: m.route.param('url') === file.id
		};
	},
	view: (ctrl, file) => {
		return m('li.node',
			{
				key: file.id,
				class: classNames({
					open : ctrl.isOpen
				})
			},
			[
				m('a.wholerow', {
					unselectable:'on',
					class:classNames({
						'current': ctrl.isCurrent
					}),
					onclick: choose(file)
				}, m.trust('&nbsp;')),

				m('i.fa.fa-fw', {
					class: classNames({
						'fa-caret-right' : ctrl.isDir && !ctrl.isOpen,
						'fa-caret-down': ctrl.isDir && ctrl.isOpen
					}),
					onclick: ctrl.isDir ? (() => ctrl.isOpen = !ctrl.isOpen) : choose(file)
				}),

				m('a', {onclick: choose(file)}, [
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
	m.route(`/file/${file.url}`);
};