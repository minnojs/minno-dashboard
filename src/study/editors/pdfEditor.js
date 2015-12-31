export default pdfEditor;

let pdfEditor = {
	view: (ctrl, args) => {
		let file = args.file;
		return m('div.', [
			m('object', {
				data: file.url,
				type: 'application/pdf',
				width: '100%',
				height: '100%'
			})
		]);
	}
};