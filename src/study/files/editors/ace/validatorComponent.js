import validator from './parser/validator';
export default validate;

let validate = args => m.component(validateComponent, args);

var validateComponent = {
    controller: args => {
        let file = args.file;
        let ctrl = {
            validations : m.prop([]),
            isError: false
        };

        m.startComputation();
        file
            .define()
            .then(()=>{
                return file.require();
            })
            .then(script => {
                ctrl.validations(validator(script, file.url));
                m.endComputation();
            })
            .catch(() => {
                ctrl.isError = true;
                m.endComputation();
            });

        return ctrl;
    },
    view: ctrl => {
        return  m('div', [
            !ctrl.isError ? '' :    m('div', {class:'alert alert-danger'}, [
                m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
                `There was a problem parsing this script. Are you sure that it is a valid PI script? Make sure you fix all syntax errors.`
            ]),

            ctrl.validations().map(validationReport => {
                return [
                    m('h4', validationReport.type),
                    !validationReport.errors.length
                        ?
                        m('div', {class:'alert alert-success'}, [
                            m('strong','Well done!'),
                            'Your script is squeaky clean'
                        ])
                        :
                        validationReport.errors.map(err => {
                            return m('.row',[
                                m('.col-md-4.stringified',
                                    m('div', {class:'pre'}, m.trust(stringify(err.element)))
                                ),
                                m('.col-md-8',[
                                    m('ul', err.messages.map(msg => {
                                        return m('li.list-unstyled', {class: msg.level == 'error' ? 'text-danger' : 'text-info'}, [
                                            m('strong', msg.level),
                                            msg.message
                                        ]);
                                    }))
                                ])
                            ]);
                        })
                ];
            })

        ]);
    }
};


function stringify(value) {
    if (value == null) { // null || undefined
        return '<i class="text-muted">undefined</i>';
    }
    if (value === '') {
        return '<i class="text-muted">an empty string</i>';
    }

    switch (typeof value) {
        case 'string':
            break;
        case 'number':
            value = '' + value;
            break;
        case 'object':
            // display the error message not the full thing...
            if (value instanceof Error){
                value = value.message;
                break;
            }
        /* fall through */
        default:
            // @TODO: implement this: http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
            value = syntaxHighlight(JSON.stringify(value, null, 4));
    }

    return value;
}


function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
