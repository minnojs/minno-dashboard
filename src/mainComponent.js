import {toJSON, checkStatus} from './study/modelHelpers';
export default mainComponent;

var mainComponent = {
	controller: function(){
		var ctrl = {
			studies:m.prop([]),
			loaded:false
		};
		fetch('/dashboard/studies')
			.then(checkStatus)
			.then(toJSON)
			.then(ctrl.studies)
			.then(()=>ctrl.loaded = true)
			.then(m.redraw);



		return ctrl;
	},
	view: ctrl => {
		return m('.container', [
			m('h2', 'My studies'),
			!ctrl.loaded
				?
				m('.loader')
				:
				m('.list-group',ctrl.studies().map(study => m('a.list-group-item',{
					href: `/editor/${study.id}`,
					config: m.route
				}, study.name)))
		]);
	}
};