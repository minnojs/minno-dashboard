export default imgEditor;

let imgEditor = {
	view: (ctrl, args) => {
		let file = args.file;
		return m('div.img-editor.centrify', [
			m('img', {src:file.url})
		]);
	}
};