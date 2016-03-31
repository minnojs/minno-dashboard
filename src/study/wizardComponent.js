import ratingWizard from './wizards/ratingWizard';
export default wizardComponent;

let wizardComponent = {
	controller(){
		console.log(ratingWizard({
			basicPage: {header:'blog', decline:true},
			basicSelect: {},
			questionList: [],
			sequence: []
		}));				
	},
	view(){		
		return m('.wizard', [
			m('h3', 'Rating wizard'),

			// http://v4-alpha.getbootstrap.com/components/forms/#using-the-grid
			
		]); 
	} 
};
