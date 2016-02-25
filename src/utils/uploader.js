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
		e.stopPropagation(); // so that only the lowest level element gets focused
		element.classList.add(DRAGOVER_CLASS);
	}
	function deactivate() {
		element.classList.remove(DRAGOVER_CLASS);
	}
	function update(e) {
		e.preventDefault();
		e.stopPropagation();
		onchange(options)(e);
	}
}

export let uploadConfig = ctrl => (element, isInitialized) => {
	if (!isInitialized) {
		dragdrop(element, {onchange: ctrl.onchange});
	}
};

export let uploadBox = args => m('form.upload', {method:'post', enctype:'multipart/form-data', config:uploadConfig(args)},[
	m('i.fa.fa-download	.fa-3x.m-b-1'),
	m('input.box__file', {id:'upload', type:'file', name:'files[]', 'data-multiple-caption':'{count} files selected', multiple:true, onchange:onchange(args)}),
	m('label', {for:'upload'},
		m('strong', 'Choose a file'),
		m('span', ' or drag it here')
	)
]);

// call onchange with files
let onchange = args => e => {
	if (typeof args.onchange == 'function') {
		args.onchange((e.dataTransfer || e.target).files);
	}
};