// download support according to modernizer
const downloadSupport = !window.externalHost && 'download' in document.createElement('a');

export default downloadLink;

const downloadLink = (url, name) => {
    console.log(url);
    if (downloadSupport){
        let link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        let win = window.open(url, '_blank');
        win.focus();
    }
};
