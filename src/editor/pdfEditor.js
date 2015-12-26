import fullHeight from './fullHeight';
export default imgEditor;

let imgEditor = {
	view: (ctrl, args) => {
		let file = args.file;
		return m('div.', {config: fullHeight},[
			m('object', {
				data: file.url,
				type: 'application/pdf',
				width: '100%',
				height: '100%'
			})
		]);
	}
};