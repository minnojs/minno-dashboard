export default messages;

let noop = ()=>{};

let messages = {
	vm: {isOpen: false},

	open: (type, opts={}) => {
		let promise = new Promise((resolve, reject) => {
			messages.vm = {resolve,reject,type, opts, isOpen:true};
		});
		m.redraw();

		return promise;
	},

	close: response => {
		let vm = messages.vm;
		vm.isOpen = false;
		if (typeof vm.resolve === 'function') vm.resolve(response);
		m.redraw();
	},

	custom: opts=>messages.open('custom', opts),
	alert: opts => messages.open('alert', opts),
	confirm: opts => messages.open('confirm', opts),
	prompt: opts => messages.open('prompt', opts),

	view: () => {
		let vm = messages.vm;
		let close = messages.close.bind(null, null);
		let stopPropagation = e => e.stopPropagation();
		return m('#messages.backdrop', [
			!vm || !vm.isOpen
				? ''
				:[
					m('.overlay', {config:messages.config()}),
					m('.backdrop-content', {onclick:close}, [
						m('.card', {class: vm.opts.wide ? 'col-sm-8' : 'col-sm-5', config:maxHeight}, [
							m('.card-block', {onclick: stopPropagation}, [
								messages.views[vm.type](vm.opts)
							])
						])
					])
				]
		]);

	},

	config: () => {
		return (element, isInitialized, context) => {
			if (!isInitialized) {
				let handleKey = function(e) {
					if (e.keyCode == 27) {
						messages.close(null);
					}
					if (e.keyCode == 13) {
						messages.close(true);
					}
				};

				document.body.addEventListener('keyup', handleKey);

				context.onunload = function() {
					document.body.removeEventListener('keyup', handleKey);
				};
			}
		};
	},

	views: {
		custom: (opts={}) => opts.content,

		alert: (opts={}) => {
			let close = response => messages.close.bind(null, response);
			return [
				m('h4', opts.header),
				m('p.card-text', opts.content),
				m('.text-xs-right.btn-toolbar',[
					m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
				])
			];
		},

		confirm: (opts={}) => {
			let close = response => messages.close.bind(null, response);
			return [
				m('h4', opts.header),
				m('p.card-text', opts.content),
				m('.text-xs-right.btn-toolbar',[
					m('a.btn.btn-secondary.btn-sm', {onclick:close(null)}, opts.okText || 'Cancel'),
					m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
				])
			];
		},

		/**
		 * Promise prompt(Object opts{header: String, content: String, name: Prop})
		 *
		 * where:
		 *   any Prop(any value)
		 */
		prompt: (opts={}) => {
			let close = response => messages.close.bind(null, response);
			let prop = opts.prop || noop;
			return [
				m('h4', opts.header),
				m('.card-text', opts.content),
				m('.card-block', [
					m('input.form-control', {
						key: 'prompt',
						value: prop(),
						onchange: m.withAttr('value', prop),
						config: (element, isInitialized) => {
							if (!isInitialized) element.focus();
						}
					})
				]),
				m('.text-xs-right.btn-toolbar',[
					m('a.btn.btn-secondary.btn-sm', {onclick:close(null)}, opts.okText || 'Cancel'),
					m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
				])
			];
		}
	}
};


// set message max height, so that content can scroll within it.
let maxHeight = (element, isInitialized, ctx) => {
	if (!isInitialized){
		onResize();

		window.addEventListener('resize', onResize, true);

		ctx.onunload = function(){
			window.removeEventListener('resize', onResize);
		};

	}

	function onResize(){
		element.style.maxHeight = document.documentElement.clientHeight * 0.9 + 'px';
	}

};
