export default imgEditor;

let imgEditor = ({file}) => m('div.img-editor.centrify', [
	m('img', {src:file.url})
]);