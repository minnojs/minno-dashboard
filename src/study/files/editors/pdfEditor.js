export default pdfEditor;

let pdfEditor = ({file}) => m('object', {
    data: file.url,
    type: 'application/pdf',
    width: '100%',
    height: '100%'
}, [
    m('embed', {src: file.url, type: 'application/pdf'}, 'Your browser does not support PDF')
]);

