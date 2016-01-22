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

	alert: opts => {
		return messages.open('alert', opts);
	},

	confirm: opts => {
		return messages.open('confirm', opts);
	},

	prompt: opts => {
		return messages.open('prompt', opts);
	},

	view: () => {
		let vm = messages.vm;
		let close = messages.close.bind(null, null);
		let stopPropagation = e => e.stopPropagation();
		return m('.messages', [
			!vm || !vm.isOpen
				? ''
				:[
					m('.overlay', {config:messages.config()}),
					m('.messages-wrapper', {onclick:close}, [
						m('.card.col-sm-5',[
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
			return [
				m('h4', opts.header),
				m('.card-text', opts.content),
				m('.card-block', [
					m('input.form-control', {
						onchange: m.withAttr('value', opts.prop || noop),
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