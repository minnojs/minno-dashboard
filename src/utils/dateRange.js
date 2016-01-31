// import $ from 'jquery';
let Pikaday = window.Pikaday;

export let datePicker = (prop, options) => m.component(pikaday, {prop,options});
export let dateRangePicker = args => m.component(pikadayRange, args);

let pikaday = {
	view(ctrl, {prop, options}){
		return m('div', {config: pikaday.config(prop, options)});
	},
	config(prop, options){
		return (element, isInitialized, ctx) => {
			if (!isInitialized){
				ctx.picker = new Pikaday(Object.assign({
					onSelect: prop,
					container: element
				},options));

				element.appendChild(ctx.picker.el);
			}

			ctx.picker.setDate(prop());
		};
	}
};

/**
 * args = {
 * 	startValue: m.prop,
 *  endValue: m.prop,
 *  options: Object // specific daterange plugin options
 * }
 */

let pikadayRange = {
	view: function(ctrl, args){
		return m('div',[
			m('.figure', [
				m('strong','Start Date'),
				m('br'),
				m('.figure', {config:pikadayRange.configStart(args)})
			]),
			m.trust('&nbsp;'),
			m('.figure', [
				m('strong','End Date'),
				m('br'),
				m('.figure', {config:pikadayRange.configEnd(args)})
			])
		]);
	},
	configStart({startDate, endDate}){
		return (element, isInitialized, ctx) => {
			let picker = ctx.picker;

			if (!isInitialized){
				picker = ctx.picker = new Pikaday({
					maxDate: new Date(),
					onSelect: date => startDate(date) && m.redraw()
				});
				element.appendChild(picker.el);

				ctx.onunload = picker.destroy.bind(picker);
			}
			console.log(234234234234)

			picker.setDate(startDate(), true);

			picker.setEndRange(endDate());
			picker.setMaxDate(endDate());
			picker.setStartRange(startDate());
		};
	},
	configEnd({startDate, endDate}){
		return (element, isInitialized, ctx) => {
			let picker = ctx.picker;

			if (!isInitialized){
				picker = ctx.picker = new Pikaday({
					maxDate: new Date(),
					onSelect: date => endDate(date) && m.redraw()
				});
				element.appendChild(picker.el);

				ctx.onunload = picker.destroy.bind(picker);
			}

			picker.setDate(endDate(), true);

			picker.setStartRange(startDate());
			picker.setMinDate(startDate());
			picker.setEndRange(endDate());
		};
	}
};