import folder from './folderComponent';
import classNames from 'utils/classNames';
import fileContext from './fileContext';
import {uploadConfig} from 'utils/uploader';

export default node;

let node = (file, args) => m.component(nodeComponent, file, args);

let nodeComponent = {
	controller: (file) => {
		return {
			isCurrent: m.route.param('fileID') === file.id
		};
	},
	view: (ctrl, file, {folderHash, study, filesVM}) => {
		let vm = filesVM(file.id); // vm is created by the study component, it exposes a "isOpen" and "isChanged" properties
		return m('li.file-node',
			{
				key: file.id,
				class: classNames({
					open : vm.isOpen()
				}),
				onclick: file.isDir ? () => vm.isOpen(!vm.isOpen()) : choose(file),
				oncontextmenu: fileContext(file, study),
				config: file.isDir ? uploadConfig(ctrl) : null
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
						'fa-caret-right' : file.isDir && !vm.isOpen(),
						'fa-caret-down': file.isDir && vm.isOpen()
					})
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
					` ${file.name}`,
					file.isDir ? folder(file.path + '/', {folderHash, study, filesVM}) : ''
				])
			]
		);
	}
};

let choose = (file) => e => {
	e.stopPropagation();
	e.preventDefault();
	m.route(`/editor/${file.studyId}/${encodeURIComponent(file.id)}`);
};