/* globals $, m */
var daterangeComponent = {
	view: function(ctrl, options){
		return m('input',{class:'form-control',placeholder:options.placeholder, config:daterangeComponent.config(options)});
	},
	config: function(ctrl){
		return function(element, isInitialized) {
			var el = $(element);


			if (!isInitialized) {
				//set up daterangepicker (only if not initialized already)
				el.daterangepicker(ctrl.options || {}, function(start, end){
					//integrate with the auto-redrawing system...
					m.startComputation();

					ctrl.startValue(start);
					ctrl.endValue(end);

					m.endComputation();
					//end integration
				});
			}

			var picker = el.data('daterangepicker');

			//update the view with the latest controller value
			picker.setStartDate(ctrl.startValue());
			picker.setEndDate(ctrl.endValue());
		};
	}
};
