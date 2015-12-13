import File from './fileModel';
import classNames from '../classNames';

export default sidebarComponent;

let sidebarComponent = {
	controller: () => {
		let ctrl = {
			fileArr: [
				new File('/test/cbm.js'),
				new File('/test/bv.js'),
				new File('/test/iat.js'),
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
	return m('a.list-group-item', {config:m.route, href:`/file/${file.url}`}, [
		m('i', {
			class: classNames('fa fa-fw', {
				'fa-file-code-o': file.type == 'js',
				'fa-file-image-o': /(jpg|png|bmp)/.test(file.type)
			})
		}),
		` ${file.name}`
	]);
};