const DRAGOVER_CLASS = 'is-dragover';
function dragdrop(element, options) {
	options = options || {};

	element.addEventListener('dragover', activate);
	element.addEventListener('dragleave', deactivate);
	element.addEventListener('dragend', deactivate);
	element.addEventListener('drop', deactivate);
	element.addEventListener('drop', update);

	function activate(e) {
		e.preventDefault();
		element.classList.add(DRAGOVER_CLASS);
	}
	function deactivate() {
		element.classList.remove(DRAGOVER_CLASS);
	}
	function update(e) {
		e.preventDefault();
		if (typeof options.onchange == 'function') {
			options.onchange((e.dataTransfer || e.target).files);
		}
	}
}

export let uploadConfig = ctrl => (element, isInitialized) => {
	if (!isInitialized) {
		dragdrop(element, {onchange: ctrl.onchange});
	}
};

export let uploadBox = ctrl => m('form.upload', {method:'post', enctype:'multipart/form-data', config:uploadConfig(ctrl)},[
	m('i.fa.fa-download	.fa-3x.m-b-1'),
	m('input.box__file', {id:'upload', type:'file', name:'files[]', 'data-multiple-caption':'{count} files selected', multiple:true, onchange:ctrl.onchange}),
	m('label', {for:'upload'},
		m('strong', 'Choose a file'),
		m('span', ' or drag it here')
	)
]);