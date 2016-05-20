export default pdfEditor;

let pdfEditor = ({file}) => m('object', {
    data: file.url,
    type: 'application/pdf',
    width: '100%',
    height: '100%'
});

