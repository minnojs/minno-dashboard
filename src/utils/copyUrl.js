import messages from 'utils/messagesComponent';

export default copyUrl;

let copyUrl = url => () => {
    messages.alert({
        header: 'Copy URL',
        content: m.component(copyComponent, url),
        okText: 'Done'
    });
};

let copyComponent = {
    controller: (url) => {
        let copyFail = m.prop(false);
        let autoCopy = () => copy(url).catch(() => copyFail(true)).then(m.redraw);
        return {autoCopy, copyFail};
    },
    view: ({autoCopy, copyFail}, url) => m('.card-block', [
        m('.form-group', [
            m('label', 'Copy Url by clicking Ctrl + C, or click the copy button.'),
            m('label.input-group',[
                m('.input-group-addon', {onclick: autoCopy}, m('i.fa.fa-fw.fa-copy')),
                m('input.form-control', { config: el => el.select(), value: url })

            ]),
            m('input-group-addon', ['Right-click ', m('a', {href: url}, 'HERE'), ' to launch']),
            m('label', 'You can use this option to play that study in a private or incognito window to bypass cached content.'),
            !copyFail() ? '' : m('small.text-muted', 'Auto copy will not work on your browser, you need to manually copy this url')
        ])
    ])
};

function copy(text){
    return new Promise((resolve, reject) => {
        let input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();

        try {
            document.execCommand('copy');
        } catch(err){
            reject(err);
        }

        input.parentNode.removeChild(input);
    });
}
