export default syntax;

let syntax = args => m.component(syntaxComponent, args);

/**
 * Syntax component
 * Takes an argument as follows:
 *
 * {valid: Boolean, data: jshint(script).data()}
 */
var syntaxComponent = {

    /**
     * Analyze script
     * @param  {String} script A script to analyze
     * @return {Object}
     * {
     *      isValid: Boolean,
     *      data: Object, // raw data
     *      errors: Array, // an array of analyzed errors
     *      errorCount: Number, // the number of errors
     *      warningCount: Number // the number of warnings
     * }
     */
    analize: (isValid, data) => {
        var errorCount = 0;
        var warningCount = 0;
        var errors = isValid ? [] : data.errors
            .filter(e => e) // clean null values
            .map(err => {
                var isError = err.code && (err.code[0] === 'E');

                isError ? errorCount++ : warningCount++;

                return {
                    isError: isError,
                    line: err.line,
                    col: err.character,
                    reason: err.reason,
                    evidence: err.evidence
                };
            });
        return {
            isValid: isValid,
            data: data,
            errors : errors,
            errorCount: errorCount,
            warningCount: warningCount
        };
    },

    controller:  args => {
        var file = args.file;
        return syntaxComponent.analize(file.syntaxValid, file.syntaxData);
    },

    view: ctrl => {
        return m('div', [
            ctrl.isValid
                ?
                m('div', {class:'alert alert-success'}, [
                    m('strong','Well done!'),
                    'Your script is squeaky clean'
                ])
                :
                m('div', [
                    m('table.table', [
                        m('tbody', ctrl.errors.map(err => {
                            return m('tr',[
                                m('td.text-muted', `line ${err.line}`),
                                m('td.text-muted', `col ${err.col}`),
                                m('td', {class: err.isError ? 'text-danger' : 'text-info'}, err.reason),
                                m('td',err.evidence)
                            ]);
                        }))
                    ]),

                    m('.row',[
                        m('.col-md-6', [
                            m('div', {class:'alert alert-danger'}, [
                                m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
                                `You have ${ctrl.errorCount} critical errors.`
                            ])
                        ]),
                        m('.col-md-6', [
                            m('div', {class:'alert alert-info'}, [
                                m('strong',{class:'glyphicon glyphicon-warning-sign'}),
                                `You have ${ctrl.warningCount} non standard syntax errors.`
                            ])
                        ])
                    ])

                ])
        ]);
    }
};
