// import $ from 'jquery';
let $ = window.$;

/**
 * args = {
 * 	startValue: m.prop,
 *  endValue: m.prop,
 *  placeholder: String,
 *  options: Object // specific daterange plugin options
 * }
 */

export default args => m.component(daterangeComponent, args);

var daterangeComponent = {
	view: function(ctrl, args){
		return m('input.form-control',{placeholder:args.placeholder, config:daterangeComponent.config(args)});
	},
	config: function(args){
		return function(element, isInitialized) {
			var el = $(element);

			if (!isInitialized) {
				//set up daterangepicker (only if not initialized already)
				el.daterangepicker(args.options || {}, function(start, end){
					//integrate with the auto-redrawing system...
					m.startComputation();

					args.startValue(start);
					args.endValue(end);

					m.endComputation();
					//end integration
				});
			}

			var picker = el.data('daterangepicker');

			//update the view with the latest controller value
			picker.setStartDate(args.startValue());
			picker.setEndDate(args.endValue());
		};
	}
};
