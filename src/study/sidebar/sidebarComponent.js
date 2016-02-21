import filesComponent from './filesComponent';
import sidebarButtons from './sidebarButtons';
import {uploadBox} from 'utils/uploader';
export default sidebarComponent;

let sidebarComponent = {
	view: (ctrl , {study, filesVM}) => {
		return m('.sidebar', [
			m('h5', study.id),
			m.component(sidebarButtons, {study}),
			m.component(filesComponent, {study,filesVM, files: study.files() || []}),
			uploadBox({study})
		]);
	}
};