import fullHeight from './fullHeight';
import filesComponent from './sidebar/filesComponent';
export default sidebarComponent;

let sidebarComponent = {
	view: (ctrl , study) => {
		return m('.editor-sidebar', {config:fullHeight}, [
			m('h5', [
				study.id
			]),

			m('.btn-group',[
				m('.btn.btn-sm.pull.btn-secondary',[
					m('i.fa.fa-plus'), ' New'
				])
			]),

			m.component(filesComponent, study)
		]);
	}
};