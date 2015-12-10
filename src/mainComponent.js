export default mainComponent;

var mainComponent = {
	controller: function(){
		var ctrl = {
			url: m.prop('')
		};

		return ctrl;
	},
	view: ctrl => {
		return m('.container', [
			m('.jumbotron', [
				m('h2', 'Welcome to PI Validator'),
				m('p','Please insert the url for the file you would like to edit'),
				m('.input-group', [
					m('span.input-group-btn', [
						m('a.btn.btn-default', {href: `/file/${ctrl.url()}`, config: m.route}, m.trust('<span aria-hidden="true" class="glyphicon glyphicon-search"></span>'))
					]),
					m('input.form-control[placeholder="Please insert a URL"]', {value: ctrl.url(), onchange: m.withAttr('value', ctrl.url)})
				])
			])
		]);
	}
};