export default editorLayoutComponent;
import studyFactory from './studyModel';
import editorComponent from './editorComponent';
import sidebarComponent from './sidebar/sidebarComponent';

let study;

let editorLayoutComponent = {
	controller: ()=>{
		let id = m.route.param('studyID');
		if (!study || (study.id !== id)){
			study = studyFactory(id);
			study
				.get()
				.then(m.redraw);
		}

		let ctrl = {study};

		return ctrl;
	},
	view: ctrl => {
		let study = ctrl.study;
		return m('.row.study', [
			study.loaded
				? [
					m('.col-md-2', [
						m.component(sidebarComponent, study)
					]),
					m('.col-md-10',[
						m.component(editorComponent, study)
					])
				]
				:
				''
		]);
	}
};