import messages from 'utils/messagesComponent';

export default copyUrl;

let copyUrl = url => () => {
    console.log('co')
    let input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)){
        messages.alert({
            header: 'Copy URL',
            content: m('.card-block', [
                m('.form-group', [
                    m('label', 'Copy Url by clicking Ctrl + C'),
                    m('input.form-control', {
                        config: el => el.select(),
                        value: url
                    })
                ])
            ])
        });
    }

    try {
        document.execCommand('copy');
    } catch(err){
        messages.alert({
            header: 'Copy URL',
            content: 'Copying the URL has failed.'
        });
    }

    input.parentNode.removeChild(input);
};

