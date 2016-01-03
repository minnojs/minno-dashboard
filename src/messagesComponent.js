export default messages;

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

		// switch (vm.type) {
		// 	case 'alert':
		// 		return
		// 	default:
		// 		throw new Error(`unnknown message type ${vm.type}`);
		// }

		return m('.messages', [
			!vm || !vm.isOpen
				? ''
				:[
					m('.overlay', {config:messages.config()}),
					m('.messages-wrapper', {onclick:messages.close.bind(null, null)}, [
						m('.card.col-sm-5',[
							m('.card-block',[
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
				m('.text-xs-right',[
					m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
				])
			];
		},

		confirm: (opts={}) => {
			let close = response => messages.close.bind(null, response);
			return [
				m('h4', opts.header),
				m('p.card-text', opts.content),
				m('.text-xs-right',[
					m('a.btn.btn-secondary.btn-sm', {onclick:close(null)}, opts.okText || 'Cancel'),
					m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
				])
			];
		},

		prompt: (opts={}) => {
			let close = response => messages.close.bind(null, response);
			return [
				m('h4', opts.header),
				m('p.card-text', opts.content),
				m('input'),
				m('.text-xs-right',[
					m('a.btn.btn-secondary.btn-sm', {onclick:close(null)}, opts.okText || 'Cancel'),
					m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
				])
			];
		}
	}


};