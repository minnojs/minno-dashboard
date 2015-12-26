import fullHeight from './fullHeight';
export default imgEditor;

let imgEditor = {
	view: (ctrl, args) => {
		let file = args.file;
		return m('div.img-editor', {config: fullHeight},[
			m('img', {src:file.url})
		]);
	}
};