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
			m('.list-group', [
				ctrl.fileArr.map(fileNode)
			])

		]);
	}
};

let fileNode = file => {
	return m('a.list-group-item', {config:m.route, href:`/file/${file.url}`, oncontextmenu: contextMenu.trigger}, [
		m('i', {
			class: classNames('fa fa-fw', {
				'fa-file-code-o': /(js)$/.test(file.type),
				'fa-file-text-o': /(jst|thml)$/.test(file.type),
				'fa-file-image-o': /(jpg|png|bmp)$/.test(file.type),
				'fa-file-pdf-o': /(pdf)$/.test(file.type)
			})
		}),
		` ${file.name}`
	]);
};