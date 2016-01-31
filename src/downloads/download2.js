/* globals $, m */
var daterangeComponent = {
	view: function(ctrl, options){
		return m('input',{class:'form-control',placeholder:options.placeholder, config:daterangeComponent.config(options)});
	},
	config: function(ctrl){
		return function(element, isInitialized) {
			var el = $(element);


			if (!isInitialized) {
				//set up select2 (only if not initialized already)
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


var form = {
	controller: function(){
		this.submit = function(e){
			e.preventDefault();
			var vm = form.vm;
			var data = {
				studyId: vm.studyId(),
				db: vm.db(),
				start

			};

			m.request({method: "GET", url: "/things", data: data, background: true})
				.then(function() {
					m.redraw()
				})
			console.log('submit');
		};
	},
	view: function(ctrl){
		return m('form',{class:'form-inline'},[
			m('.form-group',[
				m('input',{class:'form-control', placeholder:'Study ID', value: form.vm.studyId(), onchange: m.withAttr('value', form.vm.studyId),})
			]),
			m('.form-group',[
				//m('input', {class:'form-control', config: form.dateRangConfig, value: form.vm.dateRange()})
				m.component(daterangeComponent, {startValue: form.vm.startValue, endValue: form.vm.endValue})
			]),
			m('.form-group',[
				m('select', {class:'form-control', onchange: m.withAttr('value', form.vm.db)}, [
					m('option', {value:'test'}, 'Development'),
					m('option', {value:'warehouse'}, 'Production')
				])
			]),
			m('button', {class:'btn btn-primary', disabled:null, onclick:ctrl.submit}, 'Request')
		]);
	},
	vm: {
		studyId: m.prop(''),
		db: m.prop('test'),
		startValue: m.prop(),
		endValue: m.prop()
	}
};


			// <form class="form-inline" ng-controller="requestCtrl">
			//   <div class="form-group">
			//     <input class="form-control" placeholder="Study ID" ng-model="row.studyId" value="">
			//   </div>

			//   <div class="form-group">
			//     <input
			//         class="form-control"
			//         type="daterange"
			//         ng-model="dateRange"
			//         format="MM/DD/YYYY"
			//         ranges="{
			//             'Last 7 Days': [moment().subtract(6, 'days'), moment()],
			//             'Last 30 Days': [moment().subtract(29, 'days'), moment()],
			//             'Last 90 Days': [moment().subtract(89, 'days'), moment()],
			//             'All time': [moment(0), moment(), true]
			//         }"
			//         placeholder="Date Range"
			//         value=""
			//     >
			//   </div>

			//   <div class="form-group">
			//       <select class="form-control" ng-model="row.db">
			//         <option value="test" selected>Development</option>
			//         <option value="warehouse">Production</option>
			//       </select>
			//   </div>

			//   <button class="btn btn-primary" ng-click="requestDownload(row)" ng-disabled="loading" >{{loading ? 'Loading...' : 'Request'}}</button>
			// </form>








var table = {

};

var download = {
	controller: function() {
		this.form = submodule(form);
		//this.table = submodule(table);
	},
	view: function(ctrl) {
		return m('.container', [
			m('h2', 'Admin - download'),
			ctrl.form(),
			m('h4', 'table')
		]);
	}
};


m.mount(document.body, download);