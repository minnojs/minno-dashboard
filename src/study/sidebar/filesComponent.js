import nodeComponent from './nodeComponent';
export default filesComponent;

let filesComponent = {
	view(ctrl, {study,files,filesVM}){
		return m('.files', [
			m('ul', files.map(file => m.component(nodeComponent, {file, study, key:file.id, filesVM})))
		]);
	}
};
