import validator from './validator/validatorComponent';



m.mount(document.body, {
	view: () => {
		return m.component(validator, {url: getParameterByName('url') || '/test/distance.js'});
	}
});

function getParameterByName(name) {
	name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
		results = regex.exec(location.search);
	return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}