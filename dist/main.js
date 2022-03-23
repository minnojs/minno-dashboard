/**
 * @preserve minno-dashboard v1.0.0
 * @license Apache-2.0 (2022)
 */

(function () {
    'use strict';

    /**
     * Object.assign polyfill from https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
     **/
    if (typeof Object.assign != 'function') {
        Object.assign = function (target, varArgs) { // eslint-disable-line no-unused-vars
            var arguments$1 = arguments;

            if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments$1[index];

                if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function(predicate) {
                if (this == null) {
                    throw new TypeError('Array.prototype.find called on null or undefined');
                }
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }
                var list = Object(this);
                var length = list.length >>> 0;
                var thisArg = arguments[1];
                var value;

                for (var i = 0; i < length; i++) {
                    value = list[i];
                    if (predicate.call(thisArg, value, i, list)) {
                        return value;
                    }
                }
                return undefined;
            }
        });
    }

    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement /*, fromIndex*/) {
            if (this == null) {
                throw new TypeError('Array.prototype.includes called on null or undefined');
            }

            var O = Object(this);
            var len = parseInt(O.length, 10) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1], 10) || 0;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {k = 0;}
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement || (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                    return true;
                }
                k++;
            }
            return false;
        };
    }
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }

            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }

    var checkStatus = function (response) {

        if (response.status >= 200 && response.status < 300) {
            return response;
        }

        var error = new Error(response.statusText);

        error.response = response;

        throw error;
    };

    var checkFullStatus = function (response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        }
        throw response;
    };

    var toJSON = function (response) { return response
        .json()
        .catch( ); };

    // extract info from status error
    var catchJSON = function (err) { return (err.response ? err.response.json() : Promise.reject())
        .catch(function () { return Promise.reject(err); })
        .then(function (json) { return Promise.reject(json); }); };


    function fetchVoid(url, options){
        if ( options === void 0 ) options = {};

        var opts = Object.assign({
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }, options);

        opts.body = JSON.stringify(options.body);
        return fetch(url, opts)
            .then(checkStatus)
            .catch(catchJSON);
    }

    function fetchFullJson(url, options){
        if ( options === void 0 ) options = {};

        var opts = Object.assign({
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }, options);

        opts.body = JSON.stringify(options.body);
        return fetch(url, opts)
            .then(checkFullStatus)
            .then(toJSON)
            .catch();
    }

    function fetchJson(url, options){
        return fetchVoid(url, options)
            .then(toJSON);
    }

    function fetchText(url, options){
        return fetchVoid(url, options)
            .then(function (response) { return response.text(); });
    }

    function fetchUpload(url, options){
        var opts = Object.assign({
            credentials: 'same-origin'
        }, options);

        return fetch(url, opts)
            .then(checkStatus)
            .then(toJSON)
            .catch(catchJSON);
    }

    /************* PRODUCTION ************/
    var urlPrefix = location.pathname.match(/^(?=\/)(.+?\/|$)/)[1]; // first pathname section with slashes

    var baseUrl            = urlPrefix + "dashboard";
    var studyUrl           = urlPrefix + "dashboard/studies";
    var templatesUrl       = urlPrefix + "dashboard/templates";
    var tagsUrl            = urlPrefix + "dashboard/tags";
    var translateUrl       = urlPrefix + "dashboard/translate";
    var poolUrl            = urlPrefix + "StudyData";
    var fileUrl            = urlPrefix + "dashboard";
    var statisticsUrl      = urlPrefix + "PITracking";
    var downloadsUrl       = urlPrefix + "DashboardData";
    var activationUrl      = urlPrefix + "dashboard/activation";
    var collaborationUrl   = urlPrefix + "dashboard/collaboration";
    var downloadsAccessUrl = urlPrefix + "DownloadsAccess";

    /************* DEV ************
    const urlPrefix = '//localhost:3001'; // first pathname section with slashes

    export const baseUrl            = `${urlPrefix}`;
    export const studyUrl           = `${urlPrefix}/studies`;
    export const templatesUrl       = `${urlPrefix}/templates`;
    export const tagsUrl            = `${urlPrefix}/tags`;
    export const translateUrl       = `${urlPrefix}/translate`;
    export const poolUrl            = `${urlPrefix}StudyData`;
    export const fileUrl            = `${urlPrefix}`;
    export const statisticsUrl      = `${urlPrefix}PITracking`;
    export const downloadsUrl       = `${urlPrefix}Data`;
    export const activationUrl      = `${urlPrefix}/activation`;
    export const collaborationUrl   = `${urlPrefix}/collaboration`;
    export const downloadsAccessUrl = `${urlPrefix}DownloadsAccess`;

    /****************************************/

    var getStatistics$1 = function (query) {
        return fetchJson(statisticsUrl, {method:'post', body: parseQuery(query)})
            .then(function (response) {
                return response;
            });

        /**
         * Parses the query as we build it locally and creates an appropriate post for the server
         **/
        function parseQuery(ref){
            var source = ref.source;
            var study = ref.study;
            var sortstudy = ref.sortstudy;
            var sorttask = ref.sorttask;
            var sorttime = ref.sorttime;
            var startDate = ref.startDate;
            var endDate = ref.endDate;
            var firstTask = ref.firstTask;
            var lastTask = ref.lastTask;

            var post = {
                schema: source().match(/^(.*?):/)[1], // before colon
                studyId: study(),
                startDate: parseDate(startDate()),
                endDate: parseDate(endDate()),
                startTask: firstTask(),
                sorttask: sorttask(),
                sortstudy: sortstudy(),
                endTask: lastTask(),
                timeframe: sorttime()==='None' ? 'All' : sorttime(),
                extended:sorttask()
            };
            return post;

            function parseDate(date){
                if (!date) return;
                return ((date.getMonth()+1) + "/" + (date.getDate()) + "/" + (date.getYear() + 1900));
            }
        } 
    };
    /* eslint-enable */

    // import $ from 'jquery';
    var Pikaday = window.Pikaday;
    var dateRangePicker = function (args) { return m.component(pikadayRange, args); };

    /**
     * args = {
     *  startValue: m.prop,
     *  endValue: m.prop,
     *  options: Object // specific daterange plugin options
     * }
     */

    var pikadayRange = {
        view: function(ctrl, args){
            return m('.row.form-group.date-range', {config: pikadayRange.config(args)}, [
                m('.col-sm-6', [
                    m('label','Start Date'),
                    m('label.input-group',[
                        m('.input-group-addon', m('i.fa.fa-fw.fa-calendar')),
                        m('input.form-control')
                    ])
                ]),
                m('.col-sm-6', [
                    m('label','End Date'),
                    m('label.input-group',[
                        m('.input-group-addon', m('i.fa.fa-fw.fa-calendar')),
                        m('input.form-control')
                    ])
                ])
            ]);
        },
        config: function config$1(ref){
            var startDate = ref.startDate;
            var endDate = ref.endDate;

            return function (element, isInitialized, ctx) {
                var startPicker = ctx.startPicker;
                var endPicker = ctx.endPicker;

                if (!isInitialized) setup();

                // external date change
                if (!areDatesEqual(startDate, startPicker) || !areDatesEqual(endDate, endPicker)) update(); 

                function setup(){
                    var startElement = element.children[0].children[1].children[1];
                    startPicker = ctx.startPicker = new Pikaday({
                        onSelect: onSelect(startDate),
                        field: startElement 
                    });
                    startElement.addEventListener('keyup', onKeydown(startPicker));
                    
                    var endElement = element.children[1].children[1].children[1];
                    endPicker = ctx.endPicker = new Pikaday({
                        onSelect: onSelect(endDate),
                        field: endElement
                    });
                    endElement.addEventListener('keyup', onKeydown(endPicker));

                    startPicker.setDate(startDate());
                    endPicker.setDate(endDate());

                    ctx.onunload = function () {
                        startPicker.destroy();
                        endPicker.destroy();
                    };
                }

                function onKeydown(picker){
                    return function (e) {
                        if (e.keyCode === 13 && picker.isVisible()) e.stopPropagation();
                        if (e.keyCode === 27 && picker.isVisible()) {
                            e.stopPropagation();
                            picker.hide();
                        }
                    };
                }

                function onSelect(prop){
                    return function (date) {
                        prop(date); // update start/end

                        update();
                        m.redraw();
                    };
                }

                function update(){
                    startPicker.setDate(startDate(),true);
                    endPicker.setDate(endDate(),true);

                    startPicker.setStartRange(startDate());
                    startPicker.setEndRange(endDate());
                    endPicker.setStartRange(startDate());
                    endPicker.setEndRange(endDate());
                    startPicker.setMaxDate(endDate());
                    endPicker.setMinDate(startDate());
                }

                function areDatesEqual(prop, picker){
                    return prop().getTime() === picker.getDate().getTime();
                }
            };
        }
    };

    var inputWrapper = function (view) { return function (ctrl, args) {
        var isValid = !ctrl.validity || ctrl.validity();
        var groupClass;
        var inputClass;
        var form = args.form;
        var colWidth = args.colWidth || 2;

        if (!form) throw new Error('Inputs require a form');
            
        if (form.showValidation()){
            groupClass = isValid ? 'has-success' : 'has-danger';
            inputClass = isValid ? 'form-control-success' : 'form-control-error';
        }

        return m('.form-group.row', {class: groupClass}, [
            args.isStack
            ? [ 
                m('.col-sm-12', [
                    args.label != null ? m('label', {class: 'strong'}, args.label) : '',
                    view(ctrl, args, {groupClass: groupClass, inputClass: inputClass}),
                    args.help && m('small.text-muted.m-y-0', args.help )
                ])
            ]
            : [
                m((".col-sm-" + colWidth), [
                    m('label.form-control-label', args.label)
                ]),
                m((".col-sm-" + (12 - colWidth)), [
                    view(ctrl, args, {groupClass: groupClass, inputClass: inputClass})
                ]),
                args.help && m('small.text-muted.col-sm-offset-2.col-sm-10.m-y-0', args.help )
            ]
        ]);
    }; };

    var textInputComponent  = {
        controller: function controller(ref) {
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required; if ( required === void 0 ) required = false;

            var validity = function () { return !required || prop().length; };
            form.register(validity);

            return {validity: validity};
        },

        view: inputWrapper(function (ctrl, ref, ref$1) {
            var prop = ref.prop;
            var isArea = ref.isArea; if ( isArea === void 0 ) isArea = false;
            var isFirst = ref.isFirst; if ( isFirst === void 0 ) isFirst = false;
            var placeholder = ref.placeholder; if ( placeholder === void 0 ) placeholder = '';
            ref.help;
            var rows = ref.rows; if ( rows === void 0 ) rows = 3;
            var inputClass = ref$1.inputClass;

            return !isArea
                ? m('input.form-control', {
                    class: inputClass,
                    placeholder: placeholder,
                    value: prop(),
                    oninput: m.withAttr('value', prop),
                    config: function (element, isInit) { return isFirst && isInit && element.focus(); }
                })
                : m('textarea.form-control', {
                    class: inputClass,
                    placeholder: placeholder,
                    oninput: m.withAttr('value', prop),
                    rows: rows,
                    config: function (element, isInit) { return isFirst && isInit && element.focus(); }
                } , [prop()]);
        })
    };

    var  maybeInputComponent = {
        controller: function controller(ref){
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required;
            var dflt = ref.dflt;

            if (!form) throw new Error('Inputs require a form');

            var text = m.prop(typeof prop() == 'boolean' ? dflt || '' : prop());
            var checked = m.prop(!!prop()); 
            var validity = function () { return !required || prop(); };
            form.register(validity);

            return {validity: validity, showValidation: form.showValidation,
                text: function(value){
                    if (arguments.length){
                        text(value);
                        prop(value || true);
                    }
                    return text();
                },
                checked: function(value){
                    if (arguments.length) {
                        checked(value);
                        if (checked() && text()) prop(text());
                        else prop(checked());
                    }
                    return checked();
                }   
            };
        },
        view: inputWrapper(function (ref, args) {
            var text = ref.text;
            var checked = ref.checked;

            var placeholder = args.placeholder || '';
            return m('.input-group', [
                m('span.input-group-addon', [
                    m('input', {
                        type:'checkbox',
                        onclick: m.withAttr('checked', checked),
                        checked: checked()
                    })
                ]),
                m('input.form-control', {
                    placeholder: placeholder,
                    value: text(),
                    oninput: m.withAttr('value', text),
                    disabled: !checked()
                })
            ]);
        })
    };

    var  checkboxInputComponent = {
        controller: function controller(ref){
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required;

            var validity = function () { return !required || prop(); };
            form.register(validity);

            return {validity: validity, showValidation: form.showValidation};
        },
        view: inputWrapper(function (ctrl, ref, ref$1) {
            var prop = ref.prop;
            var description = ref.description; if ( description === void 0 ) description = '';
            var groupClass = ref$1.groupClass;
            var inputClass = ref$1.inputClass;

            return m('.checkbox.checkbox-input-group', {class: groupClass}, [
                m('label.c-input.c-checkbox', {class: inputClass}, [
                    m('input.form-control', {
                        type: 'checkbox',
                        onclick: m.withAttr('checked', prop),
                        checked: prop()
                    }),
                    m('span.c-indicator'),
                    m.trust('&nbsp;'),
                    description
                ])
            ]);
        })
    };

    var selectInputComponent$1 = {
        controller: function controller(ref){
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required;

            if (!form) throw new Error('Inputs require a form');

            var validity = function () { return !required || prop(); };
            form.register(validity);

            return {validity: validity, showValidation: form.showValidation};
        },
        view: inputWrapper(function (ctrl, ref, ref$1) {
            var prop = ref.prop;
            var isFirst = ref.isFirst; if ( isFirst === void 0 ) isFirst = false;
            var values = ref.values; if ( values === void 0 ) values = {};
            var inputClass = ref$1.inputClass;

            var value = prop();
            return m('.input-group', [
                m('select.c-select.form-control', {
                    class: inputClass, 
                    onchange: function (e) { return prop(values[e.target.value]); },
                    config: function (element, isInit) { return isFirst && isInit && element.focus(); }
                }, Object.keys(values).map(function (key) { return m('option', {selected:value === values[key]}, key); }))
            ]);
        })
    };

    /**
     * TransformedProp transformProp(Prop prop, Map input, Map output)
     * 
     * where:
     *  Prop :: m.prop
     *  Map  :: any Function(any)
     *
     *  Creates a Transformed prop that pipes the prop through transformation functions.
     **/
    var transformProp = function (ref) {
        var prop = ref.prop;
        var input = ref.input;
        var output = ref.output;

        var p = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            if (args.length) prop(input(args[0]));
            return output(prop());
        };

        p.toJSON = function () { return output(prop()); };

        return p;
    };

    var arrayInput$1 = function (args) {
        var identity = function (arg) { return arg; };
        var fixedArgs = Object.assign(args);
        fixedArgs.prop = transformProp({
            prop: args.prop,
            output: function (arr) { return arr.map(args.fromArr || identity).join('\n'); },
            input: function (str) { return str === '' ? [] : str.replace(/\n*$/, '').split('\n').map(args.toArr || identity); }
        });

        return m.component(textInputComponent, fixedArgs);
    };

    var selectInputComponent = {
        controller: function controller(ref){
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required;

            if (!form) throw new Error('Inputs require a form');

            var validity = function () { return !required || prop(); };
            form.register(validity);

            return {validity: validity, showValidation: form.showValidation};
        },
        view: inputWrapper(function (ctrl, ref) {
            var prop = ref.prop;
            var values = ref.values; if ( values === void 0 ) values = {};

            var keys = Object.keys(values);
            if (keys.length === 1)
                prop(values[keys[0]]);
            return m('.c-inputs-stacked', keys
                .map(function (key) { return m('label.c-input.c-radio', [
                    m('input', {type:'radio', checked: values[key] === prop(), onchange: prop.bind(null, values[key])}),
                    m('span.c-indicator'),
                    key
                ]); }));
        })
    };

    function formFactory(){
        var validationHash = [];
        return {
            register: function register(fn){
                validationHash.push(fn);
            },
            isValid: function isValid() {
                return validationHash.every(function (fn) { return fn.call(); });
            },
            showValidation: m.prop(false)
        };
    }

    var textInput = function (args) { return m.component(textInputComponent, args); };
    var maybeInput = function (args) { return m.component(maybeInputComponent, args); };
    var checkboxInput = function (args) { return m.component(checkboxInputComponent, args); };
    var selectInput = function (args) { return m.component(selectInputComponent$1, args); };
    var radioInput = function (args) { return m.component(selectInputComponent, args); };
    var arrayInput = arrayInput$1;

    var statisticsForm$1 = function (args) { return m.component(statisticsFormComponent$1, args); };
    var colWidth$1 = 3;
    var SOURCES$1 = {
        'Research pool - Current studies'   : 'Pool:Current',
        'Research pool - All studies'       : 'allPool:Any',
    //    'Research pool - Past studies'      : 'Research:History',
        'All research - Pool and lab'       : 'Research:Any',
        'Demo studies'                      : 'Demo:Any',
        'All studies'                       : 'Both:Any'
    };

    var statisticsFormComponent$1 = {
        controller: function controller(){
            var form = formFactory();

            return {form: form};
        },
        view: function view(ref, ref$1){
            var form = ref.form;
            var query = ref$1.query;

            return m('.col-sm-12', [
                selectInput({label: 'Source', prop: query.source, values: SOURCES$1, form: form, colWidth: colWidth$1}),
                textInput({label:'Study', prop: query.study , form: form, colWidth: colWidth$1}),
                m('div', {style: 'padding: .375rem'},
                    [
                        dateRangePicker({startDate:query.startDate, endDate: query.endDate})
                        ,m('small.text-muted',  'The data for the study statistics by day is saved in 24 hour increments by date in USA eastern time (EST).')
                    ]
                ),

                m('.form-group.row', [
                    m('.col-sm-3', [
                        m('label.form-control-label', 'Show by')
                    ]),
                    m('.col-sm-9.pull-right', [
                        m('.btn-group.btn-group-sm', [
                            button$1(query.sortstudy, 'Study'),
                            button$1(query.sorttask, 'Task'),
                            m('a.btn.btn-secondary.statistics-time-button', {class: query.sorttime() !== 'All' ? 'active' : ''}, [
                                'Time',
                                m('.time-card', [
                                    m('.card', [
                                        m('.card-header', 'Time filter'),
                                        m('.card-block.c-inputs-stacked', [
                                            radioButton$1(query.sorttime, 'None'),
                                            radioButton$1(query.sorttime, 'Days'),
                                            radioButton$1(query.sorttime, 'Weeks'),
                                            radioButton$1(query.sorttime, 'Months'),
                                            radioButton$1(query.sorttime, 'Years')
                                        ])
                                    ])
                                ])
                            ])
                        ]),
                        m('.btn-group.btn-group-sm.pull-right', [
                            button$1(query.showEmpty, 'Hide Empty', 'Hide Rows with Zero Started Sessions'),
                            button$1(query.sortgroup, 'Show Data Group')

                        ])
                    ])
                ]),
                m('.form-group.row', [
                    m('.col-sm-3', [
                        m('label.form-control-label', 'Compute completions')
                    ]),
                    m('.col-sm-9', [
                        m('.row', [
                            m('.col-sm-5', [
                                m('input.form-control', {placeholder: 'First task', value: query.firstTask(), onchange: m.withAttr('value', query.firstTask)})
                            ]),
                            m('.col-sm-1', [
                                m('.form-control-static', 'to')
                            ]),
                            m('.col-sm-5', [
                                m('input.form-control', {placeholder: 'Last task', value: query.lastTask(), onchange: m.withAttr('value', query.lastTask)})
                            ])
                        ])
                    ])
                ])
            ]);
        
        
        }
    };

    var button$1 = function (prop, text, title) {
        if ( title === void 0 ) title = '';

        return m('a.btn.btn-secondary', {
        class: prop() ? 'active' : '',
        onclick: function () { return prop(!prop()); },
        title: title
    }, text);
    };

    var radioButton$1 = function (prop, text) { return m('label.c-input.c-radio', [
        m('input.form-control[type=radio]', {
            onclick: prop.bind(null, text),
            checked: prop() == text
        }),
        m('span.c-indicator'),
        text
    ]); };

    function sortTable(listProp, sortByProp) {
        return function(e) {
            var prop = e.target.getAttribute('data-sort-by');
            var list = listProp();
            if (prop) {
                if (typeof sortByProp == 'function') sortByProp(prop); // record property so that we can change style accordingly
                var first = list[0];
                list.sort(function(a, b) {
                    return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0;
                });
                if (first === list[0]) list.reverse();
            }
        };
    }

    function formatDate(date){
        var pad = function (num) { return num < 10 ? '0' + num : num; };
        return ((pad(date.getMonth() + 1)) + "\\" + (pad(date.getDate())) + "\\" + (date.getFullYear()));
    }

    var statisticsTable$1 = function (args) { return m.component(statisticsTableComponent$1, args); };

    var statisticsTableComponent$1 = {
        controller: function controller(){
            return {sortBy: m.prop()};
        },
        view: function view(ref, ref$1){
            var sortBy = ref.sortBy;
            var tableContent = ref$1.tableContent;
            var query = ref$1.query;

            if (query.error())
                return m('.alert.alert-warning', m('strong', 'Error: '), query.error());
            var content = tableContent();
            if (!content) return m('div');
            if (!content.data) return m('.col-sm-12', [
                m('.alert.alert-info', 'There was no data found for this request')
            ]);

            var list = m.prop(content.data);
            return m('.col-sm-12',[
                m('table.table.table-sm', {onclick: sortTable(list, sortBy)}, [
                    m('thead', [
                        m('tr.table-default', [
                            th_option(sortBy, 'studyName', 'Study Name'),
                            !query.sorttask_sent() ? '' : th_option(sortBy, 'taskName', 'Task Name'),
                            query.sorttime_sent()==='All' ? '' : th_option(sortBy, 'date', 'Date'),
                            th_option(sortBy, 'starts', 'Starts'),
                            th_option(sortBy, 'completes', 'Completes'),
                            th_option(sortBy, 'completion_rate', 'Completion Rate %'),
                            !query.sortgroup() ? '' : th_option(sortBy, 'schema', 'Schema')
                        ])
                    ]),
                    m('tbody', [
                        list().map(function (row) { return query.showEmpty() && row.starts===0
                        ?
                        ''
                        :
                        m('tr.table-default', [
                            m('td', row.studyName),
                            !query.sorttask_sent() ? '' : m('td', row.taskName),
                            query.sorttime_sent()==='All' ? '' : m('td', formatDate(new Date(row.date))),
                            m('td', row.starts),
                            m('td', row.completes),
                            m('td', row.completion_rate = row.starts===0 ? 0 : (row.completes/row.starts).toFixed(2)),
                            !query.sortgroup() ? '' : m('td', row.schema)
                        ]); }
                        )
                    ])
                ])
            ]);
        }
    };

    var th_option = function (sortBy, sortByTxt, text) { return m('th', {
        'data-sort-by':sortByTxt, class: sortBy() === sortByTxt ? 'active' : ''
    }, text); };

    var statisticsInstructions$1 = function () { return m('.text-muted', [
        m('p', 'Choose whether you want participation data from demo studies, research pool, all research studies (including lab studies), or all studies (demo and research).'),
        m('p', 'Enter the study id or any part of the study id (the study name that that appears in an .expt file). Note that the study id search feature is case-sensitive. If you leave this box blank you will get data from all studies.'),
        m('p', 'You can also use the Task box to enter a task name or part of a task name (e.g., realstart) if you only want participation data from certain tasks.'),
        m('p', 'You can also choose how you want the data displayed, using the "Show by" options. If you click "Study", you will see data from each study that meets your search criteria. If you also check "Task" you will see data from any study that meets your search criteria separated by task.  The "Data Group" option will allow you to see whether a given study is coming from the demo or research site.  '),
        m('p', 'You can define how completion rate is calculated by entering text to "First task" and "Last task". Only sessions that visited those tasks would be used for the calculation.'),
        m('p', 'When you choose to show the results by date, you will see all the studies that have at least one session in the requested date range, separated by day, week, month or year. This will also show dates with zero sessions. If you want to hide rows with zero sessions, select the "Hide empty" option.')
    ]); };

    var statisticsComponent$1 = {
        controller: function controller(){
            var displayHelp = m.prop(false);
            var tableContent = m.prop('');

            var loading = m.prop(false);
            var query = {
                source: m.prop('Pool:Current'),
                startDate: m.prop(firstDayInPreviousMonth(new Date())),
                endDate: m.prop(new Date()),
                study: m.prop(''),
                task: m.prop(''),
                studyType: m.prop('Both'),
                studydb: m.prop('Any'),
                sortstudy: m.prop(true),
                sorttask: m.prop(false),
                sorttask_sent: m.prop(false),
                sortgroup: m.prop(false),
                sorttime: m.prop('None'),
                sorttime_sent: m.prop('None'),
                showEmpty: m.prop(false),
                firstTask: m.prop(''),
                lastTask: m.prop(''),
                error: m.prop(''),
                rows:m.prop([])
            };

            return {query: query, submit: submit, displayHelp: displayHelp, tableContent: tableContent,loading: loading};

            function submit(){
                loading(true);
                getStatistics$1(query)
                    .then(tableContent)
                    .catch(function (response) {
                        query.error(response.message);
                    })
                    .then(loading.bind(null, false))
                    .then(query.sorttask_sent(query.sorttask()))
                    .then(query.sorttime_sent(query.sorttime()))
                    .then(m.redraw);
            }

            function firstDayInPreviousMonth(yourDate) {
                return new Date(yourDate.getFullYear(), yourDate.getMonth() - 1, 1);
            }
        },
        view: function (ref) {
            var query = ref.query;
            var tableContent = ref.tableContent;
            var submit = ref.submit;
            var displayHelp = ref.displayHelp;
            var loading = ref.loading;

            return m('.container.statistics', [
            m('h3', 'Statistics'),
            m('.row', [
                statisticsForm$1({query: query})
            ]),
            m('.row', [
                m('.col-sm-12',[
                    m('button.btn.btn-secondary.btn-sm', {onclick: function (){ return displayHelp(!displayHelp()); }}, ['Toggle help ', m('i.fa.fa-question-circle')]),
                    m('a.btn.btn-primary.pull-right', {onclick:submit}, 'Submit'),
                    !tableContent()  ? '' : m('a.btn.btn-secondary.pull-right.m-r-1', {config:downloadFile$2(query.study() ? ((query.study()) + ".csv") : 'stats.csv', tableContent(), query)}, 'Download CSV')
                ])
            ]),
            !displayHelp() ? '' : m('.row', [
                m('.col-sm-12.p-a-2', statisticsInstructions$1())
            ]),
            m('.row.m-t-1', [
                loading()
                    ? m('.loader')
                    : statisticsTable$1({tableContent: tableContent, query: query})
            ])
        ]);
    }
    };

    var downloadFile$2 = function (filename, text, query) { return function (element) {
        var json = text.data;
        json = !query.showEmpty() ? json : json.filter(function (row) { return row.starts !== 0; });

        var fields = ['studyName', !query.sorttask_sent() ? '' : 'taskName', query.sorttime_sent()==='All' ? '' : 'date', 'starts', 'completes', !query.sortgroup() ? '' : 'schema'].filter(function (n) { return n; });

        var replacer = function(key, value) { return value === null ? '' : value;};
        var csv = json.map(function(row){
            return fields.map(function(fieldName){
                return JSON.stringify(row[fieldName], replacer);
            }).join(',');
        });
        csv.unshift(fields.join(',')); // add header column


        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv.join('\r\n') ));
        element.setAttribute('download', filename);
    }; };

    var getStatistics = function (query) {
        return fetchText(statisticsUrl, {method:'post', body: parseQuery(query)})
            .then(function (response) {
                var csv = response ? CSVToArray(response) : [[]];
                return {
                    study: query.study(),
                    file: response,
                    headers: csv.shift(),
                    data: csv,
                    query: Object.assign(query) // clone the query so that we can get back to it in the future
                };
            });

        /**
         * Parses the query as we build it locally and creates an appropriate post for the server
         **/
        function parseQuery(ref){
            var source = ref.source;
            var study = ref.study;
            var task = ref.task;
            var sortstudy = ref.sortstudy;
            var sorttask = ref.sorttask;
            var sortgroup = ref.sortgroup;
            var sorttime = ref.sorttime;
            var showEmpty = ref.showEmpty;
            var startDate = ref.startDate;
            var endDate = ref.endDate;
            var firstTask = ref.firstTask;
            var lastTask = ref.lastTask;

            var baseUrl = (location.origin) + "/implicit";
            var post = {
                db: source().match(/^(.*?):/)[1], // before colon
                current: source().match(/:(.*?)$/)[1], // after colon
                testDB:'newwarehouse',
                study: study(),
                task: task(),
                since: parseDate(startDate()),
                until: parseDate(endDate()),
                refresh: 'no',
                startTask: firstTask(),
                endTask: lastTask(),
                filter:'',
                studyc:sortstudy(),
                taskc:sorttask(),
                datac:sortgroup(),
                timec:sorttime() !== 'None',
                dayc:sorttime() === 'Days',
                weekc:sorttime() === 'Weeks',
                monthc:sorttime() === 'Months',
                yearc:sorttime() === 'Years',
                method:'3',
                cpath:'',
                hpath:'',
                tasksM:'3',
                threads:'yes',
                threadsNum:'1',
                zero: showEmpty(),
                curl:(baseUrl + "/research/library/randomStudiesConfig/RandomStudiesConfig.xml"),
                hurl:(baseUrl + "/research/library/randomStudiesConfig/HistoryRand.xml"),
                baseURL:baseUrl
            };
            return post;

            function parseDate(date){
                if (!date) return;
                return ((date.getMonth()+1) + "/" + (date.getDate()) + "/" + (date.getYear() + 1900));
            }
        } 
    };


    /* eslint-disable */

    // ref: http://stackoverflow.com/a/1293163/2343
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }
    /* eslint-enable */

    var statisticsForm = function (args) { return m.component(statisticsFormComponent, args); };
    var colWidth = 3;
    var SOURCES = {
        'Research pool - Current studies'   : 'Research:Current',
    //    'Research pool - Past studies'      : 'Research:History',
        'All research - Pool and lab'       : 'Research:Any',
        'Demo studies'                      : 'Demo:Any',
        'All studies'                       : 'Both:Any'
    };

    var statisticsFormComponent = {
        controller: function controller(){
            var form = formFactory();

            return {form: form};
        },
        view: function view(ref, ref$1){
            var form = ref.form;
            var query = ref$1.query;

            return m('.col-sm-12', [
                selectInput({label: 'Source', prop: query.source, values: SOURCES, form: form, colWidth: colWidth}),
                textInput({label:'Study', prop: query.study , form: form, colWidth: colWidth}),
                textInput({label:'Task', prop: query.task , form: form, colWidth: colWidth}),
                m('div', {style: 'padding: .375rem .75rem'}, dateRangePicker({startDate:query.startDate, endDate: query.endDate})),
                m('.form-group.row', [
                    m('.col-sm-3', [
                        m('label.form-control-label', 'Show by')
                    ]),
                    m('.col-sm-9.pull-right', [
                        m('.btn-group.btn-group-sm', [
                            button(query.sortstudy, 'Study'),
                            button(query.sorttask, 'Task'),
                            m('a.btn.btn-secondary.statistics-time-button', {class: query.sorttime() !== 'None' ? 'active' : ''}, [
                                'Time',
                                m('.time-card', [
                                    m('.card', [
                                        m('.card-header', 'Time filter'),
                                        m('.card-block.c-inputs-stacked', [
                                            radioButton(query.sorttime, 'None'),
                                            radioButton(query.sorttime, 'Days'),
                                            radioButton(query.sorttime, 'Weeks'),
                                            radioButton(query.sorttime, 'Months'),
                                            radioButton(query.sorttime, 'Years')
                                        ])
                                    ])
                                ])
                            ]),
                            button(query.sortgroup, 'Data Group')
                        ]),
                        m('.btn-group.btn-group-sm.pull-right', [
                            button(query.showEmpty, 'Hide empty', 'Hide Rows with Zero Started Sessions')
                        ])
                    ])
                ]),
                m('.form-group.row', [
                    m('.col-sm-3', [
                        m('label.form-control-label', 'Compute completions')
                    ]),
                    m('.col-sm-9', [
                        m('.row', [
                            m('.col-sm-5', [
                                m('input.form-control', {placeholder: 'First task', value: query.firstTask(), onchange: m.withAttr('value', query.firstTask)})
                            ]),
                            m('.col-sm-1', [
                                m('.form-control-static', 'to')
                            ]),
                            m('.col-sm-5', [
                                m('input.form-control', {placeholder: 'Last task', value: query.lastTask(), onchange: m.withAttr('value', query.lastTask)})
                            ])
                        ])
                    ])
                ])
            ]);
        
        
        }
    };

    var button = function (prop, text, title) {
        if ( title === void 0 ) title = '';

        return m('a.btn.btn-secondary', {
        class: prop() ? 'active' : '',
        onclick: function () { return prop(!prop()); },
        title: title
    }, text);
    };

    var radioButton = function (prop, text) { return m('label.c-input.c-radio', [
        m('input.form-control[type=radio]', {
            onclick: prop.bind(null, text),
            checked: prop() == text
        }),
        m('span.c-indicator'),
        text
    ]); };

    var statisticsTable = function (args) { return m.component(statisticsTableComponent, args); };

    var statisticsTableComponent = {
        controller: function controller(){
            return {sortBy: m.prop()};
        },
        view: function view(ref, ref$1){
            var sortBy = ref.sortBy;
            var tableContent = ref$1.tableContent;

            var content = tableContent();
            if (!content) return m('div'); 
            if (!content.file) return m('.col-sm-12', [
                m('.alert.alert-info', 'There was no data found for this request')            
            ]);

            var list = m.prop(content.data);
            
            return m('.col-sm-12', [
                m('table.table.table-sm', {onclick: sortTable(list, sortBy)}, [
                    m('thead', [
                        m('tr.table-default', tableContent().headers.map(function (header,index) { return m('th',{'data-sort-by':index, class: sortBy() === index ? 'active' : ''}, header); }))
                    ]),
                    m('tbody', tableContent().data.map(function (row) { return m('tr', !row.length ? '' : row.map(function (column) { return m('td', column); })); }))
                ])
            ]);
        }
    };

    var statisticsInstructions = function () { return m('.text-muted', [
        m('p', 'Choose whether you want participation data from demo studies, research pool, all research studies (including lab studies), or all studies (demo and research).'),
        m('p', 'Enter the study id or any part of the study id (the study name that that appears in an .expt file). Note that the study id search feature is case-sensitive. If you leave this box blank you will get data from all studies.'),
        m('p', 'You can also use the Task box to enter a task name or part of a task name (e.g., realstart) if you only want participation data from certain tasks.'),
        m('p', 'You can also choose how you want the data displayed, using the "Show by" options. If you click "Study", you will see data from each study that meets your search criteria. If you also check "Task" you will see data from any study that meets your search criteria separated by task.  The "Data Group" option will allow you to see whether a given study is coming from the demo or research site.  '),
        m('p', 'You can define how completion rate is calculated by entering text to "First task" and "Last task". Only sessions that visited those tasks would be used for the calculation.'),
        m('p', 'When you choose to show the results by date, you will see all the studies that have at least one session in the requested date range, separated by day, week, month or year. This will also show dates with zero sessions. If you want to hide rows with zero sessions, select the "Hide empty" option.')
    ]); };

    var statisticsComponent = {
        controller: function controller(){
            var displayHelp = m.prop(false);
            var tableContent = m.prop();
            var loading = m.prop(false);
            var query = {
                source: m.prop('Research:Current'),
                startDate: m.prop(firstDayInPreviousMonth(new Date())),
                endDate: m.prop(new Date()),
                study: m.prop(''),
                task: m.prop(''),
                studyType: m.prop('Both'),
                studydb: m.prop('Any'),
                sortstudy: m.prop(true),
                sorttask: m.prop(false),
                sortgroup: m.prop(false),
                sorttime: m.prop('None'),
                showEmpty: m.prop(false),
                firstTask: m.prop(''),
                lastTask: m.prop('')
            };

            return {query: query, submit: submit, displayHelp: displayHelp, tableContent: tableContent,loading: loading};

            function submit(){
                loading(true);
                getStatistics(query)
                    .then(tableContent)
                    .then(loading.bind(null, false))
                    .then(m.redraw);
            }

            function firstDayInPreviousMonth(yourDate) {
                return new Date(yourDate.getFullYear(), yourDate.getMonth() - 1, 1);
            }
        },
        view: function (ref) {
            var query = ref.query;
            var tableContent = ref.tableContent;
            var submit = ref.submit;
            var displayHelp = ref.displayHelp;
            var loading = ref.loading;

            return m('.container.statistics', [
            m('h3', 'Statistics'),
            m('.row', [
                statisticsForm({query: query})
            ]),
            m('.row', [
                m('.col-sm-12',[
                    m('button.btn.btn-secondary.btn-sm', {onclick: function (){ return displayHelp(!displayHelp()); }}, ['Toggle help ', m('i.fa.fa-question-circle')]),
                    m('a.btn.btn-primary.pull-right', {onclick:submit}, 'Submit'),
                    !tableContent() || !tableContent().file ? '' : m('a.btn.btn-secondary.pull-right.m-r-1', {config:downloadFile$1(((tableContent().study) + ".csv"), tableContent().file)}, 'Download CSV')
                ])
            ]),
            !displayHelp() ? '' : m('.row', [
                m('.col-sm-12.p-a-2', statisticsInstructions())
            ]),
            m('.row.m-t-1', [
                loading()
                    ? m('.loader')
                    : statisticsTable({tableContent: tableContent})
            ])
        ]);
    }
    };

    var downloadFile$1 = function (filename, text) { return function (element) {
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
    }; };

    var STATUS_RUNNING$1 = 'R';
    var STATUS_PAUSED = 'P';
    var STATUS_STOP = 'S';

    function createStudy(study){
        var body = Object.assign({
            action:'insertRulesTable',
            creationDate: new Date(),
            studyStatus: STATUS_RUNNING$1
        }, study);

        return fetchJson(poolUrl, {method: 'post', body: body})
            .then(interceptErrors$2);
    }

    function updateStudy(study){
        var body = Object.assign({
            action:'updateRulesTable'
        }, study);

        return  fetchJson(poolUrl, {method: 'post',body:body})
            .then(interceptErrors$2);
    }

    function updateStatus(study, status){
        var body = Object.assign({
            action:'updateStudyStatus'
        }, study,{studyStatus: status});

        return  fetchJson(poolUrl, {method: 'post',body:body})
            .then(interceptErrors$2);
    }

    function getAllPoolStudies(){
        return fetchJson(poolUrl, {method:'post', body: {action:'getAllPoolStudies'}})
            .then(interceptErrors$2);
    }

    function getLast100PoolUpdates(){
        return fetchJson(poolUrl, {method:'post', body: {action:'getLast100PoolUpdates'}})
            .then(interceptErrors$2);
    }

    function getStudyId(study){
        var body = Object.assign({
            action:'getStudyId'
        }, study);

        return  fetchJson(poolUrl, {method: 'post',body:body});
    }

    function resetStudy(study){
        return fetchJson(poolUrl, {method:'post', body: Object.assign({action:'resetCompletions'}, study)})
            .then(interceptErrors$2);
    }

    function interceptErrors$2(response){
        if (!response.error){
            return response;
        }

        var errors = {
            1: 'This ID already exists.',
            2: 'The study could not be found.',
            3: 'The rule file could not be found.',
            4: 'The rules file does not fit the "research" schema.'
        };

        return Promise.reject({message: errors[response.error]});
    }

    var noop$1 = function (){};

    var messages = {
        vm: {isOpen: false},

        open: function (type, opts) {
            if ( opts === void 0 ) opts={};

            var promise = new Promise(function (resolve, reject) {
                messages.vm = {resolve: resolve,reject: reject,type: type, opts: opts, isOpen:true};
            });
            m.redraw();

            return promise;
        },

        close: function (response) {
            var vm = messages.vm;
            vm.isOpen = false;
            if (typeof vm.resolve === 'function') vm.resolve(response);
            m.redraw();
        },

        custom: function (opts){ return messages.open('custom', opts); },
        alert: function (opts) { return messages.open('alert', opts); },
        confirm: function (opts) { return messages.open('confirm', opts); },
        prompt: function (opts) { return messages.open('prompt', opts); },

        view: function () {
            var vm = messages.vm;
            var close = messages.close.bind(null, null);
            var stopPropagation = function (e) { return e.stopPropagation(); };
            return m('#messages.backdrop', [
                !vm || !vm.isOpen
                    ? ''
                    :[
                        m('.overlay', {config:messages.config(vm.opts)}),
                        m('.backdrop-content', {onclick:close}, [
                            m('.card', {class: vm.opts.wide ? 'col-sm-8' : 'col-sm-5', config:maxHeight}, [
                                m('.card-block', {onclick: stopPropagation}, [
                                    messages.views[vm.type](vm.opts)
                                ])
                            ])
                        ])
                    ]
            ]);

        },

        config: function (opts) {
            return function (element, isInitialized, context) {
                if (!isInitialized) {
                    var handleKey = function(e) {
                        if (e.keyCode == 27) {
                            messages.close(null);
                        }
                        if (e.keyCode == 13 && !opts.preventEnterSubmits) {
                            messages.close(true);
                        }
                    };

                    document.body.addEventListener('keyup', handleKey);

                    context.onunload = function() {
                        document.body.removeEventListener('keyup', handleKey);
                    };
                }
            };
        },

        views: {
            custom: function (opts) {
                if ( opts === void 0 ) opts={};

                return opts.content;
    },

            alert: function (opts) {
                if ( opts === void 0 ) opts={};

                var close = function (response) { return messages.close.bind(null, response); };
                return [
                    m('h4', opts.header),
                    m('p.card-text', opts.content),
                    m('.text-xs-right.btn-toolbar',[
                        m('button.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
                    ])
                ];
            },

            confirm: function (opts) {
                if ( opts === void 0 ) opts={};

                var close = function (response) { return messages.close.bind(null, response); };
                return [
                    m('h4', opts.header),
                    m('p.card-text', opts.content),
                    m('.text-xs-right.btn-toolbar',[
                        m('button.btn.btn-secondary.btn-sm', {onclick:close(null)}, opts.cancelText || 'Cancel'),
                        m('button.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
                    ])
                ];
            },

            /**
             * Promise prompt(Object opts{header: String, content: String, name: Prop})
             *
             * where:
             *   any Prop(any value)
             */
            prompt: function (ref) {
                if ( ref === void 0 ) ref={prop:noop$1};
                var prop = ref.prop;
                var header = ref.header;
                var content = ref.content;
                var postContent = ref.postContent;
                var okText = ref.okText;
                var cancelText = ref.cancelText;

                var close = function (response) { return messages.close.bind(null, response); };
                return [
                    m('h4', header),
                    m('.card-text', content),
                    m('.card-block', [
                        m('input.form-control', {
                            key: 'prompt',
                            value: prop(),
                            onchange: m.withAttr('value', prop),
                            config: function (element, isInitialized) {
                                if (!isInitialized) setTimeout(function () { return element.focus(); });
                            }
                        })
                    ]),
                    m('.card-text', postContent),
                    m('.text-xs-right.btn-toolbar',[
                        m('button.btn.btn-secondary.btn-sm', {onclick:close(null)}, cancelText || 'Cancel'),
                        m('button.btn.btn-primary.btn-sm', {onclick:close(true)}, okText || 'OK')
                    ])
                ];
            }
        }
    };

    // set message max height, so that content can scroll within it.
    var maxHeight = function (element, isInitialized, ctx) {
        if (!isInitialized){
            onResize();

            window.addEventListener('resize', onResize, true);

            ctx.onunload = function(){
                window.removeEventListener('resize', onResize);
            };

        }

        function onResize(){
            element.style.maxHeight = document.documentElement.clientHeight * 0.9 + 'px';
        }
    };

    var spinner = {
        display: m.prop(false),
        show: function show(response){
            spinner.display(true);
            m.redraw();
            return response;
        },
        hide: function hide(response){
            spinner.display(false);
            m.redraw();
            return response;
        },
        view: function view(){
            return m('.backdrop', {hidden:!spinner.display()}, // spinner.show()
                m('.overlay'),
                m('.backdrop-content.spinner.icon.fa.fa-cog.fa-spin')
            );
        }
    };

    // taken from here:
    // https://github.com/JedWatson/classnames/blob/master/index.js
    var hasOwn = {}.hasOwnProperty;

    function classNames () {
        var arguments$1 = arguments;

        var classes = '';

        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments$1[i];
            if (!arg) continue;

            var argType = typeof arg;

            if (argType === 'string' || argType === 'number') {
                classes += ' ' + arg;
            } else if (Array.isArray(arg)) {
                classes += ' ' + classNames.apply(null, arg);
            } else if (argType === 'object') {
                for (var key in arg) {
                    if (hasOwn.call(arg, key) && arg[key]) {
                        classes += ' ' + key;
                    }
                }
            }
        }

        return classes.substr(1);
    }

    /**
     * Create edit component
     * Promise editMessage({input:Object, output:Prop})
     */
    var editMessage = function (args) { return messages.custom({
        content: m.component(editComponent, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var editComponent = {
        controller: function controller(ref){
            var input = ref.input;
            var output = ref.output;
            var close = ref.close;

            var study = ['rulesUrl', 'targetCompletions', 'autopauseUrl', 'userEmail'].reduce(function (study, prop){
                study[prop] = m.prop(input[prop] || '');
                return study;
            }, {});

            // export study to calling component
            output(study);


            var ctrl = {
                study: study,
                submitAttempt: false,
                validity: function validity(){
                    var isEmail = function (str)  { return /\S+@\S+\.\S+/.test(str); };
                    var isNormalInteger = function (str) { return /^\+?(0|[1-9]\d*)$/.test(str); };

                    var response = {
                        rulesUrl: study.rulesUrl(),
                        targetCompletions: isNormalInteger(study.targetCompletions()),
                        autopauseUrl: study.autopauseUrl(),
                        userEmail: isEmail(study.userEmail())

                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });

                    if (isValid) {
                        study.targetCompletions(+study.targetCompletions());// targetCompletions should be cast as a number
                        close(true);
                    }
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;
        },
        view: function view(ctrl, ref){
            var input = ref.input;

            var study = ctrl.study;
            var validity = ctrl.validity();
            var miniButtonView = function (prop, name, url) { return m('button.btn.btn-secondary.btn-sm', {onclick: prop.bind(null,url)}, name); };
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Study Editor'),
                m('.card-block', [
                    m('.form-group', [
                        m('label', 'Study ID'),
                        m('p',[
                            m('strong.form-control-static', input.studyId)
                        ])

                    ]),
                    m('.form-group', [
                        m('label', 'Study URL'),
                        m('p',[
                            m('strong.form-control-static', input.studyUrl)
                        ])
                    ]),

                    m('.form-group', {class:groupClasses(validity.rulesUrl)}, [
                        m('label', 'Rules File URL'),
                        m('input.form-control', {
                            config: focusConfig$5,
                            placeholder:'Rules file URL',
                            value: study.rulesUrl(),
                            oninput: m.withAttr('value', study.rulesUrl),
                            class:inputClasses(validity.rulesUrl)
                        }),
                        m('p.text-muted.btn-toolbar', [
                            miniButtonView(study.rulesUrl, 'Priority26', '/research/library/rules/Priority26.xml')
                        ]),
                        validationView(validity.rulesUrl, 'This row is required')
                    ]),
                    m('.form-group', {class:groupClasses(validity.autopauseUrl)}, [
                        m('label', 'Auto-pause file URL'),
                        m('input.form-control', {
                            placeholder:'Auto pause file URL',
                            value: study.autopauseUrl(),
                            oninput: m.withAttr('value', study.autopauseUrl),
                            class:inputClasses(validity.autopauseUrl)
                        }),
                        m('p.text-muted.btn-toolbar', [
                            miniButtonView(study.autopauseUrl, 'Default', '/research/library/pausefiles/pausedefault.xml'),
                            miniButtonView(study.autopauseUrl, 'Never', '/research/library/pausefiles/neverpause.xml'),
                            miniButtonView(study.autopauseUrl, 'Low restrictions', '/research/library/pausefiles/pauselowrestrictions.xml')
                        ]),
                        validationView(validity.autopauseUrl, 'This row is required')
                    ]),
                    m('.form-group', {class:groupClasses(validity.targetCompletions)}, [
                        m('label','Target number of sessions'),
                        m('input.form-control', {
                            type:'number',
                            placeholder:'Target Sessions',
                            value: study.targetCompletions(),
                            oninput: m.withAttr('value', study.targetCompletions),
                            onclick: m.withAttr('value', study.targetCompletions),
                            class:inputClasses(validity.targetCompletions)
                        }),
                        validationView(validity.targetCompletions, 'This row is required and has to be an integer above 0')
                    ]),
                    m('.form-group', {class:groupClasses(validity.userEmail)}, [
                        m('label','User Email'),
                        m('input.form-control', {
                            type:'email',
                            placeholder:'Email',
                            value: study.userEmail(),
                            oninput: m.withAttr('value', study.userEmail),
                            class:inputClasses(validity.userEmail)
                        }),
                        validationView(validity.userEmail, 'This row is required and must be a valid Email')
                    ])
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
                ])
            ]);
        }
    };

    var focusConfig$5 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    /**
     * Create edit component
     * Promise editMessage({output:Prop})
     */
    var createMessage$2 = function (args) { return messages.custom({
        content: m.component(createComponent$2, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var createComponent$2 = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var study = output({
                studyUrl: m.prop('')
            });

            var ctrl = {
                study: study,
                submitAttempt: false,
                validity: function validity(){
                    var response = {
                        studyUrl: study.studyUrl()
                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });
                    if (isValid) close(true);
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;
        },
        view: function view(ctrl){
            var study = ctrl.study;
            var validity = ctrl.validity();
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Create Study'),
                m('.card-block', [
                    m('.form-group', {class:groupClasses(validity.studyUrl)}, [
                        m('label', 'Study URL'),
                        m('input.form-control', {
                            config: focusConfig$4,
                            placeholder:'Study URL',
                            value: study.studyUrl(),
                            oninput: m.withAttr('value', study.studyUrl),
                            class:inputClasses(validity.studyUrl)
                        }),
                        validationView(validity.studyUrl, 'This row is required')
                    ])
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'Proceed')
                ])
            ]);
        }
    };

    var focusConfig$4 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    function play$2(study){
        return messages.confirm({
            header: 'Continue Study:',
            content: ("Are you sure you want to continue \"" + (study.studyId) + "\"?")
        })
        .then(function (response) {
            if(response) {
                studyPending(study, true)();
                return updateStatus(study, STATUS_RUNNING$1)
                    .then(function (){ return study.studyStatus = STATUS_RUNNING$1; })
                    .catch(reportError$2('Continue Study'))
                    .then(studyPending(study, false));
            }
        });
    }

    function pause(study){
        return messages.confirm({
            header: 'Pause Study:',
            content: ("Are you sure you want to pause \"" + (study.studyId) + "\"?")
        })
        .then(function (response) {
            if(response) {
                studyPending(study, true)();
                return updateStatus(study, STATUS_PAUSED)
                    .then(function (){ return study.studyStatus = STATUS_PAUSED; })
                    .catch(reportError$2('Pause Study'))
                    .then(studyPending(study, false));
            }
        });
    }

    var remove$2  = function (study, list) {
        return messages.confirm({
            header: 'Remove Study:',
            content: ("Are you sure you want to remove \"" + (study.studyId) + "\" from the pool?")
        })
        .then(function (response) {
            if(response) {
                studyPending(study, true)();
                return updateStatus(study, STATUS_STOP)
                    .then(function () { return list(list().filter(function (el) { return el !== study; })); })
                    .catch(reportError$2('Remove Study'))
                    .then(studyPending(study, false));
            }
        });
    };

    var edit  = function (input) {
        var output = m.prop();
        return editMessage({input: input, output: output})
            .then(function (response) {
                if (response) {
                    studyPending(input, true)();
                    var study = Object.assign({}, input, unPropify$2(output()));
                    return updateStudy(study)
                        .then(function () { return Object.assign(input, study); }) // update study in view
                        .catch(reportError$2('Study Editor'))
                        .then(studyPending(input, false));
                }
            });
    };

    var create$2 = function (list) {
        var output = m.prop();
        return createMessage$2({output: output})
            .then(function (response) {
                if (response) {
                    spinner.show();
                    getStudyId(output())
                        .then(function (response) { return Object.assign(unPropify$2(output()), response); }) // add response data to "newStudy"
                        .then(spinner.hide)
                        .then(editNewStudy);
                }
            });

        function editNewStudy(input){
            var output = m.prop();
            return editMessage({input: input, output: output})
                .then(function (response) {
                    if (response) {
                        var study = Object.assign({
                            startedSessions: 0,
                            completedSessions: 0,
                            creationDate:new Date(),
                            studyStatus: STATUS_RUNNING$1
                        }, input, unPropify$2(output()));
                        return createStudy(study)
                            .then(function () { return list().push(study); })
                            .then(m.redraw)
                            .catch(reportError$2('Create Study'));
                    }
                });
        }
    };

    var reset = function (study) {
        messages.confirm({
            header: 'Restart study',
            content: 'Are you sure you want to restart this study? This action will reset all started and completed sessions.'
        }).then(function (response) {
            if (response) {
                var old = {
                    startedSessions: study.startedSessions,
                    completedSessions: study.completedSessions
                };
                study.startedSessions = study.completedSessions = 0;
                m.redraw();
                return resetStudy(study)
                    .catch(function (response) {
                        Object.assign(study, old);
                        return Promise.reject(response);
                    })
                    .catch(reportError$2('Restart study'));
            }
        });
    };

    var reportError$2 = function (header) { return function (err) { return messages.alert({header: header, content: err.message}); }; };

    var studyPending = function (study, state) { return function () {
        study.$pending = state;
        m.redraw();
    }; };

    var unPropify$2 = function (obj) { return Object.keys(obj).reduce(function (result, key) {
        result[key] = obj[key]();
        return result;
    }, {}); };

    var loginUrl = baseUrl + "/connect";
    var logoutUrl = baseUrl + "/logout";
    var is_logedinUrl = baseUrl + "/is_loggedin";

    var login = function (username, password) { return fetchJson(loginUrl, {
        method: 'post',
        body: {username: username, password: password}
    }); };

    var logout = function () { return fetchVoid(logoutUrl, {method:'post'}).then(getAuth); };

    var getAuth = function () { return fetchJson(is_logedinUrl, {
        method: 'get'
    }); };

    var PRODUCTION_URL$1 = 'https://implicit.harvard.edu/implicit/';
    var TABLE_WIDTH$2 = 8;

    var poolComponent$1 = {
        controller: function () {
            var ctrl = {
                play: play$2, pause: pause, remove: remove$2, edit: edit, reset: reset, create: create$2,
                canCreate: false,
                list: m.prop([]),
                globalSearch: m.prop(''),
                sortBy: m.prop(),
                error: m.prop(''),
                loaded: m.prop()
            };

            getAuth().then(function (response) {ctrl.canCreate = response.role === 'SU';});
            getAllPoolStudies()
                .then(ctrl.list)
                .then(ctrl.loaded)
                .catch(ctrl.error)
                .then(m.redraw);
            return ctrl;
        },
        view: function (ctrl) {
            var list = ctrl.list;
            return m('.pool', [
                m('h2', 'Study pool'),
                ctrl.error()
                    ?
                    m('.alert.alert-warning',
                        m('strong', 'Warning!! '), ctrl.error().message
                    )
                    :
                    m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                        m('thead', [
                            m('tr', [
                                m('th', {colspan:TABLE_WIDTH$2 - 1}, [
                                    m('input.form-control', {placeholder: 'Global Search ...', oninput: m.withAttr('value', ctrl.globalSearch)})
                                ]),
                                m('th', [
                                    m('a.btn.btn-secondary', {href:'/pool/history', config:m.route}, [
                                        m('i.fa.fa-history'), '  History'
                                    ])
                                ])
                            ]),
                            ctrl.canCreate ? m('tr', [
                                m('th.text-xs-center', {colspan:TABLE_WIDTH$2}, [
                                    m('button.btn.btn-secondary', {onclick:ctrl.create.bind(null, list)}, [
                                        m('i.fa.fa-plus'), '  Add new study'
                                    ])
                                ])
                            ]) : '',
                            m('tr', [
                                m('th', thConfig$6('studyId',ctrl.sortBy), 'ID'),
                                m('th', thConfig$6('studyUrl',ctrl.sortBy), 'Study'),
                                m('th', thConfig$6('rulesUrl',ctrl.sortBy), 'Rules'),
                                m('th', thConfig$6('autopauseUrl',ctrl.sortBy), 'Autopause'),
                                m('th', thConfig$6('completedSessions',ctrl.sortBy), 'Completion'),
                                m('th', thConfig$6('creationDate',ctrl.sortBy), 'Date'),
                                m('th','Status'),
                                m('th','Actions')
                            ])
                        ]),
                        m('tbody', [
                            list().length === 0
                                ?
                                m('tr.table-info',
                                    m('td.text-xs-center', {colspan: TABLE_WIDTH$2},
                                        m('strong', 'Heads up! '), 
                                        ctrl.loaded()
                                            ? 'None of your studies is in the Research Pool right now'
                                            : 'Loading...'
                                    )
                                )
                                :
                                list().filter(studyFilter$2(ctrl)).map(function (study) { return m('tr', [
                                    // ### ID
                                    m('td', study.studyId),

                                    // ### Study url
                                    m('td', [
                                        m('a', {href:PRODUCTION_URL$1 + study.studyUrl, target: '_blank'}, 'Study')
                                    ]),

                                    // ### Rules url
                                    m('td', [
                                        m('a', {href:PRODUCTION_URL$1 + study.rulesUrl, target: '_blank'}, 'Rules')
                                    ]),

                                    // ### Autopause url
                                    m('td', [
                                        m('a', {href:PRODUCTION_URL$1 + study.autopauseUrl, target: '_blank'}, 'Autopause')
                                    ]),

                                    // ### Completions
                                    m('td', [
                                        study.startedSessions ? (100 * study.completedSessions / study.startedSessions).toFixed(1) + '% ' : 'n/a ',
                                        m('i.fa.fa-info-circle'),
                                        m('.info-box', [
                                            m('.card', [
                                                m('.card-header', 'Completion Details'),
                                                m('ul.list-group.list-group-flush',[
                                                    m('li.list-group-item', [
                                                        m('strong', 'Target Completions: '), study.targetCompletions
                                                    ]),
                                                    m('li.list-group-item', [
                                                        m('strong', 'Started Sessions: '), study.startedSessions
                                                    ]),
                                                    m('li.list-group-item', [
                                                        m('strong', 'Completed Sessions: '), study.completedSessions
                                                    ])
                                                ])
                                            ])
                                        ])
                                    ]),

                                    // ### Date
                                    m('td', formatDate(new Date(study.creationDate))),

                                    // ### Status
                                    m('td', [
                                        {
                                            R: m('span.label.label-success', 'Running'),
                                            P: m('span.label.label-info', 'Paused'),
                                            S: m('span.label.label-danger', 'Stopped')
                                        }[study.studyStatus]
                                    ]),

                                    // ### Actions
                                    m('td', [
                                        study.$pending
                                            ?
                                            m('.l', 'Loading...')
                                            :
                                            m('.btn-group', [
                                                study.canUnpause && study.studyStatus === STATUS_PAUSED ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.play.bind(null, study)}, [
                                                    m('i.fa.fa-play')
                                                ]) : '',
                                                study.canPause && study.studyStatus === STATUS_RUNNING$1 ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.pause.bind(null, study)}, [
                                                    m('i.fa.fa-pause')
                                                ]) : '',
                                                study.canReset ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.edit.bind(null, study)}, [
                                                    m('i.fa.fa-edit')
                                                ]): '',
                                                study.canReset ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.reset.bind(null, study)}, [
                                                    m('i.fa.fa-refresh')
                                                ]) : '',
                                                study.canStop ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.remove.bind(null, study, list)}, [
                                                    m('i.fa.fa-close')
                                                ]) : ''
                                            ])
                                    ])
                                ]); })
                        ])
                    ])
            ]);
        }
    };

    // @TODO: bad idiom! should change things within the object, not the object itself.
    var thConfig$6 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    function studyFilter$2(ctrl){
        return function (study) { return includes(study.studyId, ctrl.globalSearch()) ||
            includes(study.studyUrl, ctrl.globalSearch()) ||
            includes(study.rulesUrl, ctrl.globalSearch()); };

        function includes(val, search){
            return typeof val === 'string' && val.includes(search);
        }
    }

    var PRODUCTION_URL = 'https://implicit.harvard.edu/implicit/';
    var poolComponent = {
        controller: function () {
            var ctrl = {
                list: m.prop([]),
                globalSearch: m.prop(''),
                startDate: m.prop(new Date(0)),
                endDate: m.prop(new Date()),
                sortBy: m.prop()
            };

            getLast100PoolUpdates()
                .then(ctrl.list)
                .then(m.redraw);

            return ctrl;
        },
        view: function (ctrl) {
            var list = ctrl.list;
            return m('.pool', [
                m('h2', 'Pool history'),
                m('.row', {colspan:8}, [
                    m('.col-sm-3',[
                        m('label', 'Search'),
                        m('input.form-control', {placeholder: 'Search ...', oninput: m.withAttr('value', ctrl.globalSearch)})
                    ]),
                    m('.col-sm-4',[
                        dateRangePicker(ctrl)
                    ]),
                    m('.col-sm-5',[
                        m('label', m.trust('&nbsp')),
                        m('.text-muted.btn-toolbar', [
                            dayButtonView$1(ctrl, 'Last 7 Days', 7),
                            dayButtonView$1(ctrl, 'Last 30 Days', 30),
                            dayButtonView$1(ctrl, 'Last 90 Days', 90),
                            dayButtonView$1(ctrl, 'All time', 3650)
                        ])
                    ])
                ]) ,
                m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                    m('thead', [
                        m('tr', [
                            m('th', thConfig$5('studyId',ctrl.sortBy), 'ID'),
                            m('th', thConfig$5('studyUrl',ctrl.sortBy), 'Study'),
                            m('th', thConfig$5('rulesUrl',ctrl.sortBy), 'Rules'),
                            m('th', thConfig$5('autopauseUrl',ctrl.sortBy), 'Autopause'),     
                            m('th', thConfig$5('creationDate',ctrl.sortBy), 'Creation Date'),
                            m('th', thConfig$5('completedSessions',ctrl.sortBy), 'Completion'),
                            m('th','New Status'),
                            m('th','Old Status'),
                            m('th', thConfig$5('updaterId',ctrl.sortBy), 'Updater')
                        ])
                    ]),
                    m('tbody', [
                        list().filter(studyFilter$1(ctrl)).map(function (study) { return m('tr', [
                            // ### ID
                            m('td', study.studyId),

                            // ### Study url
                            m('td', [
                                m('a', {href:PRODUCTION_URL + study.studyUrl, target: '_blank'}, 'Study')
                            ]),

                            // ### Rules url
                            m('td', [
                                m('a', {href:PRODUCTION_URL + study.rulesUrl, target: '_blank'}, 'Rules')
                            ]),

                            // ### Autopause url
                            m('td', [
                                m('a', {href:PRODUCTION_URL + study.autopauseUrl, target: '_blank'}, 'Autopause')
                            ]),
                            
                        

                            // ### Date
                            m('td', formatDate(new Date(study.creationDate))),
                            
                            // ### Target Completionss
                            m('td', [
                                study.startedSessions ? (100 * study.completedSessions / study.startedSessions).toFixed(1) + '% ' : 'n/a ',
                                m('i.fa.fa-info-circle'),
                                m('.card.info-box', [
                                    m('.card-header', 'Completion Details'),
                                    m('ul.list-group.list-group-flush',[
                                        m('li.list-group-item', [
                                            m('strong', 'Target Completions: '), study.targetCompletions
                                        ]),
                                        m('li.list-group-item', [
                                            m('strong', 'Started Sessions: '), study.startedSessions
                                        ]),
                                        m('li.list-group-item', [
                                            m('strong', 'Completed Sessions: '), study.completedSessions
                                        ])
                                    ])
                                ])
                            ]),

                            // ### New Status
                            m('td', [
                                {
                                    R: m('span.label.label-success', 'Running'),
                                    P: m('span.label.label-info', 'Paused'),
                                    S: m('span.label.label-danger', 'Stopped')
                                }[study.newStatus]
                            ]),
                            // ### Old Status
                            m('td', [
                                {
                                    R: m('span.label.label-success', 'Running'),
                                    P: m('span.label.label-info', 'Paused'),
                                    S: m('span.label.label-danger', 'Stopped')
                                }[study.studyStatus]
                            ]),
                            m('td', study.updaterId)
                        ]); })
                    ])
                ])
            ]);
        }
    };

    // @TODO: bad idiom! should change things within the object, not the object itself.
    var thConfig$5 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    function studyFilter$1(ctrl){
        return function (study) { return (includes(study.studyId, ctrl.globalSearch()) ||    includes(study.updaterId, ctrl.globalSearch()) || includes(study.rulesUrl, ctrl.globalSearch())
                || includes(study.targetCompletions, ctrl.globalSearch()))
            && (new Date(study.creationDate)).getTime() >= ctrl.startDate().getTime()
        && (new Date(study.creationDate)).getTime() <= ctrl.endDate().getTime()+86000000; }; //include the end day selected

        function includes(val, search){
            return typeof val === 'string' && val.includes(search);
        }
    }

    var dayButtonView$1 = function (ctrl, name, days) { return m('button.btn.btn-secondary.btn-sm', {onclick: function () {
        var d = new Date();
        d.setDate(d.getDate() - days);
        ctrl.startDate(d);
        ctrl.endDate(new Date());
    }}, name); };

    var STATUS_RUNNING = 'R';
    var STATUS_COMPLETE = 'C';
    var STATUS_ERROR = 'X';

    var getAllDownloads = function () { return fetchJson(downloadsUrl, {
        method:'post',
        body: {action:'getAllDownloads'}
    }).then(interceptErrors$1); };

    var removeDownload = function (download) { return fetchVoid(downloadsUrl, {
        method:'post',
        body: Object.assign({action:'removeDownload'}, download)
    }).then(interceptErrors$1); };

    var createDownload = function (download) { return fetchVoid(downloadsUrl, {
        method: 'post',
        body: Object.assign({action:'download'}, download)
    }).then(interceptErrors$1); };

    function interceptErrors$1(response){
        if (!response || !response.error){
            return response;
        }

        return Promise.reject({message: response.msg});
    }

    function createMessage$1 (args) { return messages.custom({
        content: m.component(createComponent$1, Object.assign({close:messages.close}, args)),
        wide: true
    }); }

    var createComponent$1 = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var download ={
                studyId: m.prop(''),
                db: m.prop('test'),
                startDate: m.prop(daysAgo(3650)),
                endDate: m.prop(new Date())
            };

            // export study to calling component
            output(download);

            var ctrl = {
                download: download,
                submitAttempt: false,
                validity: function validity(){
                    var response = {
                        studyId: download.studyId()
                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });

                    if (isValid) {
                        download.endDate(endOfDay(download.endDate())); 
                        close(true);
                    }
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;

            function endOfDay(date){
                if (date) return new Date(date.setHours(23,59,59,999));
            }
        },
        view: function view(ctrl){
            var download = ctrl.download;
            var validity = ctrl.validity();
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Request Data'),
                m('.card-block', [
                    m('.row', [
                        m('.col-sm-6', [
                            m('.form-group', {class:groupClasses(validity.studyId)}, [
                                m('label', 'Study ID'),
                                m('input.form-control', {
                                    config: focusConfig$3,
                                    placeholder:'Study Id',
                                    value: download.studyId(),
                                    oninput: m.withAttr('value', download.studyId),
                                    class:inputClasses(validity.studyId)
                                }),
                                validationView(validity.studyId, 'The study ID is required in order to request a download.')
                            ])   
                        ]),
                        m('.col-sm-6', [
                            m('.form-group', [
                                m('label','Database'),
                                m('select.form-control.c-select', {onchange: m.withAttr('value',download.db)}, [
                                    m('option',{value:'test', selected: download.db() === 'test'}, 'Development'),
                                    m('option',{value:'warehouse', selected: download.db() === 'warehouse'}, 'Production')
                                ])
                            ])
                        ])
                    ]),
                    m('.row', [
                        m('.col-sm-12', [
                            m('.form-group', [
                                dateRangePicker(download),
                                m('p.text-muted.btn-toolbar', [
                                    dayButtonView(download, 'Last 7 Days', 7),
                                    dayButtonView(download, 'Last 30 Days', 30),
                                    dayButtonView(download, 'Last 90 Days', 90),
                                    dayButtonView(download, 'All time', 3650)
                                ])
                            ])
                        ])
                    ])
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
                ])
            ]);
        }
    };

    var focusConfig$3 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    // helper functions for the day buttons
    var daysAgo = function (days) {
        var d = new Date();
        d.setDate(d.getDate() - days);
        return d;
    };
    var equalDates = function (date1, date2) { return date1.getDate() === date2.getDate(); };
    var activeDate = function (ref, days) {
        var startDate = ref.startDate;
        var endDate = ref.endDate;

        return equalDates(startDate(), daysAgo(days)) && equalDates(endDate(), new Date());
    };

    var dayButtonView = function (download, name, days) { return m('button.btn.btn-secondary.btn-sm', {
        class: activeDate(download, days)? 'active' : '',
        onclick: function () {
            download.startDate(daysAgo(days));
            download.endDate(new Date());
        }
    }, name); };

    var DURATION = 5000;

    /**
     * Get all downloads
     */

    var recursiveGetAll = debounce(getAll, DURATION);
    function getAll(ref){
        var list = ref.list;
        var cancel = ref.cancel;
        var error = ref.error;
        var loaded = ref.loaded;

        return getAllDownloads()
            .then(list)
            .then(function (response) {
                if (!cancel() && response.some(function (download) { return download.studyStatus === STATUS_RUNNING; })) {
                    recursiveGetAll({list: list, cancel: cancel, error: error, loaded: loaded});
                }
            })
            .catch(error)
            .then(function(){loaded(true);})
            .then(m.redraw);
    }


    // debounce but call at first iteration
    function debounce(func, wait) {
        var first = true;
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (first) {
                func.apply(context, args);
                first = false;
            }
        };
    }


    /**
     * Remove download
     */

    function remove$1(download, list) {
        return messages.confirm({
            header: 'Delete Request:',
            content: [
                'Are you sure you want to delete this request from your queue?',
                m('.text-xs-center',
                    m('small.muted-text','(Don\'t worry, the data will stay on our servers and you can request it again in the future)')
                )
            ]
        })
        .then(function(response){
            if (response) return doRemove(download, list);
        });
    }

    function doRemove(download, list){
        list(list().filter(function (el) { return el !== download; }));
        m.redraw();
        removeDownload(download)
            .catch(function (err) {
                list().push(download);
                return messages.alert({
                    header: 'Delete Request',
                    content: err.message
                });
            });
    }

    /**
     * Create download
     */

    function create$1(list, cancel, loaded){
        var output = m.prop();
        return createMessage$1({output: output})
            .then(function (response) {
                if (response){
                    var download = unPropify$1(output());
                    list().unshift(Object.assign({
                        studyStatus: STATUS_RUNNING,
                        creationDate: new Date()
                    },download));
                    cancel(true);
                    return createDownload(download)
                        .catch(reportError$1('Error creating download'))
                        .then(cancel.bind(null, false))
                        .then(function () {
                            getAll({list: list, cancel: cancel, loaded: loaded});
                        });
                }
            });
    }

    var unPropify$1 = function (obj) { return Object.keys(obj).reduce(function (result, key) {
        result[key] = obj[key]();
        return result;
    }, {}); };

    var reportError$1 = function (header) { return function (err) { return messages.alert({header: header, content: err.message}); }; };

    var TABLE_WIDTH$1 = 7;
    var statusLabelsMap = {}; // defined at the bottom of this file

    var downloadsComponent = {
        controller: function controller(){
            var list = m.prop([]);
            var loaded = m.prop(false);

            var cancelDownload = m.prop(false);

            var ctrl = {
                loaded: loaded,
                list: list,
                cancelDownload: cancelDownload,
                create: create$1,
                remove: remove$1,
                globalSearch: m.prop(''),
                sortBy: m.prop('studyId'),
                onunload: function onunload(){
                    cancelDownload(true);
                },
                error: m.prop('')
            };

            getAll({list:ctrl.list, cancel: cancelDownload, error: ctrl.error, loaded:ctrl.loaded});
            return ctrl;
        },

        view: function view(ctrl) {

            if (!ctrl.loaded())
                return m('.loader');

            var list = ctrl.list;

            if (ctrl.error()) return m('.downloads', [
                m('h3', 'Data Download'),
                m('.alert.alert-warning', [
                    m('strong', 'Warning!! '), ctrl.error().message
                ])
            ]);

            return m('.downloads', [
                m('.row.m-b-1', [
                    m('.col-sm-6', [
                        m('h3', 'Data Download')
                    ]),
                    m('.col-sm-3',[
                        m('button.btn.btn-secondary.pull-right', {onclick:ctrl.create.bind(null, list, ctrl.cancelDownload, ctrl.loaded)}, [
                            m('i.fa.fa-plus'), ' Request Data'
                        ])
                    ]),
                    m('.col-sm-3',[
                        m('input.form-control', {placeholder: 'Search ...', oninput: m.withAttr('value', ctrl.globalSearch)})
                    ])
                ]),

                m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                    m('thead', [
                        m('tr', [
                            m('th', thConfig$4('studyId',ctrl.sortBy), 'ID'),
                            m('th', 'Data file'),
                            m('th', thConfig$4('db',ctrl.sortBy), 'Database'),
                            m('th', thConfig$4('fileSize',ctrl.sortBy), 'File Size'),
                            m('th', thConfig$4('creationDate',ctrl.sortBy), 'Date Added'),
                            m('th','Status'),
                            m('th','Actions')
                        ])
                    ]),
                    m('tbody', [
                        list().length === 0
                            ? m('tr.table-info', [
                                m('td.text-xs-center', {colspan: TABLE_WIDTH$1}, 'There are no downloads running yet')
                            ])
                            : list().filter(studyFilter(ctrl)).map(function (download) { return m('tr', [
                                // ### ID
                                m('td', download.studyId),

                                // ### Study url
                                m('td', download.studyStatus == STATUS_RUNNING
                                    ? m('i.text-muted', 'Loading...')
                                    : download.fileSize
                                        ? m('a', {href:download.studyUrl, download:download.studyId + '.zip', target: '_blank'}, 'Download')
                                        : m('i.text-muted', 'No Data')
                                ),

                                // ### Database
                                m('td', download.db),

                                // ### Filesize
                                m('td', download.fileSize !== 'unknown'
                                    ? download.fileSize
                                    : m('i.text-muted', 'Unknown')
                                ),

                                // ### Date Added
                                m('td', [
                                    formatDate(new Date(download.creationDate)),
                                    '  ',
                                    m('i.fa.fa-info-circle'),
                                    m('.info-box', [
                                        m('.card', [
                                            m('.card-header', 'Creation Details'),
                                            m('ul.list-group.list-group-flush',[
                                                m('li.list-group-item', [
                                                    m('strong', 'Creation Date: '), formatDate(new Date(download.creationDate))
                                                ]),
                                                m('li.list-group-item', [
                                                    m('strong', 'Start Date: '), formatDate(new Date(download.startDate))
                                                ]),
                                                m('li.list-group-item', [
                                                    m('strong', 'End Date: '), formatDate(new Date(download.endDate))
                                                ])
                                            ])
                                        ])
                                    ])
                                ]),

                                // ### Status
                                m('td', [
                                    statusLabelsMap[download.studyStatus]
                                ]),

                                // ### Actions
                                m('td', [
                                    m('.btn-group', [
                                        m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.remove.bind(null, download, list)}, [
                                            m('i.fa.fa-close')
                                        ])
                                    ])
                                ])
                            ]); })
                    ])
                ])
            ]);
        }
    };

    // @TODO: bad idiom! should change things within the object, not the object itself.
    var thConfig$4 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    function studyFilter(ctrl){
        var search = ctrl.globalSearch();
        return function (study) { return includes(study.studyId, search) ||
            includes(study.studyUrl, search); };

        function includes(val, search){
            return typeof val === 'string' && val.includes(search);
        }
    }

    statusLabelsMap[STATUS_COMPLETE] = m('span.label.label-success', 'Complete');
    statusLabelsMap[STATUS_RUNNING] = m('span.label.label-info', 'Running');
    statusLabelsMap[STATUS_ERROR] = m('span.label.label-danger', 'Error');

    var STATUS_APPROVED = true;
    var STATUS_SUBMITTED = false;

    function createDataAccessRequest(dataAccessRequest){
        var body = Object.assign({
            action:'createDataAccessRequest'
        }, dataAccessRequest);

        return fetchJson(downloadsAccessUrl, {method: 'post', body: body})
            .then(interceptErrors);
    }

    function deleteDataAccessRequest(dataAccessRequest){
        var body = Object.assign({
            action:'deleteDataAccessRequest'
        }, dataAccessRequest);

        return  fetchJson(downloadsAccessUrl, {method: 'post',body:body})
            .then(interceptErrors);
    }

    function updateApproved(dataAccessRequest, approved){
        var body = Object.assign({
            action:'updateApproved'
        }, dataAccessRequest,{approved: approved});

        return  fetchJson(downloadsAccessUrl, {method: 'post',body:body})
            .then(interceptErrors);
    }

    function getAllOpenRequests(){
        return fetchJson(downloadsAccessUrl, {method:'post', body: {action:'getAllOpenRequests'}})
            .then(interceptErrors);
    }



    function interceptErrors(response){
        if (!response.error){
            return response;
        }

        var errors = {
            1: 'This ID already exists.',
            2: 'The study could not be found.',
            3: 'The rule file could not be found.',
            4: 'The rules file does not fit the "research" schema.'
        };

        return Promise.reject({message: errors[response.error]});
    }

    var createMessage = function (args) { return messages.custom({
        content: m.component(createComponent, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var createComponent = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var downloadAccess ={
                studyId: m.prop('')
            };

            // export study to calling component
            output(downloadAccess);


            var ctrl = {
                downloadAccess: downloadAccess,
                submitAttempt: false,
                validity: function validity(){
                    var response = {
                        studyId: downloadAccess.studyId()
                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });

                    if (isValid) close(true);
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;
        },
        view: function view(ctrl){
            var downloadAccess = ctrl.downloadAccess;
            var validity = ctrl.validity();
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Request Download Access From Admin'),
                m('p', 'This page will request access to a study from admin.  For studies created by users you should instead email them directly for access.'),
                m('.card-block', [
                    m('.form-group', {class:groupClasses(validity.studyId)}, [
                        m('label', 'Study Id'),
                        m('input.form-control', {
                            config: focusConfig$2,
                            placeholder:'Study Id',
                            value: downloadAccess.studyId(),
                            oninput: m.withAttr('value', downloadAccess.studyId),
                            class:inputClasses(validity.studyId)
                        }),
                        validationView(validity.studyId, 'The study ID is required in order to request access.')
                    ])
                    
                    
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
                ])
            ]);
        }
    };

    var focusConfig$2 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    var grantMessage = function (args) { return messages.custom({
        content: m.component(grantComponent, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var grantComponent = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var downloadAccess ={
                studyId: m.prop(''),
                username: m.prop('')
            };

            // export study to calling component
            output(downloadAccess);


            var ctrl = {
                downloadAccess: downloadAccess,
                submitAttempt: false,
                validity: function validity(){
                    var response = {
                        studyId: downloadAccess.studyId(),
                        username: downloadAccess.username()
                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });

                    if (isValid) close(true);
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;
        },
        view: function view(ctrl){
            var downloadAccess = ctrl.downloadAccess;
            var validity = ctrl.validity();
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Grant Data Access'),
                m('.card-block', [
                    m('.form-group', {class:groupClasses(validity.studyId)}, [
                        m('label', 'Study Id'),
                        m('input.form-control', {
                            config: focusConfig$1,
                            placeholder:'Study Id',
                            value: downloadAccess.studyId(),
                            oninput: m.withAttr('value', downloadAccess.studyId),
                            class:inputClasses(validity.studyId)
                        }),
                        m('label', 'Username'),
                        m('input.form-control', {
                            config: focusConfig$1,
                            placeholder:'Username',
                            value: downloadAccess.username(),
                            oninput: m.withAttr('value', downloadAccess.username),
                            class:inputClasses(validity.username)
                        }),
                        validationView(validity.studyId, 'The study ID is required in order to grant access.'),
                        validationView(validity.username, 'The username is required in order to grant access.')
                    ])
                    
                    
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
                ])
            ]);
        }
    };

    var focusConfig$1 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    var revokeMessage = function (args) { return messages.custom({
        content: m.component(revokeComponent, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var revokeComponent = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var downloadAccess ={
                studyId: m.prop(''),
                username: m.prop('')
            };

            // export study to calling component
            output(downloadAccess);


            var ctrl = {
                downloadAccess: downloadAccess,
                submitAttempt: false,
                validity: function validity(){
                    var response = {
                        studyId: downloadAccess.studyId(),
                        username: downloadAccess.username()
                    };
                    return response;
                },
                ok: function ok(){
                    ctrl.submitAttempt = true;
                    var response = ctrl.validity();
                    var isValid = Object.keys(response).every(function (key) { return response[key]; });

                    if (isValid) close(true);
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;
        },
        view: function view(ctrl){
            var downloadAccess = ctrl.downloadAccess;
            var validity = ctrl.validity();
            var validationView = function (isValid, message) { return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message); };
            var groupClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'has-danger': !valid,
                'has-success' : valid
            }); };
            var inputClasses = function (valid) { return !ctrl.submitAttempt ? '' : classNames({
                'form-control-danger': !valid,
                'form-control-success': valid
            }); };

            return m('div',[
                m('h4', 'Revoke Data Access'),
                m('.card-block', [
                    m('.form-group', {class:groupClasses(validity.studyId)}, [
                        m('label', 'Study Id'),
                        m('input.form-control', {
                            config: focusConfig,
                            placeholder:'Study Id',
                            value: downloadAccess.studyId(),
                            oninput: m.withAttr('value', downloadAccess.studyId),
                            class:inputClasses(validity.studyId)
                        }),
                        m('label', 'Username'),
                        m('input.form-control', {
                            config: focusConfig,
                            placeholder:'Username',
                            value: downloadAccess.username(),
                            oninput: m.withAttr('value', downloadAccess.username),
                            class:inputClasses(validity.username)
                        }),
                        validationView(validity.studyId, 'The study ID is required in order to revoke access.'),
                        validationView(validity.username, 'The username is required in order to revoke access.')
                    ])
                    
                    
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
                ])
            ]);
        }
    };

    var focusConfig = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    function play$1(downloadAccess, list){
        return messages.confirm({
            header: 'Approve Access Request:',
            content: ("Are you sure you want to grant access of '" + (downloadAccess.studyId) + "' to '" + (downloadAccess.username) + "'?")
        })
        .then(function (response) {
            if(response) {
                return updateApproved(downloadAccess, STATUS_APPROVED)
                    .then(function () { return list(list().filter(function (el) { return el !== downloadAccess; })); })
                    .then(messages.alert({header:'Grant access completed', content: 'Access granted'}))
                    .catch(reportError('Grant Access'))
                    .then(m.redraw());
            }
        });
    }


    var remove  = function (downloadAccess, list) {
        return messages.confirm({
            header: 'Delete request:',
            content: ("Are you sure you want to delete the access request for'" + (downloadAccess.studyId) + "'? If access has already been granted you will lose it")
        })
        .then(function (response) {
            if(response) {
                
                return deleteDataAccessRequest(downloadAccess)
                    .then(function () { return list(list().filter(function (el) { return el !== downloadAccess; })); })
                    .then(messages.alert({header:'Deletion complete', content: 'Access has been deleted'}))
                    .catch(reportError('Remove Download Request'))
                    .then(m.redraw());

            }
        });
    };
    var grant = function () {
        var output = m.prop();
        return grantMessage({output: output})
        .then(function (response) {
            if (response) {
                var now = new Date();
                var downloadAccess = Object.assign({
                    approved: STATUS_APPROVED,
                    creationDate: now
                }, null, unPropify(output()));
                return createDataAccessRequest(downloadAccess)
                .then(messages.alert({header:'Grant access completed', content: 'Access granted'}))
                .catch(reportError('Grant Access'));
            }
        });
    };
    var revoke = function () {
        var output = m.prop();
        return revokeMessage({output: output})
        .then(function (response) {
            if (response) {
                var now = new Date();
                var downloadAccess = Object.assign({
                    creationDate: now
                }, null, unPropify(output()));
                return deleteDataAccessRequest(downloadAccess)
                .then(messages.alert({header:'Revoke access completed', content: 'Access revoked'}))
                .catch(reportError('Revoke Access'));
            }
        });
    };
    var create = function (list) {
        var output = m.prop();
        return createMessage({output: output})
            .then(function (response) {
                if (response) {
                    var now = new Date();
                    var downloadAccess = Object.assign({
                        creationDate: now,
                        approved: 'access pending'
                    }, null, unPropify(output()));
                    return createDataAccessRequest(downloadAccess)
                        .then(function () { return list().unshift(downloadAccess); })
                        .then(m.redraw)
                        .catch(reportError('Data Access Request'));
                }
            });
    };

    var reportError = function (header) { return function (err) { return messages.alert({header: header, content: err.message}); }; };

    var unPropify = function (obj) { return Object.keys(obj).reduce(function (result, key) {
        result[key] = obj[key]();
        return result;
    }, {}); };

    var TABLE_WIDTH = 6;

    var downloadsAccessComponent = {
        controller: function () {
            var ctrl = {
                play: play$1,
                loaded: m.prop(false),
                remove: remove,
                create: create,
                grant: grant,
                revoke: revoke,
                list: m.prop([]),
                globalSearch: m.prop(''),
                sortBy: m.prop(),
                error: m.prop(''),
                isAdmin: false
            };
            getAuth().then(function (response) {ctrl.isAdmin = response.role === 'SU';});

            getAllOpenRequests()
                .then(ctrl.list)
                .catch(ctrl.error)
                .then(function(){ctrl.loaded(true);})
                .then(m.redraw);

            return ctrl;
        },
        view: function (ctrl) {
            if (!ctrl.loaded())
                return m('.loader');

            var list = ctrl.list;
            return m('.downloadAccess', [
                m('h3', 'Data Download Access Requests'),
                m('p.col-xs-12.text-muted', [
                    m('small', [
                        ctrl.isAdmin
                            ? 'Approve requests by clicking the Play button; Reject requests by clicking the X button; To grant permission without a request: hit the Grant Access button; For all actions: The user will be notified by email.'
                            : 'You will receive an email when your request is approved or rejected; To cancel a request, click the X button next to the request'
                    ])
                ]),
                ctrl.error()
                    ?
                    m('.alert.alert-warning',
                        m('strong', 'Warning!! '), ctrl.error().message
                    )
                    :
                    m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                        m('thead', [
                            m('tr', [ 
                                m('th', {colspan: TABLE_WIDTH}, [ 
                                    m('.row', [
                                        m('.col-xs-3.text-xs-left', [
                                            m('button.btn.btn-secondary', {disabled: ctrl.isAdmin, onclick:ctrl.isAdmin || ctrl.create.bind(null, list)}, [
                                                m('i.fa.fa-plus'), '  Request Access From Admin'
                                            ])
                                        ]),
                                        m('.col-xs-2.text-xs-left', [
                                            m('button.btn.btn-secondary', {onclick:ctrl.grant.bind(null, list)}, [
                                                m('i.fa.fa-plus'), '  Grant Access'
                                            ])
                                        ])
                                        ,m('.col-xs-2.text-xs-left', [
                                            ctrl.isAdmin ? m('button.btn.btn-secondary', {onclick:ctrl.revoke.bind(null, list)}, [
                                                m('i.fa.fa-plus'), '  Revoke Access'
                                            ]) : ''
                                        ]),
                                        m('.col-xs-5.text-xs-left', [
                                            m('input.form-control', {placeholder: 'Global Search ...', oninput: m.withAttr('value', ctrl.globalSearch)})
                                        ])
                                    ])
                                ])
                            ]),

                            m('tr', [
                                m('th', thConfig$3('studyId',ctrl.sortBy), 'ID'),
                                m('th', thConfig$3('username',ctrl.sortBy), 'Username'),
                                m('th', thConfig$3('email',ctrl.sortBy), 'Email'),
                                m('th', thConfig$3('creationDate',ctrl.sortBy), 'Date'),
                                m('th','Status'),
                                m('th','Actions')
                            ])
                        ]),
                        m('tbody', [
                            list().length === 0
                                ?
                                m('tr.table-info',
                                    m('td.text-xs-center', {colspan: TABLE_WIDTH},
                                        m('strong', 'Heads up! '), 'There are no requests yet'
                                    )
                                )
                                :
                                list().filter(dataRequestFilter(ctrl)).map(function (dataRequest) { return m('tr', [
                                    // ### ID
                                    m('td', dataRequest.studyId),
                                    
                                    // ### USERNAME
                                    m('td', dataRequest.username),
                                    
                                    // ### EMAIL
                                    m('td', dataRequest.email),

                                    // ### Date
                                    m('td', formatDate(new Date(dataRequest.creationDate))),
                                    dataRequest.approved=== STATUS_APPROVED
                                        ?
                                        m('td', {style:'color:green'},'access granted')
                                        :
                                        m('td', {style:'color:red'},'access pending'),

                                    // ### Actions
                                    m('td', [
                                        m('.btn-group', [
                                            dataRequest.canApprove && dataRequest.approved === STATUS_SUBMITTED ? m('button.btn.btn-sm.btn-secondary', {title:'Approve request, and auto email requester',onclick: ctrl.play.bind(null, dataRequest,list)}, [
                                                m('i.fa.fa-play')
                                            ]) : '',
                                            dataRequest.canDelete ? m('button.btn.btn-sm.btn-secondary', {title:'Delete request.  If this is a granted request owner will lose access to it',onclick: ctrl.remove.bind(null, dataRequest, list)}, [
                                                m('i.fa.fa-close')
                                            ]) : ''
                                        ])
                                    ])
                                ]); })
                        ])
                    ])
            ]);
        }
    };

    // @TODO: bad idiom! should change things within the object, not the object itself.
    var thConfig$3 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    function dataRequestFilter(ctrl){
        return function (dataRequest) { return includes(dataRequest.studyId, ctrl.globalSearch()) ||
            includes(dataRequest.username, ctrl.globalSearch()) ||
            includes(dataRequest.email, ctrl.globalSearch()); };

        function includes(val, search){
            return typeof val === 'string' && val.includes(search);
        }
    }

    var fullHeight = function (element, isInitialized, ctx) {
        if (!isInitialized){
            onResize();

            window.addEventListener('resize', onResize, true);

            ctx.onunload = function(){
                window.removeEventListener('resize', onResize);
            };

        }

        function onResize(){
            element.style.height = document.documentElement.clientHeight - element.getBoundingClientRect().top + 'px';
        }
    };

    var loginComponent = {
        controller: function controller(){
            var ctrl = {
                username:m.prop(''),
                password:m.prop(''),
                isloggedin: false,
                loginAction: loginAction,
                error: m.prop('')
            };
            is_loggedin();
            return ctrl;

            function loginAction(){
                if(ctrl.username() && ctrl.password())
                    login(ctrl.username, ctrl.password)
                        .then(function () {
                            m.route(!location.hash ? './' : decodeURIComponent(location.hash).substring(1));
                        })
                        .catch(function (response) {
                            ctrl.error(response.message);
                            m.redraw();
                        })
                    ;
            }

            function is_loggedin(){
                getAuth().then(function (response) {
                    if(response.isloggedin)
                        m.route('./');
                });
            }
        },
        view: function view(ctrl){
            return m('.login.centrify', {config:fullHeight},[
                m('.card.card-inverse.col-md-4', [
                    m('.card-block',[
                        m('h4', 'Please sign in'),

                        m('form', {onsubmit:ctrl.loginAction}, [
                            m('input.form-control', {
                                type:'username',
                                placeholder: 'Username / Email',
                                value: ctrl.username(),
                                name: 'username',
                                autofocus:true,
                                oninput: m.withAttr('value', ctrl.username),
                                onkeydown: function (e){(e.keyCode == 13) ? ctrl.loginAction(): false;},
                                onchange: m.withAttr('value', ctrl.username),
                                config: getStartValue$5(ctrl.username)
                            }),
                            m('input.form-control', {
                                type:'password',
                                name:'password',
                                placeholder: 'Password',
                                value: ctrl.password(),
                                oninput: m.withAttr('value', ctrl.password),
                                onchange: m.withAttr('value', ctrl.password),
                                onkeydown: function (e){(e.keyCode == 13) ? ctrl.loginAction(): false;},
                                config: getStartValue$5(ctrl.password)
                            })
                        ]),

                        !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                        m('button.btn.btn-primary.btn-block', {onclick: ctrl.loginAction},'Sign in'),
                        m('p.text-center',
                            m('small.text-muted',  m('a', {href:'index.html?/recovery'}, 'Lost your password?'))
                        )
                    ])
                ])
            ]);
        }
    };

    function getStartValue$5(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    var jshintOptions = {
        // JSHint Default Configuration File (as on JSHint website)
        // See http://jshint.com/docs/ for more details

        'curly'         : false,    // true: Require {} for every new block or scope
        'latedef'       : 'nofunc', // true: Require variables/functions to be defined before being used
        'undef'         : true,     // true: Require all non-global variables to be declared (prevents global leaks)
        'unused'        : 'vars',   // Unused variables:
        'strict'        : false,    // true: Requires all functions run in ES5 Strict Mode

        'browser'       : true,     // Web Browser (window, document, etc)
        'devel'         : true,     // Development/debugging (alert, confirm, etc)

        esversion   : 3,        // Require es3 syntax for backward compatibility

        // Custom Globals
        predef: ['piGlobal','define','require','requirejs','angular']
    };

    var filePrototype = {
        apiUrl: function apiUrl(){

            return (fileUrl + "/files/" + (encodeURIComponent(this.studyId)) + "/file/" + (encodeURIComponent(this.id)));
        },

        get: function get(){
            var this$1$1 = this;

            return fetchJson(this.apiUrl())
                .then(function (response) {
                    var content = response.content.replace(/\r\n?|\n?$/g, '\n'); // replace carriage returns and add new line to EOF. this makes sure all files are unix encoded...
                    this$1$1.sourceContent(content);
                    this$1$1.content(content);
                    this$1$1.loaded = true;
                    this$1$1.error = false;
                    this$1$1.last_modify = response.last_modify;

                })
                .catch(function (reason) {
                    this$1$1.loaded = true;
                    this$1$1.error = true;
                    return Promise.reject(reason); // do not swallow error
                });
        },

        save: function save(){
            var this$1$1 = this;



            return fetchJson(this.apiUrl(), {
                method:'put',
                body: {content: this.content, last_modify:this.last_modify}
            })
                .then(function (response) {
                    this$1$1.sourceContent(this$1$1.content()); // update source content
                    this$1$1.last_modify = response.last_modify;
                    return response;
                });
        },

        move: function move(path, study){
            var this$1$1 = this;

            var basePath = (path.substring(0, path.lastIndexOf('/')));
            var folderExists = basePath === '' || study.files().some(function (f) { return f.isDir && f.path === basePath; });

            if (!folderExists) return Promise.reject({message: ("Folder " + basePath + " does not exist.")});
            if (study.files().some(function (f){ return f.path === path; })) return Promise.reject({message: ("File " + path + " already exists.")});

            var oldPath = this.path;
            this.setPath(path);
            this.content(this.content()); // in case where changing into a file type that needs syntax checking

            return fetchJson(this.apiUrl() + "/move/" , {
                method:'put',
                body: {path: path, url:this.url}
            })
                .then(function (response) {
                    this$1$1.id = response.id;
                    this$1$1.url = response.url;
                })
                .catch(function (response) {
                    this$1$1.setPath(oldPath);
                    return Promise.reject(response);
                });
        },

        copy: function copy(path, study_id, new_study_id){
            return fetchJson(this.apiUrl() + "/copy/", {
                method:'put',
                body: {new_study_id: new_study_id}
            })
                .catch(function (response) {
                    return Promise.reject(response);
                });
        },

        del: function del(){
            return fetchVoid(this.apiUrl(), {method:'delete'});
        },


        hasChanged: function hasChanged() {
            return this.sourceContent() !== this.content();
        },

        define: function define(context){
            if ( context === void 0 ) context = window;

            var requirejs = context.requirejs;
            var name = this.url;
            var content = this.content();

            return new Promise(function (resolve) {
                requirejs.undef(name);
                context.eval(content.replace("define(","define('" + name + "',"));
                resolve();
            });
        },

        require: function require(context){
            var this$1$1 = this;
            if ( context === void 0 ) context = window;

            var requirejs = context.requirejs;
            return new Promise(function (resolve, reject) {
                requirejs([this$1$1.url], resolve,reject);
            });
        },

        checkSyntax: function checkSyntax(){
            var jshint = window.JSHINT;
            this.syntaxValid = jshint(this.content(), jshintOptions);
            this.syntaxData = jshint.data();
            return this.syntaxValid;
        },

        setPath: function setPath(path){
            if ( path === void 0 ) path = '';

            this.path = path;
            this.name = path.substring(path.lastIndexOf('/')+1);
            this.basePath = (path.substring(0, path.lastIndexOf('/'))) + '/';
            this.type = path.substring(path.lastIndexOf('.')+1).toLowerCase();
        }
    };

    /**
     * fileObj = {
     *  id: #hash,
     *  path: path,     
     *  url: URL
     * }
     */

    var fileFactory = function (fileObj) {
        var file = Object.create(filePrototype);
        var path = decodeURIComponent(fileObj.path);


        file.setPath(path);

        Object.assign(file, fileObj, {
            id          : fileObj.id,
            sourceContent       : m.prop(fileObj.content || ''),
            content         : contentProvider.call(file, fileObj.content || ''), // custom m.prop, alows checking syntax on change

            // keep track of loaded state
            loaded          : false,
            error           : false,

            // these are defined when calling checkSyntax
            syntaxValid     : undefined,
            syntaxData      : undefined,

            undoManager     : m.prop(), // a prop to keep track of the ace-editor undo manager for this file
            position        : m.prop() // a prop to keep track of the ace-editor position in this file
        });

        file.content(fileObj.content || '');

        if (fileObj.files) file.files = fileObj.files.map(fileFactory).map(function (file) { return Object.assign(file, {studyId: fileObj.studyId}); });

        return file;


        function contentProvider (store) {
            var this$1$1 = this;

            var prop = function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                if (args.length) {
                    store = args[0];
                    this$1$1.type === 'js' && this$1$1.checkSyntax();
                }
                return store;
            };

            prop.toJSON = function () { return store; };

            return prop;
        }
    };

    var studyPrototype$1 = {
        apiURL: function apiURL(path){
            if ( path === void 0 ) path = '';

            return (baseUrl + "/files/" + (encodeURIComponent(this.id)) + path);
        },

        get: function get(){
            var this$1$1 = this;

            return fetchJson(this.apiURL())
                .then(function (study) {
                    this$1$1.loaded = true;
                    this$1$1.isReadonly = study.is_readonly;
                    this$1$1.istemplate = study.is_template;
                    this$1$1.is_locked = study.is_locked;
                    this$1$1.name = study.study_name;
                    this$1$1.baseUrl = study.base_url;
                    var files = flattenFiles(study.files)
                        .map(assignStudyId(this$1$1.id))
                        .map(fileFactory);

                    this$1$1.files(files);
                    this$1$1.sort();
                })
                .catch(function (reason) {
                    this$1$1.error = true;
                    return Promise.reject(reason); // do not swallow error
                });

            function flattenFiles(files){
                if (!files) return [];
                return files
                        .map(spreadFile)
                        .reduce(function (result, fileArr) { return result.concat(fileArr); },[]);
            }

            function assignStudyId(id){
                return function (f) { return Object.assign(f, {studyId: id}); };
            }

            // create an array including file and all its children
            function spreadFile(file){
                return [file].concat(flattenFiles(file.files));
            }
        },

        getFile: function getFile(id){
            return this.files().find(function (f) { return f.id === id; });
        },

        // makes sure not to return both a folder and its contents.
        // This is important mainly for server side clarity (don't delete or download both a folder and its content)
        // We go recurse through all the files, starting with those sitting in root (we don't have a root node, so we need to get them manually).
        getChosenFiles: function getChosenFiles(){
            var vm = this.vm;
            var rootFiles = this.files().filter(function (f) { return f.basePath === '/'; });
            return getChosen(rootFiles);

            function getChosen(files){
                return files.reduce(function (response, file) {
                    // a chosen file/dir does not need sub files to be checked
                    if (vm(file.id).isChosen() === 1) response.push(file);
                    // if not chosen, we need to look deeper
                    else response = response.concat(getChosen(file.files || []));
                    return response;
                }, []);
            }
        },

        addFile: function addFile(file){
            this.files().push(file);
            // update the parent folder
            var parent = this.getParents(file).reduce(function (result, f) { return result && (result.path.length > f.path.length) ? result : f; } , null); 
            if (parent) {
                parent.files || (parent.files = []);
                parent.files.push(file);
            }
        },

        createFile: function createFile(ref){
            var this$1$1 = this;
            var name = ref.name;
            var content = ref.content; if ( content === void 0 ) content = '';
            var isDir = ref.isDir;

            // validation (make sure there are no invalid characters)
            if(/[^\/-_.A-Za-z0-9]/.test(name)) return Promise.reject({message: ("The file name \"" + name + "\" is not valid")});

            // validation (make sure file does not already exist)
            var exists = this.files().some(function (file) { return file.path === name; });
            if (exists) return Promise.reject({message: ("The file \"" + name + "\" already exists")});

            // validateion (make sure direcotry exists)
            var basePath = (name.substring(0, name.lastIndexOf('/'))).replace(/^\//, '');
            var dirExists = basePath === '' || this.files().some(function (file) { return file.isDir && file.path === basePath; });
            if (!dirExists) return Promise.reject({message: ("The directory \"" + basePath + "\" does not exist")});
            return fetchJson(this.apiURL('/file'), {method:'post', body: {name: name, content: content, isDir: isDir}})
                .then(function (response) {
                    Object.assign(response, {studyId: this$1$1.id, content: content, path:name, isDir: isDir});
                    var file = fileFactory(response);
                    file.loaded = true;
                    this$1$1.addFile(file);
                    return response;
                })
                .then(this.sort.bind(this));
        },

        sort: function sort(response){
            var files = this.files().sort(sort);
            this.files(files);
            return response;

            function sort(a,b){
                // sort by isDir then name
                var nameA= +!a.isDir + a.name.toLowerCase(), nameB=+!b.isDir + b.name.toLowerCase();
                if (nameA < nameB) return -1;//sort string ascending
                if (nameA > nameB) return 1;
                return 0; //default return value (no sorting)
            }
        },

        uploadFiles: function uploadFiles(ref){
            var this$1$1 = this;
            var path = ref.path;
            var files = ref.files;
            var force = ref.force;

            var formData = buildFormData(files);
            formData.append('forceUpload', +force);

            return fetchUpload(this.apiURL(("/upload/" + (path === '/' ? '' : path))), {method:'post', body:formData})
                .then(function (response) { return response.forEach(function (src) {
                    var file = fileFactory(Object.assign({studyId: this$1$1.id},src));
                    // if file already exists, remove it
                    if (force && this$1$1.files().find(function (f) { return f.path === file.path; })) this$1$1.removeFiles([file]);
                    this$1$1.addFile(file);
                }); })
                .then(this.sort.bind(this));

            function buildFormData(files) {
                var formData = new FormData;
                for (var i = 0; i < files.length; i++) {
                    formData.append(i, files[i]);
                }
                return formData;
            }
        },

        /*
         * @param files [Array] a list of file.path to download
         * @returns url [String] the download url
         */
        downloadFiles: function downloadFiles(files){
            return fetchJson(this.apiURL(), {method: 'post', body: {files: files}})
                .then(function (response) { return (baseUrl + "/download?path=" + (response.zip_file) + "&study=_PATH"); });
        },

        delFiles: function delFiles(files){
            var this$1$1 = this;

            var paths = files.map(function (f){ return f.path; });
            return fetchVoid(this.apiURL(), {method: 'delete', body: {files:paths}})
                .then(function () { return this$1$1.removeFiles(files); });
        },

        removeFiles: function removeFiles(files){
            var this$1$1 = this;

            // for cases that we remove a directory without explicitly removing the children (this will cause redundancy, but it shouldn't affect us too much
            var children = files.reduce(function (arr, f) { return arr.concat(this$1$1.getChildren(f).map(function (f){ return f.path; })); },[]);
            // get all files not to be deleted
            var filesList = this.files() .filter(function (f) { return children.indexOf(f.path) === -1; }); 
            files.forEach(function (file) {
                var parent = this$1$1.getParents(file).reduce(function (result, f) { return result && (result.path.length > f.path.length) ? result : f; } , null); 
                if (parent) {
                    var index = parent.files.indexOf(file);
                    parent.files.splice(index, 1);
                }
            });

            this.files(filesList);
        },

        getParents: function getParents(file){
            return this.files().filter(function (f) { return f.isDir && file.basePath.indexOf(f.path) === 0; });
        },

        // returns array of children for this file, including itself
        getChildren: function getChildren(file){
            return children(file);
           
            function children(file){
                if (!file.files) return [file];
                return file.files
                    .map(children) // harvest children
                    .reduce(function (result, files) { return result.concat(files); }, [file]); // flatten
            }
        }
    };

    var studyFactory$1 =  function (id) {
        var study = Object.create(studyPrototype$1);
        Object.assign(study, {
            id      : id,
            files   : m.prop([]),
            loaded  : false,
            error   :false,
            vm      : viewModelMap$1({
                isOpen: m.prop(false),
                isChanged: m.prop(false),
                isChosen: m.prop(0)
            })
        });

        return study;
    };

    // http://lhorie.github.io/mithril-blog/mapping-view-models.html
    var viewModelMap$1 = function(signature) {
        var map = {};
        return function(key) {
            if (!map[key]) {
                map[key] = {};
                for (var prop in signature) map[key][prop] = m.prop(signature[prop]());
            }
            return map[key];
        };
    };

    var imgEditor = function (ref) {
        var file = ref.file;

        return m('div.img-editor.centrify', [
        m('img', {src:file.url})
    ]);
    };

    var pdfEditor = function (ref) {
        var file = ref.file;

        return m('object', {
        data: file.url,
        type: 'application/pdf',
        width: '100%',
        height: '100%'
    }, [
        m('embed', {src: file.url, type: 'application/pdf'}, 'Your browser does not support PDF')
    ]);
    };

    var unknownComponent = function () { return m('.centrify', [
        m('i.fa.fa-file.fa-5x'),
        m('h5', 'Unknow file type')
    ]); };

    // download support according to modernizer
    var downloadSupport = !window.externalHost && 'download' in document.createElement('a');

    var downloadLink = function (url, name) {
        if (downloadSupport){
            var link = document.createElement('a');
            link.href = url;
            link.download = name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            var win = window.open(url, '_blank');
            win.focus();
        }
    };

    var moveFileComponent = function (args) { return m.component(component, args); };


    var component = {
        controller: function controller(ref){
            var study = ref.study;

            var dirs = study
                .files()
                .filter(function (file) { return file.isDir; })
                .map(function (ref) {
                    var name = ref.name;
                    var basePath = ref.basePath;
                    var path = ref.path;
                    var id = ref.id;

                    return ({name: name, basePath: basePath, path: path, id: id, isOpen: m.prop(study.vm(id).isOpen())});
            })
                .reduce(function (hash, dir){
                    var path = dir.basePath;
                    if (!hash[path]) hash[path] = [];
                    hash[path].push(dir);
                    return hash;
                }, {'/': []});


            var root = {isOpen: m.prop(true), name:'/', path: '/'};
            return {root: root, dirs: dirs};
        },
        view: function view(ref, ref$1){
            var dirs = ref.dirs;
            var root = ref.root;
            var newPath = ref$1.newPath;

            return m('.card-block', [
                m('p.card-text', [
                    m('strong', 'Moving to: '),
                    dirName(newPath())
                ]),
                m('.folders-well', [
                    m('ul.list-unstyled', dirNode(root, dirs, newPath) )
                ])
            ]);
        }
    };


    function dirNode(dir, dirs, newPath){
        var children = dirs[dir.path.replace(/\/?$/, '/')]; // optionally add a backslash at the end
        return m('li', [
            m('i.fa.fa-fw', {
                onclick: function () { return dir.isOpen(!dir.isOpen()); },
                class: classNames({
                    'fa-caret-right' : children && !dir.isOpen(),
                    'fa-caret-down': children && dir.isOpen()
                })
            }),
            m('span', {onclick: function () { return newPath(dir.path); }}, [
                m('i.fa.fa-folder-o.m-r-1'),
                dirName(dir.name)
            ]),
            !children || !dir.isOpen() ? '' : m('ul.bulletless', children.map(function (d) { return dirNode(d, dirs, newPath); }))
        ]);
    }

    function dirName(name){
        return name === '/' ? m('span.text-muted', 'Root Directory') : name;
    }

    function get_url(study_id) {
        return (studyUrl + "/" + (encodeURIComponent(study_id)));
    }

    function get_duplicate_url(study_id) {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/copy");
    }
    function get_lock_url(study_id , lock) {

        if (lock)
            return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/lock");
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/unlock");
    }

    /*CRUD*/
    var load_studies = function () { return fetchJson(studyUrl, {credentials: 'same-origin'}); };

    var load_templates = function () { return fetchJson(templatesUrl, {credentials: 'same-origin'}); };

    var create_study = function (study_name, type, template_id, reuse_id) { return fetchJson(studyUrl, {
        method: 'post',
        body: {study_name: study_name, type: type, template_id: template_id, reuse_id: reuse_id}
    }); };

    var rename_study = function (study_id, study_name) { return fetchJson(get_url(study_id), {
        method: 'put',
        body: {study_name: study_name}
    }); };

    var duplicate_study = function (study_id, study_name) { return fetchJson(get_duplicate_url(study_id), {
        method: 'put',
        body: {study_name: study_name}
    }); };

    var lock_study = function (study_id, lock) { return fetchJson(get_lock_url(study_id, lock), {
        method: 'post'
    }); };


    var delete_study = function (study_id) { return fetchJson(get_url(study_id), {method: 'delete'}); };

    function copyFileComponent (args) { return m.component(copyFileComponent$1, args); }
    var copyFileComponent$1 = {
        controller: function controller(ref){
            var new_study_id = ref.new_study_id;
            var study_id = ref.study_id;

            var studies = m.prop([]);
            var loaded = m.prop(false);
            var error = m.prop(null);
            load_studies()
                .then(function (response) { return studies(response.studies.sort(sort_studies_by_name2).filter(template_filter())); })
                .catch(error)
                .then(loaded.bind(null, true))
                .then(m.redraw);
            return {studies: studies, study_id: study_id, new_study_id: new_study_id, loaded: loaded, error: error};
        },
        view: function (ref) {
            var studies = ref.studies;
            var study_id = ref.study_id;
            var new_study_id = ref.new_study_id;
            var loaded = ref.loaded;
            var error = ref.error;

            return m('div', [
            loaded() ? '' : m('.loader'),
            error() ? m('.alert.alert-warning', error().message): '',

            loaded() && !studies().length ? m('.alert.alert-info', 'You have no studies yet') : '',

            m('select.form-control', {value:new_study_id(), onchange: m.withAttr('value',new_study_id)}, [
                m('option',{value:'', disabled: true}, 'Select Study'),
                studies().filter(function (study) { return !study.is_locked && !study.is_public && study.permission!=='read only' && study.id!=study_id(); }).map(function (study) { return m('option',{value:study.id, selected: new_study_id() === study.id}, study.name); })
            ])
        ]);
    }
    };



    function sort_studies_by_name2(study1, study2){
        return study1.name.toLowerCase() === study2.name.toLowerCase() ? 0 : study1.name.toLowerCase() > study2.name.toLowerCase() ? 1 : -1;
    }

    var template_filter = function () { return function (study) {
        return study.study_type === 'regular' && !study.is_template;
    }; };

    var createImplicitMeasure = function (study, path, type) {
        if ( path === void 0 ) path = '';

        return function () {
        var name = pathProp$1(path);

        var content = function (){ return ''; };
        var anWizards = ['iat', 'ep', 'amp'];
        messages.prompt({
            header: ("Create " + (anWizards.includes(type) ? 'an' : 'a') + " " + (type.toUpperCase()) + " task"),
            content: 'Please insert task name (no file extension is needed):',
            prop: name
        }).then(function (response) {

            if (response){
                return createFile(study, m.prop(((name()) + ".js")), content)
                    .then(createFile(study, m.prop(((name()) + "." + type)), content));
            }
        });
    };
    };

    var uploadFiles = function (path,study) { return function (files) {
        // validation (make sure files do not already exist)
        var filePaths = Array.from(files, function (file) { return path === '/' ? file.name : path + '/' + file.name; });
        var exist = study.files().filter(function (file) { return filePaths.includes(file.path); }).map(function (f) { return f.path; });

        if (!exist.length) return upload({force:false});
        else return messages.confirm({
            header: 'Upload Files', 
            content: ("The file" + (exist.length > 1 ? 's' : '') + " \"" + (exist.join(', ')) + "\" already exists, do you want to overwrite " + (exist.length > 1 ? 'them' : 'it') + "?"),
            okText: 'Overwrite'
        })
            .then(function (response) { return response && upload({force:true}); });

        function upload(ref) {
            if ( ref === void 0 ) ref = {force:false};
            var force = ref.force;

            return study.uploadFiles({path: path, files: files, force: force})
                .catch(function (response) { return messages.alert({
                    header: 'Upload File',
                    content: response.message
                }); })
                .then(m.redraw);
        }
    }; };

    var moveFile = function (file, study) { return function () {
        var newPath = m.prop(file.basePath);
        messages.confirm({
            header: 'Move File',
            content: moveFileComponent({newPath: newPath, file: file, study: study})
        })
            .then(function (response) {
                var targetPath = newPath().replace(/\/$/, '') + '/' + file.name;
                if (response && newPath() !== file.basePath) return moveAction(targetPath, file,study);
            });
    }; };

    var copyFile = function (file, study) { return function () {
        var filePath = m.prop(file.basePath);
        var study_id = m.prop(study.id);
        var new_study_id = m.prop('');
        messages.confirm({
            header: 'Copy File',
            content: copyFileComponent({new_study_id: new_study_id, study_id: study_id})
        })
            .then(function (response) {
                if (response && study_id() !== new_study_id) return copyAction(filePath() +'/'+ file.name, file, study_id, new_study_id);
            })
        ;
    }; };

    var renameFile = function (file,study) { return function () {
        var newPath = m.prop(file.path);
        return messages.prompt({
            header: 'Rename File',
            postContent: m('p.text-muted', 'You can move a file to a specific folder be specifying the full path. For example "images/img.jpg"'),
            prop: newPath
        })
            .then(function (response) {
                if (response && newPath() !== file.name) return moveAction(newPath(), file, study);
            });
    }; };

    var duplicateFile = function (file,study) { return function () {
        var newPath = m.prop(file.path);
        return messages.prompt({
            header: 'Duplicate File',
            postContent: m('p.text-muted', 'You can duplicate a file to a specific folder be specifying the full path. For example "images/img.jpg"'),
            prop: newPath
        })
            .then(function (response) {
                if (response && newPath() !== file.name) return createFile(study, newPath, file.content);
            });
    }; };


    function moveAction(newPath, file, study){
        var isFocused = file.id === m.route.param('fileId');

        var def = file
        .move(newPath, study) // the actual movement
        .then(redirect)
        .catch(function (response) { return messages.alert({
            header: 'Move/Rename File',
            content: response.message
        }); })
        .then(m.redraw); // redraw after server response

        m.redraw();
        return def;

        function redirect(response){
            // redirect only if the file is chosen, otherwise we can stay right here...

            if (isFocused) m.route(("/editor/" + (study.id) + "/file/" + (file.id)));
            return response;
        }
    }

    function copyAction(path, file, study_id, new_study_id){
        var def = file
        .copy(path, study_id, new_study_id) // the actual movement
        .catch(function (response) { return messages.alert({

            header: 'Copy File',
            content: response.message
        }); })
        .then(m.redraw); // redraw after server response

        return def;
    }

    var playground;
    var play = function (file,study) { return function () {
        var isSaved = study.files().every(function (file) { return !file.hasChanged(); });  

        if (isSaved) open();
        else messages.confirm({
            header: 'Play task',
            content: 'You have unsaved files, the player will use the saved version, are you sure you want to proceed?' 
        }).then(function (response) { return response && open(); });

        function open(){
            // this is important, if we don't close the original window we get problems with onload
            if (playground && !playground.closed) playground.close();

            playground = window.open('playground.html', 'Playground');
            playground.onload = function(){
                // first set the unload listener
                playground.addEventListener('unload', function() {
                    // get focus back here
                    window.focus();
                });

                // then activate the player (this ensures that when )
                playground.activate(file);
                playground.focus();
            };
        }
    }; };

    var save$1 = function (file) { return function () {
        file.save()
            .then(m.redraw)
            .catch(function (err) { return messages.alert({
                header: 'Error Saving:',
                content: err.message
            }); });
    }; };


    // add trailing slash if needed, and then remove proceeding slash
    // return prop
    var pathProp$1 = function (path) { return m.prop(path.replace(/\/?$/, '/').replace(/^\//, '')); };

    var  createFile = function (study, name, content) {
        return study.createFile({name:name(), content:content()})
            .then(function (response) {
                m.route(("/editor/" + (study.id) + "/file/" + (encodeURIComponent(response.id))));
                return response;
            })
            .catch(function (err) { return messages.alert({
                header: 'Failed to create file:',
                content: err.message
            }); });
    };

    var createDir = function (study, path) {
        if ( path === void 0 ) path='';

        return function () {
        var name = pathProp$1(path);

        messages.prompt({
            header: 'Create Directory',
            content: 'Please insert directory name',
            prop: name
        })
            .then(function (response) {
                if (response) return study.createFile({name:name(), isDir:true});
            })
            .then(m.redraw)
            .catch(function (err) { return messages.alert({
                header: 'Failed to create directory:',
                content: err.message
            }); });
    };
    };

    var createEmpty = function (study, path) {
        if ( path === void 0 ) path = '';

        return function () {
        var name = pathProp$1(path);
        var content = function (){ return ''; };

        messages.prompt({
            header: 'Create file',
            content: 'Please insert the file name:',
            prop: name
        }).then(function (response) {
            if (response) return createFile(study, name,content);
        });
    };
    };

    var deleteFiles = function (study) { return function () {
        var chosenFiles = study.getChosenFiles();
        var isFocused = chosenFiles.some(function (file) { return file.id === m.route.param('fileId'); });

        if (!chosenFiles.length) {
            messages.alert({
                header:'Remove Files',
                content: 'There are no files selected'
            });
            return;
        }

        messages.confirm({
            header: 'Remove Files',
            content: 'Are you sure you want to remove all checked files? This is a permanent change.'
        })
            .then(function (response) {
                if (response) doDelete();
            });

        function doDelete(){
            study.delFiles(chosenFiles)
                .then(redirect)
                .catch(function (err) { return messages.alert({
                    header: 'Failed to delete files:',
                    content: err.message
                }); })
                .then(m.redraw);
        }

        function redirect(response){
            // redirect only if the file is chosen, otherwise we can stay right here...
            if (isFocused) m.route(("/editor/" + (study.id))); 
            return response;
        }
    }; };

    var downloadChosenFiles = function (study) { return function () {
        var chosenFiles = study.getChosenFiles().map(function (f){ return f.path; });
        if (!chosenFiles.length) {
            messages.alert({
                header:'Download Files',
                content: 'There are no files selected'
            });
            return;
        }

        study.downloadFiles(chosenFiles)
            .then(function (url) { return downloadLink(url, study.name); })
            .catch(function (err) { return messages.alert({
                header: 'Failed to download files:',
                content: err.message
            }); });
    }; };

    var downloadFile = function (study, file) { return function () {
        if (!file.isDir) return downloadLink(file.url, file.name);

        study.downloadFiles([file.path])
            .then(function (url) { return downloadLink(url, study.name); })
            .catch(function (err) { return messages.alert({
                header: 'Failed to download files:',
                content: err.message
            }); });
    }; };

    var resetFile = function (file) { return function () { return file.content(file.sourceContent()); }; };

    var ace = function (args) { return m.component(aceComponent, args); };

    var noop = function(){};

    var aceComponent = {
        controller: function(){
            var editorCache = m.prop();
            return {editorCache: editorCache, onunload: onunload};

            function onunload(){
                if (editorCache()){
                    editorCache().destroy();
                }
            }
        },
        view: function editorView(ctrl, args){
            return m('.editor', {id:'text-editor', config: aceComponent.config(ctrl, args)});
        },

        config: function(ref,ref$1){
            var editorCache = ref.editorCache;
            var content = ref$1.content;
            var observer = ref$1.observer;
            var settings = ref$1.settings; if ( settings === void 0 ) settings = {};

            return function(element, isInitialized, ctx){
                var editor = editorCache();
                var mode = settings.mode || 'javascript';

                // paster with padding
                var paste = function (text) {
                    if (!editor) return false;
                    var pos = editor.getSelectionRange().start; 
                    var line = editor.getSession().getLine(pos.row);
                    var padding = line.match(/^\s*/);
                    // replace all new lines with padding
                    if (padding) text = text.replace(/(?:\r\n|\r|\n)/g, '\n' + padding[0]);
                    
                    editor.insert(text);
                    editor.focus();
                };

                if (!isInitialized){
                    fullHeight(element, isInitialized, ctx);

                    require(['ace/ace'], function(ace){
                        var undoManager = settings.undoManager || (function (u) { return u; });
                        var position = settings.position || (function (u) { return u; });
                        ace.config.set('packaged', true);
                        ace.config.set('basePath', require.toUrl('ace'));

                        editor = ace.edit(element);
                        editorCache(editor);

                        var session = editor.getSession();
                        var commands = editor.commands;

                        editor.setReadOnly(!!settings.isReadonly);
                        editor.setTheme('ace/theme/cobalt');
                        session.setMode('ace/mode/' + mode);
                        if (mode !== 'javascript') session.setUseWorker(false);
                        editor.setHighlightActiveLine(true);
                        editor.setShowPrintMargin(false);
                        editor.setFontSize('18px');
                        editor.$blockScrolling = Infinity; // scroll to top

                        // set jshintOptions
                        session.on('changeMode', function(e, session){
                            if (session.getMode().$id === 'ace/mode/javascript' && !!session.$worker && settings.jshintOptions) {
                                session.$worker.send('setOptions', [settings.jshintOptions]);
                            }
                        });

                        session.on('change', function(){
                            content(editor.getValue());
                            m.redraw();
                        });

                        commands.addCommand({
                            name: 'save',
                            bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
                            exec: settings.onSave || noop
                        });
                        
                        if(observer) observer.on('paste',paste );
                        if(observer) observer.on('settings',function () { return editor.execCommand('showSettingsMenu'); });
                        
                        setContent();

                        // return to the last position when reinitializing an editor
                        if (position()) {
                            var ref = position();
                            var scroll = ref.scroll;
                            var row = ref.row;
                            var column = ref.column;
                            editor.session.setScrollTop(scroll);
                            editor.moveCursorTo(row, column);
                            editor.clearSelection();
                        }

                        // reset undo manager so that ctrl+z doesn't erase file
                        // save it so that it doesn't get lost when users navigate away
                        session.setUndoManager(undoManager() || undoManager(new ace.UndoManager())); 
                        editor.focus();
                        editor.on('destroy', function () {
                            position(Object.assign({scroll: editor.session.getScrollTop()},editor.getCursorPosition()));
                            if(observer) observer.off(paste );
                        });
                    });
                }
                
                // each redraw set content from model (the function makes sure that this is not done when not needed...)
                setContent();

                function setContent(){
                    var editor = editorCache();
                    if (!editor) return;
                    
                    // this should trigger only drastic changes such as the first time the editor is set
                    if (editor.getValue() !== content()){
                        editor.setValue(content());
                        editor.moveCursorTo(0,0);
                        editor.focus();
                    }
                }
            };
        }
    };

    function observer(){
        var channels = {};
        return {
            on: function on(channel,cb){
                channels[channel] || (channels[channel] = []);
                channels[channel].push(cb);
            },
            off: function off(cb){
                for (var channel in channels) {
                    var index = channels[channel].indexOf(cb);
                    if (index > -1) channels[channel].splice(index, 1);
                }
            },
            trigger: function trigger(channel){
                var args = [], len = arguments.length - 1;
                while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

                if (!channels[channel]) return;
                channels[channel].forEach(function (cb) { return cb.apply(null, args); });
            }
        };
    }

    var syntax = function (args) { return m.component(syntaxComponent, args); };

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
        analize: function (isValid, data) {
            var errorCount = 0;
            var warningCount = 0;
            var errors = isValid ? [] : data.errors
                .filter(function (e) { return e; }) // clean null values
                .map(function (err) {
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

        controller:  function (args) {
            var file = args.file;
            return syntaxComponent.analize(file.syntaxValid, file.syntaxData);
        },

        view: function (ctrl) {
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
                            m('tbody', ctrl.errors.map(function (err) {
                                return m('tr',[
                                    m('td.text-muted', ("line " + (err.line))),
                                    m('td.text-muted', ("col " + (err.col))),
                                    m('td', {class: err.isError ? 'text-danger' : 'text-info'}, err.reason),
                                    m('td',err.evidence)
                                ]);
                            }))
                        ]),

                        m('.row',[
                            m('.col-md-6', [
                                m('div', {class:'alert alert-danger'}, [
                                    m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
                                    ("You have " + (ctrl.errorCount) + " critical errors.")
                                ])
                            ]),
                            m('.col-md-6', [
                                m('div', {class:'alert alert-info'}, [
                                    m('strong',{class:'glyphicon glyphicon-warning-sign'}),
                                    ("You have " + (ctrl.warningCount) + " non standard syntax errors.")
                                ])
                            ])
                        ])

                    ])
            ]);
        }
    };

    function warn(message, test){
        return {level:'warn', message: message, test:test};
    }

    function error(message, test){
        return {level:'error', message: message, test:test};
    }

    function row(element, testArr){
        var messages = flatten(testArr)
            .filter(function (msg) { return msg; }) // clean empty
            .filter(function (msg) { return typeof msg.test == 'function' ? msg.test(element) : !!msg.test; }); // run test...

        return !messages.length ? null : {
            element: element,
            messages: messages
        };
    }

    function flatten(arr) {
        return arr.reduce(function (flat, toFlatten) {
            return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
        }, []);
    }

    function multiPick(arr, propArr){
        return arr
            .map(function (e){ return e && [].concat(e[propArr[0]], e[propArr[1]], e[propArr[2]]); }) // gather all stim arrays
            .reduce(function (previous, current){ return previous.concat(current); },[]) // flatten arrays
            .filter(function (t){ return t; }); // remove all undefined stim
    }

    function flattenSequence(sequence){
        function unMix(e){
            return flattenSequence([].concat(e.data, e.elseData, (e.branches || []).map(function (e){ return e.data; })));
        }

        return sequence
            .reduce(function (previous, current) {return previous.concat(current && current.mixer ? unMix(current) : current);},[])
            .filter(function (t){ return t; }); // remove all undefined stim;
    }

    function concatClean(){
        var args = [].splice.call(arguments,0);
        return [].concat.apply([], args).filter(function (e){ return e; });
    }

    function pipElements(script){
        var trials, stimuli, media;

        trials = concatClean(flattenSequence(script.sequence), script.trialSets);
        stimuli = concatClean(
            script.stimulusSets,
            multiPick(trials,['stimuli', 'layout'])
        );
        media = concatClean(
            script.mediaSets,
            multiPick(stimuli,['media','touchMedia'])
        );

        return {trials:trials, stimuli:stimuli, media:media};
    }

    function pipValidator(script, url){
        var errors = [];
        var elements = pipElements(script);

        errors.push({type:'Settings',errors: checkSettings(script, url)});
        errors.push({type:'Trials',errors: filterMap(elements.trials, trialTest)});
        // errors.push({type:'Stimuli',errors: filterMap(elements.stimuli, stimuliTest)});
        // errors.push({type:'Media',errors: filterMap(elements.media, mediaTest)});

        return errors;
    }

    function filterMap(arr, fn){
        return arr.map(fn).filter(function (e){ return e; });
    }

    /**
     * Check settings
     * @param  {Object} script The script to be tested
     * @param  {String} url    The script origin URL
     * @return {Array}        Array of error rows
     */
    function checkSettings(script, url){
        var settings = script.settings || {};

        var w = byProp(warn);
        // var e = byProp(error);

        var errors = [
            r('base_url', [
                w('Your base_url is not in the same directory as your script.', function (e) {
                    // use this!!!
                    // http://stackoverflow.com/questions/4497531/javascript-get-url-path
                    var getPath = function (url) {
                        var a = document.createElement('a');
                        a.href = url;
                        return a.pathname;
                    };

                    var path = getPath(url).substring(0, url.lastIndexOf('/') + 1); // get path but remove file name
                    var t = function (s) { return (!s || getPath(s).indexOf(path) !== 0); };

                    return (typeof e == 'object') ? t(e.image) && t(e.template) : t(e);
                })
            ])
        ];

        return errors.filter(function(err){return !!err;});

        function r(prop, arr){
            var el = {};
            el[prop] = settings[prop];
            return prop in settings && row(el, arr);
        }

        // wrap warn/error so that I don't have to individually
        function byProp(fn){
            return function(msg, test){
                return fn(msg, function (e) {
                    for (var prop in e) {
                        return test(e[prop]);
                    }
                });
            };
        }
    }

    function trialTest(trial) {
        var tests = [
            testInteractions(trial.interactions),
            testInput(trial.input)
        ];

        return row(trial, tests);

        function testInteractions(interactions){
            if (!interactions) {return;}

            if (!Array.isArray(interactions)){
                return [error('Interactions must be an array.', true)];
            }

            return  interactions.map(function (interaction, index) {
                return [
                    !interaction.conditions ? error(("Interaction [" + index + "] must have conditions"), true) : [
                        error(("Interaction conditon [" + index + "] must have a type"), toArray(interaction.conditions).some(function (c){ return !c.type; }))
                    ],
                    !interaction.actions ? error(("Interaction [" + index + "] must have actions"), true) : [
                        error(("Interaction action [" + index + "] must have a type"), toArray(interaction.actions).some(function (a){ return !a.type; }))
                    ]
                ];
            });


            function toArray(arr){
                return Array.isArray(arr) ? arr : [arr];
            }

        }

        function testInput(input){
            if (!input) {return;}

            if (!Array.isArray(trial.input)){
                return [error('Input must be an Array', true)];
            }

            return [
                error('Input must always have a handle', input.some(function (i){ return !i.handle; })),
                error('Input must always have an on attribute', input.some(function (i){ return !i.on; }))
            ];
        }
    }

    function questValidator(){
        var errors = [];

        errors.push({type:'Settings', errors:[]});
        errors.push({type:'Pages', errors:[]});
        errors.push({type:'Questions', errors:[]});

        return errors;
    }

    function managerValidator(){
        var errors = [];

        errors.push({type:'Settings', errors:[]});
        errors.push({type:'Tasks', errors:[]});

        return errors;
    }

    function validate$1(script){
        var type = script.type && script.type.toLowerCase();
        switch (type){
            case 'pip' : return pipValidator.apply(null, arguments);
            case 'quest' : return questValidator.apply(null, arguments);
            case 'manager' : return managerValidator.apply(null, arguments);
            default:
                throw new Error('Unknown script.type: ' + type);
        }
    }

    var validate = function (args) { return m.component(validateComponent, args); };

    var validateComponent = {
        controller: function (args) {
            var file = args.file;
            var ctrl = {
                validations : m.prop([]),
                isError: false
            };

            m.startComputation();
            file
                .define()
                .then(function (){
                    return file.require();
                })
                .then(function (script) {
                    ctrl.validations(validate$1(script, file.url));
                    m.endComputation();
                })
                .catch(function () {
                    ctrl.isError = true;
                    m.endComputation();
                });

            return ctrl;
        },
        view: function (ctrl) {
            return  m('div', [
                !ctrl.isError ? '' :    m('div', {class:'alert alert-danger'}, [
                    m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
                    "There was a problem parsing this script. Are you sure that it is a valid PI script? Make sure you fix all syntax errors."
                ]),

                ctrl.validations().map(function (validationReport) {
                    return [
                        m('h4', validationReport.type),
                        !validationReport.errors.length
                            ?
                            m('div', {class:'alert alert-success'}, [
                                m('strong','Well done!'),
                                'Your script is squeaky clean'
                            ])
                            :
                            validationReport.errors.map(function (err) {
                                return m('.row',[
                                    m('.col-md-4.stringified',
                                        m('div', {class:'pre'}, m.trust(stringify(err.element)))
                                    ),
                                    m('.col-md-8',[
                                        m('ul', err.messages.map(function (msg) {
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
            var cls = 'number';
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

    var copyUrl = function (url) { return function () {
        messages.alert({
            header: 'Copy URL',
            content: m.component(copyComponent, {url: url}),
            okText: 'Done'
        });
    }; };

    var copyComponent = {
        controller: function (ref) {
            var url = ref.url;

            var copyFail = m.prop(false);
            var autoCopy = function () { return copy$1(url).catch(function () { return copyFail(true); }).then(m.redraw); };

            return {autoCopy: autoCopy, copyFail: copyFail};
        },
        view: function (ref, ref$1) {
            var autoCopy = ref.autoCopy;
            var copyFail = ref.copyFail;
            var url = ref$1.url;

            return m('.card-block', [
            m('.form-group', [
                m('label', 'Copy Url by clicking Ctrl + C, or click the copy button.'),
                m('label.input-group',[
                    m('.input-group-addon', {onclick: autoCopy}, m('i.fa.fa-fw.fa-copy')),
                    m('input.form-control', { config: function (el) { return el.select(); }, value: url })
                ]),
                !copyFail() ? '' : m('small.text-muted', 'Auto copy will not work on your browser, you need to manually copy this url')
            ])
        ]);
    }
    };

    function copy$1(text){
        return new Promise(function (resolve, reject) {
            var input = document.createElement('input');
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

    var END_LINE = '\n';
    var TAB = '\t';
    var indent = function (str, tab) {
        if ( tab === void 0 ) tab = TAB;

        return str.replace(/^/gm, tab);
    };

    var print = function (obj) {
        switch (typeof obj) {
            case 'boolean': return obj ? 'true' : 'false';
            case 'string' : return printString(obj); 
            case 'number' : return obj + '';
            case 'undefined' : return 'undefined';
            case 'function': 
                if (obj.toJSON) return print(obj()); // Support m.prop
                else return obj.toString();
        }

        if (obj === null) return 'null';

        if (Array.isArray(obj)) return printArray(obj);
        
        return printObj(obj);

        function printString(str){
            return str === '' ? str : str
                // escape string
                .replace(/[\\"']/g, '\\$&')
                .replace(/\u0000/g, '\\0')
                // manage rows separately
                .split(END_LINE)
                .map(function (str) { return ("'" + str + "'"); })
                .join((" +" + END_LINE + TAB));
        }
        
        function printArray(arr){
            var isShort = arr.every(function (element) { return ['string', 'number', 'boolean'].includes(typeof element) && (element.length === undefined || element.length < 15); } );
            var content = arr
                .map(function (value) { return print(value); })
                .join(isShort ? ', ' : ',\n');

            return isShort
                ? ("[" + content + "]")
                : ("[\n" + (indent(content)) + "\n]");
        }

        function printObj(obj){
            var content = Object.keys(obj)
                .map(function (key) { return ((escapeKey(key)) + " : " + (print(obj[key]))); })
                .map(function (row) { return indent(row); })
                .join(',' + END_LINE);
            return ("{\n" + content + "\n}");

            function escapeKey(key){
                return /[^1-9a-zA-Z$_]/.test(key) ? ("'" + key + "'") : key;
            }
        }
    };

    var inheritInput = function (args) { return m.component(inheritInputComponent, args); };

    var inheritInputComponent = {
        controller: function controller(ref){
            var prop = ref.prop;

            var value = prop();
            var rawType = m.prop(typeof value === 'string' ? 'random' : value.type);
            var rawSet = m.prop(typeof value === 'string' ? value : value.set);

            return {type: type, set: set};

            function update(){
                var type = rawType();
                var set = rawSet();
                prop(type === 'random' ? set : {type: type, set: set});
            }
            
            function type(value){
                if (arguments){
                    rawType(value);
                    update();
                }

                return rawType();
            }
            
            function set(value){
                if (arguments){
                    rawSet(value);
                    update();
                }

                return rawSet();
            }
        },

        view: inputWrapper(function (ref) {
            var type = ref.type;
            var set = ref.set;


            return m('.form-inline', [
                m('.form-group.input-group', [
                    m('input.form-control', {
                        placeholder:'Set',
                        onchange: m.withAttr('value', set)
                    }),
                    m('span.input-group-addon', {style:'display:none'}) // needed to make the corners of the input square...
                ]),
                m('select.c-select', {
                    onchange: m.withAttr('value', type)
                }, TYPES.map(function (key) { return m('option', {value:key},key); }))
            ]);
        })
    };

    var TYPES = ['random', 'exRandom', 'sequential'];

    var taskComponent = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var form = formFactory();
            
            var type = m.prop('message');
            var common = {
                inherit: m.prop(''),
                name: m.prop(''),
                title: m.prop('')
            };
            var task = m.prop({});
                
            return {type: type, common: common, task: task, form: form, close: close, proceed: proceed};

            function proceed(){
                output(Object.assign({type: type}, common, task()));
                close(true)();
            }       

        },
        view: function view(ref){
            var type = ref.type;
            var common = ref.common;
            var task = ref.task;
            var form = ref.form;
            var close = ref.close;
            var proceed = ref.proceed;

            return m('div', [   
                m('h4', 'Add task'),
                m('.card-block', [
                    inheritInput({label:'inherit', prop:common.inherit, form: form, help: 'Base this element off of an element from a set'}),
                    selectInput({label:'type', prop: type, form: form, values: {message: 'message', pip: 'pip', quest: 'quest'}}),
                    textInput({label: 'name', prop: common.name, help: 'The name for the task',form: form}),
                    textInput({label: 'title', prop: common.title, help: 'The title to be displayed in the browsers tab',form: form}),
                    m.component(taskSwitch(type()), {task: task, form: form})
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:close(false)}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:proceed}, 'Proceed')
                ])
            ]);
        }
    };

    function taskSwitch(type){
        switch (type) {
            case 'message' : return messageComponent;
            case 'pip' : return pipComponent;
            case 'quest' : return questComponent$1;
            default :
                throw new Error(("Unknown task type: " + type));
        }
    }

    var messageComponent = {
        controller: function controller$1(ref){
            var task = ref.task;

            task({
                piTemplate: m.prop(true),
                template: m.prop(''),
                templateUrl: m.prop('')
            });
        },
        view: function view$1(ctrl, ref){
            var task = ref.task;
            var form = ref.form;

            var props = task();
            return m('div', [
                selectInput({label:'piTemplate', prop: props.piTemplate, form: form, values: {'Active': true, 'Debriefing template': 'debrief', 'Don\'t use': false}, help: 'Use the PI style templates'}),
                textInput({label: 'templateUrl', prop: props.templateUrl, help: 'The URL for the task template file',form: form}),
                textInput({label: 'template', prop: props.template, rows:6,  form: form, isArea:true, help: m.trust('You can manually create your template here <strong>instead</strong> of using a url')})
            ]); 
        }
    };

    var pipComponent = {
        controller: function controller$2(ref){
            var task = ref.task;

            task({
                version: m.prop('0.3'),
                scriptUrl: m.prop('')
            });
        },
        view: function view$2(ctrl, ref){
            var task = ref.task;
            var form = ref.form;

            var props = task();
            return m('div', [
                textInput({label: 'scriptUrl', prop: props.scriptUrl, help: 'The URL for the task script file',form: form}),
                selectInput({label:'version', prop: props.version, form: form, values: {'0.3':0.3, '0.2':0.2}, help: 'The version of PIP that you want to use'})
            ]); 
        }
    };

    var questComponent$1 = {
        controller: function controller$3(ref){
            var task = ref.task;

            task({
                scriptUrl: m.prop('')
            });
        },
        view: function view$3(ctrl, ref){
            var task = ref.task;
            var form = ref.form;

            var props = task();
            return m('div', [
                textInput({label: 'scriptUrl', prop: props.scriptUrl, help: 'The URL for the task script file',form: form})
            ]); 
        }
    };

    var pageComponent = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var form = formFactory();
            var page = {
                inherit: m.prop(''),
                header: m.prop(''),
                decline: m.prop(false),
                progressBar: m.prop('<%= pagesMeta.number %> out of <%= pagesMeta.outOf%>'),
                autoFocus: true,
                questions: [],
                v1style:2
            };
            output(page);

            return {page: page,form: form, close: close};

        },
        view: function view(ref){
            var page = ref.page;
            var form = ref.form;
            var close = ref.close;

            return m('div', [   
                m('h4', 'Add Page'),
                m('.card-block', [
                    inheritInput({label:'inherit', prop:page.inherit, form: form, help: 'Base this element off of an element from a set'}),
                    textInput({label: 'header', prop: page.header, help: 'The header for the page',form: form}),
                    checkboxInput({label: 'decline', description: 'Allow declining to answer', prop: page.decline,form: form}),
                    maybeInput({label:'progressBar', help: 'If and when to display the  progress bar (use templates to control the when part)', prop: page.progressBar,form: form})
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:close(false)}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, 'Proceed')
                ])
            ]);
        }
    };

    var questComponent = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var form = formFactory();
            var type = m.prop();
            var common = {
                inherit: m.prop(''),
                name: m.prop(''),
                stem: m.prop(''),
                required: m.prop(false),
                errorMsg: {
                    required: m.prop('')
                }
            };
            var quest = m.prop({});
            output(quest);

            return {type: type, common: common, quest: quest,form: form, close: close, proceed: proceed};

            function proceed(){
                var script = output(Object.assign({type: type}, common, quest()));
                if (!script.required()) script.required = script.errorMsg = undefined;
                if (!script.help || !script.help()) script.help = script.helpText = undefined;
                
                close(true)();
            }       

        },
        view: function view(ref){
            var type = ref.type;
            var common = ref.common;
            var quest = ref.quest;
            var form = ref.form;
            var close = ref.close;
            var proceed = ref.proceed;

            return m('div', [   
                m('h4', 'Add Question'),
                m('.card-block', [
                    selectInput({label:'type', prop: type, form: form, values: typeMap}),
                    inheritInput({label:'inherit', prop:common.inherit, form: form, help: 'Base this element off of an element from a set'}),
                    textInput({label: 'name', prop: common.name, help: 'The name by which this question will be recorded',form: form}),
                    textInput({label: 'stem', prop: common.stem, help: 'The question text',form: form}),
                    m.component(question(type()), {type: type,quest: quest,form: form,common: common}),
                    checkboxInput({label: 'required', prop: common.required, description: 'Require this question to be answered', form: form}),
                    common.required()
                        ? textInput({label:'requiredText',  help: 'The error message for when the question has not been answered', prop: common.errorMsg.required ,form: form})
                        : ''
                ]),
                m('.text-xs-right.btn-toolbar',[
                    m('a.btn.btn-secondary.btn-sm', {onclick:close(false)}, 'Cancel'),
                    m('a.btn.btn-primary.btn-sm', {onclick:proceed}, 'Proceed')
                ])
            ]);
        }
    };

    var typeMap = {None: undefined, Text: 'text', 'Text Area': 'textarea', 'Select One': 'selectOne', 'Select Multiple': 'selectMulti', Slider: 'slider'};

    var question = function (type) {
        switch (type) {
            case 'text' : return textComponent$1;
            case 'textarea' : return textareaComponent;
            case 'selectOne' : return selectOneComponent;
            case 'selectMulti' : return selectOneComponent;
            case 'slider' : return sliderComponent;
            case undefined : return {view: function () { return m('div'); }};
            default:
                throw new Error('Unknown question type');
        }
    };

    var textComponent$1 = {
        controller: function controller$1(ref){
            var quest = ref.quest;
            var common = ref.common;

            common.errorMsg.required('This text field is required');
            // setup unique properties
            quest({
                autoSubmit: m.prop(false)
            });
        },
        view: function view$1(ctrl, ref){
            var quest = ref.quest;
            var form = ref.form;

            var props = quest();
            return m('div', [
                checkboxInput({label: 'autoSubmit', prop: props.autoSubmit, description: 'Submit on enter', form: form})
            ]); 
        }
    };

    var textareaComponent = {
        controller: function controller$2(ref){
            var quest = ref.quest;
            var common = ref.common;

            common.errorMsg.required('This text field is required');
            // setup unique properties
            quest({
                rows: m.prop(3),
                columns: m.prop('')
            });
        },
        view: function view$2(ctrl, ref){
            var quest = ref.quest;
            var form = ref.form;

            var props = quest();
            return m('div', [
                textInput({label: 'rows', prop: props.rows, help: 'The number of visible text lines', form: form})
            ]); 

        }
    };

    var selectOneComponent = {
        controller: function controller$3(ref){
            var quest = ref.quest;
            var common = ref.common;

            common.errorMsg.required('Please select an answer, or click \'decline to answer\'');
            // setup unique properties
            quest({
                autoSubmit: m.prop(true),
                answers: m.prop([
                    'Very much',
                    'Somewhat',
                    'Undecided',
                    'Not realy',
                    'Not at all'
                ]),
                numericValues:true,
                help: m.prop(false),
                helpText: m.prop('Tip: For quick response, click to select your answer, and then click again to submit.')
            });
        },
        view: function view$3(ctrl, ref){
            var quest = ref.quest;
            var form = ref.form;

            var props = quest();
            return m('div', [
                checkboxInput({label: 'autoSubmit', prop: props.autoSubmit, description: 'Submit on double click', form: form}),
                arrayInput({label: 'answers', prop: props.answers, rows:7,  form: form, isArea:true, help: 'Each row here represents an answer option', required:true}),
                maybeInput({label:'help', help: 'If and when to display the help text (use templates to control the when part)', prop: props.help,form: form, dflt: '<%= pagesMeta.number < 3 %>'}),
                props.help()
                    ? textInput({label:'helpText',  help: 'The instruction text for using this type of question', prop: props.helpText,form: form, isArea: true})
                    : ''
            ]); 
        }
    };

    var sliderComponent = {
        controller: function controller$4(ref){
            var quest = ref.quest;
            var common = ref.common;

            common.errorMsg.required('Please select an answer, or click \'decline to answer\'');
            // setup unique properties
            quest({
                min: m.prop(0),
                max: m.prop(100),
                steps: m.prop(''),
                hidePips: m.prop(false), 
                highlight: m.prop(true),
                labels : m.prop(['Low', 'Medium', 'High']),
                help: m.prop(false),
                helpText: m.prop('Click on the gray line to indicate your judgment. After clicking the line, you can slide the circle to choose the exact judgment.')
            });
        },
        view: function view$4(ctrl, ref){
            var quest = ref.quest;
            var form = ref.form;

            var props = quest();
            return m('div', [
                textInput({label: 'min', prop: props.min, help: 'The minimum value for the slider',form: form}),
                textInput({label: 'max', prop: props.max, help: 'The maximum value for the slider',form: form}),
                textInput({label: 'steps', prop: props.steps, help: 'Break the slider continuum to individual steps. Set to an integer or empty for a continuous slider',form: form}),
                props.steps()
                    ? '' 
                    : checkboxInput({label: 'hidePips', prop: props.hidePips, description: 'Hide the markers for the individual steps',form: form}),
                arrayInput({label:'labels', prop: props.labels, help: 'A list of labels for the slider range', isArea: true, rows:5, form: form}),
                maybeInput({label:'help', help: 'If and when to display the help text (use templates to control the when part)', prop: props.help,form: form, dflt: '<%= pagesMeta.number < 3 %>'}),
                props.help()
                    ? textInput({label:'helpText',  help: 'The instruction text for using this type of question', prop: props.helpText,form: form, isArea: true})
                    : ''
            ]); 
        }
    };

    var  snippetRunner = function (component) { return function (observer) { return function () {
        var output = m.prop();
        messages
            .custom({
                preventEnterSubmits: true,
                content: m.component(component, {output: output, close: close}),
                wide: true
            })
            .then(function (isOk) { return isOk && observer.trigger('paste', print(clearUnused(output()))); });

        function close(value) {return function () { return messages.close(value); };}
    }; }; };

    var taskSnippet = snippetRunner(taskComponent);
    var pageSnippet = snippetRunner(pageComponent);
    var questSnippet = snippetRunner(questComponent);

    function clearUnused(obj){
        return Object.keys(obj).reduce(function (result, key) {
            var value = obj[key];
            if (typeof value === 'function' && value.toJSON) value = value();
            
            // check if is empty
            if (value === '' || value === undefined) return result;
            if (Array.isArray(value) && !value.length) return result;

            result[key] = value;
            return result;
        }, {});
    }

    var amdReg = /(?:define\(\[['"])(.*?)(?=['"])/;

    var textMenuView = function (ref) {
        var mode = ref.mode;
        var file = ref.file;
        var study = ref.study;
        var observer = ref.observer;

        var setMode = function (value) { return function () { return mode(value); }; };
        var modeClass = function (value) { return mode() === value ? 'active' : ''; };
        var isJs = file.type === 'js';
        var hasChanged = file.hasChanged();
        var isExpt = /\.expt\.xml$/.test(file.path);
        var isHtml = ['html', 'htm', 'jst', 'ejs'].includes(file.type);
        var amdMatch = amdReg.exec(file.content());
        var APItype = amdMatch && amdMatch[1];
        var launchUrl = "https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=" + (file.url.replace(/^.*?\/implicit/, '')) + "&refresh=true";

        return m('.btn-toolbar.editor-menu', [
            m('.file-name', {class: file.hasChanged() ? 'text-danger' : ''},
                m('span',{class: file.hasChanged() ? '' : 'invisible'}, '*'),
                file.path
            ),

            m('.btn-group.btn-group-sm.pull-xs-right', [
                m('button.btn.btn-secondary', {onclick: resetFile(file), title:'Reset any chnages made to this file since the last change'},[
                    m('strong.fa.fa-refresh')
                ]),
                m('a.btn.btn-secondary', {onclick: function (){ return observer.trigger('settings'); }, title:'Editor settings'},[
                    m('strong.fa.fa-cog')
                ])
            ]),

            m('.btn-group.btn-group-sm.pull-xs-right', [
                m('a.btn.btn-secondary', {href: "http://projectimplicit.github.io/PIquest/0.0/basics/overview.html", target: '_blank', title:'API documentation'},[
                    m('strong.fa.fa-book'),
                    m('strong', ' Docs')
                ]),
                m('a.btn.btn-secondary', {href: "https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts", target: '_blank', title:'Editor help'},[
                    m('strong.fa.fa-info')
                ])
            ]),

            !isJs ? '' : m('.btn-group.btn-group-sm.pull-xs-right', [
                m('a.btn.btn-secondary', {onclick: setMode('edit'), class: modeClass('edit')},[
                    m('strong', study.isReadonly ? 'View' : 'Edit')
                ]),
                m('a.btn.btn-secondary', {onclick: setMode('syntax'), class: modeClass('syntax')},[
                    m('strong',
                        'Syntax ',
                        file.syntaxValid
                            ? m('i.fa.fa-check-square.text-success')
                            : m('span.label.label-danger', file.syntaxData.errors.length)
                    )
                ])
                //m('a.btn.btn-secondary', {onclick: setMode('validator'), class: modeClass('validator')},[
                //  m('strong','Validator')
                //])
            ]),
            study.isReadonly ? '' : m('.btn-group.btn-group-sm.pull-xs-right', [
                APItype !== 'managerAPI' ? '' : [
                    m('a.btn.btn-secondary', {onclick: taskSnippet(observer), title: 'Add task element'}, [
                        m('strong','T') 
                    ])
                ],
                APItype !== 'questAPI' ? '' : [
                    m('a.btn.btn-secondary', {onclick: questSnippet(observer), title: 'Add question element'}, [
                        m('strong','Q') 
                    ]),
                    m('a.btn.btn-secondary', {onclick: pageSnippet(observer), title: 'Add page element'}, [
                        m('strong','P') 
                    ])
                ],
                m('a.btn.btn-secondary', {onclick:function () { return observer.trigger('paste', '{\n<%= %>\n}'); }, title:'Paste a template wizard'},[
                    m('strong.fa.fa-percent')
                ])
            ]),
            m('.btn-group.btn-group-sm.pull-xs-right', [
                !isJs ? '' :  m('a.btn.btn-secondary', {onclick: play(file,study), title:'Play this task'},[
                    m('strong.fa.fa-play')
                ]),

                !isExpt ? '' :  [
                    m('a.btn.btn-secondary', {href: launchUrl, target: '_blank', title:'Play this task'},[
                        m('strong.fa.fa-play')
                    ]),
                    m('a.btn.btn-secondary', {onmousedown: copyUrl(launchUrl), title:'Copy Launch URL'},[
                        m('strong.fa.fa-link')
                    ])
                ],

                !isHtml ? '' :  m('a.btn.btn-secondary', {href: file.url, target: '_blank', title:'View this file'},[
                    m('strong.fa.fa-eye')
                ]),

                m('a.btn.btn-secondary', {onclick: hasChanged && save$1(file), title:'Save (ctrl+s)',class: classNames({'btn-danger-outline' : hasChanged, 'disabled': !hasChanged || study.isReadonly})},[
                    m('strong.fa.fa-save')
                ])
            ])
        ]);
    };

    var textEditor = function (args) { return m.component(textEditorComponent, args); };

    var textEditorComponent = {
        controller: function(ref){
            var file = ref.file;

            var err = m.prop();
            file.loaded || file.get()
                .catch(err)
                .then(m.redraw);

            var ctrl = {mode:m.prop('edit'), observer: observer(), err: err};

            return ctrl;
        },

        view: function(ctrl, ref){
            var file = ref.file;
            var study = ref.study;

            var observer = ctrl.observer;
            var err = ctrl.err;
            var mode = ctrl.mode;

            if (!file.loaded) return m('.loader');

            if (file.error) return m('div', {class:'alert alert-danger'}, [
                m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
                ("The file \"" + (file.path) + "\" was not found (" + (err() ? err().message : 'please try to refresh the page') + ").")
            ]);

            return m('.editor', [
                textMenuView({mode: mode, file: file, study: study, observer: observer}),
                textContent(ctrl, {key: file.id, file: file,observer: observer, study: study})
            ]);
        }
    };

    var textContent = function (ctrl, ref) {
        var file = ref.file;
        var study = ref.study;
        var observer = ref.observer;

        var textMode = modeMap[file.type] || 'javascript';
        switch (ctrl.mode()){
            case 'edit' : return ace({
                content:file.content,
                observer: observer,
                settings: {
                    onSave: save$1(file), 
                    mode: textMode,
                    jshintOptions: jshintOptions,
                    isReadonly: study.isReadonly,
                    undoManager: file.undoManager,
                    position: file.position
                }
            });
            case 'validator': return validate({file: file});
            case 'syntax': return syntax({file: file});
        }
    };

    var modeMap = {
        js: 'javascript',
        json: 'json',
        jsp: 'jsp',
        jst: 'ejs',
        html: 'ejs',
        htm: 'ejs',
        txt: 'ejs',
        m: 'ejs',
        c: 'ejs',
        cs: 'ejs',
        h: 'ejs',
        py: 'ejs',
        xml: 'xml'
    };

    var tabsComponent = {
        controller: function(tabs){
            var tab = Object.keys(tabs)[0];
            var subTabs = null;
            var currSubTab = null;
            return {tab: tab, subTabs: subTabs, currSubTab: currSubTab};
        },
        view:
            function(ctrl, tabs, settings, defaultSettings, external, notifications,
                is_locked, is_settings_changed, show_do_save){
                if ( external === void 0 ) external = false;

                return m('.container-fluid',[
                    m('.row',[
                        m('.col-md-11',
                            m('.tab',
                                Object.keys(tabs).map(function(tab){
                                    if (!external && (tab === 'output' || tab === 'import'))
                                        return;
                                    if (tab === 'practice' && !settings.parameters.practiceBlock)
                                        return;
                                    if (tab === 'exampleBlock' && !settings.parameters.exampleBlock)
                                        return;
                                    return m('button.tablinks', {
                                        class: ctrl.tab === tab ? 'active' : '',
                                        onclick:function(){
                                            ctrl.tab = tab;
                                            !tabs[tab].subTabs ? ''
                                                : ctrl.currSubTab = Object.keys(tabs[tab].subTabs)[0];
                                        }}, tabs[tab].text);}))
                        ),
                        m('.col-md-1-text-center',
                            !external ?
                                is_locked() ? '' :
                                    m('button.btn btn btn-primary', {
                                        id:'save_button',
                                        title: !is_settings_changed() ? 'No changes were made'
                                            : 'Update the script file (the .js file).\nThis will override the current script file.',
                                        disabled: !is_settings_changed(),
                                        onclick: function () { return show_do_save(); },
                                    }, 'Save')
                                : m('a.btn btn-info btn-lg',{
                                    href:'https://minnojs.github.io/minno-server/implicitMeasures/',
                                    role:'button',
                                    title:'Main Page'}
                                ,m('i.fa.fa-home'))
                        )
                    ]),
                    !tabs[ctrl.tab].subTabs ? '' :
                        m('.row.space',[
                            m('.col-md-11',[
                                m('.subtab',
                                    Object.keys(tabs[ctrl.tab].subTabs).map(function(subTab){
                                        return m('button',{
                                            class: ctrl.currSubTab === subTab ? 'active' : '',
                                            onclick:function(){
                                                ctrl.currSubTab = subTab;
                                            }} ,tabs[ctrl.tab].subTabs[subTab].text);
                                    }))
                            ])
                        ]),
                    m('.row',[
                        external ? '' : m('div', notifications.view()),
                        m('.col-sm-11',{key:tabs[ctrl.tab]},
                            m.component(tabs[ctrl.tab].component, settings, defaultSettings, tabs[ctrl.tab].rowsDesc, tabs[ctrl.tab].type, ctrl.currSubTab))
                    ])
                ]);}
    };

    function defaultSettings$5(external) {
        return {
            parameters: {
                isTouch: false, isQualtrics: false, leftKey: 'E', rightKey: 'I', fullscreen: false, showDebriefing: false,
                remindError: true, errorCorrection: true,
                base_url: {image: external ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/docs/images/' : './images'}
            },
            category1: {
                name: 'Black people',
                title: {media: {word: 'Black people'}, css: {color: '#336600', 'font-size': '1.8em'}, height: 4},
                stimulusMedia: [{word: 'Tayron'}, {word: 'Malik'}, {word: 'Terrell'}, {word: 'Jazamin'}, {word: 'Tiara'}, {word: 'Shanice'}],
                stimulusCss: {color: '#336600', 'font-size': '1.8em'}
            },
            category2: {
                name: 'White people',
                title: {media: {word: 'White people'}, css: {color: '#336600', 'font-size': '1.8em'}, height: 4},
                stimulusMedia: [{word: 'Jake'}, {word: 'Conor'}, {word: 'Bradley'}, {word: 'Allison'}, {word: 'Emma'}, {word: 'Emily'}],
                stimulusCss: {color: '#336600', 'font-size': '1.8em'}
            },
            attribute1: {
                name: 'Bad Words',
                title: {media: {word: 'Bad Words'}, css: {color: '#0000FF', 'font-size': '1.8em'}, height: 4},
                stimulusMedia: [{word: 'Awful'}, {word: 'Failure'}, {word: 'Agony'}, {word: 'Hurt'}, {word: 'Horrible'}, {word: 'Terrible'}
                    , {word: 'Nasty'}, {word: 'Evil'}],
                stimulusCss: {color: '#0000FF', 'font-size': '2.3em'}
            },
            attribute2: {
                name: 'Good Words',
                title: {media: {word: 'Good Words'}, css: {color: '#0000FF', 'font-size': '1.8em'}, height: 4},
                stimulusMedia: [{word: 'Laughter'}, {word: 'Happy'}, {word: 'Glorious'}, {word: 'Joy'}, {word: 'Wonderful'}, {word: 'Peace'}
                    , {word: 'Pleasure'}, {word: 'Love'}],
                stimulusCss: {color: '#0000FF', 'font-size': '2.3em'}
            },
            blocks: {
                blockCategories_nTrials: 20,
                blockCategories_nMiniBlocks: 5,
                blockAttributes_nTrials: 20,
                blockAttributes_nMiniBlocks: 5,
                blockFirstCombined_nTrials: 20,
                blockFirstCombined_nMiniBlocks: 5,
                blockSecondCombined_nTrials: 40,
                blockSecondCombined_nMiniBlocks: 10,
                blockSwitch_nTrials: 28,
                blockSwitch_nMiniBlocks: 7,
                randomBlockOrder: true,
                randomAttSide: false
            },
            text: {
                remindErrorText : '<p align="center" style="font-size:1em; font-family:arial; color:#000000">'+ 'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' + 'Press the other key to continue.<p/>',
                leftKeyText: 'Press "E" for ',
                rightKeyText: 'Press "I" for',
                orText: 'or',
                instAttributePractice: '<div><p  style="font-size:20px;font-family:arial serif;text-align:center;">' + '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' + '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' + 'Put a left finger on the <b>E</b> key for items that belong to the category <font-color="#0000ff">leftAttribute.</font>' + '<br/>Put a right finger on the <b>I</b> key for items that belong to the category <font-color="#0000ff">rightAttribute</font>.<br/><br/>' + 'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' + 'Press the other key to continue.<br/>' + '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' + '<p style="text-align:center;">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
                instCategoriesPractice: '<div><p style="font-size:20px; font-family:arial serif;text-align:center;">' + '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' + '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' + 'Put a left finger on the <b>E</b> key for items that belong to the category <font-color="#336600">leftCategory</font>. ' + '<br/>Put a right finger on the <b>I</b> key for items that belong to the category <font-color="#336600">rightCategory</font>.<br/>' + 'Items will appear one at a time.<br/><br/>' + 'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' + 'Press the other key to continue.<br/>' + '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' + '<p style="text-align:center;">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
                instFirstCombined: '<div><p style="font-size:20px; font-family:arial serif;text-align:center;">' + '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' + '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' + 'Use the <b>E</b> key for <font-color="#336600">leftCategory</font> and for <font-color="#0000ff">leftAttribute</font>.<br/>' + 'Use the <b>I</b> key for <font-color="#336600">rightCategory</font> and for  <font-color="#0000ff">rightAttribute</font>.<br/>' + 'Each item belongs to only one category.<br/><br/>' + 'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' + 'Press the other key to continue.<br/>' + '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' + '<p style="text-align:center;">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
                instSecondCombined: '<div><p style="font-size:20px; font-family:arial serif;text-align:center;">' + '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' + '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' + 'This is the same as the previous part.<br/>' + 'Use the <b>E</b> key for <font-color="#336600">leftCategory</font> and for <font-color="#0000ff">leftAttribute</font>.<br/>' + 'Use the <b>I</b> key for <font-color="#336600">rightCategory</font> and for  <font-color="#0000ff">rightAttribute</font>.<br/>' + 'Each item belongs to only one category.<br/><br/>' + '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' + '<p style="text-align:center;">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
                instSwitchCategories: '<div><p style="font-size:20px; font-family:arial serif;text-align:center;">' + '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' + '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' + '<b>Watch out, the labels have changed position!</b><br/>' + 'Put the left finger on the <b>E</b> key for <font-color="#336600">leftCategory</font>.<br/>' + 'Put the right finger on the <b>I</b> key for <font-color="#336600">rightCategory</font>.<br/><br/>' + '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' + '<p style="text-align:center;">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
                preDebriefingText: 'Press space to continue to your feedback '
            },
            touch_text: {
                remindErrorTextTouch: '<p style="font-size:1.4em;font-family:arial serif">' + 'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' + 'Touch the other side to continue.<p/>',
                instAttributePracticeTouch: '<div><p style="font-size:20px; font-family:arial serif;text-align:center;">' + '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' + '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' + 'Put a left finger over the <b>left</b> green area for items that belong to the category <font-color="#0000ff">leftAttribute.</font>' + '<br/>Put a right finger over the <b>right</b> green area for items that belong to the category <font-color="#0000ff">rightAttribute</font>.<br/><br/>' + 'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' + 'Touch the other side to continue.<br/>' + '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' + '<p style="text-align:center;">Touch the <b>green area</b> when you are ready to start.</font></p></div>',
                instCategoriesPracticeTouch: '<div><p style="font-size:20px; font-family:arial serif;text-align:center;">' + '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' + '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' + 'Put a left finger over the <b>left</b> green area for items that belong to the category <font-color="#0000ff">leftCategory.</font>' + '<br/>Put a right finger over the <b>right</b> green area for items that belong to the category <font-color="#0000ff">rightCategory</font>.<br/><br/>' + 'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' + 'Touch the other side to continue.<br/>' + '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' + '<p style="text-align:center;">Touch the <b>green area</b> when you are ready to start.</font></p></div>',
                instFirstCombinedTouch: '<div><p style="font-size:20px; font-family:arial serif;text-align:center;">' + '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' + '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' + 'Put a left finger over the <b>left</b> green area for items that belong to the category <font-color="#0000ff">leftCategory.</font>' + '<br/>Put a right finger over the <b>right</b> green area for items that belong to the category <font-color="#0000ff">rightCategory</font>.<br/><br/>' + 'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' + 'Touch the other side to continue.<br/>' + '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' + '<p style="text-align:center;">Touch the <b>green area</b> when you are ready to start.</font></p></div>',
                instSecondCombinedTouch: '<div><p style="font-size:20px; font-family:arial serif;text-align:center;">' + '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' + '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' + 'Put a left finger over the <b>left</b> green area for items that belong to the category <font-color="#0000ff">leftCategory.</font>' + '<br/>Put a right finger over the <b>right</b> green area for items that belong to the category <font-color="#0000ff">rightCategory</font>.<br/><br/>' + 'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' + 'Touch the other side to continue.<br/>' + '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' + '<p style="text-align:center;">Touch the <b>green area</b> when you are ready to start.</font></p></div>',
                instSwitchCategoriesTouch: '<div><p style="font-size:20px; font-family:arial serif;text-align:center;">' + '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' + '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial"><br/>' + 'Watch out, the labels have changed position!<br/>' + 'Put a left finger over the <b>left</b> green area for items that belong to the category <font-color="#0000ff">leftCategory.</font>' + '<br/>Put a right finger over the <b>right</b> green area for items that belong to the category <font-color="#0000ff">rightCategory</font>.<br/><br/>' + 'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' + 'Touch the other side to continue.<br/>' + '<u>Go as fast as you can</u> while being accurate.<br/><br/></p>' + '<p style="text-align:center;">Touch the <b>green area</b> when you are ready to start.</font></p></div>',
                preDebriefingTouchText: 'Touch the bottom green area to continue to the next task.'
            }
        };
    }

    function clone(obj){
        return JSON.parse(JSON.stringify(obj));
    }

    function resetClearButtons(reset, clear, curr_tab, isBiat){
        if ( curr_tab === void 0 ) curr_tab = null;
        if ( isBiat === void 0 ) isBiat = false;

        var showReset = !(isBiat && curr_tab > 1); //if the condition holds, don't show the reset button
        return m('.pull-xs-right',[
            m('.btn-group btn-group-toggle',[
                !showReset ? '' :
                    m('button.btn btn btn-secondary',
                        {title:'Reset all current fields to default values',
                            onclick: function () { return reset(curr_tab); }},
                        m('i.fa.fa-undo.fa-sm'), ' Reset'),
                m('button.btn btn btn-danger',
                    {title:'Clears all current values',onclick:function () { return clear(curr_tab); }},
                    m('i.fa.fa-trash.fa-sm'), ' Clear'),
            ])
        ]);
    }

    function pageHeadLine(task){
        return m('h1.display-4', 'Create my '+task+' script');
    }

    function checkMissingElementName(element, name_to_display, error_msg){
        var containsImage = false;
        //check for missing titles and names
        if(element.name.length === 0)
            error_msg.push(name_to_display+'\'s name is missing');

        if(element.title.media.image !== undefined){
            containsImage = true;
            if(element.title.media.image.length === 0)
                error_msg.push(name_to_display+'\'s title is missing');
        }
        else {
            if(element.title.media.word.length === 0)
                error_msg.push(name_to_display+'\'s title is missing');
        }
        var stimulusMedia = element.stimulusMedia;

        //if there an empty stimuli list
        if (stimulusMedia.length === 0)
            error_msg.push(name_to_display+'\'s stimuli list is empty, please enter at least one stimulus.');

        //check if the stimuli contains images
        for(var i = 0; i < stimulusMedia.length ;i++)
            if(stimulusMedia[i].image) containsImage = true;

        if(element.title.startStimulus) //for biat only, checking if startStimulus contains image
            element.title.startStimulus.media.image ? containsImage = true : '';

        return containsImage;
    }

    function checkPrime(element, name_to_display, error_msg){
        var containsImage = false;
        //check for missing titles and names
        if(element.name !== undefined) {
            if (element.name.length === 0)
                error_msg.push(name_to_display + ' name for logging is missing');
        }
        //In AMP, prime and target has additional fields
        if(element.nameForFeedback !== undefined){
            if(element.nameForFeedback.length === 0)
                error_msg.push(name_to_display+' name for feedback is missing');
        }
        if(element.nameForLogging !== undefined){
            if(element.nameForLogging.length === 0)
                error_msg.push(name_to_display+' name for logging is missing');
        }

        var mediaArray = element.mediaArray;

        //if there an empty stimuli list
        if (mediaArray.length === 0)
            error_msg.push(name_to_display+' stimuli list is empty, please enter at least one stimulus.');

        //check if the stimuli contains images
        for(var i = 0; i < mediaArray.length ;i++)
            if(mediaArray[i].image) containsImage = true;

        return containsImage;
    }
    function checkStimulus(element, name_to_display, type, error_msg) {
        if(element.media[type].length === 0){
            error_msg.push(name_to_display+' is missing.');
        }
    }
    function showClearOrReset(element, value, action){
        var msg_text = {
            'reset':{text:'This will delete all current properties and reset them to default values.',title:'Reset?'},
            'clear':{text: 'This will delete all current properties.', title: 'Clear?'}
        };
        return messages.confirm({header: msg_text[action].title, content:
                m('strong', msg_text[action].text)})
            .then(function (response) {
                if (response) {
                    Object.assign(element, clone(value));
                    m.redraw();
                }
            }).catch(function (error) { return messages.alert({header: msg_text[action].title , content: m('p.alert.alert-danger', error.message)}); })
            .then(m.redraw());
    }

    function showRestrictions(type, text, title){
        if ( title === void 0 ) title = '';

        if(type === 'error')
            messages.alert({header: title , content: m('p.alert.alert-danger', text)});
        if(type === 'info') messages.alert({header: title , content: m('p.alert.alert-info', text)});
    }

    var printFlag = m.prop(false);
    function viewOutput(ctrl, settings, toString){
        return m('.space',[
            !ctrl.error_msg.length ? '' :
                m('.alert alert-danger', [
                    m('strong','Some problems were found in your script, it\'s recommended to fix them before proceeding to download:'),
                    m('ul',[
                        ctrl.error_msg.map(function(err){
                            return m('li',err);
                        })
                    ])
                ]),
            m('.row',
                m('.col-md-8.offset-sm-3',
                    m('.btn-group', [
                        m('button.btn btn btn-success', {
                            onclick: ctrl.createFile(settings,'JS'),
                            title:'Download the JavaScript file. For more details how to use it, see the “Help” page.'}, [m('i.fa.fa-download'), ' Download Script']),
                        m('button.btn btn btn-success', {
                            onclick: ctrl.createFile(settings,'JSON'),
                            title:'Importing this file to this tool, will load all your parameters to this tool.'}, [m('i.fa.fa-download'), ' Download JSON']),
                        m('button.btn btn btn-light', {
                            onclick: function () { return printFlag(true); }}, [m('i.fa.fa-file'), ' Print to Browser'])
                    ])
                )),
            !printFlag() ? '' :
                m('.row.space',
                    m('.col-md-10.offset-sm-1',
                        m('textarea.form-control', {value: toString(settings), rows:20})
                    ))
        ]);
    }

    function viewImport(ctrl){
        return m('.row.centrify.space',[
            m('.col-sm-4',
                m('.card.border-info', [
                    m('.card-header',m('strong','Upload a JSON file: ')),
                    m('card-body.text-info',[
                        m('.col-sm-12',
                            m('p.space','If you saved a JSON file from a previous session, you can upload that file here to edit the parameters.')
                        ),
                        m('input[type=file].form-control',{id:'uploadFile', onchange: ctrl.handleFile})
                    ])
                ])
            )]
        );
    }

    function editStimulusObject(fieldName, get, set){ //used in parameters component
        return m('.col-sm-4.col-lg-4',[
            m('.row',[
                m('.col-sm-4', m('span' ,'Font\'s color: ')),
                m('.col-sm-4', m('input[type=color].form-control', {value: get(fieldName,'css','color'), onchange:m.withAttr('value', set(fieldName,'css','color'))}))
            ]),
            m('.row.space',[
                m('.col-sm-4', m('span', 'Font\'s size:')),
                m('.col-sm-4', m('input[type=number].form-control', {placeholder:'0', value:get(fieldName,'css','font-size') ,min: '0' ,onchange:m.withAttr('value', set(fieldName,'css','font-size'))}))
            ]),
            m('.row.space',[
                m('.col-sm-4',
                    m('span', 'Stimulus: ')),
                m('.col-sm-7',
                    !fieldName.toLowerCase().includes('maskstimulus')
                        ? m('input[type=text].form-control', {value:get(fieldName,'media','word') ,oninput:m.withAttr('value', set(fieldName,'media','word'))})
                        : m('input[type=text].form-control', {value:get(fieldName,'media','image') ,oninput:m.withAttr('value', set(fieldName,'media','image'))})
                )
            ])
        ]);
    }

    var parametersComponent$1 = {
        controller:controller$u,
        view:view$u
    };

    function controller$u(settings, defaultSettings, rows) {
        var parameters = settings.parameters;
        var external = settings.external;
        var qualtricsParameters = ['leftKey', 'rightKey', 'fullscreen', 'showDebriefing'];

        //There is versions to the image url description so- I added a special base url description
        var baseURLDesc =  'If your task has any images, enter here the path to that images folder.' +
            '\nIt can be a full url, or a relative URL to the folder that will host this script.';
        if (!settings.external)
            baseURLDesc+='\nThe default value reflects the assumption that your images are under an \'images\' folder under this study.';

        return {reset: reset, clear: clear, set: set, get: get, rows: rows, qualtricsParameters: qualtricsParameters, external: external, baseURLDesc: baseURLDesc};

        function reset(){showClearOrReset(parameters, defaultSettings.parameters, 'reset');}
        function clear(){showClearOrReset(parameters, rows.slice(-1)[0], 'clear');}

        function get(name, object, parameter) {
            if (name === 'base_url')
                return parameters[name][object];
            if (name === 'isTouch')
                if (parameters[name] === true) return 'Touch';
                else return 'Keyboard';
            if (name === 'isQualtrics')
                if (parameters[name] === true) {
                    return 'Qualtrics';
                } else return 'Regular';
            if (object && parameter) {
                if (parameter === 'font-size')
                    return parseFloat((parameters[name][object][parameter].replace('em', '')));
                return parameters[name][object][parameter];
            }
            return parameters[name];
        }

        function set(name, object, parameter) {
            return function (value) {
                if (name === 'base_url')
                    return parameters[name][object] = value;
                if (name === 'isTouch')
                    if (value === 'Keyboard') return parameters[name] = false;
                    else return parameters[name] = true;
                if (name === 'isQualtrics')
                    if (value === 'Regular') return parameters[name] = false;
                    else return parameters[name] = true;
                if (name.includes('Duration')) return parameters[name] = Math.abs(value);
                if (object && parameter) {
                    if (parameter === 'font-size') {
                        value = Math.abs(value);
                        if (value === 0) {
                            showRestrictions('error', 'Font\'s size must be bigger than 0.', 'Error');
                            return parameters[name][object][parameter];
                        }
                        return parameters[name][object][parameter] = value + 'em';
                    }
                    return parameters[name][object][parameter] = value;
                }
                return parameters[name] = value;
            };
        }

    }

    function view$u(ctrl, settings){
        return m('.space' ,[
            ctrl.rows.slice(0,-1).map(function (row) {
                if(!ctrl.external && row.name === 'isQualtrics') return;
                if((ctrl.qualtricsParameters.includes(row.name)) && ctrl.get('isQualtrics') === 'Regular') return;
                if(settings.parameters.isTouch && row.name.toLowerCase().includes('key')) return;
                if(settings.parameters.responses === '7' && row.name.toLowerCase().includes('key')) return;
                return m('.row.line', [
                    m('.col-md-4',
                        row.desc || row.name === 'base_url' ?
                            [
                                m('span', [' ', row.label, ' ']),
                                m('i.fa.fa-info-circle.text-muted',{title: row.name === 'base_url' ? ctrl.baseURLDesc : row.desc})
                            ]
                            : m('span', [' ', row.label])
                    ),
                    row.name === ('base_url') ?
                        m('.col-md-6',
                            m('input[type=text].form-control', {value:ctrl.get('base_url','image'), oninput: m.withAttr('value', ctrl.set(row.name, 'image'))}))
                        : row.name.toLowerCase().includes('key') ? //case of keys parameters
                            m('.col-md-6.col-lg-1',
                                m('input[type=text].form-control',{value:ctrl.get(row.name), oninput:m.withAttr('value', ctrl.set(row.name))}))
                            : (row.name === 'fixationStimulus') ||  (row.name === 'deadlineStimulus' || row.name === 'maskStimulus') ?
                                editStimulusObject(row.name, ctrl.get, ctrl.set)
                                : m('.col-md-4.col-lg-2',
                                    row.options ? //case of isTouch and isQualtrics
                                        m('select.form-control',{value: ctrl.get(row.name), onchange:m.withAttr('value',ctrl.set(row.name)), style: {width: '8.3rem', height:'2.8rem'}},[
                                            row.options.map(function(option){return m('option', option);})])
                                        : row.name.includes('Duration') ? //case of duration parameter
                                            m('input[type=number].form-control',{placeholder:'0', min:0, value:ctrl.get(row.name), onchange:m.withAttr('value', ctrl.set(row.name))})
                                            : (row.name === 'sortingLabel1' || row.name === 'sortingLabel2' || row.name === 'targetCat') ?
                                                m('input[type=text].form-control', {value:ctrl.get(row.name) ,oninput:m.withAttr('value', ctrl.set(row.name))})
                                                : m('input[type=checkbox]', {onclick: m.withAttr('checked', ctrl.set(row.name)), checked: ctrl.get(row.name)})
                                )
                ]);
            }), resetClearButtons(ctrl.reset, ctrl.clear)
        ]);
    }

    var iatOutputComponent$1 = {
        controller: controller$t,
        view: view$t
    };

    function controller$t(settings, defaultSettings, blocksObject){
        var error_msg = [];
        error_msg = validityCheck$5(error_msg, settings, blocksObject);

        return {error_msg: error_msg, createFile: createFile, settings: settings};

        function createFile(settings, fileType){
            return function(){
                var output,textFileAsBlob;
                var downloadLink = document.createElement('a');
                if (fileType === 'JS') {
                    output = toString$5(settings);
                    textFileAsBlob = new Blob([output], {type:'text/plain'});
                    downloadLink.download = 'IAT.js'; }
                else {
                    output = updateSettings$b(settings);
                    textFileAsBlob = new Blob([JSON.stringify(output,null,4)], {type : 'application/json'});
                    downloadLink.download = 'IAT.json'; }
                if (window.webkitURL) {downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);}
                else {
                    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                    downloadLink.style.display = 'none';
                    document.body.appendChild(downloadLink);
                }
                downloadLink.click();
            };
        }
    }

    function validityCheck$5(error_msg, settings, blocksObject){
        var containsImage;
        var temp1 = checkMissingElementName(settings.category1, 'First Category', error_msg);
        var temp2 = checkMissingElementName(settings.category2, 'Second Category', error_msg);
        var temp3 = checkMissingElementName(settings.attribute1, 'First Attribute', error_msg);
        var temp4 = checkMissingElementName(settings.attribute2, 'Second Attribute', error_msg);

        temp1 || temp2 || temp3 || temp4 ? containsImage = true : containsImage = false;

        if(settings.parameters.base_url.image.length === 0 && containsImage)
            error_msg.push('Image\'s url is missing and there is an image in the study');

        //check for blocks problems
        var currBlocks = clone(settings.blocks);
        var clearBlocks = blocksObject.slice(-1)[0]; //blocks parameters with zeros as the values, used to check if the current parameters are also zeros.

        ['randomBlockOrder', 'randomAttSide'].forEach(function(key){ //remove those parameters for the comparison
            delete currBlocks[key];
            delete clearBlocks[key];
        });

        if(JSON.stringify(currBlocks) === JSON.stringify(clearBlocks))
            error_msg.push('All the block\'s parameters equals to 0, that will result in not showing the task at all');
        blocksObject.slice(0,-1).map(function(block){
            if(settings.blocks[block.numTrialBlocks] !== 0 && settings.blocks[block.numMiniBlocks] === 0)
                error_msg.push(block.label+'\'s number of trials is '+settings.blocks[block.numTrialBlocks]+' and the number of mini blocks is set as 0. If you wish to skip this block, set both of those parameters to 0.');
        });
        return error_msg;
    }

    function toString$5(settings, external){
        return toScript$5(updateSettings$b(settings), external);
    }

    function updateSettings$b(settings){
        var output={
            category1: settings.category1,
            category2: settings.category2,
            attribute1: settings.attribute1,
            attribute2: settings.attribute2,
            base_url: settings.parameters.base_url,
            remindError: settings.parameters.remindError,
            errorCorrection: settings.parameters.errorCorrection,
            isTouch: settings.parameters.isTouch
        };
        if(settings.parameters.isQualtrics){
            output.isQualtrics=settings.parameters.isQualtrics;
            output.showDebriefing=settings.parameters.showDebriefing;
            output.fullscreen=settings.parameters.fullscreen;

            if(!settings.parameters.isTouch){
                output.leftKey = settings.parameters.leftKey;
                output.rightKey = settings.parameters.rightKey;
            }
        }
        Object.assign(output, settings.blocks);
        settings.parameters.isTouch ? Object.assign(output, settings.touch_text) : Object.assign(output, settings.text);
        return output;
    }

    function toScript$5(output, external){
        var textForInternal = '//Note: This script was created by the IAT wizard.\n//Modification of this file won\'t be reflected in the wizard.\n';
        var script = "define(['pipAPI' ,'" + (output.isQualtrics ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/IAT/qualtrics/quiat10.js': 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/IAT/iat9.js') + "'], function(APIConstructor, iatExtension){\n\tvar API = new APIConstructor(); return iatExtension(" + (JSON.stringify(output,null,4)) + ");});";
        external === false ? script = textForInternal + script : '';
        return script;
    }

    function view$t(ctrl,settings){
        return viewOutput(ctrl, settings, toString$5);
    }

    var textComponent = {
        controller:controller$s,
        view:view$s
    };

    function controller$s(settings, defaultSettings, rows){
        var isTouch = settings.parameters.isTouch;
        var isQualtrics = settings.parameters.isQualtrics;
        var textparameters;
        isTouch ? textparameters = settings.touch_text : textparameters = settings.text;
        //for AMP
        var isSeven = settings.parameters.responses;
        if(isSeven == 7) {
            textparameters = settings.text_seven;
            isSeven = true;
        }
        else if(isSeven == 2){
            textparameters = settings.text;
            isSeven = false;
        }
        return {reset: reset, clear: clear, set: set, get: get, rows: rows.slice(0,-2), isTouch: isTouch, isQualtrics: isQualtrics, isSeven: isSeven};

        function reset(){
            var valueToSet = isTouch ? defaultSettings.touch_text
                : isSeven ?  defaultSettings.text_seven
                    : defaultSettings.text;
            showClearOrReset(textparameters, valueToSet, 'reset');
        }
        function clear(){
            var valueToSet = isTouch || isSeven ? rows.slice(-1)[0] :  rows.slice(-2)[0];
            showClearOrReset(textparameters, valueToSet, 'clear');
        }
        function get(name){return textparameters[name];}
        function set(name){return function(value){return textparameters[name] = value;};}
    }

    function view$s(ctrl){
        return m('.space' ,[
            ctrl.rows.map(function(row){
                //if touch parameter is chosen, don't show the irrelevant text parameters
                if (ctrl.isTouch === true && row.nameTouch === undefined)
                    return;
                if(ctrl.isQualtrics === false && row.name === 'preDebriefingText')
                    return;
                return m('.row.line',[
                    m('.col-md-4',
                        row.desc ?
                            [
                                m('span', [' ', row.label, ' ']),
                                m('i.fa.fa-info-circle.text-muted',{title:row.desc})
                            ]
                            : m('span', [' ', row.label])
                    ),
                    m('.col-md-8', [
                        m('textarea.form-control',{rows:5, value:ctrl.get(ctrl.isTouch ? row.nameTouch : ctrl.isSeven? row.nameSeven : row.name), oninput:m.withAttr('value', ctrl.set(ctrl.isTouch ? row.nameTouch : ctrl.isSeven ? row.nameSeven : row.name))})
                    ])
                ]);
            }), resetClearButtons(ctrl.reset, ctrl.clear)
        ]);
    }

    var iatBlocksComponent = {
        controller:controller$r,
        view:view$r
    };

    function controller$r(settings, defaultSettings, rows){
        var blocks = settings.blocks;
        return {reset: reset, clear: clear, set: set, get: get, rows: rows};

        function reset(){showClearOrReset(blocks, defaultSettings.blocks,'reset');}
        function clear(){showClearOrReset(blocks, rows.slice(-1)[0],'clear');}

        function get(name){ return blocks[name]; }
        function set(name, type){
            if (type === 'checkbox') return function(value){return blocks[name] = value; };
            return function(value) {return blocks[name] = Math.abs(Math.round(value));};
        }
    }

    function view$r(ctrl){
        return m('.col-12',[
            m('.row',[
                m('.col-md-8',
                    ctrl.rows.slice(0,-1).map(function(row) {
                        return m('.row.line', [
                            m('.col-sm-4.space',[
                                m('span', [' ', row.label, ' ']),
                                m('i.fa.fa-info-circle.text-muted',{
                                    title:row.desc
                                }),
                            ]),
                            m('.col-sm-8.space',
                                row.name ?  //case of randomBlockOrder & randomAttSide
                                    m('input[type=checkbox]', {onclick: m.withAttr('checked', ctrl.set(row.name,'checkbox')), checked: ctrl.get(row.name)})
                                    : [
                                        m('.row', [
                                            m('.col-sm-6', 'Number of trials: '),
                                            m('.col-sm-3', [
                                                m('input[type=number].form-control',{placeholder:'0', onchange: m.withAttr('value', ctrl.set(row.numTrialBlocks, 'number')), value: ctrl.get(row.numTrialBlocks), min:'0'})
                                            ])
                                        ]),
                                        m('.row.space',[
                                            m('.col-sm-6', 'Number of mini-blocks: '),
                                            m('.col-sm-3', [
                                                m('input[type=number].form-control',{placeholder:'0', onchange: m.withAttr('value', ctrl.set(row.numMiniBlocks, 'number')), value: ctrl.get(row.numMiniBlocks), min:'0'})
                                            ])
                                        ])
                                    ]
                            )
                        ]);
                    }
                    )),
                m('.col-md-4.double_space',
                    m('.alert.alert-info',[
                        m('h4','More information:'),
                        m('p','By default, we separate each block into mini-blocks of four trials. In Blocks 3, 4, 6, and 7, '+
                                        'exactly one item from each of the four groups (attributes and categories) appears in each mini-block. In Blocks 1, 2, and 5, '+
                                        'two trials of each group (category or attribute) will appear in each mini-block. Tony Greenwald recommended using that feature, '+
                                        'to avoid same-key runs, based on internal testing in his lab. In Project Implicit, our tests so far found no effect of this feature on the validity of any IAT.'+
                                        ' To cancel this feature, set Number of mini-blocks to 1, in each block.'),
                        m('hr'),
                        m('p','To cancel a block, set the number of trials to 0 (useful for 5-blocks IATs).')
                    ])
                )
            ]),
            m('.row',resetClearButtons(ctrl.reset, ctrl.clear))
        ]);
    }

    var elementComponent$2 = {
        controller:controller$q,
        view:view$q,
    };

    function controller$q(object, settings, stimuliList){
        var element = settings[object.key];
        var fields = {
            newStimulus : m.prop(''),
            elementType: m.prop(object.key.includes('attribute') ? 'Attribute' : 'Category'),
            titleType: m.prop(element.title.media.word === undefined ? 'image' : 'word'),
            titleHidden: m.prop(this.titleType === 'word'), //weather the category design flag will be visible
            selectedStimuli: m.prop(''),
            stimuliHidden: m.prop(true),
        }; 
        return {fields: fields, set: set, get: get, addStimulus: addStimulus, updateSelectedStimuli: updateSelectedStimuli,removeChosenStimuli: removeChosenStimuli, removeAllStimuli: removeAllStimuli,
            updateTitleType: updateTitleType, resetStimuliList: resetStimuliList};
        
        function get(name, media ,type){
            if (name === 'title' && media == null && type == null) { //special case - return the title's value (word/image)
                if (element.title.media.word === undefined) return element.title.media.image;
                return element.title.media.word;
            }
            if (media !=null && type!=null) {
                if (type === 'font-size') {
                    return parseFloat((element[name][media][type].replace('em','')));
                }
                return element[name][media][type];
            }
            else if (media ==='color') //case of stimulusCss
                return element[name][media];
            else if (media === 'font-size') return parseFloat((element[name][media]).substring(0,3));
            return element[name]; 
        }
        function set(name, media, type){
            return function(value){ 
                if (media !=null && type!=null) {
                    if (type === 'font-size') {
                        value = Math.abs(value);
                        if (value === 0) {
                            showRestrictions('error', 'Font\'s size must be bigger than 0', 'Error');
                            return element[name][media][type]; 
                        }
                        return element[name][media][type] = value + 'em';
                    }
                    return element[name][media][type] = value;
                }
                else if (media === 'color') return element[name][media] = value;
                else if (media === 'font-size') {
                    value = Math.abs(value);
                    if (value === 0) {
                        showRestrictions('error','Font\'s size must be bigger than 0', 'Error');
                        return element[name][media];
                    }
                    return element[name][media] = value + 'em';
                }
                return element[name] = value; 
            };
        }

        function updateTitleType() {
            return function (type) {
                fields.titleType(type);
                var object = element.title.media;
                var category = object.word !== undefined ? object.word : object.image;
                if (type === 'word') {
                    element.title.media = {};
                    element.title.media = {word: category};
                }
                else {
                    element.title.media = {};
                    element.title.media = {image: category};
                }
            };
        }
        function addStimulus(event){
            var new_stimuli = fields.newStimulus();
            event = event.target.id; //button name, to know the kind of the stimulus added
            element.stimulusMedia.push( (event === 'addWord') ? {word : new_stimuli} : {image : new_stimuli});
            fields.newStimulus(''); //reset the field               
        }
        function updateSelectedStimuli(select){
            var list = element.stimulusMedia.filter(function (val,i) { return select.target.options[i].selected; });
            fields.selectedStimuli(list);
        }

        function removeChosenStimuli() {
            element.stimulusMedia = element.stimulusMedia.filter(function (element){ return !fields.selectedStimuli().includes(element); });
            fields.selectedStimuli([]);
        }

        function removeAllStimuli() {element.stimulusMedia.length = 0;}
        function resetStimuliList() {element.stimulusMedia = clone(stimuliList);}
    }

    function view$q(ctrl) {
        return m('.space', [
            m('.row.line', [
                m('.col-sm-3',[
                    m('span', ctrl.fields.elementType()+' name logged in the data file '),
                    m('i.fa.fa-info-circle.text-muted',{title:'Will appear in the data and in the default feedback message.'})
                ]),
                m('.col-sm-3', m('input[type=text].form-control',{value:ctrl.get('name'), oninput: m.withAttr('value', ctrl.set('name'))})),
            ]),
            m('.row.line', [
                m('.col-sm-3',[
                    m('span', ctrl.fields.elementType()+' name presented in the task '),
                    m('i.fa.fa-info-circle.text-muted',{title:'Name of the ' +ctrl.fields.elementType()+' presented in the task'}),
                ]),
                m('.col-sm-3', [
                    m('input[type=text].form-control',{value: ctrl.get('title'), oninput:m.withAttr('value', ctrl.set('title', 'media', ctrl.fields.titleType()))}),
                ]),
                m('.col-sm-3',
                    m('.row',[
                        m('.col-sm-5',m('span', 'Category\'s Type:')),
                        m('.col-sm-7',[
                            m('select.custom-select',{value: ctrl.get('title','media','word') === undefined ? 'image' : 'word', onchange:m.withAttr('value',ctrl.updateTitleType())},[
                                ctrl.fields.titleType(ctrl.get('title','media','word') === undefined ? 'image' : 'word'),
                                ctrl.fields.titleHidden(ctrl.fields.titleType() === 'word'),
                                m('option', 'word'),
                                m('option', 'image')
                            ])
                        ])
                    ])
                ),
                !ctrl.fields.titleHidden() ? '' :
                    m('.col-sm-3',[
                        m('.row',[
                            m('.col-sm-5',[
                                m('span', 'Font\'s color:'),
                            ]),
                            m('.col-sm-6',[
                                m('input[type=color].form-control',{value: ctrl.get('title','css','color'), onchange:m.withAttr('value', ctrl.set('title','css','color'))})
                            ])
                        ]),
                        m('.row.space',[
                            m('.col-sm-5',[
                                m('span', 'Font\'s size:'),
                            ]),
                            m('.col-sm-6',[
                                m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('title','css','font-size') ,min: '0' ,onchange:m.withAttr('value', ctrl.set('title','css','font-size'))})
                            ])
                        ])
                    ])
            ]),
            m('.row',[
                m('.col-md-6',[
                    m('.row',
                        m('.col-md-6',
                            m('p.h4','Stimuli: ', m('i.fa.fa-info-circle.text-muted',{
                                title:'Enter text (word) or image name with its file extension (image).\nSet the path to the folder of images in the General Parameters page.'})
                            ))
                    ),
                    m('.row',
                        m('.col-md-7',
                            m('input[type=text].form-control', {placeholder:'Enter Stimulus content here', 'aria-label':'Enter Stimulus content', 'aria-describedby':'basic-addon2', value: ctrl.fields.newStimulus(), oninput: m.withAttr('value', ctrl.fields.newStimulus)}
                            ))
                    ),
                    m('.row',
                        m('.col-md-9',
                            m('.btn-group btn-group-toggle', [
                                m('button[type=button].btn btn-secondary',{disabled:!ctrl.fields.newStimulus().length, id:'addWord', onclick: function (e) { return ctrl.addStimulus(e); }},[
                                    m('i.fa.fa-plus'), 'Add Word'
                                ]),
                                m('button[type=button].btn btn-secondary', {disabled:!ctrl.fields.newStimulus().length, id:'addImage', onclick: function (e) { return ctrl.addStimulus(e); }},[
                                    m('i.fa.fa-plus'), 'Add Image'
                                ])
                            ])
                        )
                    ),
                    m('.row',[
                        m('.col-md-7',
                            m('select.form-control.scroll', {multiple : 'multiple', size : '8' ,onchange:function (e) { return ctrl.updateSelectedStimuli(e); }},[
                                ctrl.get('stimulusMedia').some(function (object) { return object.word; }) ? ctrl.fields.stimuliHidden(true) : ctrl.fields.stimuliHidden(false),
                                ctrl.get('stimulusMedia').map(function(object){
                                    var value = object.word ? object.word : object.image;
                                    var option = value + (object.word ? ' [Word]' : ' [Image]');
                                    return m('option', {value:value, selected : ctrl.fields.selectedStimuli().includes(object)}, option);
                                })
                            ])
                        ),
                        m('.col-md-5',
                            !ctrl.fields.stimuliHidden() ? '' :
                                [
                                    m('.row',
                                        m('.col-md-8',[
                                            m('u','Stimuli font\'s design:'),
                                        ])
                                    ),
                                    m('.row.space',
                                        m('.col-md-8',[
                                            m('label','Font\'s color: '),
                                            m('input[type=color].form-control', {value: ctrl.get('stimulusCss','color'), onchange: m.withAttr('value', ctrl.set('stimulusCss','color'))}),
                                        ])

                                    ),
                                    m('.row.space',
                                        m('.col-md-8',[

                                            m('label', 'Font\'s size:'),
                                            m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('stimulusCss','font-size') ,min: '0' ,onchange: m.withAttr('value', ctrl.set('stimulusCss','font-size'))})
                                        ])
                                    )
                                ]
                        )
                    ])
                ])
            ]),
            m('.row',
                m('.col-md-6.space',
                    m('.btn-group-vertical',[
                        m('button.btn btn btn-warning', {title:'To select multiple stimuli, please press the ctrl key while selecting the desired stimuli', disabled: !ctrl.fields.selectedStimuli().length, onclick: function () { return ctrl.removeChosenStimuli(); }},'Remove Chosen Stimuli'),
                        m('button.btn btn btn-warning', {onclick: function () { return ctrl.removeAllStimuli(); }},'Remove All Stimuli'),
                        m('button.btn btn btn-warning', {onclick: function () { return ctrl.resetStimuliList(); }},'Reset Stimuli List'),
                    ])
                )
            )
        ]);
    }

    var elementComponent$1 = {
        controller: controller$p,
        view: view$p,
    };

    function controller$p(object, settings,stimuliList, startStimulusList ,index){
        var element = settings[object.key];
        if (Array.isArray(element)) element = element[index]; //in case of 'categories' in BIAT
        var fields = {
            newStimulus : m.prop(''),
            elementType: m.prop(object.key.toLowerCase().includes('categor') ? 'Category' : 'Attribute'),
            titleType: m.prop(element.title.media.word === undefined ? 'image' : 'word'),
            titleHidden: m.prop(this.titleType === 'word'), //weather the category design flag will be visible
            selectedStimuli: m.prop(''),
            stimuliHidden: m.prop(true),
            startStimulus: m.prop(settings.parameters.showStimuliWithInst),
            newStartStimulus: m.prop(''), //startStimulus
            startStimuliHidden: m.prop(this.startStimulus),
            selectedStartStimuli: m.prop(''),
            isNewCategory: index > 1 ? m.prop(true) : m.prop(false) //if it's a new category (mot first or second) there won't be an option to reset stimuli lists
        };
        return {fields: fields, set: set, get: get, addStimulus: addStimulus, updateSelectedStimuli: updateSelectedStimuli,removeChosenStimuli: removeChosenStimuli, removeAllStimuli: removeAllStimuli,
            updateTitleType: updateTitleType, removeChosenStartStimuli: removeChosenStartStimuli, resetStimuliList: resetStimuliList};
        
        function get(name, media, type, startStimulus){
            if (name === 'title' && media === 'startStimulus' && type === 'media'){ //in case of getting startStimulus stimuli list
                if (element.title.startStimulus.media.word !== undefined)
                {
                    if (element.title.startStimulus.media.word === '') return [];
                    return element.title.startStimulus.media.word.split(', ');
                }
                else {
                    if (element.title.startStimulus.media.image === '') return [];
                    return [element.title.startStimulus.media.image];
                }
            }
            if (name === 'title' && !media && !type) //special case - return the title's value (word/image)
            { 
                if (element.title.media.word === undefined) return element.title.media.image;
                return element.title.media.word;
            }
            if (media && type){
                if (type === 'font-size')
                    return parseFloat((element[name][media][type].replace('em','')));
                else if (startStimulus){
                    if (startStimulus === 'font-size')
                        return parseFloat((element[name][media][type][startStimulus].replace('em','')));
                    return element[name][media][type][startStimulus];
                }
                return element[name][media][type];
            }
            else if (media === 'color') //case of stimulusCss
                return element[name][media];
            else if (media === 'font-size') return parseFloat((element[name][media]).substring(0,3));
            return element[name]; 
        }
        function set(name, media, type, startStimulus){
            return function(value){
                if (media && type){
                    if (type === 'font-size'){
                        value = Math.abs(value);
                        if (!value){
                            showRestrictions('error','Font\'s size must be bigger than 0.', 'Error');
                            return element[name][media][type];
                        }
                        return element[name][media][type] = value + 'em';
                    }
                    else if (startStimulus !=null){ //in case of startStimulus
                        if(startStimulus === 'font-size'){
                            value = Math.abs(value);
                            if (!value){
                                showRestrictions('error','Font\'s size must be bigger than 0.', 'Error');
                                return element[name][media][type][startStimulus];
                            }
                            return element[name][media][type][startStimulus] = value + 'em';
                        }
                        return element[name][media][type][startStimulus] = value;
                    }
                    return element[name][media][type] = value;
                }
                else if (media === 'color') return element[name][media] = value;
                else if (media === 'font-size'){
                    value = Math.abs(value);
                    if (!value){
                        showRestrictions('error','Font\'s size must be bigger than 0.', 'Error');
                        return element[name][media];
                    }
                    return element[name][media] = value + 'em';
                }
                return element[name]= value;
            };
        }
        function updateTitleType(){
            return function(type){
                fields.titleType(type);
                var object = element.title.media;
                var category;
                object.word ? category = object.word : category = object.image;
                if (type === 'word'){
                    element.title.media = {};
                    element.title.media = {word: category};
                }
                else {
                    element.title.media = {};
                    element.title.media = {image: category};
                }
            };
        }
        function addStimulus(event, startStimulus){
            if ( startStimulus === void 0 ) startStimulus = false;

            var new_stimuli = !startStimulus ? fields.newStimulus() : fields.newStartStimulus();
            event = event.target.id; //get the button name, to know the kind of the stimulus added
            if (event === 'addWord'){
                if (!startStimulus) element.stimulusMedia.push({word : new_stimuli});
                else {
                    var mediaStr;
                    if (!element.title.startStimulus.media.word) {
                        removeAllStimuli(event, true);
                        mediaStr = new_stimuli;
                    }
                    else if (element.title.startStimulus.media.word === '')
                        mediaStr = element.title.startStimulus.media.word + new_stimuli;
                    else mediaStr = element.title.startStimulus.media.word +', '+new_stimuli;
                    element.title.startStimulus.media = {word : mediaStr};
                }
            }
            else { //addImage
                if (!startStimulus) element.stimulusMedia.push({image : new_stimuli});
                else {
                    removeAllStimuli(event, true);
                    element.title.startStimulus.media = {image: new_stimuli};
                }
            }
            if (!startStimulus) fields.newStimulus(''); //reset the field
            else fields.newStartStimulus('');
        }

        function updateSelectedStimuli(select, startStimulus){
            if ( startStimulus === void 0 ) startStimulus = false;

            var list =[];
            if (!startStimulus) {
                list = element.stimulusMedia.filter(function (val,i) { return select.target.options[i].selected; });
                fields.selectedStimuli(list);
            }
            else {
                for (var i = 0; i < select.target.options.length; i++)
                    if (select.target.options[i].selected) list.push(select.target.options[i].value);
                fields.selectedStartStimuli(list);
            }
        }
        function removeChosenStimuli(){
            element.stimulusMedia = element.stimulusMedia.filter(function (element){ return !fields.selectedStimuli().includes(element); });
            fields.selectedStimuli([]);
        }
        function removeChosenStartStimuli(e){
            var selected = fields.selectedStartStimuli();
            var stimuli = element.title.startStimulus.media;
            if (!stimuli.word) { //in case of a single image
                removeAllStimuli(e, true);
                fields.selectedStartStimuli([]);
                return; 
            }
            else stimuli = element.title.startStimulus.media.word.split(', ');
            var new_str = '';
            for (var i = 0 ; i < stimuli.length; i++){
                if (selected.includes(stimuli[i])){
                    if (stimuli.length === 1) new_str = '';
                    else if (i === stimuli.length - 1) new_str = new_str.slice(0,-2);
                    continue;
                }
                if (stimuli.length === 1) new_str = stimuli[i];
                else if (i === stimuli.length - 1) new_str = new_str + stimuli[i];
                else new_str = new_str + stimuli[i] + ', ';
            }
            element.title.startStimulus.media.word = new_str;
            fields.selectedStartStimuli([]);
        }
        function removeAllStimuli(e,startStimulus){
            if ( startStimulus === void 0 ) startStimulus = false;

            if (!startStimulus) element.stimulusMedia.length = 0;
            else {
                if (element.title.startStimulus.media.word)
                    element.title.startStimulus.media.word = '';
                else element.title.startStimulus.media.image = '';
            }
        }
        function resetStimuliList(e,flag){
            if ( flag === void 0 ) flag = false;

            flag ? element.title.startStimulus = clone(startStimulusList) : element.stimulusMedia = clone(stimuliList);
        }
    }

    function view$p(ctrl) {
        return m('.space', [
            m('.row.line', [
                m('.col-sm-3',[
                    m('span', ctrl.fields.elementType()+' name logged in the data file '),
                    m('i.fa.fa-info-circle.text-muted',{title:'Will appear in the data and in the default feedback message.'})
                ]),
                m('.col-sm-3', m('input[type=text].form-control',{value:ctrl.get('name'), oninput: m.withAttr('value', ctrl.set('name'))})),
            ]),
            m('.row.line', [
                m('.col-sm-3',[
                    m('span', ctrl.fields.elementType()+' name presented in the task '),
                    m('i.fa.fa-info-circle.text-muted',{title:'Name of the ' +ctrl.fields.elementType()+' presented in the task'}),
                ]),
                m('.col-sm-3', [
                    m('input[type=text].form-control',{value: ctrl.get('title'), oninput:m.withAttr('value', ctrl.set('title', 'media', ctrl.fields.titleType()))}),
                ]),
                m('.col-sm-3',
                    m('.row',[
                        m('.col-sm-5',m('span', 'Category\'s Type:')),
                        m('.col-sm-7',[
                            m('select.custom-select',{value: ctrl.get('title','media','word') === undefined ? 'image' : 'word', onchange:m.withAttr('value',ctrl.updateTitleType())},[
                                ctrl.fields.titleType(ctrl.get('title','media','word') === undefined ? 'image' : 'word'),
                                ctrl.fields.titleHidden(ctrl.fields.titleType() === 'word'),
                                m('option', 'word'),
                                m('option', 'image')
                            ])
                        ])
                    ])
                ),
                !ctrl.fields.titleHidden() ? '' :
                    m('.col-sm-3',[
                        m('.row',[
                            m('.col-sm-5',[
                                m('span', 'Font\'s color:'),
                            ]),
                            m('.col-sm-6',[
                                m('input[type=color].form-control',{value: ctrl.get('title','css','color'), onchange:m.withAttr('value', ctrl.set('title','css','color'))})
                            ])
                        ]),
                        m('.row.space',[
                            m('.col-sm-5',[
                                m('span', 'Font\'s size:'),
                            ]),
                            m('.col-sm-6',[
                                m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('title','css','font-size') ,min: '0' ,onchange:m.withAttr('value', ctrl.set('title','css','font-size'))})
                            ])
                        ])
                    ])
            ]),
            m('.row',[
                m('.col-md-6',[
                    m('.row',
                        m('.col-md-6',
                            m('p.h4','Stimuli: ', m('i.fa.fa-info-circle.text-muted',{
                                title:'Enter text (word) or image name with its file extension (image).\nSet the path to the folder of images in the General Parameters page.'})
                            )
                        )
                    ),
                    m('.row',
                        m('.col-md-7',
                            m('input[type=text].form-control', {placeholder:'Enter Stimulus content here', 'aria-label':'Enter Stimulus content', value: ctrl.fields.newStimulus(), oninput: m.withAttr('value', ctrl.fields.newStimulus)})
                        )
                    ),
                    m('.row',
                        m('.col-md-9',[
                            m('.btn-group btn-group-toggle', [
                                m('button[type=button].btn btn-secondary',{disabled:!ctrl.fields.newStimulus().length, id:'addWord', onclick: ctrl.addStimulus},[
                                    m('i.fa.fa-plus'), 'Add Word'
                                ]),
                                m('button[type=button].btn btn-secondary', {disabled:!ctrl.fields.newStimulus().length, id:'addImage', onclick: ctrl.addStimulus},[
                                    m('i.fa.fa-plus'), 'Add Image'
                                ])
                            ])
                        ])
                    ),
                    m('.row',[
                        m('.col-md-7',
                            m('select.form-control.scroll', {multiple : 'multiple', size : '8' ,onchange: function (e) { return ctrl.updateSelectedStimuli(e); }},[
                                ctrl.get('stimulusMedia').some(function (object) { return object.word; }) ? ctrl.fields.stimuliHidden(true) : ctrl.fields.stimuliHidden(false),
                                ctrl.get('stimulusMedia').map(function(object){
                                    var value = object.word ? object.word : object.image;
                                    var option = value + (object.word ? ' [Word]' : ' [Image]');
                                    return m('option', {value:value, selected : ctrl.fields.selectedStimuli().includes(object)}, option);
                                })
                            ])
                        ),
                        m('.col-md-5',
                            !ctrl.fields.stimuliHidden() ? '' :
                                [
                                    m('.row',
                                        m('.col-md-8',[
                                            m('u','Stimuli font\'s design:'),
                                        ])
                                    ),
                                    m('.row.space',
                                        m('.col-md-8',[
                                            m('label','Font\'s color: '),
                                            m('input[type=color].form-control', {value: ctrl.get('stimulusCss','color'), onchange: m.withAttr('value', ctrl.set('stimulusCss','color'))}),
                                        ])

                                    ),
                                    m('.row.space',
                                        m('.col-md-8',[

                                            m('label', 'Font\'s size:'),
                                            m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('stimulusCss','font-size') ,min: '0' ,onchange: m.withAttr('value', ctrl.set('stimulusCss','font-size'))})
                                        ])
                                    )
                                ]
                        )
                    ])
                ]),
                ///startStimulus
                !ctrl.fields.startStimulus() ? '' :
                    m('.col-md-6', [
                        m('.row',
                            m('.col-md-12',
                                m('p.h4','Stimuli Presented with Instructions: ', m('i.fa.fa-info-circle.text-muted',{
                                    title:'Here You can enter only one type of stimuli (image or words), if you enter an image you can only enter one and with its file extension.'
                                }))
                            )
                        ),
                        m('.row',
                            m('.col-md-7',
                                m('input[type=text].form-control', {placeholder:'Enter Stimulus content here', 'aria-label':'Enter Stimulus content', value: ctrl.fields.newStartStimulus(), oninput: m.withAttr('value', ctrl.fields.newStartStimulus)})
                            )

                        ),
                        m('.row',
                            m('.col-md-9',
                                m('.btn-group btn-group-toggle', [
                                    m('button[type=button].btn btn-secondary',{disabled:!ctrl.fields.newStartStimulus().length, id:'addWord', onclick: function (e) { return ctrl.addStimulus(e,true); }},[
                                        m('i.fa.fa-plus'), 'Add Word'
                                    ]),
                                    m('button[type=button].btn btn-secondary', {disabled:!ctrl.fields.newStartStimulus().length, id:'addImage', onclick: function (e) { return ctrl.addStimulus(e,true); }},[
                                        m('i.fa.fa-plus'), 'Add Image'
                                    ])
                                ])
                            )
                        ),
                        m('.row',[
                            m('.col-md-7',
                                m('select.form-control.scroll', {multiple : 'multiple', size : '8' ,onchange: function (e) { return ctrl.updateSelectedStimuli(e, true); }},[
                                    !ctrl.fields.startStimulus()  ||
                                    ctrl.get('title','startStimulus','media').some(function (object) { return object.includes('.'); }) ||
                                    !ctrl.get('title','startStimulus','media').length ? ctrl.fields.startStimuliHidden(false) : ctrl.fields.startStimuliHidden(true),
                                    ctrl.get('title','startStimulus','media').map(function(object){
                                        var type = object.includes('.') ? ' [Image]' : ' [Word]';
                                        var option = object + type;
                                        return m('option', {value:object, selected : ctrl.fields.selectedStartStimuli().includes(object)} ,option);
                                    })
                                ])
                            ),
                            m('.col-md-5',
                                !ctrl.fields.startStimuliHidden() ? '' :
                                    [
                                        m('.row',
                                            m('.col-md-8',[
                                                m('u','Stimuli font\'s design:'),
                                            ])
                                        ),
                                        m('.row.space',
                                            m('.col-md-8',[
                                                m('label','Font\'s color: '),
                                                m('input[type=color].form-control', {value: ctrl.get('title','startStimulus','css','color'), onchange:m.withAttr('value', ctrl.set('title','startStimulus','css','color'))}),
                                            ])
                                        ),
                                        m('.row.space',
                                            m('.col-md-8',[
                                                m('label', 'Font\'s size:'),
                                                m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('title','startStimulus','css','font-size') ,min: '0' ,onchange:m.withAttr('value', ctrl.set('title','startStimulus','css','font-size'))})
                                            ])
                                        )
                                    ]
                            )
                        ])
                    ])
            ]),
            m('.row',[
                m('.col-md-6.space',
                    m('.btn-group-vertical', [
                        m('button.btn btn btn-warning', {title:'To select multiple stimuli, please press the ctrl key while selecting the desired stimuli', disabled: !ctrl.fields.selectedStimuli().length, onclick:ctrl.removeChosenStimuli}, 'Remove Chosen Stimuli'),
                        m('button.btn btn btn-warning', {onclick:ctrl.removeAllStimuli},'Remove All Stimuli'),
                        ctrl.fields.isNewCategory() ? '' : m('button.btn btn btn-warning', {onclick:function (e) { return ctrl.resetStimuliList(e); }}, 'Reset Stimuli List'),
                    ])),
                ///startStimulus
                !ctrl.fields.startStimulus() ? '' :
                    m('.col-md-6.space',[
                        m('.btn-group-vertical', [
                            m('button.btn btn btn-warning', {title:'To select multiple stimuli, please press the ctrl key while selecting the desired stimuli', disabled: !ctrl.fields.selectedStartStimuli().length, onclick: function (e) { return ctrl.removeChosenStartStimuli(e); }}, 'Remove Chosen Stimuli'),
                            m('button.btn btn btn-warning', {onclick: function (e) { return ctrl.removeAllStimuli(e,true); }}, 'Remove All Stimuli'),
                            ctrl.fields.isNewCategory() ? '' : m('button.btn btn btn-warning', {onclick:function (e) { return ctrl.resetStimuliList(e,true); }}, 'Reset Stimuli List'),
                        ])
                    ])
            ]),
        ]);
    }

    var elementComponent = {
        controller:controller$o,
        view:view$o,
    };

    function controller$o(object, settings, stimuliList, taskType){
        var element = settings[object.key];
        var fields = {
            newStimulus : m.prop(''),
            selectedStimuli: m.prop(''),
            isAMP: taskType === 'AMP',
            elementType: m.prop(object.key.includes('target') ? 'Target' : 'Prime'),
            isTarget: m.prop(object.key.includes('target'))
        };

        return {fields: fields ,set: set, get: get, addStimulus: addStimulus, updateSelectedStimuli: updateSelectedStimuli,
            removeChosenStimuli: removeChosenStimuli, removeAllStimuli: removeAllStimuli, resetStimuliList: resetStimuliList};

        function get(name, media, type){
            if (media != null && type != null){
                if (type === 'font-size'){
                    return parseFloat((element[name][media][type].replace('em','')));
                }
                return element[name][media][type];
            }
            else if (media === 'color') return element[name][media]; //case of stimulusCss
            else if (media === 'font-size') return parseFloat((element[name][media]).substring(0,3));
            return element[name];
        }
        function set(name, media, type){
            return function(value){
                if (media && type){
                    if (type === 'font-size'){
                        value = Math.abs(value);
                        if (value === 0){
                            showRestrictions('Font\'s size must be bigger than 0.', 'error');
                            return element[name][media][type];
                        }
                        return element[name][media][type] = value + 'em';
                    }
                    return element[name][media][type] = value;
                }
                else if (media === 'color') return element[name][media] = value;
                else if (media === 'font-size'){
                    value = Math.abs(value);
                    if (value === 0){
                        showRestrictions('Font\'s size must be bigger than 0.', 'error');
                        return element[name][media];
                    }
                    return element[name][media] = value + 'em';
                }
                return element[name] = value;
            };
        }
        function addStimulus(event){
            var new_stimuli = fields.newStimulus();
            event = event.target.id; //button name, to know the kind of the stimulus added
            element.mediaArray.push( (event === 'addWord') ? {word : new_stimuli} : {image : new_stimuli});
            fields.newStimulus(''); //reset the field
        }
        function updateSelectedStimuli(select){
            var list = element.mediaArray.filter(function (val,i) { return select.target.options[i].selected; });
            fields.selectedStimuli(list);
        }

        function removeChosenStimuli(){
            element.mediaArray = element.mediaArray.filter(function (element){ return !fields.selectedStimuli().includes(element); });
            fields.selectedStimuli([]);
        }

        function removeAllStimuli(){element.mediaArray.length = 0;}
        function resetStimuliList(){element.mediaArray = clone(stimuliList);}
    }

    function view$o(ctrl) {
        return m('.space', [
            m('.row.line',[
                m('.col-sm-3',[
                    m('span', ctrl.fields.elementType()+' category\'s name logged in the data file '),
                    m('i.fa.fa-info-circle.text-muted',{
                        title:'Will appear in the data and in the default feedback message.'
                    }),
                ]),
                m('.col-sm-3', [
                    m('input[type=text].form-control', {value:ctrl.get('name'), oninput:m.withAttr('value', ctrl.set('name'))})
                ])
            ]),
            !ctrl.fields.isAMP ? '' : //AMP has this additional field
                m('.row.line',[
                    m('.col-sm-3',[
                        m('span', ctrl.fields.elementType()+' category\'s name presented in the feedback page '),
                        m('i.fa.fa-info-circle.text-muted',{
                            title: !ctrl.fields.isTarget() ? 'Will appear in the default feedback message'
                                : 'The name of the targets (used in the instructions)'
                        }),
                    ]),
                    m('.col-sm-3', [
                        m('input[type=text].form-control', {value:ctrl.get('nameForFeedback'),
                            oninput:m.withAttr('value', ctrl.set('nameForFeedback'))})
                    ])
                ]),
            m('.row',[
                m('.col-md-6',[
                    m('.row',
                        m('.col-md-6',
                            m('p.h4','Stimuli: ', m('i.fa.fa-info-circle.text-muted',{
                                title:'Enter text (word) or image name with its file extension (image).\nSet the path to the folder of images in the General Parameters page.'})
                            ))
                    ),
                    m('.row',
                        m('.col-md-7',
                            m('input[type=text].form-control', {placeholder:'Enter Stimulus content here', 'aria-label':'Enter Stimulus content', 'aria-describedby':'basic-addon2', value: ctrl.fields.newStimulus(), oninput: m.withAttr('value', ctrl.fields.newStimulus)}
                            ))
                    ),
                    m('.row',
                        m('.col-md-9',
                            m('.btn-group btn-group-toggle', [
                                m('button[type=button].btn btn-secondary',{disabled:!ctrl.fields.newStimulus().length, id:'addWord', onclick: function (e) { return ctrl.addStimulus(e); }},[
                                    m('i.fa.fa-plus'), 'Add Word'
                                ]),
                                m('button[type=button].btn btn-secondary', {disabled:!ctrl.fields.newStimulus().length, id:'addImage', onclick: function (e) { return ctrl.addStimulus(e); }},[
                                    m('i.fa.fa-plus'), 'Add Image'
                                ])
                            ])
                        )
                    ),
                    m('.row',[
                        m('.col-md-7',
                            m('select.form-control.scroll', {multiple : 'multiple', size : '8' ,onchange:function (e) { return ctrl.updateSelectedStimuli(e); }},[
                                ctrl.get('mediaArray').map(function(object){
                                    var value = object.word ? object.word : object.image;
                                    var option = value + (object.word ? ' [Word]' : ' [Image]');
                                    return m('option', {value:value, selected : ctrl.fields.selectedStimuli().includes(object)}, option);
                                })
                            ])
                        ),
                    ]),
                ])
            ]),

            m('.row',
                m('.col-sm-5.space',
                    m('.btn-group-vertical',[
                        m('button.btn btn btn-warning', {title:'To select multiple stimuli, please press the ctrl key while selecting the desired stimuli', disabled: !ctrl.fields.selectedStimuli().length, onclick:ctrl.removeChosenStimuli},'Remove Chosen Stimuli'),
                        m('button.btn btn btn-warning', {onclick:ctrl.removeAllStimuli},'Remove All Stimuli'),
                        m('button.btn btn btn-warning', {onclick: ctrl.resetStimuliList},'Reset Stimuli List')
                    ]))
            )
        ]);
    }

    var parametersComponent = {
        controller:controller$n,
        view:view$n
    };

    function controller$n(taskType, settings, elementName){
        var primeCss = settings[elementName];
        var elementType = m.prop(elementName.includes('target') ? 'Target' : 'Prime');
        var durationFieldName = m.prop(elementType() === 'Target' ? 'targetDuration' : 'primeDuration');
        return {set: set, get: get, elementType: elementType, durationFieldName: durationFieldName, primeCss: primeCss};

        function get(parameter){
            if (parameter === 'font-size') return parseFloat((primeCss[parameter]).substring(0,3));
            return primeCss[parameter];
        }
        function set(parameter){
            return function(value){
                if(parameter.includes('Duration')) //Duration parameter is under settings directly
                    return primeCss[parameter] = Math.abs(value);
                if (parameter === 'font-size'){
                    value = Math.abs(value);
                    if (value === 0){
                        showRestrictions('Font\'s size must be bigger than 0.', 'error');
                        return primeCss[parameter];
                    }
                    return primeCss[parameter] = value + 'em';
                }
                return primeCss[parameter] = value;
            };
        }
    }

    function view$n(ctrl, taskType){
        return m('.space' , [
            m('.row.line',[
                m('.col-sm-3',[
                    m('.row.space', m('.col-sm-12', m('span', 'Font\'s color:'))),
                    m('.row.space', m('.col-sm-6', m('input[type=color].form-control', {value: ctrl.get('color'), onchange:m.withAttr('value', ctrl.set('color'))})))
                ]),
                m('.col-sm-3',[
                    m('.row.space', m('.col-sm-12',m('span', 'Font\'s size:'))),
                    m('.row.space', m('.col-sm-6',m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('font-size') ,min: '0' ,onchange:m.withAttr('value', ctrl.set('font-size'))})))
                ])
            ]),
            m('.row.space',[
                m('.col-sm-3',[
                    m('.row.space', m('.col-sm-12', m('span', ctrl.elementType()+' category\'s display presentation:'))),

                    m('.row.space', m('.col-sm-6', m('input[type=number].form-control',{placeholder:'0', min:0, value:ctrl.get(ctrl.durationFieldName()), onchange:m.withAttr('value', ctrl.set(ctrl.durationFieldName()))})))
                ]),
                ctrl.elementType() === 'Prime' && taskType === 'AMP' ?
                    m('.col-sm-3',[
                        m('.row.space', m('.col-sm-12', m('span', 'Post prime category\'s display presentation:'))),
                        m('.row.space', m('.col-sm-6', m('input[type=number].form-control',{placeholder:'0', min:0, value:ctrl.get('postPrimeDuration'), onchange:m.withAttr('value', ctrl.set('postPrimeDuration'))})))
                    ])
                    : ''
            ])
        ]);
    }

    var categoriesComponent$1 = {
        controller:controller$m,
        view:view$m
    };

    function controller$m(settings, defaultSettings, clearElement) {
        return {reset: reset, clear: clear};

        function reset(curr_tab){showClearOrReset(settings[curr_tab], defaultSettings[curr_tab],'reset');}
        function clear(curr_tab){
            curr_tab.includes('StimulusCSS') ?
                showClearOrReset(settings[curr_tab], clearElement[1], 'clear')
                : showClearOrReset(settings[curr_tab], clearElement[0], 'clear');
        }
    }

    function view$m(ctrl, settings, defaultSettings, clearElement, taskType, currTab) {
        return m('div', [
            taskType === 'BIAT' ?
                m.component(elementComponent$1,{key:currTab}, settings,
                    defaultSettings[currTab].stimulusMedia, defaultSettings[currTab].title.startStimulus)
                //in EP & AMP there is additional sub tab called Target/Prime Appearance, it needs a different component.
                : currTab.includes('StimulusCSS') ?
                    m.component(parametersComponent, taskType, settings, currTab)
                    : taskType === 'EP' || taskType === 'AMP' ?
                        m.component(elementComponent, {key:currTab}, settings, defaultSettings[currTab].mediaArray, taskType)
                        : m.component(elementComponent$2, {key:currTab}, settings, defaultSettings[currTab].stimulusMedia),
            m('hr')
            ,resetClearButtons(ctrl.reset, ctrl.clear, currTab)
        ]);
    }

    var iatImportComponent = {
        controller:controller$l,
        view:view$l
    };

    function view$l(ctrl){
        return viewImport(ctrl);
    }

    function controller$l(settings) {
        return {handleFile: handleFile, updateSettings: updateSettings$a};

        function handleFile(){
            var importedFile = document.getElementById('uploadFile').files[0];
            var reader = new FileReader();
            reader.readAsText(importedFile); 
            reader.onload = function() {
                var fileContent = JSON.parse(reader.result);
                settings = updateSettings$a(settings, fileContent);
            };
        }
    }
    function updateSettings$a(settings, input) {
        settings.category1 = input.category1;
        settings.category2 = input.category2;
        settings.attribute1 = input.attribute1;
        settings.attribute2 = input.attribute2;
        settings.parameters.base_url = input.base_url;
        settings.parameters.remindError = input.remindError;
        settings.parameters.errorCorrection = input.errorCorrection;
        settings.parameters.isTouch = input.isTouch;
        if(input.isQualtrics){
            settings.parameters.isQualtrics = input.isQualtrics;
            settings.parameters.showDebriefing = input.showDebriefing;
            settings.parameters.fullscreen = input.fullscreen;
            if(!input.isTouch){
                settings.parameters.leftKey = input.leftKey;
                settings.parameters.rightKey = input.rightKey;
            }
        }
        settings.blocks.blockCategories_nTrials = input.blockCategories_nTrials;
        settings.blocks.blockCategories_nMiniBlocks = input.blockCategories_nMiniBlocks;
        settings.blocks.blockAttributes_nTrials = input.blockAttributes_nTrials;
        settings.blocks.blockAttributes_nMiniBlocks = input.blockAttributes_nMiniBlocks;
        settings.blocks.blockFirstCombined_nTrials = input.blockFirstCombined_nTrials;
        settings.blocks.blockFirstCombined_nMiniBlocks = input.blockFirstCombined_nMiniBlocks;
        settings.blocks.blockSecondCombined_nTrials = input.blockSecondCombined_nTrials;
        settings.blocks.blockSecondCombined_nMiniBlocks = input.blockSecondCombined_nMiniBlocks;
        settings.blocks.blockSwitch_nTrials = input.blockSwitch_nTrials;
        settings.blocks.blockSwitch_nMiniBlocks = input.blockSwitch_nMiniBlocks;
        settings.blocks.randomBlockOrder = input.randomBlockOrder;
        settings.blocks.randomAttSide = input.randomAttSide;
        if (input.isTouch){
            settings.touch_text.textOnError = input.textOnError;
            settings.touch_text.leftKeyText = input.leftKeyText;
            settings.touch_text.rightKeyText = input.rightKeyText;
            settings.touch_text.orKeyText = input.orKeyText;
            settings.touch_text.AttributesBlockInstructions = input.AttributesBlockInstructions;
            settings.touch_text.CategoriesBlockInstructions = input.CategoriesBlockInstructions;
            settings.touch_text.FirstCombinedBlockInstructions = input.FirstCombinedBlockInstructions;
            settings.touch_text.SecondCombinedBlockInstructions = input.SecondCombinedBlockInstructions;
            settings.touch_text.SwitchedCategoriesInstructions = input.SwitchedCategoriesInstructions;
            settings.touch_text.PreDebriefingText = input.PreDebriefingText;
        }
        else {
            settings.text.textOnError = input.textOnError;
            settings.text.leftKeyText = input.leftKeyText;
            settings.text.rightKeyText = input.rightKeyText;
            settings.text.orKeyText = input.orKeyText;
            settings.text.AttributesBlockInstructions = input.AttributesBlockInstructions;
            settings.text.CategoriesBlockInstructions = input.CategoriesBlockInstructions;
            settings.text.FirstCombinedBlockInstructions = input.FirstCombinedBlockInstructions;
            settings.text.SecondCombinedBlockInstructions = input.SecondCombinedBlockInstructions;
            settings.text.SwitchedCategoriesInstructions = input.SwitchedCategoriesInstructions;
            settings.text.PreDebriefingText = input.PreDebriefingText;
        }
        return settings;
    }

    var links = {IAT: 'https://minnojs.github.io/minnojs-blog/qualtrics-iat/',
    	BIAT: 'https://minnojs.github.io/minnojs-blog/qualtrics-biat/',
    	STIAT: 'https://minnojs.github.io/minnojs-blog/qualtrics-stiat/',
    	SPF: '#',
    	EP: 'https://minnojs.github.io/minnojs-blog/qualtrics-priming/'
    };

    var aboutComponent = {
    	view: function(ctrl, settings, defaultSettings, type){
    		var extension = '.'+type.toLowerCase();
    		return m('.space',
    			m('.alert.alert-info',
    				!settings.external ? //only show this text if we are in the dashboard
    				['This feature of the dashboard will create a script that uses Project Implicit\'s '+type+' extension. ' +
    					'After you save your work here, it will be updated into a file with the same name but a different file extension (.js instead of '+extension+'). ' +
    					'You can edit that .js file further. However, note that every time you make (and save) changes to the .'+type.toLowerCase()+' file (this wizard),  these changes override your .js file. '
    				]:
    				['This tool creates a script for running an '+type+' in your online study. ' +
    					'The script uses Project Implicit’s '+type+ ' extension, which runs on MinnoJS, a JavaScript player for online studies. ',
    					m('a',{href: 'http://projectimplicit.net/'}, 'Project Implicit '), 'has developed MinnoJS to program web studies. ' +
    					'To create ' +type+'s, we programmed a general script (the “extension”) that runs an '+type+ ' based on parameters provided by another, ' + 'more simple script. ' +
    					'In this page, you can create a script that uses our '+type+' extension. ' +
    					'You can read more about the basic idea of using extensions in Minno ',
    					m('a',{href: 'https://github.com/baranan/minno-tasks/blob/master/implicitmeasures.md'}, 'on this page. '),
    					'We run those scripts in ', m('a',{href: 'https://minnojs.github.io/docsite/minnosuitedashboard/'}, 'Open Minno Suite, '),
    					'our platform for running web studies. ' +
    					'You can install that platform on your own server, use a more simple ',
    					m('a',{href: 'https://minnojs.github.io/minnojs-blog/csv-server/'}, 'php server for Minno, '), 'or run ', m('a',{href: links[type]},'this script directly from Qualtrics.')
    				]));}
    };

    var parametersDesc$5 = [
        {name: 'isTouch', options:['Keyboard', 'Touch'], label:'Keyboard input or touch input?', desc:'Minno does not auto-detect the input method. If you need a touch version and a keyboard version, create two different scripts with this tool.'},
        {name: 'isQualtrics',options:['Regular','Qualtrics'], label:'Regular script or Qualtrics?', desc: ['If you want this IAT to run from Qualtrics, read ', m('a',{href: 'https://minnojs.github.io/minnojs-blog/qualtrics-iat/'}, 'this blog post '),'to see how.']},
        {name: 'leftKey', label: 'Left Key', desc: 'It\'s recommended to use upper case letters for the key values.'},
        {name: 'rightKey', label: 'Right Key'},
        {name: 'fullscreen', label:'Run Full Screen', desc: 'Do you want to enable a full screen option?'},
        {name: 'showDebriefing', label:'Show results interpretation at the end', desc: 'Not recommended.\nA single IAT score is not a reliable estimate of any psychological construct.'},
        {name: 'remindError', label: 'Error feedback on incorrect responses', desc: 'Should we show error feedback?\nIt is recommended to show participants an error feedback on error responses.'},
        {name: 'errorCorrection', label: 'Require correct response', desc: 'Should we require the participant to respond correctly after a wrong response?\nIt is recommended to require participants to hit the correct response even after errors.'},
        {name: 'base_url', label: 'Image\'s URL'},
        {isTouch:false, isQualtrics:false, leftKey:'', rightKey:'' ,fullscreen:false, showDebriefing:false, remindError:false, errorCorrection:false, base_url:{image:''}}
    ];

    var textDesc$5=[
        {name: 'remindErrorText', nameTouch: 'remindErrorTextTouch', label:'Screen\'s Bottom (error reminder)', desc:'We use this text to remind participants what happens on error.\nDelete this text if you do not require participants to correct their error responses (see General Parameters page).'},
        {name: 'leftKeyText', label:'Top-left text (about the left key)', desc: 'We use this text to remind participants what key to use for a left response.'},
        {name: 'rightKeyText', label:'Top-right text (about the right key)', desc: 'We use this text to remind participants what key to use for a right response.'},
        {name: 'orText', label:'Or', desc: 'We show this text in the combined blocks to separate between the two categories that use the same key.'},
        {name: 'instAttributePractice', nameTouch: 'instAttributePracticeTouch', label: 'Instructions in Block 1', desc: 'The instructions in the attributes practice block.'},
        {name: 'instCategoriesPractice', nameTouch: 'instCategoriesPracticeTouch', label: 'Instructions in Block 2', desc: 'The instructions in the categories practice block.'},
        {name: 'instFirstCombined', nameTouch: 'instFirstCombinedTouch', label: 'Instructions in Blocks 3 and 6', desc: 'The instructions in the first combined (4-groups) block.'},
        {name: 'instSecondCombined', nameTouch: 'instSecondCombinedTouch', label: 'Instructions in Blocks 4 and 7', desc: 'The instructions in the second combined (4-groups) block.'},
        {name: 'instSwitchCategories', nameTouch: 'instSwitchCategoriesTouch', label: 'Instructions in Block 5', desc: 'The instructions in the block that provides practice for the reversed categories.'},
        {name: 'preDebriefingText', nameTouch: 'preDebriefingTouchText', label: 'Text before showing results', desc: 'Will be used only if you selected (in the General Parameters page) to show the participants an interpretation of the result.\nWe recommend avoiding that.'},
        {remindErrorText:'', leftKeyText:'', rightKeyText:'', orText:'', instAttributePractice:'',instCategoriesPractice:'',
            instFirstCombined:'', instSecondCombined:'', instSwitchCategories:'',preDebriefingText:''},
        {remindErrorTextTouch:'', instAttributePracticeTouch:'',instCategoriesPracticeTouch:'',
            instFirstCombinedTouch:'', instSecondCombinedTouch:'', instSwitchCategoriesTouch:'',preDebriefingTouchText:''}
    ];

    var blocksDesc$5 = [
        {label:'Block #1', numTrialBlocks:'blockCategories_nTrials', numMiniBlocks: 'blockCategories_nMiniBlocks', desc:'Will present the categories.'},
        {label:'Block #2', numTrialBlocks:'blockAttributes_nTrials', numMiniBlocks: 'blockAttributes_nMiniBlocks', desc:'Will present the attributes.'},
        {label:'Blocks #3 and #6', numTrialBlocks:'blockFirstCombined_nTrials', numMiniBlocks: 'blockFirstCombined_nMiniBlocks', desc:'The first combined block.'},
        {label:'Blocks #4 and #7', numTrialBlocks:'blockSecondCombined_nTrials', numMiniBlocks: 'blockSecondCombined_nMiniBlocks', desc:'The second combined block.'},
        {label:'Block #5', numTrialBlocks:'blockSwitch_nTrials', numMiniBlocks: 'blockSwitch_nMiniBlocks', desc:'Flipping the sides of the categories. Some have recommended using 50 trials in this block.'},
        {name:'randomBlockOrder' ,label:'Randomly choose categories\' location in Block #1', desc:'If not randomized: the First Category (in the Categories page) will appear on the left in Blocks #1,#3, and #4.'},
        {name:'randomAttSide',label:'Randomly choose attributes\' location in the task', desc: 'If not randomized: the First Attribute (in the Attributes page) will appear on the left.'},
        {blockCategories_nTrials: 0,blockCategories_nMiniBlocks:0, blockAttributes_nTrials:0,blockAttributes_nMiniBlocks:0,
            blockFirstCombined_nTrials:0, blockFirstCombined_nMiniBlocks:0, blockSecondCombined_nTrials:0, blockSecondCombined_nMiniBlocks:0,
            blockSwitch_nTrials:0, blockSwitch_nMiniBlocks:0, randomBlockOrder: false, randomAttSide : false}
    ];

    var categoryClear$3 = [{
        name: '',
        title: {media: {word: ''},
            css: {color: '#000000', 'font-size': '1em'}, height: 4},
        stimulusMedia: [],
        stimulusCss : {color:'#000000', 'font-size':'1em'}
    }];

    var categoriesTabs$2 = {
        'category1': {text: 'First Category'},
        'category2': {text: 'Second Category'}
    };

    var attributesTabs$3 = {
        'attribute1':{text: 'First Attribute'},
        'attribute2':{text: 'Second Attribute'}
    };

    var tabs$5 = {
        'parameters': {text: 'General parameters', component: parametersComponent$1, rowsDesc: parametersDesc$5},
        'blocks': {text: 'Blocks', component: iatBlocksComponent, rowsDesc: blocksDesc$5},
        'categories': {
            text: 'Categories',
            component: categoriesComponent$1,
            rowsDesc: categoryClear$3,
            subTabs: categoriesTabs$2
        },
        'attributes': {
            text: 'Attributes',
            component: categoriesComponent$1,
            rowsDesc: categoryClear$3,
            subTabs: attributesTabs$3
        },
        'text': {text: 'Texts', component: textComponent, rowsDesc: textDesc$5},
        'output': {text: 'Complete', component: iatOutputComponent$1, rowsDesc: blocksDesc$5},
        'import': {text: 'Import', component: iatImportComponent},
        'about': {text: 'About', component: aboutComponent, rowsDesc: 'IAT'}
    };

    function url(study_type, study_id, file_id) {
        return (baseUrl + "/files/" + (encodeURIComponent(study_id)) + "/file/" + (encodeURIComponent(file_id)));
    }

    var save = function (study_type, study_id, file_id, content, last_modify) { return fetchJson(url(study_type, study_id, file_id), {
        method: 'put',
        body: {content: JSON.stringify(content), last_modify: last_modify}
    }); };

    var saveToJS = function (study_type, study_id, file_id, content, last_modify) { return fetchJson(url(study_type, study_id, file_id), {
        method: 'put',
        body: {content: content, last_modify: last_modify}
    }); };

    var createNotifications = function(){
        var state = [];
        return {show_success: show_success, show_danger: show_danger, view: view};

        function show(value, time){
            if ( time === void 0 ) time = 6000;

            state.push(value);
            m.redraw();
            setTimeout(function (){state.pop(value);  m.redraw();}, time);
        }

        function show_success(value){
            return show({value: value, type:'success'});
        }

        function show_danger(value){
            return show({value: value, type:'danger'});
        }


        function view(){
            return state.map(function (notes) { return m('.note.alert.animated.fade', {class: notes.type==='danger' ? 'alert-danger' : 'alert-success'},[
                notes.value
            ]); });

        }
    };

    var iat = function (args, external) { return m.component(iatComponent, args, external); };

    var iatComponent = {
        controller: controller$k,
        view: view$k
    };

    function controller$k(ref, external){
        var file = ref.file;
        var study = ref.study;
        if ( external === void 0 ) external = false;

        var ctrl = {
            study: study ? study : null,
            file : file ? file : null,
            err : m.prop([]),
            last_modify : m.prop(''),
            loaded : m.prop(false),
            notifications : createNotifications(),
            defaultSettings : clone(defaultSettings$5(external)),
            settings : clone(defaultSettings$5(external)),
            external: external,
            is_locked:m.prop(study ? study.is_locked : null),
            show_do_save: show_do_save,
            is_settings_changed: is_settings_changed
        };

        ctrl.settings.external = ctrl.external;

        function load() {
            return ctrl.file.get()
                .catch(ctrl.err)
                .then(function () {
                    if (ctrl.file.content().length>10) {
                        ctrl.last_modify(file.last_modify);
                        ctrl.settings = JSON.parse(ctrl.file.content());
                        ctrl.prev_settings = clone(ctrl.settings );
                    }
                    ctrl.loaded(true);
                })
                .then(m.redraw);
        }

        function show_do_save(){
            var error_msg = [];
            var blocksObject = tabs$5.blocks.rowsDesc; //blockDesc inside output attribute
            error_msg = validityCheck$5(error_msg, ctrl.settings, blocksObject);
            if(error_msg.length !== 0) {
                return messages.confirm({
                    header: 'Some problems were found in your script, it\'s recommended to fix them before saving:',
                    content:
                        m('div',[
                            m('.alert alert-danger', [
                                m('ul', [
                                    error_msg.map(function (err) {
                                        return m('li', err);
                                    })
                                ])
                            ]),
                            m('strong','Do you want to save anyway?')
                        ])})
                    .then(function (response) {
                        if (response) do_save();
                    }).catch(function (error) { return messages.alert({
                        content: m('p.alert.alert-danger', error.message)
                    }); })
                    .then(m.redraw());
            }
            else do_save();
        }

        function do_save(){
            ctrl.err([]);
            var studyId  =  m.route.param('studyId');
            var fileId = m.route.param('fileId');
            var jsFileId =  fileId.split('.')[0]+'.js';
            save('iat', studyId, fileId, ctrl.settings, ctrl.last_modify)
                .then (function () { return saveToJS('iat', studyId, jsFileId, toString$5(ctrl.settings, ctrl.external), ctrl.last_modify); })
                .then(ctrl.study.get())
                .then(function () { return ctrl.notifications.show_success("IAT Script successfully saved"); })
                .then(m.redraw)
                .catch(function (err) { return ctrl.notifications.show_danger('Error Saving:', err.message); });
            ctrl.prev_settings = clone(ctrl.settings);
            m.redraw();
        }

        function is_settings_changed(){
            return JSON.stringify(ctrl.prev_settings) !== JSON.stringify(ctrl.settings);
        }

        external ? null : load();
        return ctrl;
    }
    function view$k(ctrl){
        if(!ctrl.external) {
            return !ctrl.loaded()
                ? m('.loader')
                : m('.wizard.container-fluid.space',
                    m.component(tabsComponent, tabs$5, ctrl.settings, ctrl.defaultSettings, ctrl.external, ctrl.notifications,
                        ctrl.is_locked, ctrl.is_settings_changed, ctrl.show_do_save));
        }
        return m('.container-fluid',
            pageHeadLine('IAT'),
            m.component(messages),
            m.component(tabsComponent, tabs$5, ctrl.settings, ctrl.defaultSettings, ctrl.external)
        );
    }

    function defaultSettings$4(external){
        return {
            parameters : {isTouch:false, isQualtrics:false, practiceBlock:true,
                showStimuliWithInst:true, remindError:true,
                base_url: {image: external ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/docs/images/' : './images'}
            },
            blocks: {nMiniBlocks: 1, nTrialsPerMiniBlock:16, nPracticeBlockTrials: 8, nCategoryAttributeBlocks: 4,
                focalAttribute: 'attribute1', firstFocalAttribute : 'random', focalCategoryOrder: 'random'
            },
            practiceCategory1 : {
                name : 'Mammals',
                title : {
                    media : {word : 'Mammals'},
                    css : {color:'#31b404','font-size':'1.8em'},
                    height : 4,
                    startStimulus : {
                        media : {word : 'Dogs, Horses, Cows, Lions'},
                        css : {color:'#31b404','font-size':'1em'},
                        height : 2
                    }
                },
                stimulusMedia : [
                    {word : 'Dogs'},
                    {word : 'Horses'},
                    {word : 'Lions'},
                    {word : 'Cows'}
                ],
                stimulusCss : {color:'#31b404','font-size':'2em'}},
            practiceCategory2 : {
                name : 'Birds',
                title : {
                    media : {word : 'Birds'},
                    css : {color:'#31b404','font-size':'1.8em'},
                    height : 4,
                    startStimulus : {
                        media : {word : 'Pigeons, Swans, Crows, Ravens'},
                        css : {color:'#31b404','font-size':'1em'},
                        height : 2
                    }
                },
                stimulusMedia : [
                    {word : 'Pigeons'},
                    {word : 'Swans'},
                    {word : 'Crows'},
                    {word : 'Ravens'}
                ],
                stimulusCss : {color:'#31b404','font-size':'2em'}
            },
            categories : [  //As many categories you need.
                {
                    name : 'Black people',
                    title : {
                        media : {word : 'Black people'},
                        css : {color:'#31b404','font-size':'1.8em'},
                        height : 4,
                        startStimulus : {
                            media : {word : 'Tyron, Malik, Terrell, Jazmin, Tiara, Shanice'},
                            css : {color:'#31b404','font-size':'1em'},
                            height : 2
                        }
                    },
                    stimulusMedia : [
                        {word: 'Tyron'},
                        {word: 'Malik'},
                        {word: 'Terrell'},
                        {word: 'Jazmin'},
                        {word: 'Tiara'},
                        {word: 'Shanice'}
                    ],
                    stimulusCss : {color:'#31b404','font-size':'2em'}
                },
                {
                    name : 'White people',
                    title : {
                        media : {word : 'White people'},
                        css : {color:'#31b404','font-size':'1.8em'},
                        height : 4,
                        startStimulus : {
                            media : {word : 'Jake, Connor, Bradley, Alison, Emma, Emily'},
                            css : {color:'#31b404','font-size':'1em'},
                            height : 2
                        }
                    },
                    stimulusMedia : [
                        {word: 'Jake'},
                        {word: 'Connor'},
                        {word: 'Bradley'},
                        {word: 'Allison'},
                        {word: 'Emma'},
                        {word: 'Emily'}
                    ],
                    //Stimulus css
                    stimulusCss : {color:'#31b404','font-size':'2em'}
                }
            ],
            attribute1 :
                {
                    name : 'Pleasant',
                    title : {
                        media : {word : 'Pleasant'},
                        css : {color:'#0000FF','font-size':'1.8em'},
                        height : 4,
                        startStimulus : {
                            media : {word : 'Joy, Love, Happy, Good'},
                            css : {color:'#0000FF','font-size':'1em'},
                            height : 2
                        }
                    },
                    stimulusMedia : [
                        {word : 'Joy'},
                        {word : 'Love'},
                        {word : 'Happy'},
                        {word : 'Good'}
                    ],
                    stimulusCss : {color:'#0000FF','font-size':'2em'}
                },
            attribute2 :
                {
                    name : 'Unpleasant',
                    title : {
                        media : {word : 'Unpleasant'},
                        css : {color:'#0000FF','font-size':'1.8em'},
                        height : 4,
                        startStimulus : {
                            media : {word : 'Horrible, Evil, Nasty, Bad'},
                            css : {color:'#0000FF','font-size':'1em'},
                            height : 2
                        }
                    },
                    stimulusMedia : [
                        {word : 'Horrible'},
                        {word : 'Nasty'},
                        {word : 'Bad'},
                        {word : 'Evil'}
                    ],
                    stimulusCss : {color:'#0000FF','font-size':'2em'}
                },
            text: {
                leftKeyText:'"E" for all else',
                rightKeyText:'"I" if item belongs',
                orText:'or',
                remindErrorText : '<p style="font-size:0.6em;font-family:arial sans-serif; text-align:center;">' +
                    'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' +
                    'Press the other key to continue.<p/>',
                finalText : 'Press space to continue to the next task',
                instTemplate: '<div><p style="font-size:20px; font-family:arial sans-serif; text-align:center;"><br/>' +
                    '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
                    '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
                    'Put a right finger on the <b>I</b> key for items that belong to the category ' +
                    '<font-color="#0000FF">focalAtt</font>, ' +
                    'and for items that belong to the category <font-color="#31b404">focalCat</font>.<br/>' +
                    'Put a left finger on the <b>E</b> key for items that do not belong to these categories.<br/><br/>' +
                    'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' +
                    'Press the other key to continue.<br/><br/>' +
                    '<p style="text-align:center;">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
            },
            touch_text : {
                rightKeyTextTouch : 'Left for all else',
                leftKeyTextTouch : 'Right if item belongs',
                remindErrorTextTouch : '<p style="font-size:1.4em; font-family:arial sans-serif; text-align:center;">' +
                    'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' +
                    'Touch the other side to continue.<p/>',
                finalTouchText: 'Touch the bottom green area to continue to the next task',
                instTemplateTouch: '<div><p style="text-align:center;"" ' +
                    '<br/><font-color="#000000"><u>Part blockNum of nBlocks </u><br/></p>' +
                    '<p style="text-align:left;" style="margin-left:5px"> ' +
                    'Put a right finger on the <b>right</b> green area for items that belong to the category ' +
                    '<font-color="#0000FF">focalAtt</font>, ' +
                    'and for items that belong to the category <font-color="#31b404">focalCat</font>.<br/>' +
                    'Put a left finger on the <b>left</b> green area for items that do not belong to these categories.<br/>' +
                    'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' +
                    'Press the other key to continue.<br/>' +
                    '<p style="text-align:center;">Touch the <b>lower </b> green area to start.</font></p></div>',

            }
        };
    }

    var blocksComponent$2 = {
        controller:controller$j,
        view:view$j
    };

    function controller$j(settings, defaultSettings, rows){
        var blocks = settings.blocks;
        return {set: set, get: get, rows:rows.slice(0,-1), reset: reset, clear: clear};

        function reset(){showClearOrReset(blocks, defaultSettings.blocks, 'reset');}
        function clear(){showClearOrReset(blocks, rows.slice(-1)[0], 'clear');}
        function get(name){return blocks[name];}
        function set(name, type){
            if (type === 'number') return function(value){return blocks[name] = Math.abs(Math.round(value));};
            return function(value){return blocks[name] = value;};
        }
    }
    function view$j(ctrl, settings){
        return m('.space' , [
            //create numbers inputs
            ctrl.rows.map(function(row){
                //if user chooses not to have a practice block set its parameter to 0
                if (row.name === 'nPracticeBlockTrials' && settings.parameters.practiceBlock === false) {
                    settings.blocks.nPracticeBlockTrials = 0;
                    return;
                }
                return m('.row.line', [
                    m('.col-md-4',
                        row.desc ?
                            [
                                m('span', [' ', row.label, ' ']),
                                m('i.fa.fa-info-circle.text-muted',{title:row.desc})
                            ]
                            : m('span', [' ', row.label])
                    ),
                    row.options ?
                        m('.col-md-3.col-lg-2',
                            m('select.form-control',{value: ctrl.get(row.name), onchange:m.withAttr('value',ctrl.set(row.name))},[
                                row.options.map(function(option){return m('option', option);})
                            ]))
                        : row.name.includes('random') ?
                            m('.col-md-3.col-lg-1',
                                m('input[type=checkbox]', {onclick: m.withAttr('checked', ctrl.set(row.name,'checkbox')), checked: ctrl.get(row.name)})
                            )
                            : m('.col-md-3.col-lg-2',
                                m('input[type=number].form-control',{placeholder:'0', onchange: m.withAttr('value', ctrl.set(row.name, 'number')), value: ctrl.get(row.name), min:0})
                            )

                ]);
            }), resetClearButtons(ctrl.reset, ctrl.clear)
        ]);
    }

    var categoriesComponent = {
        controller:controller$i,
        view:view$i
    };

    function controller$i(settings, defaultSettings, clearElement){
        var categories = settings.categories;
        categories.forEach(function (element) { //adding a random key for each category
            element.key = Math.random();
        });
        var headlines = ['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth'];
        var chooseFlag = m.prop(false);
        var chosenCategoriesList = m.prop([]);
        var chooseClicked = m.prop(false);
        var curr_tab = m.prop(0);

        return {reset: reset, clear: clear, chooseFlag: chooseFlag, unChooseCategories: unChooseCategories,categories: categories, headlines: headlines, addCategory: addCategory, chosenCategoriesList: chosenCategoriesList,
            updateChosenBlocks: updateChosenBlocks, showRemoveCategories: showRemoveCategories, chooseCategories: chooseCategories, curr_tab: curr_tab, getDefaultValues: getDefaultValues};

        function clear(curr_tab){showClearOrReset(categories[curr_tab], clearElement[0], 'clear');}
        function reset(curr_tab){showClearOrReset(categories[curr_tab], defaultSettings.categories[curr_tab], 'reset');
        }
        function addCategory() {
            categories.push(clone(clearElement[0]));
            var last = categories.length - 1;
            categories[last].key = Math.random();
        }
        function updateChosenBlocks(e, index){
            //if clicked the checkbox to uncheck the item
            if (chosenCategoriesList().includes(index) && !e.target.checked){
                var i = chosenCategoriesList().indexOf(index);
                if (i !== -1) chosenCategoriesList().splice(i, 1);
                return;
            }
            if (e.target.checked) chosenCategoriesList().push(index);
        }
        function unChooseCategories(){
            chooseFlag(false);
            chosenCategoriesList().length = 0;
        }
        function chooseCategories(){
            if(categories.length < 3){
                showRestrictions('error','It\'s not possible to remove categories because there must be at least 2 categories.','Error');
                return;
            }
            chooseFlag(true);
            if (!chooseClicked()) { //show the info msg only for the first time the choose button has been clicked
                showRestrictions('info','To choose categories to remove, please tik the checkbox near the wanted category, and to remove them click the \'Remove Chosen Categories\' button.', 'Choose categories to remove');
                chooseClicked(true);
            }
        }
        function showRemoveCategories(){
            if ((categories.length - chosenCategoriesList().length) < 2){
                showRestrictions('error','Minimum number of categories needs to be 2, please choose less categories to remove', 'Error Removing Chosen Categories');
                return;
            }
            return messages.confirm({header: 'Are you sure?', content:
                    m('', 'This action is permanent')})
                .then(function (response) {
                    if (response) {
                        removeCategories();
                        m.redraw();
                    }
                    else {
                        chosenCategoriesList().length = 0;
                        chooseFlag(false);
                        m.redraw();
                    }
                }).catch(function (error) { return messages.alert({header: 'Error in removing categories' , content: m('p.alert.alert-danger', error.message)}); })
                .then(m.redraw());

            function removeCategories(){
                chosenCategoriesList().sort();
                for (var i = chosenCategoriesList().length - 1; i >=0; i--)
                    categories.splice(chosenCategoriesList()[i],1);

                chosenCategoriesList().length = 0;
                chooseFlag(false);
                curr_tab(categories.length - 1);
            }
        }

        function getDefaultValues(){
            var stimulusMedia = null;
            var startStimulus = null;
            if(curr_tab() < 2){
                stimulusMedia = defaultSettings.categories[curr_tab()].stimulusMedia;
                startStimulus = defaultSettings.categories[curr_tab()].title.startStimulus;
            }
            return [stimulusMedia, startStimulus];
        }
    }

    function view$i(ctrl,settings) {
        return m('.space',[
            m('.row',[
                m('.col-md-12',
                    m('.subtab', ctrl.categories.map(function(tab, index){
                        return m('button',{
                            class: ctrl.curr_tab() === index ? 'active' : '',
                            onclick:function(){
                                ctrl.curr_tab(index);
                            }}, ctrl.headlines[index] + ' Category ',
                        !ctrl.chooseFlag() ? '' :
                            m('input[type=checkbox].space', {checked : ctrl.chosenCategoriesList().includes(index), onclick: function (e) { return ctrl.updateChosenBlocks(e, index); }}));
                    }))
                )
            ]),
            m('.row.space',[
                m('.col-md-9',
                    m('.btn-group btn-group-toggle', [
                        ctrl.categories.length > 7 ? '' :
                            m('button.btn btn btn-info',{title:'You can add up to 8 categories',onclick: ctrl.addCategory}, [m('i.fa.fa-plus')],' Add Category'),
                        !ctrl.chooseFlag() ?
                            m('button.btn btn btn-secondary',{onclick: ctrl.chooseCategories},[
                                m('i.fa.fa-check'), ' Choose Categories to Remove'])
                            : m('button.btn btn btn-warning',{onclick: ctrl.unChooseCategories},[
                                m('i.fa.fa-minus-circle'), ' Un-Choose Categories to Remove']),
                        !ctrl.chosenCategoriesList().length ? '' :
                            m('button.btn btn btn-danger',{onclick: ctrl.showRemoveCategories},[
                                m('i.fa.fa-eraser'), ' Remove Chosen Categories'])

                    ])
                )
            ]),
            m('div',{key:ctrl.categories[ctrl.curr_tab()].key},
                m.component(elementComponent$1, {key:'categories'}, settings, ctrl.getDefaultValues()[0], ctrl.getDefaultValues()[1], ctrl.curr_tab())),
            m('hr'),
            resetClearButtons(ctrl.reset, ctrl.clear, ctrl.curr_tab(), true)
        ]);
    }

    var outputComponent$3 = {
        controller: controller$h,
        view:view$h
    };

    function controller$h(settings, defaultSettings, blocksObject){
        var error_msg = [];
        error_msg = validityCheck$4(error_msg, settings, blocksObject);

        return {createFile: createFile, error_msg: error_msg};

        function createFile(settings, type){
            return function(){
                var output,textFileAsBlob;
                var downloadLink = document.createElement('a');
                if (type === 'JS'){
                    output = toString$4(settings);
                    textFileAsBlob = new Blob([output], {type:'text/plain'});
                    downloadLink.download = 'BIAT.js';
                }
                else {
                    output = updateSettings$9(settings);
                    textFileAsBlob = new Blob([JSON.stringify(output,null,4)], {type : 'application/json'});
                    downloadLink.download = 'BIAT.json';
                }
                if (window.webkitURL) {downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);}
                else {
                    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                    downloadLink.style.display = 'none';
                    document.body.appendChild(downloadLink);
                }
                downloadLink.click();
            };
        }

    }
    function validityCheck$4(error_msg, settings, blocksObject){
        var category_headlines = ['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth'];

        var temp1,temp2,temp3 = false;
        if(settings.parameters.practiceBlock){
            temp1 = checkMissingElementName(settings.practiceCategory1, 'First Practice Category', error_msg);
            temp2 = checkMissingElementName(settings.practiceCategory2, 'Second Practice Category', error_msg);
        }
        settings.categories.map(function(category, index){
            var temp = checkMissingElementName(category, category_headlines[index]+' Category', error_msg);
            if (temp) temp3 = true;
        });

        var temp4 = checkMissingElementName(settings.attribute1, 'First Attribute', error_msg);
        var temp5 = checkMissingElementName(settings.attribute2, 'Second Attribute', error_msg);

        var containsImage = temp1 || temp2 || temp3 || temp4 || temp5;

        if(settings.parameters.base_url.image.length === 0 && containsImage)
            error_msg.push('Image\'s url is missing and there is an image in the study');

        //check for blocks problems
        var currBlocks = clone(settings.blocks);
        var clearBlocks = blocksObject.slice(-1)[0]; //blocks parameters with zeros as the values, used to check if the current parameters are also zeros.
        ['focalAttribute', 'firstFocalAttribute', 'focalCategoryOrder'].forEach(function(key){
            delete currBlocks[key];
            delete clearBlocks[key];
        });

        if(JSON.stringify(currBlocks) === JSON.stringify(clearBlocks))
            error_msg.push('All the block\'s parameters equals to 0, that will result in not showing the task at all');
        return error_msg;

    }

    function removeIndexFromCategories(settings){
        settings.categories.forEach(function (element) { return delete element.key; });
        return settings;
    }

    function toString$4(settings, external){
        return toScript$4(updateSettings$9(settings), external);
    }

    function updateSettings$9(settings){
        // remove added keys and put in a temp var to keep keys on original settings
        var temp_settings = clone(settings);
        temp_settings = removeIndexFromCategories(temp_settings);
        var output = {};
        if (settings.parameters.practiceBlock){
            output.practiceCategory1 = temp_settings.practiceCategory1;
            output.practiceCategory2 = temp_settings.practiceCategory2;
        }
        output.categories = temp_settings.categories;
        output.attribute1 = temp_settings.attribute1;
        output.attribute2 = temp_settings.attribute2;
        output.base_url = temp_settings.parameters.base_url;
        output.remindError =  temp_settings.parameters.remindError;
        output.showStimuliWithInst = temp_settings.parameters.showStimuliWithInst;
        output.isTouch = temp_settings.parameters.isTouch;
        output.practiceBlock = temp_settings.parameters.practiceBlock;

        temp_settings.parameters.isQualtrics ? output.isQualtrics = temp_settings.parameters.isQualtrics : '';

        Object.assign(output, temp_settings.blocks);
        temp_settings.parameters.isTouch ? Object.assign(output, temp_settings.touch_text) : Object.assign(output, temp_settings.text);
        return output;
    }

    function toScript$4(output, external){
        var textForInternal = '//Note: This script was created by the BIAT wizard.\n//Modification of this file won\'t be reflected in the wizard.\n';
        var script = "define(['pipAPI' ,'" + (output.isQualtrics ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/BIAT/qualtrics/qbiat6.js': 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/BIAT/biat6.js') + "'], function(APIConstructor, iatExtension){\n\tvar API = new APIConstructor(); return iatExtension(" + (JSON.stringify(output,null,4)) + ");});";
        external === false ? script = textForInternal + script : '';
        return script;
    }

    function view$h(ctrl, settings){
        return viewOutput(ctrl, settings, toString$4);
    }

    var importComponent$4 = {
        controller:controller$g,
        view:view$g
    };

    function view$g(ctrl){
        return viewImport(ctrl);
    }

    function controller$g(settings) {
        return {handleFile: handleFile, updateSettings: updateSettings$8};

        function handleFile(){
            var importedFile = document.getElementById('uploadFile').files[0];
            var reader = new FileReader();
            reader.readAsText(importedFile);
            reader.onload = function(){
                var fileContent = JSON.parse(reader.result);
                settings = updateSettings$8(settings, fileContent);
            };
        }
    }
    function updateSettings$8(settings, input) {
        if(input.practiceBlock) {
            settings.practiceCategory1 = input.practiceCategory1;
            settings.practiceCategory2 = input.practiceCategory2;
        }
        settings.categories = input.categories;
        settings.attribute1 = input.attribute1;
        settings.attribute2 = input.attribute2;
        settings.parameters.base_url = input.base_url;
        settings.parameters.remindError = input.remindError;
        settings.parameters.showStimuliWithInst = input.showStimuliWithInst;
        settings.parameters.isTouch = input.isTouch;
        settings.parameters.practiceBlock = input.practiceBlock;
        settings.blocks.nMiniBlocks = input.nMiniBlocks;
        settings.blocks.nTrialsPerMiniBlock = input.nTrialsPerMiniBlock;
        settings.blocks.nPracticeBlockTrials = input.nPracticeBlockTrials;
        settings.blocks.nCategoryAttributeBlocks = input.nCategoryAttributeBlocks;
        settings.blocks.focalAttribute = input.focalAttribute;
        settings.blocks.firstFocalAttribute = input.firstFocalAttribute;
        settings.blocks.focalCategoryOrder = input.focalCategoryOrder;
        if(input.isQualtrics) settings.parameters.isQualtrics = input.isQualtrics;
        if (input.isTouch){
            settings.touch_text.remindErrorTextTouch = input.remindErrorTextTouch;
            settings.touch_text.leftKeyTextTouch = input.leftKeyTextTouch;
            settings.touch_text.rightKeyTextTouch = input.rightKeyTextTouch;
            settings.touch_text.orKeyText = input.orKeyText;
            settings.touch_text.finalTouchText = input.finalTouchText;
            settings.touch_text.instTemplateTouch = input.instTemplateTouch;
        }
        else {
            settings.text.remindErrorText = input.remindErrorText;
            settings.text.leftKeyText = input.leftKeyText;
            settings.text.rightKeyText = input.rightKeyText;
            settings.text.orKeyText = input.orKeyText;
            settings.text.finalText = input.finalText;
            settings.text.instTemplate = input.instTemplate;
        }

        return settings;
    }

    var parametersDesc$4 = [
        {name: 'isTouch', options:['Keyboard', 'Touch'], label:'Keyboard input or touch input?', desc:'The script can run on a desktop computer or a touch device. \nMinno does not auto-detect the input method. If you need a touch version and a keyboard version, create two different scripts with this tool.'},
        {name: 'isQualtrics', options:['Regular','Qualtrics'], label:'Regular script or Qualtrics?', desc: ['If you want this BIAT to run from Qualtrics, read ', m('a',{href: 'https://minnojs.github.io/minnojs-blog/qualtrics-biat/'}, 'this blog post '),'to see how.']},
        {name: 'practiceBlock', label: 'Practice Block', desc: 'Should the task start with a practice block?'},
        {name: 'remindError', label: 'Error feedback on incorrect responses', desc: 'Should we show error feedback?\nIt is recommended to show participants an error feedback on error responses.'},
        {name: 'showStimuliWithInst', label: 'Show Stimuli with Instructions', desc: 'Whether to show the stimuli of the IN categories at the beginning of the block.'},
        {name: 'base_url', label: 'Image\'s URL', desc: 'If your task has any images, enter here the path to that images folder.\nIt can be a full url, or a relative URL to the folder that will host this script.'},
        {istouch:false, isQualtrics:false, practiceBlock:false, showStimuliWithInst:false, remindError:false, base_url:{image:''}}
    ];

    var blocksDesc$4 = [
        {name: 'nMiniBlocks', label: 'Mini Blocks', desc: 'Each block can be separated to a number of mini-blocks, to reduce repetition of the same response in consecutive trials. The default, 1, means that we don\'t actually use mini blocks.'},
        {name: 'nTrialsPerMiniBlock', label: 'Trials in Mini Blocks', desc: '50% on the right, 50% left, 50% attributes, 50% categories.'},
        {name: 'nPracticeBlockTrials', label: 'Trials in Practice Block', desc:'Should be at least 8 trials'},
        {name: 'nCategoryAttributeBlocks', label: 'Blocks per focal category-attribute combination', desc: 'Number of blocks per focal category-attribute combination'},
        {name: 'focalAttribute', label: 'Focal Attribute', desc: 'Sets whether we use a certain focal attribute throughout the task, or both.', options: ['attribute1','attribute2','both']},
        {name: 'firstFocalAttribute', label: 'First Focal Attribute', desc: 'Sets what attribute appears first. Irrelevant if Focal Attribute is not \'both\'.', options: ['attribute1','attribute2','random']},
        {name: 'focalCategoryOrder', label: 'Focal Category Order', desc: 'If bySequence then we always start with the first category in the list as the first focal category.', options: ['bySequence','random']},
        {nMiniBlocks: 0, nTrialsPerMiniBlock: 0, nPracticeBlockTrials:0, nCategoryAttributeBlocks:0,
            focalAttribute: 'attribute1', firstFocalAttribute : 'random', focalCategoryOrder: 'random'}
    ];

    var textDesc$4 = [
        {name: 'instTemplate', nameTouch: 'instTemplateTouch',label:'Instructions'},
        {name: 'remindErrorText', nameTouch: 'remindErrorTextTouch' , label:'Screen\'s Bottom (error reminder)', desc:'We use this text to remind participants what happens on error. Replace this text if you do not require participants to correct their error responses (see General Parameters page).'},
        {name: 'leftKeyText', nameTouch:'leftKeyTextTouch',label:'Top-left text (about the left key)', desc: 'We use this text to remind participants what key to use for a left response.'},
        {name: 'rightKeyText', nameTouch:'rightKeyTextTouch',label:'Top-right text (about the right key)', desc: 'We use this text to remind participants what key to use for a right response.'},
        {name: 'orText', label:'Or', desc: 'We show this text in the combined blocks to separate between the two categories that use the same key.'},
        {name: 'finalText', nameTouch: 'finalTouchText' , label:'Text shown at the end of the task'},
        {remindErrorText:'', leftKeyText:'', rightKeyText:'', orText:'', instTemplate:'', finalText:''},
        {remindErrorTextTouch:'', leftKeyTextTouch:'', rightKeyTextTouch:'',  instTemplateTouch:'', finalTouchText:''}
    ];

    var elementClear = [{
        name : '',
        title : {
            media : {word : ''},
            css : {color:'#000000','font-size':'1em'},
            height : 4, 
            startStimulus : { 
                media : {word : ''},
                css : {color:'#000000','font-size':'1em'},
                height : 2
            }
        },
        stimulusMedia : [], 
        stimulusCss : {color:'#000000','font-size':'1em'} }];


    var attributesTabs$2 = {
        'attribute1': {text: 'First Attribute'},
        'attribute2': {text: 'Second Attribute'}
    };

    var practiceTabs = {
        'practiceCategory1':{text: 'First Practice Category'},
        'practiceCategory2':{text: 'Second Practice Category'}
    };

    var tabs$4 = {
        'parameters': {text: 'General parameters', component: parametersComponent$1, rowsDesc: parametersDesc$4},
        'blocks': {text: 'Blocks', component: blocksComponent$2, rowsDesc: blocksDesc$4},
        'practice': {
            text: 'Practice Block',
            component: categoriesComponent$1,
            rowsDesc: elementClear,
            subTabs: practiceTabs,
            type: 'BIAT'
        },
        'categories': {text: 'Categories', component: categoriesComponent, rowsDesc: elementClear},
        'attributes': {
            text: 'Attributes',
            component: categoriesComponent$1,
            rowsDesc: elementClear,
            subTabs: attributesTabs$2,
            type: 'BIAT'
        },
        'text': {text: 'Texts', component: textComponent, rowsDesc: textDesc$4},
        'output': {text: 'Complete', component: outputComponent$3, rowsDesc: blocksDesc$4},
        'import': {text: 'Import', component: importComponent$4},
        'about': {text: 'About', component: aboutComponent, rowsDesc: 'BIAT'}
    };

    var biat = function (args, external) { return m.component(biatComponent, args, external); };

    var biatComponent = {
        controller: controller$f,
        view: view$f
    };

    function controller$f(ref, external){
        var file = ref.file;
        var study = ref.study;
        if ( external === void 0 ) external = false;

        var ctrl = {
            study: study ? study : null,
            file : file ? file : null,
            err : m.prop([]),
            last_modify : m.prop(''),
            loaded : m.prop(false),
            notifications : createNotifications(),
            defaultSettings : clone(defaultSettings$4(external)),
            settings : clone(defaultSettings$4(external)),
            external: external,
            is_locked:m.prop(study ? study.is_locked : null),
            show_do_save: show_do_save,
            is_settings_changed: is_settings_changed
        };

        ctrl.settings.external = ctrl.external;

        function load() {
            return ctrl.file.get()
                .catch(ctrl.err)
                .then(function () {
                    if (ctrl.file.content().length>10) {
                        ctrl.last_modify(file.last_modify);
                        ctrl.settings = JSON.parse(ctrl.file.content());
                        ctrl.prev_settings = clone(ctrl.settings);
                    }
                    ctrl.loaded(true);
                })
                .then(m.redraw);
        }

        function show_do_save(){
            var error_msg = [];
            var blocksObject = tabs$4.blocks.rowsDesc; //blockDesc inside output attribute
            error_msg = validityCheck$4(error_msg, ctrl.settings, blocksObject);
            if(error_msg.length !== 0) {
                return messages.confirm({
                    header: 'Some problems were found in your script, it\'s recommended to fix them before saving:',
                    content:
                        m('div',[
                            m('.alert alert-danger', [
                                m('ul', [
                                    error_msg.map(function (err) {
                                        return m('li', err);
                                    })
                                ])
                            ]),
                            m('strong','Do you want to save anyway?')
                        ])
                })
                    .then(function (response) {
                        if (response) do_save();
                    }).catch(function (error) { return messages.alert({
                        content: m('p.alert.alert-danger', error.message)
                    }); })
                    .then(m.redraw());
            }
            else do_save();

        }
        function do_save(){
            ctrl.err([]);
            var studyId  =  m.route.param('studyId');
            var fileId = m.route.param('fileId');
            var jsFileId =  fileId.split('.')[0]+'.js';
            save('biat', studyId, fileId, ctrl.settings, ctrl.last_modify)
                .then (function () { return saveToJS('biat', studyId, jsFileId, toString$4(ctrl.settings, ctrl.external), ctrl.last_modify); })
                .then(ctrl.study.get())
                .then(function () { return ctrl.notifications.show_success("BIAT Script successfully saved"); })
                .then(m.redraw)
                .catch(function (err) { return ctrl.notifications.show_danger('Error Saving:', err.message); });
            ctrl.prev_settings = clone(ctrl.settings);
            m.redraw();
        }

        function is_settings_changed(){
            // remove added keys and put in a temp var to keep keys on original settings
            var temp_settings = removeIndexFromCategories(clone(ctrl.settings));
            var temp_prev_settings = ctrl.prev_settings === undefined ? ' ' : //if this is a new file and the prev_settings isn't set
                removeIndexFromCategories(clone(ctrl.prev_settings));
            return JSON.stringify(temp_prev_settings) !== JSON.stringify(temp_settings);
        }

        external ? null : load();
        return ctrl;
    }
    function view$f(ctrl){
        if(!ctrl.external) {
            return !ctrl.loaded()
                ? m('.loader')
                : m('.wizard.container-fluid.space',
                    m.component(tabsComponent, tabs$4, ctrl.settings, ctrl.defaultSettings, ctrl.external, ctrl.notifications,
                        ctrl.is_locked, ctrl.is_settings_changed, ctrl.show_do_save));
        }
        return m('.container-fluid',[
            pageHeadLine('BIAT'),
            m.component(messages),
            m.component(tabsComponent, tabs$4, ctrl.settings, ctrl.defaultSettings, ctrl.external)
        ]);
    }

    function defaultSettings$3(external) {

        return {
            parameters: {
                keyTopLeft: 'E', keyTopRight: 'I', keyBottomLeft: 'C', keyBottomRight: 'N',
                base_url: {image: external ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/docs/images/' : './images'}
            },
            objectCat1: {
                name: 'Mammals', title: {media: {word: 'Mammals'}, css: {color: '#31b404', 'font-size': '2em'}, height: 8},
                stimulusMedia: [{word: 'Dogs'}, {word: 'Horses'}, {word: 'Lions'}, {word: 'Cows'}],
                stimulusCss: {color: '#31b404', 'font-size': '2em'}
            },
            objectCat2: {
                name: 'Birds', title: {media: {word: 'Birds'}, css: {color: '#31b404', 'font-size': '2em'}, height: 8},
                stimulusMedia: [{word: 'Pigeons'}, {word: 'Swans'}, {word: 'Crows'}, {word: 'Ravens'}],
                stimulusCss: {color: '#31b404', 'font-size': '2em'}
            },
            attribute1: {
                name: 'Unpleasant',
                title: {media: {word: 'Unpleasant'}, css: {color: '#0000FF', 'font-size': '2em'}, height: 8},
                stimulusMedia: [{word: 'Bomb'}, {word: 'Abuse'}, {word: 'Sadness'}, {word: 'Pain'}, {word: 'Poison'}, {word: 'Grief'}],
                stimulusCss: {color: '#0000FF', 'font-size': '2em'}
            },
            attribute2: {
                name: 'Pleasant',
                title: {media: {word: 'Pleasant'}, css: {color: '#0000FF', 'font-size': '2em'}, height: 8},
                stimulusMedia: [{word: 'Paradise'}, {word: 'Pleasure'}, {word: 'Cheer'}, {word: 'Wonderful'}, {word: 'Splendid'}, {word: 'Love'}],
                stimulusCss: {color: '#0000FF', 'font-size': '2em'}
            },
            blocks: {
                nBlocks: 3,
                nTrialsPerPrimeTargetPair: 10,
                randomCategoryLocation: true,
                randomAttributeLocation: false
            },
            text: {
                firstBlock:
                    '<div><p style="font-size:18px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'Put your left middle and index finger on the <b>keyTopLeft</b> and <b>keyBottomLeft</b> keys. ' +
                    'Put your right middle and index finger on the <b>keyTopRight</b> and <b>keyBottomRight</b> keys. ' +
                    'Pairs of stimuli will appear in the middle of the screen. ' +
                    'Four pairs of categories will appear in the corners of the screen. ' +
                    'Sort each pair of items to the corner in which their two categories appear. ' +
                    'If you make an error, an <font color="#FF0000"><b>X</b></font> will appear until you hit the correct key. ' +
                    'This is a timed sorting task. <b>GO AS FAST AS YOU CAN</b> while making as few mistakes as possible.' +
                    '</color></p><p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                    'press SPACE to begin</p><p style="font-size:14px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round 1 of 3]</p></div>',
                middleBlock:
                    '<div><p style="font-size:18px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'Press SPACE to continue with the same task.<br/><br/>' +
                    'Sort each pair of items to the corner in which their two categories appear. ' +
                    'If you make an error, an <font color="#FF0000"><b>X</b></font> will appear until you hit the correct key. ' +
                    'This is a timed sorting task. <b>GO AS FAST AS YOU CAN</b> while making as few mistakes as possible.</p>' +
                    '<p style="font-size:14px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round 2 of 3]</p></div>',
                lastBlock:
                    '<div><p style="font-size:18px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'This task can be a little exhausting. ' +
                    'Try to challenge yourself to respond as quickly as you can without making mistakes.<br/><br/>' +
                    'Press SPACE for the final round.</p><br/><br/>' +
                    '<p style="font-size:14px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round 3 of 3]</p></div>'
            }
        };
    }

    var outputComponent$2 = {
        controller: controller$e,
        view:view$e
    };

    function controller$e(settings, defaultSettings, blocksObject){
        var error_msg = [];

        error_msg = validityCheck$3(error_msg, settings, blocksObject);

        return {createFile: createFile, error_msg: error_msg};

        function createFile(settings, fileType){
            return function(){
                var output,textFileAsBlob;
                var downloadLink = document.createElement('a');
                if (fileType === 'JS') {
                    output = toString$3(settings);
                    textFileAsBlob = new Blob([output], {type:'text/plain'});
                    downloadLink.download = 'SPF.js'; }
                else {
                    output = updateSettings$7(settings);
                    textFileAsBlob = new Blob([JSON.stringify(output,null,4)], {type : 'application/json'});
                    downloadLink.download = 'SPF.json'; }
                if (window.webkitURL != null) {downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);}
                else {
                    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                    downloadLink.style.display = 'none';
                    document.body.appendChild(downloadLink);
                }
                downloadLink.click();
            };
        }
    }

    function updateSettings$7(settings){
        var output={
            objectCat1: settings.objectCat1,
            objectCat2: settings.objectCat2,
            attribute1: settings.attribute1,
            attribute2: settings.attribute2,
        };
        Object.assign(output, settings.parameters);
        Object.assign(output, settings.blocks);
        Object.assign(output, settings.text);
        return output;
    }

    function toString$3(settings, external){
        return toScript$3(updateSettings$7(settings), external);
    }

    function toScript$3(output, external){
        var textForInternal = '//Note: This script was created by the SPF wizard.\n//Modification of this file won\'t be reflected in the wizard.\n';
        var script = "define(['pipAPI' ,'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/spf/spf4.js'], function(APIConstructor, spfExtension){\n\tvar API = new APIConstructor(); return spfExtension(" + (JSON.stringify(output,null,4)) + ")});";
        external === false ? script = textForInternal + script : '';
        return script;
    }

    function validityCheck$3(error_msg, settings, blocksObject){
        var temp1 = checkMissingElementName(settings.objectCat1, 'First Category', error_msg);
        var temp2 = checkMissingElementName(settings.objectCat2, 'Second Category', error_msg);
        var temp3 = checkMissingElementName(settings.attribute1, 'First Attribute', error_msg);
        var temp4 = checkMissingElementName(settings.attribute2, 'Second Attribute', error_msg);

        var containsImage = temp1 || temp2 || temp3 || temp4;

        if(settings.parameters.base_url.image.length === 0 && containsImage)
            error_msg.push('Image\'s url is missing and there is an image in the study');

        //check for blocks problems
        var currBlocks = clone(settings.blocks);
        var clearBlocks = blocksObject.slice(-1)[0]; //blocks parameters with zeros as the values, used to check if the current parameters are also zeros.

        ['randomCategoryLocation', 'randomAttributeLocation'].forEach(function(key){
            delete currBlocks[key];
            delete clearBlocks[key];
        });

        if(JSON.stringify(currBlocks) === JSON.stringify(clearBlocks))
            error_msg.push('All the block\'s parameters equals to 0, that will result in not showing the task at all');
        return error_msg;

    }

    function view$e(ctrl, settings){
        return viewOutput(ctrl, settings, toString$3);
    }

    var importComponent$3 = {
        controller:controller$d,
        view:view$d
    };

    function view$d(ctrl){
        return viewImport(ctrl);
    }

    function controller$d(settings){
        var fileInput = m.prop('');
        return {fileInput: fileInput, handleFile: handleFile, updateSettings: updateSettings$6};

        function handleFile(){
            var importedFile = document.getElementById('uploadFile').files[0];
            var reader = new FileReader();
            reader.readAsText(importedFile); 
            reader.onload = function(){
                var fileContent = JSON.parse(reader.result);
                settings = updateSettings$6(settings, fileContent);
            };
        }
    }

    function updateSettings$6(settings, input){
        settings.objectCat1 = input.objectCat1;
        settings.objectCat2 = input.objectCat2;
        settings.attribute1 = input.attribute1;
        settings.attribute2 = input.attribute2;

        settings.parameters.base_url = input.base_url;
        settings.parameters.keyTopLeft = input.keyTopLeft;
        settings.parameters.keyTopRight = input.keyTopRight;
        settings.parameters.keyBottomLeft = input.keyBottomLeft;
        settings.parameters.keyBottomRight = input.keyBottomRight;

        settings.blocks.nBlocks = input.nBlocks;
        settings.blocks.nTrialsPerPrimeTargetPair = input.nTrialsPerPrimeTargetPair;
        settings.blocks.randomCategoryLocation = input.randomCategoryLocation;
        settings.blocks.randomAttributeLocation = input.randomAttributeLocation;

        settings.text.firstBlock = input.firstBlock;
        settings.text.middleBlock = input.middleBlock;
        settings.text.lastBlock = input.lastBlock;

        return settings;

    }

    var parametersDesc$3 = [
        {name: 'keyTopLeft', label:'Top left key', desc: 'It\'s recommended to use upper case letters for the key values.'},
        {name: 'keyTopRight', label:'Top right key'},
        {name: 'keyBottomLeft', label:'Bottom left key'},
        {name: 'keyBottomRight', label:'Bottom right key'},
        {name: 'base_url', label: 'Image\'s URL'},
        {keyTopLeft: '', keyTopRight: '', keyBottomLeft: '', keyBottomRight: '', base_url:{image:''}}
    ];

    var textDesc$3=[
        {name: 'firstBlock', label:'First Block\'s Instructions'},
        {name: 'middleBlock', label:'Middle Block\'s Instructions'},
        {name: 'lastBlock', label:'Last Block\'s Instructions'},
        {firstBlock: '', middleBlock:'', lastBlock:''},
        {} //an empty element

    ];

    var blocksDesc$3 = [
        {name: 'nBlocks', label: 'Number of blocks'},
        {name: 'nTrialsPerPrimeTargetPair', label: 'Number of trials in a block, per category-attribute combination', desc: 'How many trials in each block, for each of the four category-attribute combinations.'},
        {name: 'randomCategoryLocation', label: 'Randomly choose categories location', desc: 'Whether to randomly select which category is on top.\nIf false, then the first category is on top.'},
        {name: 'randomAttributeLocation', label: 'Randomly choose attributes location', desc: 'Whether to randomly select which attribute is on the left.\nIf false, the first attribute is on the left.'},
        {nBlocks: 0, nTrialsPerPrimeTargetPair: 0, randomCategoryLocation : false, randomAttributeLocation: false}
    ];

    var categoryClear$2 = [{
        name: '', 
        title: {media: {word: ''}, css: {color: '#000000', 'font-size': '1em'}, height: 4},
        stimulusMedia: [],
        stimulusCss : {color:'#000000', 'font-size':'1em'}
    }];

    var categoriesTabs$1 = {
        'objectCat1': {text: 'First Category'},
        'objectCat2': {text: 'Second Category'}
    };

    var attributesTabs$1 = {
        'attribute1': {text: 'First Attribute'},
        'attribute2': {text: 'Second Attribute'}
    };

    var tabs$3 = {
        'parameters': {text: 'General parameters', component: parametersComponent$1, rowsDesc: parametersDesc$3},
        'blocks': {text: 'Blocks', component: blocksComponent$2, rowsDesc: blocksDesc$3},
        'categories': {
            text: 'Categories',
            component: categoriesComponent$1,
            rowsDesc: categoryClear$2,
            subTabs: categoriesTabs$1
        },
        'attributes': {
            text: 'Attributes',
            component: categoriesComponent$1,
            rowsDesc: categoryClear$2,
            subTabs: attributesTabs$1
        },
        'text': {text: 'Texts', component: textComponent, rowsDesc: textDesc$3},
        'output': {text: 'Complete', component: outputComponent$2, rowsDesc: blocksDesc$3},
        'import': {text: 'Import', component: importComponent$3},
        'about': {text: 'About', component: aboutComponent, rowsDesc: 'SPF'}
    };

    var spf = function (args, external) { return m.component(spfComponent, args, external); };

    var spfComponent = {
        controller: controller$c,
        view: view$c
    };

    function controller$c(ref, external){
        var file = ref.file;
        var study = ref.study;
        if ( external === void 0 ) external = false;

        var ctrl = {
            study: study ? study : null,
            file : file ? file : null,
            err : m.prop([]),
            last_modify : m.prop(''),
            loaded : m.prop(false),
            notifications : createNotifications(),
            defaultSettings : clone(defaultSettings$3(external)),
            settings : clone(defaultSettings$3(external)),
            external: external,
            is_locked:m.prop(study ? study.is_locked : null),
            show_do_save: show_do_save,
            is_settings_changed: is_settings_changed
        };

        ctrl.settings.external = ctrl.external;

        function load() {
            return ctrl.file.get()
                .catch(ctrl.err)
                .then(function () {
                    if (ctrl.file.content().length>10) {
                        ctrl.last_modify(file.last_modify);
                        ctrl.settings = JSON.parse(ctrl.file.content());
                        ctrl.prev_settings = clone(ctrl.settings);
                    }
                    ctrl.loaded(true);
                })
                .then(m.redraw);
        }

        function show_do_save(){
            var error_msg = [];
            var blocksObject = tabs$3.blocks.rowsDesc; //blockDesc inside output attribute
            error_msg = validityCheck$3(error_msg, ctrl.settings, blocksObject);
            if(error_msg.length !== 0) {
                return messages.confirm({
                    header: 'Some problems were found in your script, it\'s recommended to fix them before saving:',
                    content:
                        m('div',[
                            m('.alert alert-danger', [
                                m('ul', [
                                    error_msg.map(function (err) {
                                        return m('li', err);
                                    })
                                ])
                            ]),
                            m('strong','Do you want to save anyway?')
                        ])
                })
                    .then(function (response) {
                        if (response) do_save();
                    }).catch(function (error) { return messages.alert({
                        content: m('p.alert.alert-danger', error.message)
                    }); })
                    .then(m.redraw());
            }
            else do_save();
        }

        function do_save(){
            ctrl.err([]);
            var studyId  =  m.route.param('studyId');
            var fileId = m.route.param('fileId');
            var jsFileId =  fileId.split('.')[0]+'.js';
            save('spf', studyId, fileId, ctrl.settings, ctrl.last_modify)
                .then (function () { return saveToJS('spf', studyId, jsFileId, toString$3(ctrl.settings, ctrl.external), ctrl.last_modify); })
                .then(ctrl.study.get())
                .then(function () { return ctrl.notifications.show_success("SPF Script successfully saved"); })
                .then(m.redraw)
                .catch(function (err) { return ctrl.notifications.show_danger('Error Saving:', err.message); });
            ctrl.prev_settings = clone(ctrl.settings);
            m.redraw();
        }

        function is_settings_changed(){
            return JSON.stringify(ctrl.prev_settings) !== JSON.stringify(ctrl.settings);
        }

        external ? null : load();
        return ctrl;
    }
    function view$c(ctrl){
        if(!ctrl.external) {
            return !ctrl.loaded()
                ? m('.loader')
                : m('.wizard.container-fluid.space',
                    m.component(tabsComponent, tabs$3, ctrl.settings, ctrl.defaultSettings, ctrl.external, ctrl.notifications,
                        ctrl.is_locked, ctrl.is_settings_changed, ctrl.show_do_save));
        }
        return m('.container-fluid',
            pageHeadLine('SPF'),
            m.component(messages),
            m.component(tabsComponent, tabs$3, ctrl.settings, ctrl.defaultSettings, ctrl.external)
        );
    }

    function defaultSettings$2(external) {

        return {
            parameters: {
                isQualtrics: false,
                base_url: {image: external ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/docs/images/' : './images'}
            },
            category: {
                name: 'Black people',
                title: {media: {word: 'Black people'}, css: {color: '#31b404', 'font-size': '2em'}, height: 4},
                stimulusMedia: [{word: 'Tayron'}, {word: 'Malik'}, {word: 'Terrell'}, {word: 'Jazamin'}, {word: 'Tiara'}, {word: 'Shanice'}],
                stimulusCss: {color: '#31b404', 'font-size': '2em'}
            },
            attribute1: {
                name: 'Unpleasant',
                title: {media: {word: 'Unpleasant'}, css: {color: '#31b404', 'font-size': '2em'}, height: 4},
                stimulusMedia: [{word: 'Bomb'}, {word: 'Abuse'}, {word: 'Sadness'}, {word: 'Pain'}, {word: 'Poison'}, {word: 'Grief'}],
                stimulusCss: {color: '#31b404', 'font-size': '2em'}
            },
            attribute2: {
                name: 'Pleasant',
                title: {media: {word: 'Pleasant'}, css: {color: '#31b404', 'font-size': '2em'}, height: 4},
                stimulusMedia: [{word: 'Paradise'}, {word: 'Pleasure'}, {word: 'Cheer'}, {word: 'Wonderful'}, {word: 'Splendid'}, {word: 'Love'}],
                stimulusCss: {color: '#31b404', 'font-size': '2em'}
            },
            trialsByBlock:
                [//Each object in this array defines a block
                    {
                        instHTML: '',
                        block: 1,
                        miniBlocks: 1,
                        singleAttTrials: 10,
                        sharedAttTrials: 10,
                        categoryTrials: 0
                    },
                    {
                        instHTML: '',
                        block: 2,
                        miniBlocks: 2,
                        singleAttTrials: 10,
                        sharedAttTrials: 7,
                        categoryTrials: 7
                    },
                    {
                        instHTML: '',
                        block: 3,
                        miniBlocks: 2,
                        singleAttTrials: 10,
                        sharedAttTrials: 7,
                        categoryTrials: 7
                    },
                    {
                        instHTML: '',
                        block: 4,
                        miniBlocks: 2,
                        singleAttTrials: 10,
                        sharedAttTrials: 7,
                        categoryTrials: 7
                    },
                    {
                        instHTML: '',
                        block: 5,
                        miniBlocks: 2,
                        singleAttTrials: 10,
                        sharedAttTrials: 7,
                        categoryTrials: 7
                    }
                ],
            blockOrder: 'random', //can be startRight/startLeft/random
            switchSideBlock: 4, //By default, we switch on block 4 (i.e., after blocks 2 and 3 showed the first pairing condition).
            text: {
                leftKeyText: 'Press "E" for',
                rightKeyText: 'Press "I" for',
                orKeyText: 'or',
                remindErrorText: '<p style="font-size:0.6em;font-family:arial sans-serif; text-align:center;">' +
                    'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' +
                    'Press the other key to continue.<p/>',
                finalText: 'You have completed this task<br/><br/>Press SPACE to continue.',
                instTemplatePractice: '<div><p align="center" style="font-size:20px; font-family:arial">' +
                    '<font color="#000000"><u>Part blockNum of nBlocks</u><br/><br/></p>' +
                    '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
                    'Put a left finger on the <b>E</b> key for items that belong to the category ' +
                    '<font color="#31b404">attribute1</font>.<br/>' +
                    'Put a right finger on the <b>I</b> key for items that belong to the category ' +
                    '<font color="#31b404">attribute2</font>.<br/>' +
                    'Items will appear one at a time.<br/><br/>' +
                    'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
                    'Press the other key to continue.<br/><br/>' +
                    '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
                instTemplateCategoryRight: '<div><p align="center" style="font-size:20px; font-family:arial">' +
                    '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
                    '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
                    'Put a left finger on the <b>E</b> key for items that belong to the category ' +
                    '<font color="#31b404">attribute1</font>.<br/>' +
                    'Put a right finger on the <b>I</b> key for items that belong to the category ' +
                    '<font color="#31b404">attribute2</font> ' +
                    'and for items that belong to the category <font color="#31b404">thecategory</font>.<br/>' +
                    'Items will appear one at a time.<br/><br/>' +
                    'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
                    'Press the other key to continue.<br/><br/>' +
                    '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
                instTemplateCategoryLeft: '<div><p align="center" style="font-size:20px; font-family:arial">' +
                    '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
                    '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
                    'Put a left finger on the <b>E</b> key for items that belong to the category ' +
                    '<font color="#31b404">attribute1</font> ' +
                    'and for items that belong to the category <font color="#31b404">thecategory</font>.<br/>' +
                    'Put a right finger on the <b>I</b> key for items that belong to the category ' +
                    '<font color="#31b404">attribute2</font>.<br/>' +
                    'Items will appear one at a time.<br/><br/>' +
                    'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
                    'Press the other key to continue.<br/><br/>' +
                    '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
            }
        };
    }

    var outputComponent$1 = {
        view:view$b,
        controller:controller$b,
    };

    function controller$b(settings, defaultSettings, clearBlock){
        var error_msg = [];
        error_msg = validityCheck$2(error_msg, settings, clearBlock);
        return {error_msg: error_msg, createFile: createFile};

        function createFile(fileType){
            return function(){
                var output,textFileAsBlob;
                var downloadLink = document.createElement('a');
                if (fileType === 'JS') {
                    output = toString$2(settings);
                    textFileAsBlob = new Blob([output], {type:'text/plain'});
                    downloadLink.download = 'STIAT.js'; }
                else {
                    output = updateSettings$5(settings);
                    textFileAsBlob = new Blob([JSON.stringify(output,null,4)], {type : 'application/json'});
                    downloadLink.download = 'STIAT.json'; }
                if (window.webkitURL != null) {downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);}
                else {
                    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                    downloadLink.style.display = 'none';
                    document.body.appendChild(downloadLink);
                }
                downloadLink.click();
            };
        }
    }

    function toString$2(settings, external){
        return toScript$2(updateSettings$5(settings), external);
    }

    function updateMediaSettings$5(settings){
        //update attributes to be compatible to STIAT
        var settings_output = clone(settings);
        settings_output.category.media = settings_output.category.stimulusMedia;
        delete settings_output.category.stimulusMedia;
        settings_output.attribute1.media = settings_output.attribute1.stimulusMedia;
        delete settings_output.attribute1.stimulusMedia;
        settings_output.attribute2.media = settings_output.attribute2.stimulusMedia;
        delete settings_output.attribute2.stimulusMedia;

        settings_output.category.css = settings_output.category.stimulusCss;
        delete settings_output.category.stimulusCss;
        settings_output.attribute1.css = settings_output.attribute1.stimulusCss;
        delete settings_output.attribute1.stimulusCss;
        settings_output.attribute2.css = settings_output.attribute2.stimulusCss;
        delete settings_output.attribute2.stimulusCss;
        return settings_output;
    }

    function updateSettings$5(settings){
        settings = updateMediaSettings$5(settings);
        var output={
            category: settings.category,
            attribute1: settings.attribute1,
            attribute2: settings.attribute2,
            trialsByBlock: settings.trialsByBlock,
            blockOrder: settings.blockOrder,
            switchSideBlock: settings.switchSideBlock,
            base_url: settings.parameters.base_url,
        };
        if(settings.parameters.isQualtrics){
            output.isQualtrics=settings.parameters.isQualtrics;
        }
        Object.assign(output, settings.text);
        return output;
    }

    function toScript$2(output, external){
        var textForInternal = '//Note: This script was created by the STIAT wizard.\n//Modification of this file won\'t be reflected in the wizard.\n';
        var script = "define(['pipAPI' ,'" + (output.isQualtrics ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/stiat/qualtrics/qstiat6.js': 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/stiat/stiat6.js') + "'], function(APIConstructor, stiatExtension){\n\tvar API = new APIConstructor(); return stiatExtension(" + (JSON.stringify(output,null,4)) + ");});";
        external === false ? script = textForInternal + script : '';
        return script;
    }

    function validityCheck$2(error_msg, settings, clearBlock){
        var temp1 = checkMissingElementName(settings.category, 'Category', error_msg);
        var temp2 = checkMissingElementName(settings.attribute1, 'First Attribute', error_msg);
        var temp3 = checkMissingElementName(settings.attribute2, 'Second Attribute', error_msg);

        var containsImage = temp1 || temp2 || temp3;

        if(settings.parameters.base_url.image.length === 0 && containsImage)
            error_msg.push('Image\'s url is missing and there is an image in the study');

        //check for blocks problems
        var currBlocks = clone(settings.trialsByBlock);
        clearBlock = clone(clearBlock); //blocks parameters with zeros as the values, used to check if the current parameters are also zeros.
        delete clearBlock.block;

        var count = 0;
        var temp_err_msg = [];
        currBlocks.forEach(function(element, index){ //remove those parameters for the comparison
            delete element.block;
            if(JSON.stringify(element) === JSON.stringify(clearBlock)){
                temp_err_msg.push('All block #'+(index+1)+' parameters equals to 0, that will result in skipping this block');
                count++;
            }
        });
        if (count === currBlocks.length)
            error_msg.push('All the block\'s parameters equals to 0, that will result in not showing the task at all');
        else if (temp_err_msg.length !==0) error_msg = error_msg.concat(temp_err_msg);

        return error_msg;


    }

    function view$b(ctrl, settings){
        return viewOutput(ctrl, settings, toString$2);
    }

    var blocksComponent$1 = {
        controller:controller$a,
        view:view$a
    };

    function controller$a(settings, defaultSettings, rows){
        var blocks = settings.trialsByBlock;
        var chooseFlag = m.prop(false);
        var chosenBlocksList = m.prop([]);
        var chooseClicked = m.prop(false);
        var clearBlock = rows.slice(-1)[0];
        
        return {showReset: showReset, showClear: showClear, set: set, get: get, blocks: blocks, getParameters: getParameters, setParameters: setParameters, unChooseCategories: unChooseCategories,
            chooseFlag: chooseFlag, addBlock: addBlock, showRemoveBlocks: showRemoveBlocks, chosenBlocksList: chosenBlocksList, updateChosenBlocks: updateChosenBlocks, chooseBlocks: chooseBlocks, rows: rows};

        function beforeClearReset(action, func){
            var msg_text = {
                'reset':{text:'This will delete all current properties and reset them to default values.',title:'Reset?'},
                'clear':{text: 'This will delete all current properties.', title: 'Clear?'}
            };
            return messages.confirm({header: msg_text[action].title, content:
                    m('strong', msg_text[action].text)})
                .then(function (response) {
                    if (response) {
                        func();
                        m.redraw();
                    }
                }).catch(function (error) { return messages.alert({header: msg_text[action].title , content: m('p.alert.alert-danger', error.message)}); })
                .then(m.redraw());

        }
        function showReset(){
            beforeClearReset('reset', reset);
            function reset(){
                Object.assign(blocks, clone(defaultSettings.trialsByBlock));
                if(blocks.length > 5){
                    blocks.length = 5;
                }
                settings.switchSideBlock = defaultSettings.switchSideBlock;
                settings.blockOrder = defaultSettings.blockOrder;
                chosenBlocksList().length = 0;
            }
        }
        function showClear(){
            beforeClearReset('clear', clear);
            function clear(){
                blocks.forEach(function (element) {
                    element.instHTML = '';
                    element.miniBlocks = 0;
                    element.singleAttTrials = 0;
                    element.sharedAttTrials = 0;
                    element.categoryTrials = 0;
                });
                settings.switchSideBlock = 0;
                settings.blockOrder = defaultSettings.blockOrder;
            }
        }

        function get(name, index){ return blocks[index][name]; }
        function set(name, index, type){ 
            if (type === 'text') return function(value){return blocks[index][name] = value; };
            return function(value){return blocks[index][name] = Math.abs(Math.round(value));};
        }
        function getParameters(name){return settings[name]; }
        function setParameters(name, type){
            if (type === 'select') return function(value){return settings[name] = value; };
            return function(value){return settings[name] = Math.abs(Math.round(value));};
        }
        function unChooseCategories(){
            chooseFlag(false);
            chosenBlocksList().length = 0;
        }
        function updateChosenBlocks(e, index){
            if (chosenBlocksList().includes(index) && !e.target.checked){
                var i = chosenBlocksList().indexOf(index);
                if (i !== -1) {
                    chosenBlocksList().splice(i, 1);
                }
                return;
            } 
            if (e.target.checked) chosenBlocksList().push(index);
        }
        function chooseBlocks(){
            if (blocks.length < 4) {
                showRestrictions('error','It\'s not possible to remove blocks because there must be at least 3 blocks.', 'Error in Removing Chosen Blocks');
                return;
            }
            chooseFlag(true);
            if(!chooseClicked()){  //show info message only for the first time the choose button has been clicked
                showRestrictions('info', 'To choose blocks to remove, please tik the checkbox near the wanted block, and to remove them click the \'Remove Chosen Blocks\' button.', 'Choose Blocks to Remove');
                chooseClicked(true);
            }
        }
        function addBlock(){
            blocks.push(clone(clearBlock));
            blocks.slice(-1)[0]['block'] = blocks.length;
        }
        function showRemoveBlocks(){
            if ((blocks.length - chosenBlocksList().length) < 3){
                showRestrictions('error','Minimum number of blocks needs to be 3, please choose less blocks to remove','Error in Removing Chosen Blocks');
                return;
            }
            return messages.confirm({header: 'Are you sure?', content:
                    m('strong', 'This action is permanent')})
                .then(function (response) {
                    if (response) {
                        removeBlocks();
                        m.redraw();
                    }
                    else {
                        chosenBlocksList().length = 0;
                        chooseFlag(false);
                        m.redraw();
                    }
                }).catch(function (error) {showRestrictions('error', 'Something went wrong on the page!\n'+error, 'Oops!');})
                .then(m.redraw());
            function removeBlocks(){
                chosenBlocksList().sort();
                for (var i = chosenBlocksList().length - 1; i >=0; i--)
                    blocks.splice(chosenBlocksList()[i],1);
                
                for (var i$1 = 0; i$1 < blocks.length; i$1++) 
                    blocks[i$1]['block'] = i$1+1;
                
                chosenBlocksList().length = 0;
                chooseFlag(true);
            }
        }
    }

    function view$a(ctrl){
        return m('.space' , [
            ctrl.rows.slice(0,2).map(function(row) {
                return m('.row.line', [
                    m('.col-md-3',[
                        m('span', [' ', row.label, ' ']),
                        m('i.fa.fa-info-circle.text-muted',{
                            title:row.desc
                        })
                    ]),
                    row.options ?
                        m('.col-md-2',
                            m('select.form-control',{value: ctrl.getParameters(row.name), onchange:m.withAttr('value',ctrl.setParameters(row.name, 'select'))},[
                                row.options.map(function(option){return m('option', option);})])
                        )
                        : m('.col-md-2.col-lg-1',
                            m('input[type=number].form-control',{placeholder:'0', value: ctrl.getParameters(row.name), onchange:m.withAttr('value',ctrl.setParameters(row.name)), min:0})
                        )
                ]);
            }),
            ctrl.blocks.map(function(block) {
                var index = ctrl.blocks.indexOf(block);
                return m('.row.line', [
                    m('.col-md-3',[
                        !ctrl.chooseFlag() ? ' ' :
                            m('input[type=checkbox]', {checked : ctrl.chosenBlocksList().includes(index), onclick: function (e) { return ctrl.updateChosenBlocks(e, index); }}),
                        m('span', [' ','Block '+parseInt(index+1), ' ']),
                        index !== 0 ? ' ' :
                            m('i.fa.fa-info-circle.text-muted', {
                                title:'By default, this is the practice block that shows only the attributes and not the category. ' +
                                'Because of that, the number of category trials is 0. ' +
                                'You can change that if you want.'
                            }),
                    ]),
                    m('.col-md-9',[
                        ctrl.rows.slice(2,-1).map(function(row) {
                            return m('.row.space', [
                                m('.col-md-5.space',[
                                    m('span', [' ', row.label, ' ']),
                                    m('i.fa.fa-info-circle.text-muted',{
                                        title:row.desc
                                    }),
                                ]),
                                row.name === 'instHTML' ?
                                    m('.col-md-5', [
                                        m('textarea.form-control',{rows:5, oninput: m.withAttr('value', ctrl.set(row.name, index, 'text')), value: ctrl.get(row.name, index)})
                                    ]) :
                                    m('.col-md-3.col-lg-2',
                                        m('input[type=number].form-control',{placeholder:'0', onchange: m.withAttr('value', ctrl.set(row.name, index,'number')), value: ctrl.get(row.name, index), min:0})
                                    )
                            ]);
                        })
                    ])
                ]);
            }),
            m('.row.space',
                m('.col-sm-8',
                    m('.btn-group btn-group-toggle', [
                        ctrl.blocks.length > 29 ? '' : //limit number of blocks to 30
                            m('button.btn btn btn-info',{onclick: ctrl.addBlock},
                                m('i.fa.fa-plus'),' Add Block'),
                        !ctrl.chooseFlag() ?
                            m('button.btn btn btn-warning',{onclick: ctrl.chooseBlocks},
                                m('i.fa.fa-check'), ' Choose Blocks to Remove')
                            : m('button.btn btn btn-warning',{onclick: ctrl.unChooseCategories},[
                                m('i.fa.fa-minus-circle'), ' Un-Choose Categories to Remove']),
                        !ctrl.chosenBlocksList().length ? '' :
                            m('button.btn btn btn-danger',{onclick: ctrl.showRemoveBlocks, disabled: !ctrl.chosenBlocksList().length},
                                m('i.fa.fa-minus-square'), ' Remove Chosen Blocks')
                    ])
                )
            ), resetClearButtons(ctrl.showReset, ctrl.showClear)
        ]);
    }

    var importComponent$2 = {
        controller:controller$9,
        view:view$9
    };

    function view$9(ctrl){
        return viewImport(ctrl);
    }

    function controller$9(settings) {
        return {handleFile: handleFile, updateSettings: updateSettings$4};

        function handleFile(){
            var importedFile = document.getElementById('uploadFile').files[0];
            var reader = new FileReader();
            reader.readAsText(importedFile); 
            reader.onload = function() {
                var fileContent = JSON.parse(reader.result);
                settings = updateSettings$4(settings, fileContent);
            };
        }
    }

    function updateMediaSettings$4(settings){
        //update attributes to be compatible to IAT so that elementComponent can be used.
        settings.category.stimulusMedia = settings.category.media;
        delete settings.category.media;
        settings.attribute1.stimulusMedia = settings.attribute1.media;
        delete settings.attribute1.media;
        settings.attribute2.stimulusMedia = settings.attribute2.media;
        delete settings.attribute2.media;

        settings.category.stimulusCss = settings.category.css;
        delete settings.category.css;
        settings.attribute1.stimulusCss = settings.attribute1.css;
        delete settings.attribute1.css;
        settings.attribute2.stimulusCss = settings.attribute2.css;
        delete settings.attribute2.css;
        return settings;
    }

    function updateSettings$4(settings, input) {
        settings.category = input.category;
        settings.attribute1 = input.attribute1;
        settings.attribute2 = input.attribute2;
        settings.parameters.base_url = input.base_url;
        settings.parameters.isQualtrics = input.isQualtrics;
        settings.text.leftKeyText = input.leftKeyText;
        settings.text.rightKeyText = input.rightKeyText;
        settings.text.orKeyText = input.orKeyText;
        settings.text.remindErrorText = input.remindErrorText;
        settings.text.finalText = input.finalText;
        settings.text.instTemplatePractice = input.instTemplatePractice;
        settings.text.instTemplateCategoryRight = input.instTemplateCategoryRight;
        settings.text.instTemplateCategoryLeft = input.instTemplateCategoryLeft;
        settings.trialsByBlock = input.trialsByBlock;
        settings.blockOrder = input.blockOrder;
        settings.switchSideBlock = input.switchSideBlock;

        settings = updateMediaSettings$4(settings);
        return settings;

    }

    var parametersDesc$2 = [
        {name: 'isQualtrics', options:['Regular','Qualtrics'],label:'Regular script or Qualtrics?', desc: ['If you want this IAT to run from Qualtrics, read ', m('a',{href: 'https://minnojs.github.io/minnojs-blog/qualtrics-iat/'}, 'this blog post '),'to see how.']},
        {name: 'base_url', label: 'Image\'s URL'},
        {isQualtrics:false, base_url:{image:''}}
    ];

    var textDesc$2 = [
        {name: 'leftKeyText', label:'Top-left text (about the left key)', desc: 'We use this text to remind participants what key to use for a left response.'},
        {name: 'rightKeyText', label:'Top-right text (about the right key)', desc: 'We use this text to remind participants what key to use for a right response.'},
        {name: 'orKeyText', label:'Or', desc: 'We show this text in the combined blocks to separate between the two categories that use the same key.'},
        {name: 'remindErrorText', label: 'Screen\'s Bottom (error reminder)', desc: 'We use this text to remind participants what happens on error.'},
        {name: 'finalText', label:'Text shown at the end of the task'},
        {name: 'instTemplatePractice', label:'Instructions in Practice Block'},
        {name: 'instTemplateCategoryRight', label:'Block instructions when the single category is on the right'},
        {name: 'instTemplateCategoryLeft', label:'Block instructions when the single category is on the left'},
        {textOnError:'', leftKeyText:'', rightKeyText:'', orKeyText:'', remindErrorText:'',finalText:'',
            instTemplatePractice:'', instTemplateCategoryRight:'', instTemplateCategoryLeft:''},
        {} //an empty element
    ];

    var blocksDesc$2 = [
        {name: 'blockOrder', label: 'Block Order', options: ['startRight','startLeft','random'],
            desc: 'Applies to the single category\'s location on the first block. \n' +
                'Choose \'startRight\' for it to appear on the right side, \'startLeft\' for it to appear on the left side, or \'random\' if you want to randomize the location.\n' +
                'Note that the first Attribute on the Attributes page appears on the left side, and the second attribute appears on the right.'},
        {name: 'switchSideBlock', label: 'Switch Side Block ', desc: 'By default, we switch on block 4 (i.e., after blocks 2 and 3 showed the first pairing condition).'},
        {name: 'instHTML', label:'Block\'s Instructions', desc: 'Empty field means we will create the instructions from a default template.'},
        {name: 'miniBlocks', label:'Number of mini-blocks', desc: 'Higher number reduces repetition of same group/response.\nSet to 1 if you don\'t need mini blocks.\nValue of 0 will break the task.'},
        {name: 'singleAttTrials', label:'Number of single attribute trials', desc: 'Number of trials of the attribute that does not share key with the category (in a mini block).'},
        {name: 'sharedAttTrials', label:'Number of shared key attribute trials', desc: 'Number of trials of the attribute that shares key with the category (in a mini block).'},
        {name: 'categoryTrials', label:'Number of category trials', desc: 'Number of trials of the category (in a mini-block).\nIf 0, the label does not appear.'},
        {
            instHTML : '', 
            block : 1,
            miniBlocks : 0, 
            singleAttTrials : 0, 
            sharedAttTrials : 0, 
            categoryTrials : 0 
        }
    ];

    var categoryClear$1 = [{
        name: '', 
        title: {media: {word: ''}, css: {color: '#000000', 'font-size': '1em'}, height: 4},
        stimulusMedia: [],
        stimulusCss : {color:'#000000', 'font-size':'1em'}
    }];

    var category = {
        'category':{text: 'Category'}
    };

    var attributesTabs = {
        'attribute1': {text: 'First Attribute'},
        'attribute2': {text: 'Second Attribute'}
    };

    var tabs$2 = {
        'parameters': {text: 'General parameters', component: parametersComponent$1, rowsDesc: parametersDesc$2},
        'blocks': {text: 'Blocks', component: blocksComponent$1, rowsDesc: blocksDesc$2},
        'category': {text: 'Category', component: categoriesComponent$1, rowsDesc: categoryClear$1, subTabs: category},
        'attributes': {
            text: 'Attributes',
            component: categoriesComponent$1,
            rowsDesc: categoryClear$1,
            subTabs: attributesTabs
        },
        'text': {text: 'Texts', component: textComponent, rowsDesc: textDesc$2},
        'output': {text: 'Complete', component: outputComponent$1, rowsDesc: blocksDesc$2.slice(-1)[0]},
        'import': {text: 'Import', component: importComponent$2},
        'help': {text: 'Help', component: aboutComponent, rowsDesc: 'STIAT'}
    };

    var stiat = function (args, external) { return m.component(stiatComponent, args, external); };

    var stiatComponent = {
        controller: controller$8,
        view: view$8
    };

    function controller$8(ref, external){
        var file = ref.file;
        var study = ref.study;
        if ( external === void 0 ) external = false;

        var ctrl = {
            study: study ? study : null,
            file : file ? file : null,
            err : m.prop([]),
            last_modify : m.prop(''),
            loaded : m.prop(false),
            notifications : createNotifications(),
            settings : clone(defaultSettings$2(external)),
            defaultSettings : clone(defaultSettings$2(external)),
            external: external,
            is_locked:m.prop(study ? study.is_locked : null),
            show_do_save: show_do_save,
            is_settings_changed: is_settings_changed
        };

        ctrl.settings.external = ctrl.external;

        function load() {
            return ctrl.file.get()
                .catch(ctrl.err)
                .then(function () {
                    if (ctrl.file.content().length>10) {
                        ctrl.last_modify(file.last_modify);
                        ctrl.settings = JSON.parse(ctrl.file.content());
                        ctrl.prev_settings = clone(ctrl.settings);
                    }
                    ctrl.loaded(true);
                })
                .then(m.redraw);
        }

        function show_do_save(){
            var error_msg = [];
            var blocksObject = tabs$2.blocks.rowsDesc; //blockDesc inside output attribute
            error_msg = validityCheck$2(error_msg, ctrl.settings, blocksObject);
            if(error_msg.length !== 0) {
                return messages.confirm({
                    header: 'Some problems were found in your script, it\'s recommended to fix them before saving:',
                    content:
                        m('div',[
                            m('.alert alert-danger', [
                                m('ul', [
                                    error_msg.map(function (err) {
                                        return m('li', err);
                                    })
                                ])
                            ]),
                            m('strong','Do you want to save anyway?')
                        ])
                })
                    .then(function (response) {
                        if (response) do_save();
                    }).catch(function (error) { return messages.alert({
                        content: m('p.alert.alert-danger', error.message)
                    }); })
                    .then(m.redraw());
            }
            else do_save();
        }
        function do_save(){
            ctrl.err([]);
            var studyId  =  m.route.param('studyId');
            var fileId = m.route.param('fileId');
            var jsFileId =  fileId.split('.')[0]+'.js';
            save('stiat', studyId, fileId, ctrl.settings, ctrl.last_modify)
                .then (function () { return saveToJS('stiat', studyId, jsFileId, toString$2(ctrl.settings, ctrl.external), ctrl.last_modify); })
                .then(ctrl.study.get())
                .then(function () { return ctrl.notifications.show_success("STIAT Script successfully saved"); })
                .then(m.redraw)
                .catch(function (err) { return ctrl.notifications.show_danger('Error Saving:', err.message); });
            ctrl.prev_settings = clone(ctrl.settings);
            m.redraw();
        }

        function is_settings_changed(){
            return JSON.stringify(ctrl.prev_settings) !== JSON.stringify(ctrl.settings);
        }

        external ? null : load();
        return ctrl;
    }
    function view$8(ctrl){
        if(!ctrl.external) {
            return !ctrl.loaded()
                ? m('.loader')
                : m('.wizard.container-fluid.space',
                    m.component(tabsComponent, tabs$2, ctrl.settings, ctrl.defaultSettings, ctrl.external, ctrl.notifications,
                        ctrl.is_locked, ctrl.is_settings_changed, ctrl.show_do_save));
        }
        return m('.container-fluid',
            pageHeadLine('STIAT'),
            m.component(messages),
            m.component(tabsComponent, tabs$2, ctrl.settings, ctrl.defaultSettings, ctrl.external)
        );


    }

    function defaultSettings$1(external) {
        return {
            parameters: {
                isQualtrics: false,
                separateStimulusSelection: true,
                fixationDuration: 0,
                deadlineDuration: 0,
                deadlineMsgDuration: 750,
                fixationStimulus: {
                    css: {color: '#000000', 'font-size': '3em'},
                    media: {word: '+'}
                },
                deadlineStimulus: {
                    css: {color: '#FF0000', 'font-size': '2.5em'},
                    media: {word: '!!!PLEASE RESPOND FASTER!!!'},
                    location: {bottom: 10}
                },
                base_url: {image: external ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/docs/images/' : './images'}
            },
            primeStimulusCSS: { //The CSS for all the prime stimuli.
                primeDuration: 200,
                color: '#0000FF', 'font-size': '2.3em'
            },
            prime1: {
                name: 'prime1',  //Will be used in the logging
                mediaArray: [{word: 'prime1Stim1'}, {word: 'prime1Stim2'}] //An array of all media objects for this category.
            },
            prime2: {
                name: 'prime2',
                mediaArray: [{word: 'prime2Stim2'}, {word: 'prime2Stim2'}]
            },
            rightAttTargets: {
                name: 'Pleasant',
                title: {
                    media: {word: 'Pleasant'}, //Name of the attribute presented in the task.
                    css: {color: '#0000FF', 'font-size': '3em'} //Style of the attribute title.
                },
                stimulusMedia: [
                    {word: 'Paradise'},
                    {word: 'Pleasure'},
                    {word: 'Cheer'},
                    {word: 'Friend'},
                    {word: 'Splendid'},
                    {word: 'Love'},
                    {word: 'Glee'},
                    {word: 'Smile'},
                    {word: 'Enjoy'},
                    {word: 'Delight'},
                    {word: 'Beautiful'},
                    {word: 'Attractive'},
                    {word: 'Likeable'},
                    {word: 'Wonderful'}
                ],
                stimulusCss: {color: '#0000FF', 'font-size': '2em'}
            },
            leftAttTargets: {
                name: 'Unpleasant',
                title: {
                    media: {word: 'Unpleasant'}, //Name of the attribute presented in the task.
                    css: {color: '#0000FF', 'font-size': '3em'} //Style of the attribute title.
                },
                stimulusMedia: [
                    {word: 'Bomb'},
                    {word: 'Abuse'},
                    {word: 'Sadness'},
                    {word: 'Pain'},
                    {word: 'Poison'},
                    {word: 'Grief'},
                    {word: 'Ugly'},
                    {word: 'Dirty'},
                    {word: 'Stink'},
                    {word: 'Noxious'},
                    {word: 'Humiliate'},
                    {word: 'Annoying'},
                    {word: 'Disgusting'},
                    {word: 'Offensive'}
                ],
                stimulusCss: {color: '#0000FF', 'font-size': '2em'}
            },
            blocks: {
                nTrialsPerPrimeTargetPair: 15, nBlocks: 3,
            },
            text: {
                firstBlock: '<div><p style="font-size:1.3em; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'Put your middle or index fingers on the <b>E</b> and <b>I</b> keys of your keyboard. ' +
                    'Pairs of items (words and images) will appear one after another. ' +
                    'For each pair of items, ignore the first item and categorize the second item as posAttribute' +
                    ' or negAttribute.<br/><br/>' +
                    'When the second item you see belongs to the category "negAttribute", press <b>E</b>; ' +
                    'when the item belongs to the category "posAttribute", press <b>I</b>. ' +
                    'If you make an error, an </color> <font color="#ff0000"><b>X</b></font> will appear.<br/><br/>' +
                    'This is a timed sorting task. <b>GO AS FAST AS YOU CAN</b> while making as few mistakes as possible.' +
                    '</color></p><p style="font-size:14px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                    'press SPACE to begin</p><p style="font-size:12px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round 1 of nBlocks]</p></div>',
                middleBlock: '<div><p style="font-size:1.3em; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'Press SPACE to continue with the same task.<br/><br/>' +
                    'Ignore the first item and categorize the second item.<br/><br/>' +
                    'Press <b>E</b> if the second item is negAttribute.<br/>' +
                    'Press <b>I</b> if the second item is posAttribute.</p><br/><br/>' +
                    '<p style="font-size:12px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round blockNum of nBlocks]</p></div>',
                lastBlock: '<div><p style="font-size:1.3em; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'This task can be a little exhausting. ' +
                    'Try to challenge yourself to respond as quickly as you can without making mistakes.<br/><br/>' +
                    'Press SPACE for the final round.</p><br/><br/>' +
                    '<p style="font-size:12px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round nBlocks of nBlocks]</p></div>'
            }
        };
    }

    var outputComponent = {
        controller: controller$7,
        view:view$7
    };

    function controller$7(settings){
        var error_msg = [];
        error_msg = validityCheck$1(error_msg, settings);

        return {createFile: createFile, error_msg: error_msg};

        function createFile(fileType){
            return function(){
                var output,textFileAsBlob;
                var downloadLink = document.createElement('a');
                if (fileType === 'JS'){
                    output = toString$1(settings);
                    textFileAsBlob = new Blob([output], {type:'text/plain'});
                    downloadLink.download = 'EP.js';
                }
                else {
                    output = updateSettings$3(settings);
                    textFileAsBlob = new Blob([JSON.stringify(output,null,4)], {type : 'application/json'});
                    downloadLink.download = 'EP.json';
                }
                if (window.webkitURL != null)
                    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
                else {
                    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                    downloadLink.style.display = 'none';
                    document.body.appendChild(downloadLink);
                }
                downloadLink.click();
            };
        }
    }

    function validityCheck$1(error_msg, settings){
        var temp1 = checkPrime(settings.prime1, 'First Prime Category\'s', error_msg);
        var temp2 = checkPrime(settings.prime2, 'Second Prime Category\'s', error_msg);
        var temp3 = checkMissingElementName(settings.rightAttTargets, 'First Target Category', error_msg);
        var temp4 = checkMissingElementName(settings.leftAttTargets, 'Second Target Category', error_msg);

        var containsImage = temp1 || temp2 || temp3 || temp4;

        if(settings.parameters.base_url.image.length === 0 && containsImage)
            error_msg.push('Image\'s url is missing and there is an image in the study');

        //check for blocks problems
        if(!settings.blocks.nTrialsPerPrimeTargetPair)
            error_msg.push('Number of trials in a block, per prime-target combination equals to zero, this will result in not showing the trials.');
        if(!settings.blocks.nBlocks)
            error_msg.push('Number of blocks equals to zero, this will result in skipping the task.');
        return error_msg;
    }

    function toString$1(settings, external){
        return toScript$1(updateSettings$3(settings), external);
    }

    function updateMediaSettings$3(settings){
        //update attributes names to be compatible to EP
        var settings_output = clone(settings);

        settings_output.primeDuration = settings_output.primeStimulusCSS.primeDuration;
        delete settings_output.primeStimulusCSS.primeDuration;

        settings_output.targetCats = {};
        settings_output.targetCats.rightAttTargets = settings_output.rightAttTargets;
        settings_output.targetCats.rightAttTargets.mediaArray = settings_output.rightAttTargets.stimulusMedia;
        delete settings_output.rightAttTargets.stimulusMedia;
        settings_output.targetCats.leftAttTargets = settings_output.leftAttTargets;
        settings_output.targetCats.leftAttTargets.mediaArray = settings_output.leftAttTargets.stimulusMedia;
        delete settings_output.leftAttTargets.stimulusMedia;

        settings_output.targetCats.rightAttTargets.stimulusCSS = settings_output.rightAttTargets.stimulusCss;
        settings_output.targetCats.leftAttTargets.stimulusCSS = settings_output.leftAttTargets.stimulusCss;
        delete settings_output.rightAttTargets.stimulusCss;
        delete settings_output.leftAttTargets.stimulusCss;
        delete settings_output.rightAttTargets;
        delete settings_output.leftAttTargets;

        return settings_output;
    }

    function updateSettings$3(settings){
        settings = updateMediaSettings$3(settings);

        var output={
            prime1: settings.prime1,
            prime2: settings.prime2,
            primeStimulusCSS: settings.primeStimulusCSS,
            primeDuration: settings.primeDuration,
            targetCats: settings.targetCats
        };
        if(settings.parameters.isQualtrics)
            output.isQualtrics = settings.parameters.isQualtrics;
        delete settings.parameters.isQualtrics;

        Object.assign(output, settings.parameters);
        Object.assign(output, settings.blocks);
        Object.assign(output, settings.text);
        return output;
    }

    function toScript$1(output, external){
        var textForInternal = '//Note: This script was created by the EP wizard.\n//Modification of this file won\'t be reflected in the wizard.\n';
        var script = "define(['pipAPI' ,'" + (output.isQualtrics ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/ep/qualtrics/quep5.js': 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/ep/ep5.js') + "'], function(APIConstructor, epExtension) {var API = new APIConstructor(); return epExtension(" + (JSON.stringify(output,null,4)) + ");});";
        external === false ? script = textForInternal + script : '';
        return script;
    }

    function view$7(ctrl, settings){
        return viewOutput(ctrl, settings, toString$1);
    }

    var importComponent$1 = {
        controller:controller$6,
        view:view$6
    };

    function view$6(ctrl){
        return viewImport(ctrl);
    }

    function controller$6(settings) {
        var fileInput = m.prop('');
        return {fileInput: fileInput, handleFile: handleFile, updateSettings: updateSettings$2};

        function handleFile(){
            var importedFile = document.getElementById('uploadFile').files[0];
            var reader = new FileReader();
            reader.readAsText(importedFile);
            reader.onload = function() {
                var fileContent = JSON.parse(reader.result);
                updateSettings$2(settings, fileContent);
            };
        }
    }
    function updateMediaSettings$2(settings){
        //update attributes to be compatible to IAT so that elementComponent can be used.
        settings.primeStimulusCSS.primeDuration = settings.primeDuration;
        delete settings.primeDuration;

        settings.rightAttTargets = settings.targetCats.rightAttTargets;
        settings.rightAttTargets.stimulusMedia = settings.targetCats.rightAttTargets.mediaArray;
        delete settings.targetCats.rightAttTargets.mediaArray;

        settings.leftAttTargets = settings.targetCats.leftAttTargets;
        settings.leftAttTargets.stimulusMedia = settings.targetCats.leftAttTargets.mediaArray;
        delete settings.targetCats.leftAttTargets.mediaArray;

        settings.rightAttTargets.stimulusCss = settings.targetCats.rightAttTargets.stimulusCSS;
        settings.leftAttTargets.stimulusCss = settings.targetCats.leftAttTargets.stimulusCSS;
        delete settings.rightAttTargets.stimulusCSS;
        delete settings.leftAttTargets.stimulusCSS;
        delete settings.targetCats.rightAttTargets;
        delete settings.targetCats.leftAttTargets;
        delete settings.targetCats;
        return settings;
    }
    function updateSettings$2(settings, input) {
        settings.primeStimulusCSS = input.primeStimulusCSS;
        settings.prime1 = input.prime1;
        settings.prime2 = input.prime2;
        settings.targetCats = input.targetCats;
        settings.parameters.base_url = input.base_url;
        settings.parameters.separateStimulusSelection = input.separateStimulusSelection;
        settings.parameters.primeDuration = input.primeDuration;
        settings.parameters.fixationDuration = input.fixationDuration;
        settings.parameters.deadlineDuration = input.deadlineDuration;
        settings.parameters.deadlineMsgDuration = input.deadlineMsgDuration;
        settings.parameters.fixationStimulus = input.fixationStimulus;
        settings.parameters.deadlineStimulus = input.deadlineStimulus;

        if(input.isQualtrics)
            settings.parameters.isQualtrics = input.isQualtrics;

        settings.text.firstBlock = input.firstBlock;
        settings.text.middleBlock = input.middleBlock;
        settings.text.lastBlock = input.lastBlock;

        settings.blocks.nTrialsPerPrimeTargetPair = input.nTrialsPerPrimeTargetPair;
        settings.blocks.nBlocks = input.nBlocks;

        settings = updateMediaSettings$2(settings);
        return settings;
    }

    var parametersDesc$1 = [
        {name: 'isQualtrics',options:['Regular','Qualtrics'], label:'Regular script or Qualtrics?', desc: ['If you want this Evaluative Priming task to run from Qualtrics, read ', m('a',{href: 'https://minnojs.github.io/minnojs-blog/qualtrics-priming/'}, 'this blog post '),'to see how.']},
        {name: 'separateStimulusSelection', label: 'Separate Stimulus Selection', desc: 'We select the stimuli randomly until exhaustion ' +
                '(i.e., a stimulus would not appear again until all other stimuli of that category would appear). ' +
                '\nThis kind of selection can be done throughout the task or within each prime-target combination (if you keep this option checked).'},
        {name: 'fixationDuration', label: 'Fixation Duration', desc: 'Value of 0 means no fixation presentation.'},
        {name: 'fixationStimulus', label: 'Fixation Stimulus'},
        {name: 'deadlineDuration', label: 'Response Deadline Duration', desc: 'Value of 0 means no response deadline, we\'ll wait until response.'},
        {name: 'deadlineMsgDuration', label: 'Response Deadline\'s Message Duration', desc: 'How long the response deadline message will be presented?'},
        {name: 'deadlineStimulus', label: 'Response Deadline Stimulus'},
        {name: 'base_url', label: 'Image\'s URL'},
        {isTouch:false, separateStimulusSelection:0, fixationDuration:0 ,
            fixationStimulus:{css : {color:'#000000', 'font-size':'1em'}, media : {word:''}},
            deadlineStimulus:{css : {color:'#000000', 'font-size':'1em'}, media : {word:''}, location: {bottom:10}},
            deadlineDuration:0, deadlineMsgDuration:0, base_url:{image:''}}
    ];

    var textDesc$1=[
        {name: 'firstBlock', label:'First Block\'s Instructions'},
        {name: 'middleBlock', label:'Middle Block\'s Instructions'},
        {name: 'lastBlock', label:'Last Block\'s Instructions'},
        {firstBlock: '', middleBlock:'', lastBlock:''},
        {} //an empty element
    ];

    var blocksDesc$1 = [
        {name: 'nBlocks', label: 'Number of blocks'},
        {name: 'nTrialsPerPrimeTargetPair', label: 'Number of trials in a block, per prime-target combination'},
        {nBlocks: 0, nTrialsPerPrimeTargetPair: 0}
    ];

    var categoryClear = [{
        name: '',
        title: {media: {word: ''},
            css: {color: '#000000', 'font-size': '1em'}, height: 4},
        stimulusMedia: [],
        stimulusCss : {color:'#000000', 'font-size':'1em'}
    }];

    var primeClear$1 = [
        {
            name : '',  //Will be used in the logging
            mediaArray : []
        },
        { //CSS cleared
            primeDuration: 0,
            color: '#000000',
            'font-size': '1em'
        }
    ];

    var categoriesTabs = {
        'rightAttTargets':{text: 'First Category'},
        'leftAttTargets':{text: 'Second Category'},
    };

    var primesTabs$1 = {
        'prime1':{text: 'First Category'},
        'prime2':{text: 'Second Category'},
        'primeStimulusCSS':{text:'Prime Appearance'}
    };

    var tabs$1 = {
        'parameters': {text: 'General parameters', component: parametersComponent$1, rowsDesc: parametersDesc$1},
        'blocks': {text: 'Blocks', component: blocksComponent$2, rowsDesc: blocksDesc$1},
        'prime': {
            text: 'Prime Categories',
            component: categoriesComponent$1,
            rowsDesc: primeClear$1,
            subTabs: primesTabs$1,
            type: 'EP'
        },
        'categories': {
            text: 'Target Categories',
            component: categoriesComponent$1,
            rowsDesc: categoryClear,
            subTabs: categoriesTabs
        },
        'text': {text: 'Texts', component: textComponent, rowsDesc: textDesc$1},
        'output': {text: 'Complete', component: outputComponent},
        'import': {text: 'Import', component: importComponent$1},
        'about': {text: 'About', component: aboutComponent, rowsDesc: 'EP'}
    };

    var ep = function (args, external) { return m.component(epComponent, args, external); };

    var epComponent = {
        controller: controller$5,
        view: view$5
    };

    function controller$5(ref, external){
        var file = ref.file;
        var study = ref.study;
        if ( external === void 0 ) external = false;

        var ctrl = {
            study: study ? study : null,
            file : file ? file : null,
            err : m.prop([]),
            last_modify : m.prop(''),
            loaded : m.prop(false),
            notifications : createNotifications(),
            settings : clone(defaultSettings$1(external)),
            defaultSettings : clone(defaultSettings$1(external)),
            external: external,
            is_locked:m.prop(study ? study.is_locked : null),
            show_do_save: show_do_save,
            is_settings_changed: is_settings_changed
        };

        ctrl.settings.external = ctrl.external;

        function load() {
            return ctrl.file.get()
                .catch(ctrl.err)
                .then(function () {
                    if (ctrl.file.content().length>10) {
                        ctrl.last_modify(file.last_modify);
                        ctrl.settings = JSON.parse(ctrl.file.content());
                        ctrl.prev_settings = clone(ctrl.settings);
                    }
                    ctrl.loaded(true);
                })
                .then(m.redraw);
        }

        function show_do_save(){
            var error_msg = [];
            error_msg = validityCheck$1(error_msg, ctrl.settings);
            if(error_msg.length !== 0) {
                return messages.confirm({
                    header: 'Some problems were found in your script, it\'s recommended to fix them before saving:',
                    content:
                        m('div',[
                            m('.alert alert-danger', [
                                m('ul', [
                                    error_msg.map(function (err) {
                                        return m('li', err);
                                    })
                                ])
                            ]),
                            m('strong','Do you want to save anyway?')
                        ])
                })
                    .then(function (response) {
                        if (response) do_save();
                    }).catch(function (error) { return messages.alert({
                        content: m('p.alert.alert-danger', error.message)
                    }); })
                    .then(m.redraw());
            }
            else do_save();

        }
        function do_save(){
            ctrl.err([]);
            var studyId  =  m.route.param('studyId');
            var fileId = m.route.param('fileId');
            var jsFileId =  fileId.split('.')[0]+'.js';
            save('ep', studyId, fileId, ctrl.settings, ctrl.last_modify)
                .then (function () { return saveToJS('ep', studyId, jsFileId, toString$1(ctrl.settings, ctrl.external), ctrl.last_modify); })
                .then(ctrl.study.get())
                .then(function () { return ctrl.notifications.show_success("EP Script successfully saved"); })
                .then(m.redraw)
                .catch(function (err) { return ctrl.notifications.show_danger('Error Saving:', err.message); });
            ctrl.prev_settings = clone(ctrl.settings);
            m.redraw();
        }

        function is_settings_changed(){
            return JSON.stringify(ctrl.prev_settings) !== JSON.stringify(ctrl.settings);
        }

        external ? null : load();
        return ctrl;
    }
    function view$5(ctrl){
        if(!ctrl.external) {
            return !ctrl.loaded()
                ? m('.loader')
                : m('.wizard.container-fluid.space',
                    m.component(tabsComponent, tabs$1, ctrl.settings, ctrl.defaultSettings, ctrl.external, ctrl.notifications,
                        ctrl.is_locked, ctrl.is_settings_changed, ctrl.show_do_save));
        }
        return m('.container-fluid',
            pageHeadLine('Evaluative Priming'),
            m.component(messages),
            m.component(tabsComponent, tabs$1, ctrl.settings, ctrl.defaultSettings, ctrl.external)
        );
    }

    function defaultSettings(external) {
        return {
            parameters: {
                isQualtrics: false,
                exampleBlock: true,
                fixationDuration: 0,
                showRatingDuration: 300,
                responses: 2,
                sortingLabel1: 'Pleasant', //Response is coded as 0.
                sortingLabel2: 'Unpleasant',  //Response is coded as 1.
                randomizeLabelSides: false, //If false, then label1 is on the left, and label2 is on the right.
                rightkey: 'i',
                leftkey: 'e',
                fixationStimulus: { //The fixation stimulus
                    css: {color: '#000000', 'font-size': '3em'},
                    media: {word: '+'}
                },
                maskStimulus: { //The mask stimulus
                    css: {color: '000000', 'font-size': '3em'},
                    media: {image: 'ampmask.jpg'}
                },
                base_url: {image: external ? 'https://baranan.github.io/minno-tasks/images/ampImages' : './images'}
            },
            exampleBlock: {
                exampleTargetStimulus:
                    {
                        nameForLogging: 'exampleTarget', //Will be used in the logging
                        sameAsTargets: true //Use the same media array as the first targetCat.
                    },
                exampleFixationStimulus: { //The fixation stimulus in the example block
                    css: {color: '000000', 'font-size': '3em'},
                    media: {word: '+'}
                },
                exampleMaskStimulus: { //The mask stimulus in the example block
                    css: {color: '000000', 'font-size': '3em'},
                    media: {image: 'ampmaskr.jpg'}
                },
                examplePrimeStimulus: {
                    nameForLogging: 'examplePrime', //Will be used in the logging
                    //An array of all media objects for this category.
                    mediaArray: [{word: 'Table'}, {word: 'Chair'}]
                },
                exampleBlock_fixationDuration: -1,
                exampleBlock_primeDuration: 100,
                exampleBlock_postPrimeDuration: 100,
                exampleBlock_targetDuration: 300
            },
            primeStimulusCSS: { //The CSS for all the prime stimuli.
                primeDuration: 100,
                postPrimeDuration: 100,
                color: '#0000FF',
                'font-size': '2.3em'
            },
            //primeCats: [
            prime1: {
                nameForFeedback: 'positive words',  //Will be used in the user feedback
                name: 'positive', //Will be used in the logging
                //An array of all media objects for this category.
                mediaArray: [{word: 'Wonderful'}, {word: 'Great'}]
            },
            prime2:{
                nameForFeedback: 'negative words',  //Will be used in the user feedback
                name: 'negative', //Will be used in the logging
                mediaArray: [{word: 'Awful'}, {word: 'Horrible'}]
            },
            //],
            targetStimulusCSS: { //The CSS for all the target stimuli (usually irrelevant because the targets are Chinese pictographs).
                targetDuration: 100,
                color: '#0000FF',
                'font-size': '2.3em'},
            //targetCats: [
            targetCategory:{
                nameForFeedback : 'Chinese symbol',  //The name of the targets (used in the instructions)
                name: 'chinese',  //Will be used in the logging
                //An array of all media objects for this category. The default is pic1-pic200.jpg
                mediaArray: [
                    {image: 'pic1.jpg'}, {image: 'pic2.jpg'}, {image: 'pic3.jpg'}, {image: 'pic4.jpg'}, {image: 'pic5.jpg'}, {image: 'pic6.jpg'}, {image: 'pic7.jpg'}, {image: 'pic8.jpg'}, {image: 'pic9.jpg'},
                    {image: 'pic10.jpg'}, {image: 'pic11.jpg'}, {image: 'pic12.jpg'}, {image: 'pic13.jpg'}, {image: 'pic14.jpg'}, {image: 'pic15.jpg'}, {image: 'pic16.jpg'}, {image: 'pic17.jpg'}, {image: 'pic18.jpg'}, {image: 'pic19.jpg'},
                    {image: 'pic20.jpg'}, {image: 'pic21.jpg'}, {image: 'pic22.jpg'}, {image: 'pic23.jpg'}, {image: 'pic24.jpg'}, {image: 'pic25.jpg'}, {image: 'pic26.jpg'}, {image: 'pic27.jpg'}, {image: 'pic28.jpg'}, {image: 'pic29.jpg'},
                    {image: 'pic30.jpg'}, {image: 'pic31.jpg'}, {image: 'pic32.jpg'}, {image: 'pic33.jpg'}, {image: 'pic34.jpg'}, {image: 'pic35.jpg'}, {image: 'pic36.jpg'}, {image: 'pic37.jpg'}, {image: 'pic38.jpg'}, {image: 'pic39.jpg'},
                    {image: 'pic40.jpg'}, {image: 'pic41.jpg'}, {image: 'pic42.jpg'}, {image: 'pic43.jpg'}, {image: 'pic44.jpg'}, {image: 'pic45.jpg'}, {image: 'pic46.jpg'}, {image: 'pic47.jpg'}, {image: 'pic48.jpg'}, {image: 'pic49.jpg'},
                    {image: 'pic50.jpg'}, {image: 'pic51.jpg'}, {image: 'pic52.jpg'}, {image: 'pic53.jpg'}, {image: 'pic54.jpg'}, {image: 'pic55.jpg'}, {image: 'pic56.jpg'}, {image: 'pic57.jpg'}, {image: 'pic58.jpg'}, {image: 'pic59.jpg'},
                    {image: 'pic60.jpg'}, {image: 'pic61.jpg'}, {image: 'pic62.jpg'}, {image: 'pic63.jpg'}, {image: 'pic64.jpg'}, {image: 'pic65.jpg'}, {image: 'pic66.jpg'}, {image: 'pic67.jpg'}, {image: 'pic68.jpg'}, {image: 'pic69.jpg'},
                    {image: 'pic70.jpg'}, {image: 'pic71.jpg'}, {image: 'pic72.jpg'}, {image: 'pic73.jpg'}, {image: 'pic74.jpg'}, {image: 'pic75.jpg'}, {image: 'pic76.jpg'}, {image: 'pic77.jpg'}, {image: 'pic78.jpg'}, {image: 'pic79.jpg'},
                    {image: 'pic80.jpg'}, {image: 'pic81.jpg'}, {image: 'pic82.jpg'}, {image: 'pic83.jpg'}, {image: 'pic84.jpg'}, {image: 'pic85.jpg'}, {image: 'pic86.jpg'}, {image: 'pic87.jpg'}, {image: 'pic88.jpg'}, {image: 'pic89.jpg'},
                    {image: 'pic90.jpg'}, {image: 'pic91.jpg'}, {image: 'pic92.jpg'}, {image: 'pic93.jpg'}, {image: 'pic94.jpg'}, {image: 'pic95.jpg'}, {image: 'pic96.jpg'}, {image: 'pic97.jpg'}, {image: 'pic98.jpg'}, {image: 'pic99.jpg'},
                    {image: 'pic110.jpg'}, {image: 'pic111.jpg'}, {image: 'pic112.jpg'}, {image: 'pic113.jpg'}, {image: 'pic114.jpg'}, {image: 'pic115.jpg'}, {image: 'pic116.jpg'}, {image: 'pic117.jpg'}, {image: 'pic118.jpg'}, {image: 'pic119.jpg'},
                    {image: 'pic120.jpg'}, {image: 'pic121.jpg'}, {image: 'pic122.jpg'}, {image: 'pic123.jpg'}, {image: 'pic124.jpg'}, {image: 'pic125.jpg'}, {image: 'pic126.jpg'}, {image: 'pic127.jpg'}, {image: 'pic128.jpg'}, {image: 'pic129.jpg'},
                    {image: 'pic130.jpg'}, {image: 'pic131.jpg'}, {image: 'pic132.jpg'}, {image: 'pic133.jpg'}, {image: 'pic134.jpg'}, {image: 'pic135.jpg'}, {image: 'pic136.jpg'}, {image: 'pic137.jpg'}, {image: 'pic138.jpg'}, {image: 'pic139.jpg'},
                    {image: 'pic140.jpg'}, {image: 'pic141.jpg'}, {image: 'pic142.jpg'}, {image: 'pic143.jpg'}, {image: 'pic144.jpg'}, {image: 'pic145.jpg'}, {image: 'pic146.jpg'}, {image: 'pic147.jpg'}, {image: 'pic148.jpg'}, {image: 'pic149.jpg'},
                    {image: 'pic150.jpg'}, {image: 'pic151.jpg'}, {image: 'pic152.jpg'}, {image: 'pic153.jpg'}, {image: 'pic154.jpg'}, {image: 'pic155.jpg'}, {image: 'pic156.jpg'}, {image: 'pic157.jpg'}, {image: 'pic158.jpg'}, {image: 'pic159.jpg'},
                    {image: 'pic160.jpg'}, {image: 'pic161.jpg'}, {image: 'pic162.jpg'}, {image: 'pic163.jpg'}, {image: 'pic164.jpg'}, {image: 'pic165.jpg'}, {image: 'pic166.jpg'}, {image: 'pic167.jpg'}, {image: 'pic168.jpg'}, {image: 'pic169.jpg'},
                    {image: 'pic170.jpg'}, {image: 'pic171.jpg'}, {image: 'pic172.jpg'}, {image: 'pic173.jpg'}, {image: 'pic174.jpg'}, {image: 'pic175.jpg'}, {image: 'pic176.jpg'}, {image: 'pic177.jpg'}, {image: 'pic178.jpg'}, {image: 'pic179.jpg'},
                    {image: 'pic180.jpg'}, {image: 'pic181.jpg'}, {image: 'pic182.jpg'}, {image: 'pic183.jpg'}, {image: 'pic184.jpg'}, {image: 'pic185.jpg'}, {image: 'pic186.jpg'}, {image: 'pic187.jpg'}, {image: 'pic188.jpg'}, {image: 'pic189.jpg'},
                    {image: 'pic190.jpg'}, {image: 'pic191.jpg'}, {image: 'pic192.jpg'}, {image: 'pic193.jpg'}, {image: 'pic194.jpg'}, {image: 'pic195.jpg'}, {image: 'pic196.jpg'}, {image: 'pic197.jpg'}, {image: 'pic198.jpg'}, {image: 'pic199.jpg'},
                    {image: 'pic200.jpg'}
                ]
            },
            //],
            blocks: {
                trialsInExample: 3,trialsInBlock: [40, 40, 40]
            },
            text: { //Instructions text for the 2-responses version.
                exampleBlockInst: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'Press the key <B>rightKey</B> if the targetCat is more rightAttribute than average. ' +
                    'Hit the <b>leftKey</b> key if it is more leftAttribute than average.<br/><br/>' +
                    'The items appear and disappear quickly.  ' +
                    'Remember to ignore the item that appears before the targetCat and evaluate only the targetCat.<br/><br/></p>' +
                    '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                    'When you are ready to try a few practice responses, hit the <b>space bar</b>.</p>' +
                    '<p style="font-size:12px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round 1 of nBlocks]</p></div>',
                firstBlockInst: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    "See how fast it is? Don't worry if you miss some. " +
                    'Go with your gut feelings.<br/><br/>' +
                    'Concentrate on each targetCat and rate it as more rightAttribute than the average targetCat with the <b>rightKey</b> key, ' +
                    'or more leftAttribute than average with the <b>leftKey</b> key.<br/><br/>' +
                    'Evaluate each targetCat and not the item that appears before it. ' +
                    'Those items are sometimes distracting.<br/><br/>' +
                    '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                    'Ready? Hit the <b>space bar</b>.</p>' +
                    '<p style="font-size:12px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round 2 of nBlocks]</p></div>',
                middleBlockInst: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'Continue to another round of this task. ' +
                    'The rules are exactly the same:<br/><br/>' +
                    'Concentrate on the targetCat and rate it as more rightAttribute than average with the <b>rightKey</b> key, ' +
                    'or more leftAttribute than average with the <b>leftKey</b> key.<br/><br/>' +
                    'Evaluate each targetCat and not the item that appears before it. ' +
                    'Those items are sometimes distracting. Go with your gut feelings.<br/><br/>' +
                    '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                    'Ready? Hit the <b>space bar</b>.</p>' +
                    '<p style="font-size:12px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round blockNum of nBlocks]</p></div>',
                lastBlockInst: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'Ready for the FINAL round? ' +
                    'The rules are exactly the same:<br/><br/>' +
                    'Concentrate on the targetCat and rate it as more rightAttribute than average with the <b>rightKey</b> key, ' +
                    'or more leftAttribute than average with the <b>leftKey</b> key.<br/><br/>' +
                    'Evaluate each targetCat and not the item that appears before it. ' +
                    'Those items are sometimes distracting. Go with your gut feelings.<br/><br/>' +
                    '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                    'Ready? Hit the <b>space bar</b>.</p>' +
                    '<p style="font-size:12px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round blockNum of nBlocks]</p></div>',
                endText: '<div><p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial"><color="FFFFFF">' +
                    'You have completed the task<br/><br/>Press "space" to continue to next task.</p></div>',
            },
            text_seven: { //Instructions text for the 7-responses version.
                exampleBlockInst7: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'Rate your feelings toward the targetCats from <i>Extremely negativeAdj</i> to <i>Extremely positiveAdj</i>. ' +
                    'The items appear and disappear quickly.  ' +
                    'Remember to ignore the item that appears before the targetCat and evaluate only the targetCat.<br/><br/></p>' +
                    '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                    'When you are ready to try a few practice responses, hit the <b>space bar</b>.</p>' +
                    '<p style="font-size:12px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round 1 of nBlocks]</p></div>',
                firstBlockInst7: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    "See how fast it is? Don't worry if you miss some. " +
                    'Go with your gut feelings.<br/><br/>' +
                    'Concentrate on each targetCat and rate it based on your own feelings. ' +
                    'Evaluate each targetCat and not the item that appears before it. ' +
                    'Those items are sometimes distracting.<br/><br/>' +
                    'Notice: you can respond with your mouse or the keys 1-7.<br/><br/>' +
                    '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                    'Ready? Hit the <b>space bar</b>.</p>' +
                    '<p style="font-size:12px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round 2 of nBlocks]</p></div>',
                middleBlockInst7: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'Continue to another round of this task. ' +
                    'The rules are exactly the same:<br/><br/>' +
                    'Concentrate on each targetCat and rate it based on your own feelings. ' +
                    'Evaluate each targetCat and not the item that appears before it. ' +
                    'Those items are sometimes distracting.<br/><br/>' +
                    '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                    'Ready? Hit the <b>space bar</b>.</p>' +
                    '<p style="font-size:12px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round blockNum of nBlocks]</p></div>',
                lastBlockInst7: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                    'Ready for the FINAL round? ' +
                    'The rules are exactly the same:<br/><br/>' +
                    'Concentrate on each targetCat and rate it based on your own feelings. ' +
                    'Evaluate each targetCat and not the item that appears before it. ' +
                    'Those items are sometimes distracting.<br/><br/>' +
                    '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                    'Ready? Hit the <b>space bar</b>.</p>' +
                    '<p style="font-size:12px; text-align:center; font-family:arial">' +
                    '<color="000000">[Round blockNum of nBlocks]</p></div>',
                endText: '<div><p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial"><color="FFFFFF">' +
                    'You have completed the task<br/><br/>Press "space" to continue to next task.</p></div>',
            }
        };
    }

    var iatOutputComponent = {
        controller: controller$4,
        view: view$4
    };

    function controller$4(settings, defaultSettings, blocksObject){
        var error_msg = [];
        error_msg = validityCheck(error_msg, settings);

        return {error_msg: error_msg, createFile: createFile, settings: settings};

        function createFile(settings, fileType){
            return function(){
                var output,textFileAsBlob;
                var downloadLink = document.createElement('a');
                if (fileType === 'JS') {
                    output = toString(settings);
                    textFileAsBlob = new Blob([output], {type:'text/plain'});
                    downloadLink.download = 'IAT.js'; }
                else {
                    output = updateSettings$1(settings);
                    textFileAsBlob = new Blob([JSON.stringify(output,null,4)], {type : 'application/json'});
                    downloadLink.download = 'AMP.json'; }
                if (window.webkitURL) {downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);}
                else {
                    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                    downloadLink.style.display = 'none';
                    document.body.appendChild(downloadLink);
                }
                downloadLink.click();
            };
        }
    }

    function validityCheck(error_msg, settings){
        //Parameters Tab
        var textParameters= {
            sortingLabel1: 'First Sorting Label',
            sortingLabel2: 'Second Sorting Label',
            rightkey: 'Right key',
            leftkey: 'Left key'
        };
        Object.entries(textParameters).forEach(function (ref) {
            var key = ref[0];
            var value = ref[1];

            if(!settings.parameters[key].length)
                error_msg.push(value+' is missing');
        });
        checkStimulus(settings.parameters.fixationStimulus, 'Fixation stimulus', 'word' ,error_msg);
        checkStimulus(settings.parameters.maskStimulus, 'Mask stimulus', 'image' ,error_msg);
        //Prime, Target & Example Categories
        var temp1 = checkPrime(settings.prime1, 'First Prime Category\'s', error_msg);
        var temp2 = checkPrime(settings.prime2, 'Second Prime Category\'s', error_msg);
        var temp3 = checkPrime(settings.targetCategory, 'Target Category\'s', error_msg);
        var temp4 = false;
        if(settings.parameters.exampleBlock)
            temp4 = checkPrime(settings.exampleBlock.examplePrimeStimulus, 'Example Prime stimulus\'' ,error_msg);

        //Blocks tab
        if(!settings.blocks.trialsInBlock.reduce(function (a, b) { return a + b; }, 0))
            error_msg.push('All the block\'s trials equals to 0, that will result in not showing the task at all');
        if(settings.parameters.exampleBlock && !settings.blocks.trialsInExample)
            error_msg.push('The example block in the Parameters tab is checked but the the ' +
                'number of trials in example block (in the Blocks tab) is set to 0. ' +
                'Please beware and change the parameters accordingly.');

        //Example Block Check
        if(settings.parameters.exampleBlock){
            if(settings.exampleBlock.exampleTargetStimulus.nameForLogging.length === 0)
                error_msg.push('Example Target stimulus\' name for logging is missing');
            checkStimulus(settings.exampleBlock.exampleFixationStimulus, 'Example Fixation stimulus', 'word' ,error_msg);
            checkStimulus(settings.exampleBlock.exampleMaskStimulus, 'Example Mask stimulus', 'image' ,error_msg);
        }

        //If  one of the categories is using an image and the user didn't set a base_url
        var containsImage = temp1 || temp2 || temp3 || temp4;
        if(settings.parameters.base_url.image.length === 0 && containsImage)
            error_msg.push('Image\'s url is missing and there is an image in the study');

        return error_msg;
    }

    function toString(settings, external){
        return toScript(updateSettings$1(settings), external);
    }

    function updateMediaSettings$1(settings) {
        //update PrimeCats and TargetCats names to be compatible to AMP
        var settings_output = clone(settings);

        settings_output.primeDuration = settings_output.primeStimulusCSS.primeDuration;
        delete settings_output.primeStimulusCSS.primeDuration;
        settings_output.postPrimeDuration = settings_output.primeStimulusCSS.postPrimeDuration;
        delete settings_output.primeStimulusCSS.postPrimeDuration;
        delete settings_output.primeStimulusCSS.targetDuration;
        settings_output.targetDuration = settings_output.targetStimulusCSS.targetDuration;
        delete settings_output.targetStimulusCSS.targetDuration;
        delete settings_output.targetStimulusCSS.postPrimeDuration;
        delete settings_output.targetStimulusCSS.primeDuration;

        settings_output.primeCats = [{ //To order the attributes
            nameForFeedback: settings_output.prime1.nameForFeedback,
            nameForLogging: settings_output.prime1.name,
            mediaArray: settings_output.prime1.mediaArray}, {
            nameForFeedback: settings_output.prime2.nameForFeedback,
            nameForLogging: settings_output.prime2.name,
            mediaArray: settings_output.prime2.mediaArray}];

        delete settings_output.prime1;
        delete settings_output.prime2;

        settings_output.targetCats=[{
            nameForLogging: settings_output.targetCategory.name,
            mediaArray: settings_output.targetCategory.mediaArray}];
        settings_output.targetCat = settings.targetCategory.nameForFeedback;
        delete settings_output.targetCategory;

        if(settings.parameters.responses === '2'){
            settings_output.parameters.leftKey = settings.parameters.leftkey;
            settings_output.parameters.rightKey = settings.parameters.rightkey;
        }
        delete settings_output.parameters.leftkey;
        delete settings_output.parameters.rightkey;

        return settings_output;
    }

    function updateSettings$1(settings){
        settings = updateMediaSettings$1(settings);

        var output={
            primeStimulusCSS: settings.primeStimulusCSS,
            primeDuration: settings.primeDuration,
            postPrimeDuration: settings.postPrimeDuration,
            primeCats: settings.primeCats,
            targetStimulusCSS: settings.targetStimulusCSS,
            targetDuration: settings.targetDuration,
            targetCat: settings.targetCat,
            targetCats: settings.targetCats
        };
        Object.assign(output, settings.blocks);
        if(settings.parameters.exampleBlock){
            Object.assign(output, settings.exampleBlock);
        }
        if(settings.parameters.isQualtrics)
            output.isQualtrics = settings.parameters.isQualtrics;
        delete settings.parameters.isQualtrics;

        Object.assign(output, settings.parameters);
        settings.parameters.responses === 2 ?
            Object.assign(output, settings.text)
            : Object.assign(output, settings.text_seven);
        return output;
    }

    function toScript(output, external){
        var textForInternal = '//Note: This script was created by the IAT wizard.\n//Modification of this file won\'t be reflected in the wizard.\n';
        var script = "define(['pipAPI' ,'" + (output.isQualtrics ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/amp/qualtrics/qamp.js': 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/amp/amp4.js') + "'], function(APIConstructor, iatExtension){\n\tvar API = new APIConstructor(); return iatExtension(" + (JSON.stringify(output,null,4)) + ");});";
        external === false ? script = textForInternal + script : '';
        return script;
    }

    function view$4(ctrl,settings){
        return viewOutput(ctrl, settings, toString);
    }

    var exampleComponent = {
        controller:controller$3,
        view:view$3
    };

    function controller$3(settings, defaultSettings, exampleParameters){
        var exampleBlock = settings.exampleBlock;
        var element = settings.exampleBlock.examplePrimeStimulus;
        var stimuliList = defaultSettings.exampleBlock.examplePrimeStimulus.mediaArray;
        var fields = {
            newStimulus : m.prop(''),
            selectedStimuli: m.prop(''),
        };
        return {fields: fields, reset: reset, clear: clear, set: set, get: get, exampleParameters: exampleParameters,
            addStimulus: addStimulus, updateSelectedStimuli: updateSelectedStimuli, removeChosenStimuli: removeChosenStimuli, removeAllStimuli: removeAllStimuli, resetStimuliList: resetStimuliList};

        function reset(){showClearOrReset(exampleBlock, defaultSettings.exampleBlock, 'reset');}
        function clear(){showClearOrReset(exampleBlock, exampleParameters.slice(-1)[0],'clear');}

        function get(name, object, parameter){
            if(object && parameter){
                if (parameter === 'font-size')
                    return parseFloat((exampleBlock[name][object][parameter].replace('em','')));
                return exampleBlock[name][object][parameter];
            }
            if(name && object) return exampleBlock[name][object];
            return exampleBlock[name];
        }
        function set(name, object, parameter){
            return function(value){
                if(name.includes('Duration')) return exampleBlock[name] = Math.abs(value);
                if(object && parameter) {
                    if (parameter === 'font-size'){
                        value = Math.abs(value);
                        if (value === 0){
                            showRestrictions('Font\'s size must be bigger than 0.', 'error');
                            return exampleBlock[name][object][parameter];
                        }
                        return exampleBlock[name][object][parameter] = value + 'em';
                    }
                    return exampleBlock[name][object][parameter] = value;
                }
                if(name && object) return exampleBlock[name][object] = value;
                return exampleBlock[name] = value;
            };
        }
        function addStimulus(event){
            var new_stimuli = fields.newStimulus();
            event = event.target.id; //button name, to know the kind of the stimulus added
            element.mediaArray.push( (event === 'addWord') ? {word : new_stimuli} : {image : new_stimuli});
            fields.newStimulus(''); //reset the field
        }
        function updateSelectedStimuli(select){
            var list = element.mediaArray.filter(function (val,i) { return select.target.options[i].selected; });
            fields.selectedStimuli(list);
        }

        function removeChosenStimuli(){
            element.mediaArray = element.mediaArray.filter(function (element){ return !fields.selectedStimuli().includes(element); });
            fields.selectedStimuli([]);
        }

        function removeAllStimuli(){element.mediaArray.length = 0;}
        function resetStimuliList(){element.mediaArray = clone(stimuliList);}
    }

    function view$3(ctrl){
        return m('.space' , [
            ctrl.exampleParameters.slice(0,-1).map(function(row){
                return m('.row.line', [
                    m('.col-md-4',
                        row.desc ?
                            [
                                m('span', [' ', row.label, ' ']),
                                m('i.fa.fa-info-circle.text-muted',{title:row.desc})
                            ]
                            : m('span', [' ', row.label])
                    ),
                    m('.col-md-3.col-lg-2', m('input[type=number].form-control',{placeholder:'0', onchange: m.withAttr('value', ctrl.set(row.name, 'number')), value: ctrl.get(row.name), min:0}))
                ]);
            }),
            m('.row.space',
                m('.col-md-5',
                    m('p.h4','Example Target Stimulus: ',
                        m('i.fa.fa-info-circle.text-muted',{
                            title:'Here you can set the number of trials in each block.\nBelow you can add add additional blocks.'}
                        )
                    )
                )
            ),
            m('.row.space.line',[
                m('.col-md-4',[
                    m('span', [' ', 'Example Target Stimulus']),
                ]),
                m('.col-md-8',[
                    m('.row',[
                        m('.col-sm-5', m('span' ,'Name of target stimulus for logging: ')),
                        m('.col-sm-4', m('input[type=text].form-control', {value:ctrl.get('exampleTargetStimulus', 'nameForLogging') ,onchange:m.withAttr('value', ctrl.set('exampleTargetStimulus', 'nameForLogging'))}))
                    ]),
                    m('.row.space',[
                        m('.col-sm-5', m('span' ,'Use the same media array as the first Target Category')),
                        m('.col-sm-4', m('input[type=checkbox]', {onclick: m.withAttr('checked', ctrl.set('exampleTargetStimulus', 'sameAsTargets')), checked: ctrl.get('exampleTargetStimulus', 'sameAsTargets')}))
                    ])
                ])
            ]),
            m('.row.line',[
                m('.col-md-4','Example Fixation Stimulus'),
                editStimulusObject('exampleFixationStimulus', ctrl.get, ctrl.set)
            ]),
            m('.row.line',[
                m('.col-md-4', 'Example Mask Stimulus'),
                editStimulusObject('exampleMaskStimulus', ctrl.get, ctrl.set)
            ]),
            m('.row.space.line',[
                m('.col-md-4',[
                    m('span', [' ', 'Example Prime Stimulus']),
                ]),
                m('.col-md-8',[
                    m('.row',[
                        m('.col-sm-5', m('span' ,'Name of prime stimulus for logging: ')),
                        m('.col-sm-4', m('input[type=text].form-control', {value:ctrl.get('examplePrimeStimulus', 'nameForLogging') ,onchange:m.withAttr('value', ctrl.set('examplePrimeStimulus', 'nameForLogging'))}))
                    ]),
                    m('.row.space',[
                        m('.col-sm-5', 'Media objects for this category'),
                        m('.col-sm-5',
                            m('input[type=text].form-control',
                                {placeholder:'Enter media content here', 'aria-label':'Enter media content', 'aria-describedby':'basic-addon2', value: ctrl.fields.newStimulus(), oninput: m.withAttr('value', ctrl.fields.newStimulus)}),
                            m('.btn-group btn-group-toggle', [
                                m('button[type=button].btn btn-secondary',
                                    {disabled:!ctrl.fields.newStimulus().length, id:'addWord', onclick: function (e) { return ctrl.addStimulus(e); }},[
                                        m('i.fa.fa-plus'), 'Add Word'
                                    ]),
                                m('button[type=button].btn btn-secondary', {disabled:!ctrl.fields.newStimulus().length, id:'addImage', onclick: function (e) { return ctrl.addStimulus(e); }},[
                                    m('i.fa.fa-plus'), 'Add Image'
                                ])
                            ]),
                            m('select.form-control', {multiple : 'multiple', size : '4' ,onchange:function (e) { return ctrl.updateSelectedStimuli(e); }},[
                                ctrl.get('examplePrimeStimulus', 'mediaArray').map(function(object){
                                    var value = object.word ? object.word : object.image;
                                    var option = value + (object.word ? ' [Word]' : ' [Image]');
                                    return m('option', {value:value, selected : ctrl.fields.selectedStimuli().includes(object)}, option);
                                })
                            ]),
                            m('.btn-group-vertical.space',[
                                m('button.btn btn btn-warning', {title:'To select multiple stimuli, please press the ctrl key while selecting the desired stimuli', disabled: !ctrl.fields.selectedStimuli().length, onclick:ctrl.removeChosenStimuli},'Remove Chosen Stimuli'),
                                m('button.btn btn btn-warning', {onclick:ctrl.removeAllStimuli},'Remove All Stimuli'),
                                m('button.btn btn btn-warning', {onclick: ctrl.resetStimuliList},'Reset Stimuli List')
                            ])
                        ),
                    ])
                ])
            ]), resetClearButtons(ctrl.reset, ctrl.clear)
        ]);
    }

    var blocksComponent = {
        controller:controller$2,
        view:view$2
    };
    var deafaultNumOfTrials = 40;
    function controller$2(settings, defaultSettings, rows){
        var blocks = settings.blocks;
        var trialsInBlock = blocks.trialsInBlock;
        var chooseFlag = m.prop(false);
        var chosenBlocksList = m.prop([]);
        var chooseClicked = m.prop(false);
        return {trialsInBlock: trialsInBlock, set: set, get: get, rows: rows, showReset: showReset, showClear: showClear,
            chooseFlag: chooseFlag, chosenBlocksList: chosenBlocksList, chooseClicked: chooseClicked, unChooseCategories: unChooseCategories,
            chooseBlocks: chooseBlocks, addBlock: addBlock, updateChosenBlocks: updateChosenBlocks, showRemoveBlocks: showRemoveBlocks};

        function beforeClearReset(action, func){
            var msg_text = {
                'reset':{text:'This will delete all current properties and reset them to default values.',title:'Reset?'},
                'clear':{text: 'This will delete all current properties.', title: 'Clear?'}
            };
            return messages.confirm({header: msg_text[action].title, content:
                    m('strong', msg_text[action].text)})
                .then(function (response) {
                    if (response) {
                        func();
                        m.redraw();
                    }
                }).catch(function (error) { return messages.alert({header: msg_text[action].title , content: m('p.alert.alert-danger', error.message)}); })
                .then(m.redraw());

        }
        function showReset(){
            beforeClearReset('reset', reset);
            function reset(){
                trialsInBlock.length = 3;
                Object.assign(blocks.trialsInBlock, clone(defaultSettings.blocks.trialsInBlock));
                blocks.trialsInExample = defaultSettings.blocks.trialsInExample;
                chosenBlocksList().length = 0;
            }
        }
        function showClear(){
            beforeClearReset('clear', clear);
            function clear(){
                for (var i = 0; i < trialsInBlock.length; i++) trialsInBlock[i] = 0;
                settings.blocks.trialsInExample = 0;
            }
        }
        function get(name, index){
            if(name === 'trialsInBlock')
                return trialsInBlock[index];
            return blocks[name];
        }
        function set(name, index){
            if(name === 'trialsInBlock')
                return function(value){return trialsInBlock[index] = Math.abs(Math.round(value));};
            return function(value){return blocks[name] = value;};
        }
        function updateChosenBlocks(e, index){
            if (chosenBlocksList().includes(index) && !e.target.checked){
                var i = chosenBlocksList().indexOf(index);
                if (i !== -1)
                    chosenBlocksList().splice(i, 1);
                return;
            }
            if (e.target.checked) chosenBlocksList().push(index);
        }
        function chooseBlocks(){
            if (blocks.length < 2) {
                showRestrictions('It\'s not possible to remove more blocks because there must be at least one block.', 'error');
                return;
            }
            chooseFlag(true);
            if(!chooseClicked()){  //show info message only for the first time the choose button has been clicked
                showRestrictions('To choose blocks to remove, please tik the checkbox near the wanted block, and to remove them click the \'Remove Choosen Blocks\' button.','info');
                chooseClicked(true);
            }
        }
        function addBlock(){
            trialsInBlock.push(deafaultNumOfTrials);
        }
        function unChooseCategories(){
            chooseFlag(false);
            chosenBlocksList().length = 0;
        }
        function showRemoveBlocks(){
            if ((trialsInBlock.length - chosenBlocksList().length) < 1){
                showRestrictions('error','Minimum number of blocks needs to be 3, please choose less blocks to remove','Error in Removing Chosen Blocks');
                return;
            }
            return messages.confirm({header: 'Are you sure?', content:
                    m('strong', 'This action is permanent')})
                .then(function (response) {
                    if (response) {
                        removeBlocks();
                        m.redraw();
                    }
                    else {
                        chosenBlocksList().length = 0;
                        chooseFlag(false);
                        m.redraw();
                    }
                }).catch(function (error) {showRestrictions('error', 'Something went wrong on the page!\n'+error, 'Oops!');})
                .then(m.redraw());

            function removeBlocks(){

                chosenBlocksList().sort();
                for (var i = chosenBlocksList().length - 1; i >=0; i--)
                    trialsInBlock.splice(chosenBlocksList()[i],1);

                chosenBlocksList().length = 0;
                chooseFlag(false);
            }
        }
    }
    function view$2(ctrl){
        return m('.space' , [
            m('.row.line', [
                m('.col-md-3',
                    m('span', [' ', 'Trials In Example Block', ' ']),
                    m('i.fa.fa-info-circle.text-muted',{title:'Change to 0 if you don\'t want an example block'})
                ),
                m('.col-md-3.col-lg-2',
                    m('input[type=number].form-control',{onchange: m.withAttr('value', ctrl.set('trialsInExample')), value: ctrl.get('trialsInExample'), min:0}))
            ]),
            m('.row.double_space',
                m('.col-md-5',
                    m('p.h5', 'Number of Trials in Each Block: ', m('i.fa.fa-info-circle.text-muted',{
                        title:'Here you can set the number of trials in each block.\nBelow you can add add additional blocks.'}
                    ))
                )
            ),
            ctrl.trialsInBlock.map(function(block, index) {
                return m('.row.space', [
                    m('.col-md-3',[
                        !ctrl.chooseFlag() ? ' ' :
                            m('input[type=checkbox]', {checked : ctrl.chosenBlocksList().includes(index), onclick: function (e) { return ctrl.updateChosenBlocks(e, index); }}),
                        m('span', [' ','Block '+parseInt(index+1)])
                    ]),
                    m('.col-md-3.col-lg-2',
                        m('input[type=number].form-control',{onchange: m.withAttr('value', ctrl.set('trialsInBlock', index)), value: ctrl.get('trialsInBlock', index), min:0})
                    )
                ]);
            }),
            m('.row.space',
                m('.col-md-9',
                    m('.btn-group btn-group-toggle',[
                        m('button.btn btn btn-info',{onclick: ctrl.addBlock}, 
                            m('i.fa.fa-plus'),' Add Block'),
                        !ctrl.chooseFlag() ?
                            m('button.btn btn btn-warning',{onclick: ctrl.chooseBlocks},
                                m('i.fa.fa-check'), ' Choose Blocks to Remove')
                            : m('button.btn btn btn-warning',{onclick: ctrl.unChooseCategories},[
                                m('i.fa.fa-minus-circle'), ' Un-Choose Categories to Remove']),
                        !ctrl.chosenBlocksList().length ? '' :
                            m('button.btn btn btn-danger',{onclick: ctrl.showRemoveBlocks, disabled: !ctrl.chosenBlocksList().length},
                                m('i.fa.fa-minus-square'), ' Remove Chosen Blocks'),
                    ])
                )
            ), resetClearButtons(ctrl.showReset, ctrl.showClear)
        ]);
    }

    var importComponent = {
        controller:controller$1,
        view:view$1
    };

    function view$1(ctrl){
        return viewImport(ctrl);
    }

    function controller$1(settings) {
        return {handleFile: handleFile, updateSettings: updateSettings};

        function handleFile(){
            var importedFile = document.getElementById('uploadFile').files[0];
            var reader = new FileReader();
            reader.readAsText(importedFile);
            reader.onload = function(){
                var fileContent = JSON.parse(reader.result);
                settings = updateSettings(settings, fileContent);
            };
        }
    }
    function updateMediaSettings(settings) {
        //update attributes to be compatible to EP so that primeComponent & primeDesignComp can be used for AMP also.

        settings.prime1 = settings.primeCats[0];
        settings.prime2 = settings.primeCats[1];
        delete settings.primeCats;
        settings.prime1.name = settings.prime1.nameForLogging;
        settings.prime2.name = settings.prime2.nameForLogging;

        var temp = settings.targetCats[0];
        delete settings.targetCats;
        settings.targetCategory = temp;
        settings.targetCategory.name = settings.targetCategory.nameForLogging;
        settings.targetCategory.nameForFeedback = settings.targetCat;
        delete settings.targetCategory.nameForLogging;
        delete settings.targetCat;

        return settings;
    }
    function updateSettings(settings, input) {
        //updating the settings variable in parameters group according
        //to the DefaultSettings file pattern
        var parameters = ['isQualtrics', 'exampleBlock',
            'fixationDuration',
            'showRatingDuration', 'responses',
            'sortingLabel1', 'sortingLabel2',
            'randomizeLabelSides', 'rightKey', 'leftKey',
            'fixationStimulus', 'maskStimulus', 'base_url'
        ];
        parameters.forEach(function (parameter) {settings.parameters[parameter] = input[parameter];});

        if(settings.parameters.exampleBlock){
            var exampleBlock = [
                'exampleTargetStimulus', 'exampleFixationStimulus',
                'exampleMaskStimulus', 'exampleBlock_fixationDuration',
                'exampleBlock_primeDuration', 'exampleBlock_postPrimeDuration',
                'exampleBlock_targetDuration', 'examplePrimeStimulus',
            ];
            exampleBlock.forEach(function (parameter) {settings.exampleBlock[parameter] = input[parameter];});
        }
        var variousParams = [
            'primeStimulusCSS', 'primeCats', 'targetStimulusCSS', 'targetCats', 'targetCat'
        ];
        variousParams.forEach(function (parameter) {settings[parameter] = input[parameter];});

        var blocks = ['trialsInBlock', 'trialsInExample'];
        blocks.forEach(function (parameter) {settings.blocks[parameter] = input[parameter];});

        var primeParam = ['primeDuration', 'postPrimeDuration'];
        primeParam.forEach(function (parameter) {settings.primeStimulusCSS[parameter] = input[parameter];});

        settings.targetStimulusCSS.targetDuration = input.targetDuration;

        var textParams = [];
        if(input.responses === '2'){
            textParams = ['exampleBlockInst', 'firstBlockInst',
                'middleBlockInst', 'lastBlockInst', 'endText'
            ];
            textParams.forEach(function (param) {settings.text[param] = input[param];});
            settings.parameters.leftkey = input.leftKey;
            settings.parameters.rightkey = input.rightKey;
        }
        else {
            textParams = ['exampleBlockInst7', 'firstBlockInst7',
                'middleBlockInst7', 'lastBlockInst7', 'endText'
            ];
            textParams.forEach(function (param) {settings.text_seven[param] = input[param];});
        }

        settings = updateMediaSettings(settings);
        m.redraw();

        return settings;
    }

    var parametersDesc = [
        {name: 'isQualtrics',options:['Regular','Qualtrics'], label:'Regular script or Qualtrics?', desc: ['If you want this IAT to run from Qualtrics, read ', m('a',{href: 'https://minnojs.github.io/minnojs-blog/qualtrics-iat/'}, 'this blog post '),'to see how.']},
        {name: 'exampleBlock', label:'Example Block', desc: ['Should the task start with an example block?']},
        {name: 'responses', label: 'Number of responses options', options:[2,7], desc: 'Change to 7 for a 1-7 rating.'},
        {name: 'leftkey', label: 'Left Key'},
        {name: 'rightkey', label: 'Right Key'},
        {name: 'sortingLabel1', label: 'First Sorting Label',desc: 'Response is coded as 0.'},
        {name: 'sortingLabel2', label: 'Second Sorting Label', desc: 'Response is coded as 1.'},
        {name: 'randomizeLabelSides',label:'Randomize Label Sides', desc: 'If false, then the first label is on the left, and the second is on the right.'},
        {name: 'maskStimulus', label: 'Mask Stimulus'},
        {name: 'fixationDuration', label: 'Fixation Duration', desc: 'Value of 0 means no fixation presentation.'},
        {name: 'fixationStimulus', label: 'Fixation Stimulus'},
        {name: 'showRatingDuration', label: 'Show Rating Duration ', desc: 'In the 7-responses option, for how long to show the selected rating.'},
        {name: 'base_url', label: 'Image\'s URL'},
        //Clearing Object
        {
            leftkey: '', rightkey: '',
            sortingLabel1:'', sortingLabel2:'',
            randomizeLabelSides: false,
            maskStimulus:{css : {color:'#000000', 'font-size':'1em'}, media : {image:''}},
            fixationDuration:0,
            fixationStimulus:{css : {color:'#000000', 'font-size':'1em'}, media : {word:''}},
            showRatingDuration: '', base_url:{image:''}
        }
    ];

    var textDesc=[
        {name: 'exampleBlockInst', nameSeven:'exampleBlockInst7', label:'Example Block\'s Instructions'},
        {name: 'firstBlockInst', nameSeven:'firstBlockInst7', label:'First Block\'s Instructions'},
        {name: 'middleBlockInst', nameSeven:'middleBlockInst7', label:'Middle Block\'s Instructions'},
        {name: 'lastBlockInst', nameSeven:'lastBlockInst7', label:'Last Block\'s Instructions'},
        {name: 'endText', nameSeven:'endText', label:'End Block\'s Instructions'},
        {exampleBlockInst: '', firstBlockInst: '', middleBlockInst:'', lastBlockInst:'', endText:''},
        {exampleBlockInst7: '', firstBlockInst7: '', middleBlockInst7:'', lastBlockInst7:'', endText:''}
    ];

    var blocksDesc = [
        {name: 'trialsInExample', label: 'Number of trials in example block', desc: 'Change to 0 if you don\'t want an example block.'},
        {name: 'trialsInBlock', label: 'Number of trials in a block'},
        {trialsInExample: 0, trialsInBlock: [0,0,0]}
    ];

    var exampleBlock = [
        {name: 'exampleBlock_fixationDuration', label: 'Fixation Duration', desc: 'Value of -1 means no fixation presentation.'},
        {name: 'exampleBlock_primeDuration', label: 'Prime Duration'},
        {name: 'exampleBlock_postPrimeDuration', label: 'Post Prime Duration'},
        {name: 'exampleBlock_targetDuration', label: 'Target Duration'},
        {   exampleBlock_fixationDuration: 0,
            exampleBlock_primeDuration: 0,
            exampleBlock_postPrimeDuration: 0,
            exampleBlock_targetDuration:0,
            exampleTargetStimulus: {nameForLogging: '', sameAsTargets: false},
            exampleFixationStimulus: {css: {color: '000000', 'font-size': '1em'}, media: {word: ''}},
            exampleMaskStimulus: {css: {color: '000000', 'font-size': '1em'}, media: {image: ''}},
            examplePrimeStimulus: {nameForLogging: '', mediaArray: []}
        }
    ];

    var targetClear = [
        {
            name: '',
            nameForFeedback : '',
            mediaArray : []
        },
        {
            targetDuration: 0,
            color: '#000000',
            'font-size': '1em',
            primeDuration: 0,
            postPrimeDuration: 0,
        }
    ];

    var targetTab = {
        'targetCategory':{text: 'Target Category'},
        'targetStimulusCSS':{text:'Target Appearance'}
    };

    var primeClear = [
        {
            name : '',
            nameForFeedback: '',
            mediaArray : []
        },
        { //CSS cleared
            targetDuration: 0,
            primeDuration: 0,
            postPrimeDuration: 0,
            color: '#000000',
            'font-size': '1em'
        }
    ];

    var primesTabs = {
        'prime1':{text: 'First Category'},
        'prime2':{text: 'Second Category'},
        'primeStimulusCSS':{text:'Prime Appearance'}
    };


    var tabs = {
        'parameters':{text: 'General parameters', component: parametersComponent$1, rowsDesc: parametersDesc },
        'blocks':{text: 'Blocks', component: blocksComponent, rowsDesc: blocksDesc},
        'exampleBlock':{text: 'Example Block', component: exampleComponent, rowsDesc: exampleBlock},
        'prime': {
            text: 'Prime Categories',
            component: categoriesComponent$1,
            rowsDesc: primeClear,
            subTabs: primesTabs,
            type: 'AMP'
        },
        'categories':{
            text: 'Target Category',
            component: categoriesComponent$1,
            rowsDesc: targetClear,
            subTabs: targetTab,
            type: 'AMP'
        },
        'text':{text: 'Texts', component: textComponent, rowsDesc: textDesc},
        'output':{text: 'Complete', component: iatOutputComponent, rowsDesc: blocksDesc},
        'import':{text: 'Import', component: importComponent},
        'about': {text: 'About', component: aboutComponent, rowsDesc:'AMP'}
    };

    var amp = function (args, external) { return m.component(ampComponent, args, external); };

    var ampComponent = {
        controller: controller,
        view: view
    };

    function controller(ref, external){
        var file = ref.file;
        var study = ref.study;
        if ( external === void 0 ) external = false;

        var ctrl = {
            study: study ? study : null,
            file : file ? file : null,
            err : m.prop([]),
            last_modify : m.prop(''),
            loaded : m.prop(false),
            notifications : createNotifications(),
            defaultSettings : clone(defaultSettings(external)),
            settings : clone(defaultSettings(external)),
            external: external,
            is_locked:m.prop(study ? study.is_locked : null),
            show_do_save: show_do_save,
            is_settings_changed: is_settings_changed
        };

        ctrl.settings.external = ctrl.external;

        function load() {
            return ctrl.file.get()
                .catch(ctrl.err)
                .then(function () {
                    if (ctrl.file.content().length>10) {
                        ctrl.last_modify(file.last_modify);
                        ctrl.settings = JSON.parse(ctrl.file.content());
                        ctrl.prev_settings = clone(ctrl.settings);
                    }
                    ctrl.loaded(true);
                })
                .then(m.redraw);
        }

        function show_do_save(){
            var error_msg = [];
            tabs.blocks.rowsDesc; //blockDesc inside output attribute
            error_msg = validityCheck(error_msg, ctrl.settings);
            if(error_msg.length !== 0) {
                return messages.confirm({
                    header: 'Some problems were found in your script, it\'s recommended to fix them before saving:',
                    content:
                        m('div',[
                            m('.alert alert-danger', [
                                m('ul', [
                                    error_msg.map(function (err) {
                                        return m('li', err);
                                    })
                                ])
                            ]),
                            m('strong','Do you want to save anyway?')
                        ])
                })
                    .then(function (response) {
                        if (response) do_save();
                    }).catch(function (error) { return messages.alert({
                        content: m('p.alert.alert-danger', error.message)
                    }); })
                    .then(m.redraw());
            }
            else do_save();

        }
        function do_save(){
            ctrl.err([]);
            var studyId  =  m.route.param('studyId');
            var fileId = m.route.param('fileId');
            var jsFileId =  fileId.split('.')[0]+'.js';
            save('amp', studyId, fileId, ctrl.settings, ctrl.last_modify)
                .then (function () { return saveToJS('amp', studyId, jsFileId, toString(ctrl.settings, ctrl.external), ctrl.last_modify); })
                .then(ctrl.study.get())
                .then(function () { return ctrl.notifications.show_success("AMP Script successfully saved"); })
                .then(m.redraw)
                .catch(function (err) { return ctrl.notifications.show_danger('Error Saving:', err.message); });
            ctrl.prev_settings = clone(ctrl.settings);
            m.redraw();
        }

        function is_settings_changed(){
            return JSON.stringify(ctrl.prev_settings) !== JSON.stringify(ctrl.settings);
        }

        external ? null : load();
        return ctrl;
    }
    function view(ctrl){
        if(!ctrl.external) {
            return !ctrl.loaded()
                ? m('.loader')
                : m('.wizard.container-fluid.space',
                    m.component(tabsComponent, tabs, ctrl.settings, ctrl.defaultSettings, ctrl.external, ctrl.notifications,
                        ctrl.is_locked, ctrl.is_settings_changed, ctrl.show_do_save));
        }
        return m('.container-fluid',[
            pageHeadLine('AMP'),
            m.component(messages),
            m.component(tabsComponent, tabs, ctrl.settings, ctrl.defaultSettings, ctrl.external)
        ]);
    }

    var editors = {
        js:     textEditor,
        jsp:    textEditor,
        json:   textEditor,
        html:   textEditor,
        htm:    textEditor,
        jst:    textEditor,
        txt:    textEditor,
        m:      textEditor,
        c:      textEditor,
        cs:     textEditor,
        h:      textEditor,
        py:     textEditor,
        xml:    textEditor,

        jpg:    imgEditor,
        bmp:    imgEditor,
        png:    imgEditor,

        pdf:    pdfEditor,

        iat:    iat,
        biat:   biat,
        spf:    spf,
        stiat:  stiat,
        ep:     ep,
        amp:    amp
    };

    var fileEditorComponent = {
        controller: function(ref) {
            var study = ref.study;

            return {study: study};
        },

        view: function (ref, args) {
            var study = ref.study;
            if ( args === void 0 ) args = {};

            var id = m.route.param('fileId');
            var file = study.getFile(id);
            var editor = file && editors[file.type] || unknownComponent;

            return m('div', {config:fullHeight}, [
                file
                    ? editor({file: file, study: study,  settings: args.settings, key:file.id})
                    : m('.centrify', [
                        m('i.fa.fa-smile-o.fa-5x'),
                        m('h5', 'Please select a file to start working')
                    ])
            ]);
        }
    };

    function ratingWizard(ref){
        var basicPage = ref.basicPage;
        var basicSelect = ref.basicSelect;
        var questionList = ref.questionList;
        var sequence = ref.sequence;

        var NEW_LINE = '\n';
        var content = [
            "var API = new Quest();",

            "",
            "// The structure for the basic questionnaire page",
            ("API.addPagesSet('basicPage', " + (print(basicPage)) + ");"),

            "",
            "// The structure for the basic question    ",
            ("API.addQuestionsSet('basicSelect', " + (print(basicSelect)) + ");"),

            "// This is the question pool, the sequence picks the questions from here",
            ("API.addQuestionsSet('questionList', " + (print(questionList)) + ");"),
            "",

            "// This is the sequence of questions",
            "// Note that you may want to update the \"times\" property if you change the number of questions",
            ("API.addSequence(" + (print(sequence)) + ");"),

            "",
            "return API.script;"
        ].join(NEW_LINE);

        return ("define(['questAPI'], function(Quest){\n" + (indent(content)) + "\n});");
    }

    var wizardComponent = {
        controller: function controller(ref){
            var study = ref.study;

            var path = m.prop('');
            var form = formFactory();
            var submit = function () {
                form.showValidation(true);
                if (form.isValid()){
                    createFile(study, path, compileScript(script) );
                }
                
            };

            var compileScript = function (script) { return function () {
                script.basicPage.questions = [
                    {inherit: {type:script.randomize() ? 'exRandom' : 'sequential', set:'questionList'}}
                ];
                script.sequence = [
                    {
                        mixer:'repeat',
                        times: script.times() || script.questionList().length,
                        data:[
                            {inherit: 'basicPage'}
                        ]
                    }
                ];

                return ratingWizard(script);
            }; };


            var script ={
                basicPage: {
                    header: m.prop(''),
                    decline: m.prop(true),
                    autoFocus:true,
                    v1style: 2
                },
                basicSelect: {
                    type: 'selectOne',
                    autoSubmit: m.prop(false),
                    numericValues: m.prop(true),
                    help: m.prop('<%= pagesMeta.number < 3 %>'),
                    helpText: m.prop('Tip: For quick response, click to select your answer, and then click again to submit.'),
                    answers: m.prop([
                        'Very much',
                        'Somewhat',
                        'Undecided',
                        'Not realy',
                        'Not at all'
                    ]) 
                },
                questionList: m.prop([
                    {stem:'Do you like chocolate?', name:'q1', inherit:'basicSelect'},
                    {stem:'Do you like bannanas?', name:'q2', inherit:'basicSelect'}
                ]),
                times: m.prop(false),
                randomize: m.prop(true),
                sequence: [
                    {
                        mixer: 'repeat',
                        times: m.prop(10),
                        data: [
                            {inherit:'basicPage'}
                        ]
                    }
                ]
            };
            return {path: path, form: form, submit: submit, script: script};
        },
        view: function view(ref){
            var form = ref.form;
            var submit = ref.submit;
            var script = ref.script;
            var path = ref.path;
          
            var basicPage = script.basicPage;
            var basicSelect = script.basicSelect;

            return m('.wizard.container', [
                m('h3', 'Rating wizard'),
                m('p', 'This wizard is responsible for rating stuff'),
                textInput({label:'File Name',  placeholder: 'Path to file', prop: path ,form: form, required:true}), 

                m('h4', 'Basic Page'),
                textInput({label:'Header',  placeholder: 'Page header', help: 'The header for all pages.', prop: basicPage.header,form: form}), 
                checkboxInput({label: 'Decline', description: 'Allow users to decline', prop: basicPage.decline, form: form}),

                m('h4', 'Basic Select'),
                checkboxInput({label: 'autoSubmit', description: 'Submit upon second click', prop: basicSelect.autoSubmit, form: form}),
                arrayInput({label: 'answers', prop: (basicSelect.answers), rows:7,  form: form, isArea:true, help: 'Each row here represents an answer option', required:true}),
                checkboxInput({label: 'numericValues', description: 'Responses are recorded as numbers', prop: basicSelect.numericValues, form: form}),
                maybeInput({label:'help', help: 'If and when to display the help text (use templates to control the when part)', prop: basicSelect.help,form: form}),
                basicSelect.help()
                    ? textInput({label:'helpText',  help: 'The instruction text for using this type of question', prop: basicSelect.helpText,form: form, isArea: true})
                    : '',

                m('h4', 'Sequence'),
                checkboxInput({label: 'Randomize', description: 'Randomize questions', prop: script.randomize, form: form}),
                maybeInput({label: 'Choose', help:'Set a number of questions to choose from the pool. If this option is not selected all questions will be used.', form: form, prop: script.times}),
                arrayInput({label: 'questions', prop: script.questionList, toArr: function (stem, index) { return ({stem: stem, name: ("q" + index), inherit:'basicSelect'}); }, fromArr: function (q) { return q.stem; }, rows:20,  form: form, isArea:true, help: 'Each row here represents a questions', required:true}),
                m('.row', [
                    m('.col-cs-12.text-xs-right', [
                        !form.showValidation() || form.isValid()
                            ? m('button.btn.btn-primary', {onclick: submit}, 'Create')  
                            : m('button.btn.btn-danger', {disabled: true}, 'Not Valid')
                    ])
                ])
            ]); 
        } 
    };

    /**
     * Set this component into your layout then use any mouse event to open the context menu:
     * oncontextmenu: contextMenuComponent.open([...menu])
     *
     * Example menu:
     * [
     *  {icon:'fa-play', text:'begone'},
     *  {icon:'fa-play', text:'asdf'},
     *  {separator:true},
     *  {icon:'fa-play', text:'wertwert', menu: [
     *      {icon:'fa-play', text:'asdf'}
     *  ]}
     * ]
     */

    var contextMenuComponent = {
        vm: {
            show: m.prop(false),
            style: m.prop({}),
            menu: m.prop([])
        },
        view: function () {
            return m(
                '.context-menu',
                {
                    class: classNames({'show-context-menu': contextMenuComponent.vm.show()}),
                    style: contextMenuComponent.vm.style()
                },
                contextMenuComponent.vm.menu().map(menuNode)
            );
        },

        open: function (menu) { return function (e) {
            e.preventDefault();
            e.stopPropagation();

            contextMenuComponent.vm.menu(menu);
            contextMenuComponent.vm.show(true);
            contextMenuComponent.vm.style({
                left:e.pageX + 'px',
                top:e.pageY + 'px'
            });

            document.addEventListener('mousedown', onClick, false);
            function onClick(){
                contextMenuComponent.vm.show(false);
                document.removeEventListener('mousedown', onClick);
                m.redraw();
            }
        }; }
    };

    var menuNode = function (node, key) {
        if (!node) return '';
        if (node.separator) return m('.context-menu-separator', {key:key});

        var action = node.action;
        if (node.href && !action) action = openTab;
        if (node.disabled) action = null;
        
        return m('.context-menu-item', {class: classNames({disabled: node.disabled, submenu:node.menu, key: key})}, [
            m('button.context-menu-btn',{onmousedown: action}, [
                m('i.fa', {class:node.icon}),
                m('span.context-menu-text', node.text)
            ]),
            node.menu ? m('.context-menu', node.menu.map(menuNode)) : ''
        ]);

        function openTab(){
            var win = window.open(node.href, '_blank');
            win.focus();
        }
    };

    // add trailing slash if needed, and then remove proceeding slash
    // return prop
    var pathProp = function (path) { return m.prop(path.replace(/\/?$/, '/').replace(/^\//, '')); };

    var createFromTemplate = function (ref) {
        var study = ref.study;
        var path = ref.path;
        var url = ref.url;
        var templateName = ref.templateName;

        return function () {
        var name = pathProp(path);
        var template = fetchText(url);

        return messages.prompt({
            header: ("Create from \"" + templateName + "\""),
            content: 'Please insert the file name:',
            prop: name
        })
            .then(function (response) {
                if (response) return template.then(function (content) { return createFile(study, name,function () { return content; }); });
            })
            .catch(function (err) {
                var message = (err.response && err.response.status === 404)
                    ? ("Template file not found at " + url)
                    : err.message;

                return messages.alert({
                    header: ("Create from \"" + templateName + "\" failed"),
                    content: message
                });
            });
    };
    };

    var hash = {};

    hash.piPlayer = {
        'Empty': '/implicit/user/yba/wizards/emptypip.js',
        'Typical': '/implicit/user/yba/wizards/typical.js',
        'Simple sorting task': '/implicit/user/yba/wizards/sorting.js',
        'IAT (images)': '/implicit/user/yba/wizards/iatimages.js',
        'IAT (words)': '/implicit/user/yba/wizards/iatwords.js',
        'IAT (modify attributes)': '/implicit/user/yba/wizards/iatatt.js',
        'IAT (all the parameters)': '/implicit/user/yba/wizards/iatall.js',
        'Mobile IAT': '/implicit/user/yba/wizards/iatmobile.js',
        'ST-IAT': '/implicit/user/yba/wizards/stiatsimple.js',
        'ST-IAT (all parameters)': '/implicit/user/yba/wizards/stiatall.js',
        'AMP (with words as primes)': '/implicit/user/yba/wizards/ampwords.js',
        'AMP (all parameters)': '/implicit/user/yba/wizards/ampall.js',
        'Brief-IAT': '/implicit/user/yba/wizards/batsimple.js',
        'Brief-IAT (all parameters)': '/implicit/user/yba/wizards/batall.js',
        'Attitude induction (behaviors)': '/implicit/user/yba/wizards/attitude.js',
        'Evaluative Conditioning': '/implicit/user/yba/wizards/ec.js'
    };

    hash.piQuest = {
        'Empty': '/implicit/user/yba/wizards/emptyquest.js',
        'Rating Questionnaire': '/implicit/user/yba/wizards/rating.js',
        'Rating Questionnaire (with images)': '/implicit/user/yba/wizards/ratingimages.js'
    };

    hash.piMessage = {
        'Consent (Yoav lab)': '/implicit/user/yba/wizards/consent.jst',
        'Intro': '/implicit/user/yba/wizards/intro.jst',
        'Debriefing': '/implicit/user/yba/wizards/debriefing.jst'
    };

    hash.piManager = {
        'Empty': '/implicit/user/yba/wizards/emptymgr.js',
        'Typical': '/implicit/user/yba/wizards/typicalmgr.js'
    };

    var fileContext = function (file, study) {
        var path = !file ? '/' : file.isDir ? file.path : file.basePath;
        var isReadonly = study.isReadonly;
        var menu = [];

        if (!isReadonly) {
            menu = menu.concat([
                {icon:'fa-folder', text:'New Directory', action: createDir(study, path)},
                {icon:'fa-file', text:'New File', action: createEmpty(study, path)},
                {icon:'fa-file-text', text:'New from template', menu: mapWizardHash(hash)},
                {icon:'fa-magic', text:'New from wizard', menu: [
                    {text: 'Rating wizard', action: activateWizard("rating")},
                    {text:'IAT task', action: createImplicitMeasure(study, path, 'iat')},
                    {text:'Brief-IAT task', action: createImplicitMeasure(study, path, 'biat')},
                    {text:'SPF task', action: createImplicitMeasure(study, path, 'spf')},
                    {text:'Single Target-IAT task', action: createImplicitMeasure(study, path, 'stiat')},
                    {text:'Evaluative Priming task', action: createImplicitMeasure(study, path, 'ep')},
                    {text:'AMP task', action: createImplicitMeasure(study, path, 'amp')}]}
            ]);
        }
         
        // Allows to use as a button without a specific file
        if (file) {
            var isExpt = /\.expt\.xml$/.test(file.name);

            if (!isReadonly) menu.push({separator:true});

            menu = menu.concat([
                {icon:'fa-refresh', text: 'Refresh/Reset', action: resetFile(file), disabled: isReadonly || file.content() == file.sourceContent()},
                {icon:'fa-download', text:'Download', action: downloadFile(study, file)},
                {icon:'fa-link', text: 'Copy URL', action: copyUrl(file.url)},
                isExpt ?  { icon:'fa-play', href:("https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=" + (file.url.replace(/^.*?\/implicit/, ''))), text:'Play this task'} : '',
                isExpt ? {icon:'fa-link', text: 'Copy Launch URL', action: copyUrl(("https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=" + (file.url.replace(/^.*?\/implicit/, ''))))} : '',
                {icon:'fa-close', text:'Delete', action: deleteFile, disabled: isReadonly },
                {icon:'fa-arrows-v', text:'Move', action: moveFile(file,study), disabled: isReadonly },
                {icon:'fa-clone', text:'Duplicate', action: duplicateFile(file, study), disabled: isReadonly },
                {icon:'fa-clone', text:'Copy to Different Study', action: copyFile(file, study), disabled: isReadonly },
                {icon:'fa-exchange', text:'Rename...', action: renameFile(file, study), disabled: isReadonly }
            ]);
        }

        return contextMenuComponent.open(menu);

        function activateWizard(route){
            return function () { return m.route("/editor/" + (study.id) + "/wizard/" + route); };
        }
        
        function mapWizardHash(wizardHash){
            return Object.keys(wizardHash).map(function (text) {
                var value = wizardHash[text];
                return typeof value === 'string'
                    ? {text: text, action: createFromTemplate({study: study, path: path, url:value, templateName:text})}
                    : {text: text, menu: mapWizardHash(value)};
            });
        }

        function deleteFile(){
            var isFocused = file.id === m.route.param('fileId');

            messages.confirm({
                header:['Delete ',m('small', file.name)],
                content: 'Are you sure you want to delete this file? This action is permanent!'
            })
            .then(function (ok) {
                if (ok) return doDelete();
            });

            function doDelete(){
                study.delFiles([file])
                    .then(redirect)
                    .catch(function (err) { return messages.alert({
                        header: 'Failed to delete file:',
                        content: err.message
                    }); })
                    .then(m.redraw);
            }

            function redirect(response){
                // redirect only if the file is chosen, otherwise we can stay right here...
                if (isFocused) m.route(("/editor/" + (study.id))); 
                return response;
            }
        } // end delete file
    };

    var DRAGOVER_CLASS = 'is-dragover';
    function dragdrop(element, options) {
        options = options || {};

        element.addEventListener('dragover', activate);
        element.addEventListener('dragleave', deactivate);
        element.addEventListener('dragend', deactivate);
        element.addEventListener('drop', deactivate);
        element.addEventListener('drop', update);

        function activate(e) {
            e.preventDefault();
            e.stopPropagation(); // so that only the lowest level element gets focused
            element.classList.add(DRAGOVER_CLASS);
        }
        function deactivate() {
            element.classList.remove(DRAGOVER_CLASS);
        }
        function update(e) {
            e.preventDefault();
            e.stopPropagation();
            onchange(options)(e);
        }
    }

    var uploadConfig = function (ctrl) { return function (element, isInitialized) {
        if (!isInitialized) {
            dragdrop(element, {onchange: ctrl.onchange});
        }
    }; };

    // call onchange with files
    var onchange = function (args) { return function (e) {
        if (typeof args.onchange == 'function') {
            args.onchange((e.dataTransfer || e.target).files);
        }
    }; };

    var node = function (args) { return m.component(nodeComponent, args); };

    var nodeComponent = {
        view: function (ctrl, ref) {
            var file = ref.file;
            var folderHash = ref.folderHash;
            var study = ref.study;

            var vm = study.vm(file.id); // vm is created by the studyModel
            var hasChildren = !!(file.isDir && file.files && file.files.length);
            return m('li.file-node',
                {
                    key: file.id,
                    class: classNames({
                        open : vm.isOpen()
                    }),
                    onclick: file.isDir ? toggleOpen(vm) : select$1(file),
                    oncontextmenu: fileContext(file, study),
                    config: file.isDir ? uploadConfig({onchange:uploadFiles(file.path, study)}) : null
                },
                [
                    m('a.wholerow', {
                        unselectable:'on',
                        class:classNames({
                            'current': m.route.param('fileId') === file.id
                        })
                    }, m.trust('&nbsp;')),
                    m('i.fa.fa-fw', {
                        class: classNames({
                            'fa-caret-right' : hasChildren && !vm.isOpen(),
                            'fa-caret-down': hasChildren && vm.isOpen()
                        })
                    }),

                    m('a', {class:classNames({'text-primary': /\.expt\.xml$/.test(file.name)})}, [
                        // checkbox
                        m('i.fa.fa-fw', {
                            onclick: choose$1({file: file,study: study}),
                            class: classNames({
                                'fa-check-square-o': vm.isChosen() === 1,
                                'fa-square-o': vm.isChosen() === 0,
                                'fa-minus-square-o': vm.isChosen() === -1
                            })
                        }),

                        // icon
                        m('i.fa.fa-fw.fa-file-o', {
                            class: classNames({
                                'fa-file-code-o': /(js)$/.test(file.type),
                                'fa-file-text-o': /(jst|html|xml)$/.test(file.type),
                                'fa-file-image-o': /(jpg|png|bmp)$/.test(file.type),
                                'fa-file-pdf-o': /(pdf)$/.test(file.type),
                                'fa-folder-o': file.isDir
                            })
                        }),

                        // file name
                        m('span',{class:classNames({'font-weight-bold':file.hasChanged()})},(" " + (file.name))),

                        // children
                        hasChildren && vm.isOpen() ? folder({path: file.path + '/', folderHash: folderHash, study: study}) : ''
                    ])
                ]
            );
        }
    };

    var toggleOpen = function (vm) { return function (e) {
        vm.isOpen(!vm.isOpen());
        e.preventDefault();
        e.stopPropagation();
    }; };

    // select specific file and display it
    var select$1 = function (file) { return function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (file.viewStudy) m.route(("/view/" + (m.route.param('code')) + "/file/" + (encodeURIComponent(file.id))));
        else m.route(("/editor/" + (file.studyId) + "/file/" + (encodeURIComponent(file.id))));
        m.redraw.strategy('diff'); // make sure that the route change is diffed as opposed to redraws
    }; };

    // checkmark a file/folder
    var choose$1 = function (ref) {
        var file = ref.file;
        var study = ref.study;

        return function (e) {
        e.stopPropagation();
        e.preventDefault();

        var lastState = isChosen(file)();

        // mark decendents (and the file itself
        study
            .getChildren(file)
            .forEach(function (f) { return isChosen(f)(lastState === 1 ? 0 : 1); }); // update vm for each child

        function isChosen(file){
            return study.vm(file.id).isChosen;
        }
    };
    };

    var folder = function (args) {
        args.key = args.path;
        return m.component(folderComponent, args);
    };

    var folderComponent = {
        view: function view(ctrl, ref){
            var path = ref.path;
            var folderHash = ref.folderHash;
            var study = ref.study;

            var files = folderHash[path] || [];

            return m('.files', [
                m('ul', files.map(function (file) { return node({key: file.id, file: file, folderHash: folderHash, study: study}); }))
            ]);
        }
    };

    var filesList = function (ref) {
        var study = ref.study;

        var folderHash = parseFiles(study.files());
        var config = uploadConfig({onchange:uploadFiles('/', study)});
        var chooseState = getCurrentState(study); 

        return m('div', {config: config}, [
            m('h5', [
                m('small', [
                    m('i.fa.fa-fw', {
                        onclick: choose(chooseState, study),
                        class: classNames({
                            'fa-check-square-o': chooseState === 1,
                            'fa-square-o': chooseState === 0,
                            'fa-minus-square-o': chooseState === -1
                        })
                    })
                ]),
                m('a.no-decoration', {href:("/editor/" + (study.id)), config:m.route}, study.name)
            ]),
            folder({path:'/',folderHash: folderHash, study: study})
        ]);
    };

    var parseFiles = function (files) { return files.reduce(function (hash, file){
        var path = file.basePath;
        if (!hash[path]) hash[path] = [];
        hash[path].push(file);
        return hash;
    }, {}); };

    function choose(currentState, study){
        return function () { return study.files().forEach(function (file) { return study.vm(file.id).isChosen(currentState === 1 ? 0 : 1); }); };
    }

    function getCurrentState(study){
        var vm = study.vm;
        var filesCount = study.files().length;
        var chosenCount = study.files().reduce(function (result, file) { return vm(file.id).isChosen() ? result + 1 : result; }, 0);
        return !chosenCount ? 0 : filesCount === chosenCount ? 1 : -1;
    }

    /**
     * VirtualElement dropdown(Object {String toggleSelector, Element toggleContent, Element elements})
     *
     * where:
     *  Element String text | VirtualElement virtualElement | Component
     * 
     * @param toggleSelector the selector for the toggle element
     * @param toggleContent the: content for the toggle element
     * @param elements: a list of dropdown items (http://v4-alpha.getbootstrap.com/components/dropdowns/)
     **/
    var dropdown = function (args) { return m.component(dropdownComponent, args); };

    var dropdownComponent = {
        controller: function controller(){
            var isOpen = m.prop(false);
            return {isOpen: isOpen};
        },

        view: function view(ref, ref$1){
            var isOpen = ref.isOpen;
            var toggleSelector = ref$1.toggleSelector;
            var toggleContent = ref$1.toggleContent;
            var elements = ref$1.elements;
            var right = ref$1.right;

            return m('.dropdown.dropdown-component', {class: isOpen() ? 'open' : '', config: dropdownComponent.config(isOpen)}, [
                m(toggleSelector, {onmousedown: function () {isOpen(!isOpen());}}, toggleContent), 
                m('.dropdown-menu', {class: right ? 'dropdown-menu-right' : ''}, elements)
            ]);
        },

        config: function (isOpen) { return function (element, isInit, ctx) {
            if (!isInit) {
                // this is a bit memory intensive, but lets not preemptively optimse
                // bootstrap does this with a backdrop
                document.addEventListener('mousedown', onClick, false);
                ctx.onunload = function () { return document.removeEventListener('mousedown', onClick); };
            }

            function onClick(e){
                if (!isOpen()) return;

                // if we are within the dropdown do not close it
                // this is conditional to prevent IE problems
                if (e.target.closest && e.target.closest('.dropdown') === element && !hasClass(e.target, 'dropdown-onclick')) return true;
                isOpen(false);
                m.redraw();
            }

            function hasClass(el, selector){
                return ( (' ' + el.className + ' ').replace(/[\n\t\r]/g, ' ').indexOf(' ' + selector + ' ') > -1 );
            }
        }; }
    };

    function studyTemplatesComponent (args) { return m.component(studyTemplatesComponent$1, args); }
    var studyTemplatesComponent$1 = {
        controller: function controller(ref){
            var load_templates = ref.load_templates;
            var studies = ref.studies;
            var reuse_id = ref.reuse_id;
            var templates = ref.templates;
            var template_id = ref.template_id;

            var loaded = m.prop(false);
            var error = m.prop(null);
            load_templates()
                .then(function (response) { return templates(response.templates); })
                .catch(error)
                .then(loaded.bind(null, true))
                .then(m.redraw);
            return {studies: studies, template_id: template_id, reuse_id: reuse_id, templates: templates, loaded: loaded, error: error};
        },
        view: function (ref) {
            var studies = ref.studies;
            var template_id = ref.template_id;
            var reuse_id = ref.reuse_id;
            var templates = ref.templates;
            var loaded = ref.loaded;
            var error = ref.error;

            return m('div.space', [
            loaded() ? '' : m('.loader'),
            error() ? m('.alert.alert-warning', error().message): '',
            loaded() && !templates().length ? m('.alert.alert-info', 'There is no templates yet') : '',
            m('select.form-control', {value:template_id(), onchange: m.withAttr('value',template_id)}, [
                m('option',{value:'', disabled: true}, 'Select template'),
                templates().filter(ownerFilter()).sort(sort_studies).map(function (study) { return m('option',{value:study.id}, study.name); })
            ]),
            !template_id() ? '' :
            m('div.space', [
                m('select.form-control', {value:reuse_id(), onchange: m.withAttr('value',reuse_id)}, [
                    m('option',{value:'', disabled: true}, 'Select template for reuse (optional)'),
                    studies.map(function (study) { return m('option',{value:study.id}, study.name); })
                ])])

        ]);
    }
    };

    function sort_studies(study_1, study_2){return study_1.name.toLowerCase() === study_2.name.toLowerCase() ? 0 : study_1.name.toLowerCase() > study_2.name.toLowerCase() ? 1 : -1;}

    var ownerFilter = function () { return function (study) {
        return study.permission == 'owner';
    }; };

    function tag_url(tag_id)
    {
        return (tagsUrl + "/" + (encodeURIComponent(tag_id)));
    }

    function study_url(study_id) {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/tags");
    }

    var update_tags_in_study = function (study_id, tags) { return fetchJson(study_url(study_id), {
        method: 'put',
        body: {tags: tags}
    }); };

    var get_tags = function () { return fetchJson(tagsUrl, {
        method: 'get'
    }); };


    var get_tags_for_study = function (study_id) { return fetchJson(study_url(study_id), {
        method: 'get'
    }); };

    var remove_tag = function (tag_id) { return fetchJson(tag_url(tag_id), {
        method: 'delete'
    }); };

    var add_tag = function (tag_text, tag_color) { return fetchJson(tagsUrl, {
        method: 'post',
        body: {tag_text: tag_text, tag_color: tag_color}
    }); };

    var edit_tag = function (tag_id, tag_text, tag_color) { return fetchJson(tag_url(tag_id), {
        method: 'put',
        body: {tag_text: tag_text, tag_color: tag_color}
    }); };

    function studyTagsComponent (args) { return m.component(studyTagsComponent$1, args); }
    var studyTagsComponent$1 = {
        controller: function controller(ref){
            var loadTags = ref.loadTags;
            var tags = ref.tags;
            var study_id = ref.study_id;

            var tagName = m.prop('');
            var loaded = m.prop(false);
            var error = m.prop(null);
            get_tags_for_study(study_id)
                .then(function (response) { return tags(response.tags); })
                .catch(error)
                .then(loaded.bind(null, true))
                .then(m.redraw);

            return {tagName: tagName, tags: tags, loaded: loaded, error: error, loadTags: loadTags};
        },
        view: function (ref, ref$1) {
            var tagName = ref.tagName;
            var tags = ref.tags;
            var loaded = ref.loaded;
            var error = ref.error;
            var loadTags = ref.loadTags;
            var study_id = ref$1.study_id;

            return m('div', [
            m('.input-group', [
                m('input.form-control', {
                    placeholder: 'Filter Tags',
                    value: tagName(),
                    oninput: m.withAttr('value', tagName)
                }),
                m('span.input-group-btn', [
                    m('button.btn.btn-secondary', {onclick: create_tag(study_id, tagName, tags, error, loadTags), disabled: !tagName()}, [
                        m('i.fa.fa-plus'),
                        ' Create New'
                    ])
                ])
            ]),
            m('.small.text-muted.m-b-1', 'Use this text field to filter your tags. Click "Create New" to turn a filter into a new tag'),

            loaded() ? '' : m('.loader'),
            error() ? m('.alert.alert-warning', error().message): '',
            loaded() && !tags().length ? m('.alert.alert-info', 'You have no tags yet') : '',

            m('.custom-controls-stacked.pre-scrollable', tags().sort(sort_tags).filter(filter_tags(tagName())).map(function (tag) { return m('label.custom-control.custom-checkbox', [
                m('input.custom-control-input', {
                    type: 'checkbox',
                    checked: tag.used,
                    onclick: function(){
                        tag.used = !tag.used;
                        tag.changed = !tag.changed;
                    }
                }), 
                m('span.custom-control-indicator'),
                m('span.custom-control-description.m-l-1.study-tag',{style: {'background-color': '#' + tag.color}}, tag.text)
            ]); }))
        ]);
    }
    };

    function filter_tags(val){return function (tag) { return tag.text.indexOf(val) !== -1; };}
    function sort_tags(tag_1, tag_2){return tag_1.text.toLowerCase() === tag_2.text.toLowerCase() ? 0 : tag_1.text.toLowerCase() > tag_2.text.toLowerCase() ? 1 : -1;}       


    function create_tag(study_id, tagName, tags, error, callback){
        return function () { return add_tag(tagName(), 'E7E7E7')
            .then(function (response) { return tags().push(response); })
            .then(tagName.bind(null, ''))
            .then(callback)
            .catch(error)
            .then(m.redraw); };
    }

    var do_create = function (type, studies) {
        var study_name = m.prop('');
        var templates = m.prop([]);
        var template_id = m.prop('');
        var reuse_id = m.prop('');
        var error = m.prop('');



        var ask = function () { return messages.confirm({
            header:type == 'regular' ? 'New Study' : 'New Template Study',
            content: m.component({view: function () { return m('p', [
                m('p', 'Enter Study Name:'),
                m('input.form-control',  {oninput: m.withAttr('value', study_name)}),
                !error() ? '' : m('p.alert.alert-danger', error()),
                m('p', type == 'regular' ? '' : studyTemplatesComponent({load_templates: load_templates, studies: studies, reuse_id: reuse_id, templates: templates, template_id: template_id}))
            ]); }
        })}).then(function (response) { return response && create(); }); };

        var create = function () { return create_study(study_name, type, template_id, reuse_id)
            .then(function (response) { return m.route(type == 'regular' ? ("/editor/" + (response.study_id)) : ("/translate/" + (response.study_id))); })
            .catch(function (e) {
                error(e.message);
                ask();
            }); };
        ask();
    };

    var do_tags = function (ref) {
        var study_id = ref.study_id;
        var loadTags = ref.loadTags;
        var callback = ref.callback;

        return function (e) {
        e.preventDefault();
        var  filter_tags = function (){return function (tag) { return tag.changed; };};
        var tags = m.prop([]);
        messages.confirm({header:'Tags', content: studyTagsComponent({loadTags: loadTags, tags: tags, study_id: study_id, callback: callback})})
            .then(function (response) {
                if (response)
                    update_tags_in_study(study_id, tags().filter(filter_tags()).map(function (tag){ return (({id: tag.id, used: tag.used})); })).then(callback);
            });
    };
    };


    var do_delete = function (study_id, callback) { return function (e) {
        e.preventDefault();
        return messages.confirm({header:'Delete study', content:'Are you sure?'})
            .then(function (response) {
                if (response) delete_study(study_id)
                    .then(callback)
                    .then(m.redraw)
                    .catch(function (error) { return messages.alert({header: 'Delete study', content: m('p.alert.alert-danger', error.message)}); })
                    .then(m.redraw);
            });
    }; };


    var do_rename = function (study_id, name, callback) { return function (e) {
        e.preventDefault();
        var study_name = m.prop(name);
        var error = m.prop('');

        var ask = function () { return messages.confirm({
            header:'New Name',
            content: m('div', [
                m('input.form-control', {placeholder: 'Enter Study Name', value: study_name(), onchange: m.withAttr('value', study_name)}),
                !error() ? '' : m('p.alert.alert-danger', error())
            ])
        }).then(function (response) { return response && rename(); }); };

        var rename = function () { return rename_study(study_id, study_name)
            .then(callback.bind(null, study_name()))
            .then(m.redraw)
            .catch(function (e) {
                error(e.message);
                ask();
            }); };

        // activate creation
        ask();
    }; };

    var do_duplicate= function (study_id, name, type) { return function (e) {
        e.preventDefault();
        var study_name = m.prop(name);
        var error = m.prop('');

        var ask = function () { return messages.confirm({
            header:'New Name',
            content: m('div', [
                m('input.form-control', {placeholder: 'Enter Study Name', value: '', onchange: m.withAttr('value', study_name)}),
                !error() ? '' : m('p.alert.alert-danger', error())
            ])
        }).then(function (response) { return response && duplicate(); }); };

        var duplicate= function () { return duplicate_study(study_id, study_name)
            .then(function (response) { return m.route( type==='regular' ? ("/editor/" + (response.study_id)): ("/editor/" + (response.study_id)) ); })
            .then(m.redraw)
            .catch(function (e) {
                error(e.message);
                ask();
            }); };
        ask();
    }; };

    var do_lock = function (study) { return function (e) {
        e.preventDefault();
        var error = m.prop('');

        var ask = function () { return messages.confirm({okText: ['Yes, ', study.is_locked ? 'unlock' : 'lock' , ' the study'], cancelText: 'Cancel', header:'Are you sure?', content:m('p', [m('p', study.is_locked
            ?
            'Unlocking the study will let you modifying the study. When a study is Unlocked, you can add files, delete files, rename files, edit files, rename the study, or delete the study.'
            :
            'Are you sure you want to lock the study? This will prevent you from modifying the study until you unlock the study again. When a study is locked, you cannot add files, delete files, rename files, edit files, rename the study, or delete the study.'),
            !error() ? '' : m('p.alert.alert-danger', error())])
        })

        .then(function (response) { return response && lock(); }); };

        var lock= function () { return lock_study(study.id, !study.is_locked)
            .then(study.is_locked = !study.is_locked)
            .then(study.isReadonly = study.is_locked)
            

            .catch(function (e) {
                error(e.message);
                ask();
            })
            .then(m.redraw); };
        ask();
    }; };

    var sidebarButtons = function (ref) {
        var study = ref.study;

        var readonly = study.isReadonly;
        var studyId = m.route.param('studyId');

        return m('.btn-toolbar', [
            m('.btn-group.btn-group-sm', [
                dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-menu-right', toggleContent: m('i.fa.fa-bars'), elements: [
                    readonly ? '' : [
                        study.is_locked ? '' : m('button.dropdown-item.dropdown-onclick', {onmousedown: do_delete(study.id, function () { return m.route('/studies'); })}, [
                            m('i.fa.fa-fw.fa-remove'), ' Delete study'
                        ]),
                        study.is_locked ? '' : m('button.dropdown-item.dropdown-onclick', {onmousedown: do_rename(study.id, study.name, function (name) { return study.name = name; })}, [
                            m('i.fa.fa-fw.fa-exchange'), ' Rename study'
                        ])

                    ],
                    study.view ? '' :
                        m('button.dropdown-item.dropdown-onclick', {onmousedown: do_duplicate(study.id, study.name)}, [
                            m('i.fa.fa-fw.fa-clone'), ' Duplicate study'
                        ]),

                    !study.is_locked && readonly ? '' : [
                        m('button.dropdown-item.dropdown-onclick', {onmousedown: do_lock(study)}, [
                            m('i.fa.fa-fw', {class: study.is_locked ? 'fa-unlock' : 'fa-lock'}), study.is_locked  ? ' Unlock Study' :' Lock Study'
                        ]),
                        study.is_locked ? '' : m('a.dropdown-item', { href: ("/deploy/" + studyId), config: m.route }, 'Request Deploy'),
                        study.is_locked ? '' : m('a.dropdown-item', { href: ("/studyChangeRequest/" + studyId), config: m.route }, 'Request Change'),
                        study.is_locked ? '' : m('a.dropdown-item', { href: ("/studyRemoval/" + studyId), config: m.route }, 'Request Removal'),
                        m('a.dropdown-item', { href: ("/sharing/" + studyId), config: m.route }, [m('i.fa.fa-fw.fa-user-plus'), ' Sharing'])
                    ],
                    m('button.dropdown-item.dropdown-onclick', {onmousedown: copyUrl(study.baseUrl)}, [m('i.fa.fa-fw.fa-link'), ' Copy Base URL'])
                ]})
            ]),
            m('.btn-group.btn-group-sm', [
                m('a.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', onclick: readonly || fileContext(null, study), title: 'Create new files'}, [
                    m('i.fa.fa-plus')
                ]),
                m('a.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', onclick: readonly || deleteFiles(study), title: 'Delete selected files'}, [
                    m('i.fa.fa-close')
                ]),
                m('a.btn.btn-secondary.btn-sm', {onclick: downloadChosenFiles(study), title: 'Download selected files'}, [
                    m('i.fa.fa-download')
                ]),
                m('label.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', title: 'Drag files over the file list in order to upload easily'}, [
                    m('i.fa.fa-upload'),
                    readonly ? '' : m('input[type="file"]', {style: 'display:none', multiple:'true', onchange: uploadButton(study)})
                ])
            ])
        ]);
    };


    function uploadButton(study){
        return function (e) {
            var dataTransfer = e.dataTransfer || e.target;
            uploadFiles('/', study)(dataTransfer.files);
        };
    }

    var sidebarComponent = {
        view: function (ctrl , ref) {
            var study = ref.study;

            return m('.sidebar', {config: config$1}, [
                sidebarButtons({study: study}),
                filesList({study: study})
            ]);
        }
    };

    function config$1(el, isInitialized, ctx){
        if (!isInitialized) el.addEventListener('scroll', listen, false);
        el.scrollTop = ctx.scrollTop || 0;

        function listen(){
            ctx.scrollTop = el.scrollTop;
        }
    }

    var splitPane = function (args) { return m.component(splitComponent, args); };

    var splitComponent = {
        controller: function controller(ref){
            var leftWidth = ref.leftWidth;

            return {
                parentWidth: m.prop(),
                parentOffset: m.prop(),
                leftWidth: leftWidth || m.prop('auto')
            };
        },

        view: function view(ref, ref$1){
            var parentWidth = ref.parentWidth;
            var parentOffset = ref.parentOffset;
            var leftWidth = ref.leftWidth;
            var left = ref$1.left; if ( left === void 0 ) left = '';
            var right = ref$1.right; if ( right === void 0 ) right = '';

            return m('.split-pane', {config: config(parentWidth, parentOffset, leftWidth)}, [
                m('.split-pane-col-left', {style: {flexBasis: leftWidth() + 'px'}}, left),
                m('.split-pane-divider', {onmousedown: onmousedown(parentOffset, leftWidth)}),
                m('.split-pane-col-right', right)
            ]);
        }
    };

    var config = function (parentWidth, parentLeft, leftWidth) { return function (element, isInitialized, ctx) {
        if (!isInitialized){
            update();
            if (leftWidth() === undefined) leftWidth(parentWidth()/6);
        }

        document.addEventListener('resize', update);
        ctx.onunload = function () { return document.removeEventListener('resize', update); };
        
        function update(){
            parentWidth(element.offsetWidth);
            parentLeft(element.getBoundingClientRect().left);
        }
    }; };

    var onmousedown = function (parentOffset, leftWidth) { return function () {
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('mousemove', mousemove);

        function mouseup() {
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mousemove);
        }

        function mousemove(e){
            leftWidth(e.pageX - parentOffset());
            m.redraw();
        }
    }; };

    var study$1;

    var editorLayoutComponent$1 = {
        controller: function (){
            var id = m.route.param('studyId');

            if (!study$1 || (study$1.id !== id)){
                study$1 = studyFactory$1(id);
                study$1
                    .get()
                    .then(m.redraw);
            }

            var ctrl = {study: study$1, onunload: onunload};

            window.addEventListener('beforeunload', beforeunload);

            return ctrl;

            function hasUnsavedData(){
                return study$1.files().some(function (f) { return f.content() !== f.sourceContent(); });
            }

            function beforeunload(event) {
                if (hasUnsavedData()) return event.returnValue = 'You have unsaved data are you sure you want to leave?';
            }

            function onunload(e){

                var leavingEditor = !/^\/editor\//.test(m.route());
                if (leavingEditor && hasUnsavedData() && !window.confirm('You have unsaved data are you sure you want to leave?')){
                    e.preventDefault();
                } else {
                    window.removeEventListener('beforeunload', beforeunload);
                }

                if (leavingEditor) study$1 = null;
            }
        },
        view: function (ref) {
            var study = ref.study;

            return m('.study', {config: fullHeight},  [
                !study.loaded ? '' : splitPane({
                    leftWidth: leftWidth$2,
                    left: m.component(sidebarComponent, {study: study}),
                    right: m.route.param('resource') === 'wizard'
                        ? m.component(wizardComponent, {study: study})
                        : m.component(fileEditorComponent, {study: study})
                })
            ]);
        }
    };

    // a clone of m.prop that users localStorage so that width changes persist across sessions as well as files.
    // Essentially this is a global variable
    function leftWidth$2(val){
        if (arguments.length) localStorage.fileSidebarWidth = val;
        return localStorage.fileSidebarWidth;
    }

    var studyPrototype = {
        apiURL: function apiURL(path){
            if ( path === void 0 ) path = '';

            return (baseUrl + "/view_files/" + (encodeURIComponent(this.code)) + path);
        },

        get: function get(){
            var this$1$1 = this;

            return fetchFullJson(this.apiURL())
                .then(function (study) {
                    this$1$1.loaded = true;
                    this$1$1.id = study.id;
                    this$1$1.isReadonly = study.is_readonly;
                    this$1$1.istemplate = study.is_template;
                    this$1$1.is_locked = study.is_locked;
                    this$1$1.name = study.study_name;
                    this$1$1.baseUrl = study.base_url;
                    var files = flattenFiles(study.files)
                        .map(assignStudyId(this$1$1.id))
                        .map(assignViewStudy())
                        .map(fileFactory);

                    this$1$1.files(files);
                    this$1$1.sort();
                })
                .catch(function (reason) {
                    this$1$1.error = true;
                    throw(reason);
                    // if(reason.status==404)
                    //
                    // console.log(reason.status);
                    //
                    // return Promise.reject(reason); // do not swallow error
                });

            function flattenFiles(files){
                if (!files) return [];
                return files
                        .map(spreadFile)
                        .reduce(function (result, fileArr) { return result.concat(fileArr); },[]);
            }

            function assignStudyId(id){
                return function (f) { return Object.assign(f, {studyId: id}); };
            }

            function assignViewStudy(){
                return function (f) { return Object.assign(f, {viewStudy: true}); };
            }

            // create an array including file and all its children
            function spreadFile(file){
                return [file].concat(flattenFiles(file.files));
            }
        },

        getFile: function getFile(id){
            return this.files().find(function (f) { return f.id === id; });
        },

        // makes sure not to return both a folder and its contents.
        // This is important mainly for server side clarity (don't delete or download both a folder and its content)
        // We go recurse through all the files, starting with those sitting in root (we don't have a root node, so we need to get them manually).
        getChosenFiles: function getChosenFiles(){
            var vm = this.vm;
            var rootFiles = this.files().filter(function (f) { return f.basePath === '/'; });
            return getChosen(rootFiles);

            function getChosen(files){
                return files.reduce(function (response, file) {
                    // a chosen file/dir does not need sub files to be checked
                    if (vm(file.id).isChosen() === 1) response.push(file);
                    // if not chosen, we need to look deeper
                    else response = response.concat(getChosen(file.files || []));
                    return response;
                }, []);
            }
        },

        addFile: function addFile(file){
            this.files().push(file);
            // update the parent folder
            var parent = this.getParents(file).reduce(function (result, f) { return result && (result.path.length > f.path.length) ? result : f; } , null); 
            if (parent) {
                parent.files || (parent.files = []);
                parent.files.push(file);
            }
        },

        createFile: function createFile(ref){
            var this$1$1 = this;
            var name = ref.name;
            var content = ref.content; if ( content === void 0 ) content = '';
            var isDir = ref.isDir;

            // validation (make sure there are no invalid characters)
            if(/[^\/-_.A-Za-z0-9]/.test(name)) return Promise.reject({message: ("The file name \"" + name + "\" is not valid")});

            // validation (make sure file does not already exist)
            var exists = this.files().some(function (file) { return file.path === name; });
            if (exists) return Promise.reject({message: ("The file \"" + name + "\" already exists")});

            // validateion (make sure direcotry exists)
            var basePath = (name.substring(0, name.lastIndexOf('/'))).replace(/^\//, '');
            var dirExists = basePath === '' || this.files().some(function (file) { return file.isDir && file.path === basePath; });
            if (!dirExists) return Promise.reject({message: ("The directory \"" + basePath + "\" does not exist")});
            return fetchJson(this.apiURL('/file'), {method:'post', body: {name: name, content: content, isDir: isDir}})
                .then(function (response) {
                    Object.assign(response, {studyId: this$1$1.id, content: content, path:name, isDir: isDir});
                    var file = fileFactory(response);
                    file.loaded = true;
                    this$1$1.addFile(file);
                    return response;
                })
                .then(this.sort.bind(this));
        },

        sort: function sort(response){
            var files = this.files().sort(sort);
            this.files(files);
            return response;

            function sort(a,b){
                // sort by isDir then name
                var nameA= +!a.isDir + a.name.toLowerCase(), nameB=+!b.isDir + b.name.toLowerCase();
                if (nameA < nameB) return -1;//sort string ascending
                if (nameA > nameB) return 1;
                return 0; //default return value (no sorting)
            }
        },


        /*
         * @param files [Array] a list of file.path to download
         * @returns url [String] the download url
         */
        downloadFiles: function downloadFiles(files){
            return fetchJson(this.apiURL(), {method: 'post', body: {files: files}})
                .then(function (response) { return (baseUrl + "/download?path=" + (response.zip_file) + "&study=_PATH"); });
        },


        getParents: function getParents(file){
            return this.files().filter(function (f) { return f.isDir && file.basePath.indexOf(f.path) === 0; });
        },

        // returns array of children for this file, including itself
        getChildren: function getChildren(file){
            return children(file);
           
            function children(file){
                if (!file.files) return [file];
                return file.files
                    .map(children) // harvest children
                    .reduce(function (result, files) { return result.concat(files); }, [file]); // flatten
            }
        }
    };

    var studyFactory =  function (code) {
        var study = Object.create(studyPrototype);
        Object.assign(study, {
            code    : code,
            id      : '',
            view    : true,
            files   : m.prop([]),
            loaded  : false,
            error   :false,
            vm      : viewModelMap({
                isOpen: m.prop(false),
                isChanged: m.prop(false),
                isChosen: m.prop(0)
            })
        });

        return study;
    };

    // http://lhorie.github.io/mithril-blog/mapping-view-models.html
    var viewModelMap = function(signature) {
        var map = {};
        return function(key) {
            if (!map[key]) {
                map[key] = {};
                for (var prop in signature) map[key][prop] = m.prop(signature[prop]());
            }
            return map[key];
        };
    };

    var study;

    var editorLayoutComponent = {
        controller: function (){

            var code = m.route.param('code');

            if (!study || (study.code !== code)){
                study = studyFactory(code);
                study
                    .get()
                    .catch(function (reason) {
                        if(reason.status==403)
                            m.route('/');
                    })
                    .then(m.redraw);
            }

            var ctrl = {study: study, onunload: onunload};
            return ctrl;
        },
        view: function (ref) {
            var study = ref.study;

            return m('.study', {config: fullHeight},  [
                !study.loaded ? '' : splitPane({
                    leftWidth: leftWidth$1,
                    left: m.component(sidebarComponent, {study: study}),
                    right: m.route.param('resource') === 'wizard'
                        ? m.component(wizardComponent, {study: study})
                        : m.component(fileEditorComponent, {study: study})
                })
            ]);
        }
    };

    // a clone of m.prop that users localStorage so that width changes persist across sessions as well as files.
    // Essentially this is a global variable
    function leftWidth$1(val){
        if (arguments.length) localStorage.fileSidebarWidth = val;
        return localStorage.fileSidebarWidth;
    }

    var mainComponent = {

        controller: function(){
            var ctrl = {
                studies:m.prop([]),
                have_templates:m.prop(false),
                tags:m.prop([]),
                user_name:m.prop(''),
                globalSearch: m.prop(''),
                permissionChoice: m.prop('all'),
                loaded:false,
                order_by_name: true,
                loadStudies: loadStudies,
                loadTags: loadTags,
                type: m.prop(''),
                sort_studies_by_name: sort_studies_by_name,
                sort_studies_by_date: sort_studies_by_date
            };

            loadTags();
            loadStudies();
            function loadStudies() {
                ctrl.type(m.route() == '/studies' ? 'regular' : 'template');
                // console.log(ctrl.type());
                load_studies()
                    .then(function (response) { return response.studies; })
                    .then(ctrl.studies)
                    .then(function (){ return ctrl.loaded = true; })
                    .then(sort_studies_by_name)
                    .then(m.redraw);
            }

            function loadTags() {
                get_tags()
                    .then(function (response) { return response.tags; })
                    .then(ctrl.tags)
                    .then(m.redraw);
            }

            return ctrl;
            function sort_studies_by_name2(study1, study2){
                ctrl.order_by_name = true;
                return study1.name.toLowerCase() === study2.name.toLowerCase() ? 0 : study1.name.toLowerCase() > study2.name.toLowerCase() ? 1 : -1;
            }

            function sort_studies_by_date2(study1, study2){
                ctrl.order_by_name = false;
                return study1.last_modified === study2.last_modified ? 0 : study1.last_modified < study2.last_modified ? 1 : -1;
            }



            function sort_studies_by_date(){
                ctrl.studies(ctrl.studies().sort(sort_studies_by_date2));
            }
            function sort_studies_by_name(){
                ctrl.studies(ctrl.studies().sort(sort_studies_by_name2));
            }


        },
        view: function view(ref){
            var loaded = ref.loaded;
            var studies = ref.studies;
            var tags = ref.tags;
            var permissionChoice = ref.permissionChoice;
            var globalSearch = ref.globalSearch;
            var loadStudies = ref.loadStudies;
            var loadTags = ref.loadTags;
            var sort_studies_by_date = ref.sort_studies_by_date;
            var sort_studies_by_name = ref.sort_studies_by_name;
            var order_by_name = ref.order_by_name;
            var type = ref.type;

            if (!loaded) return m('.loader');
            return m('.container.studies', [
                m('.row.p-t-1', [
                    m('.col-sm-4', [
                        m('h3', ['My ', type()=='regular' ? 'Studies' : 'Template Studies'])
                    ]),

                    m('.col-sm-8', [
                        m('button.btn.btn-success.btn-sm.pull-right', {onclick:function(){do_create(type(), studies().filter(typeFilter(type())));}}, [
                            m('i.fa.fa-plus'), '  Add new study'
                        ]),

                        m('.pull-right.m-r-1', [
                            dropdown({toggleSelector:'button.btn.btn-sm.btn-secondary.dropdown-toggle', toggleContent: [m('i.fa.fa-tags'), ' Tags'], elements:[
                                m('h6.dropdown-header', 'Filter by tags'),
                                !tags().length
                                    ? m('em.dropdown-header', 'You do not have any tags yet')
                                    : tags().map(function (tag) { return m('a.dropdown-item',m('label.custom-control.custom-checkbox', [
                                        m('input.custom-control-input', {
                                            type: 'checkbox',
                                            checked: tag.used,
                                            onclick: function(){
                                                tag.used = !tag.used;
                                            }
                                        }),
                                        m('span.custom-control-indicator'),
                                        m('span.custom-control-description.m-r-1.study-tag',{style: {'background-color': '#'+tag.color}}, tag.text)
                                    ])); }),
                                m('.dropdown-divider'),
                                m('a.dropdown-item', { href: "/tags", config: m.route }, 'Manage tags')
                            ]})
                        ]),

                        m('.input-group.pull-right.m-r-1', [
                            m('select.c-select.form-control', {onchange: function (e) { return permissionChoice(e.target.value); }}, [
                                m('option', {value:'all'}, 'Show all my studies'),
                                m('option', {value:'owner'}, 'Show only studies I created'),
                                m('option', {value:'collaboration'}, 'Show only studies shared with me'),
                                m('option', {value:'public'}, 'Show public studies')
                            ])
                        ])
                    ])
                ]),

                m('.card.studies-card', [
                    m('.card-block', [
                        m('.row', {key: '@@notid@@'}, [
                            m('.col-sm-6', [
                                m('.form-control-static',{onclick:sort_studies_by_name, style:'cursor:pointer'},[
                                    m('strong', 'Study Name '),
                                    m('i.fa.fa-sort', {style: {color: order_by_name ? 'black' : 'grey'}})
                                ])
                            ]),
                            m('.col-sm-2', [
                                m('.form-control-static',{onclick:sort_studies_by_date, style:'cursor:pointer'},[
                                    m('strong', ' Last Changed '),
                                    m('i.fa.fa-sort', {style: {color: !order_by_name ? 'black' : 'grey'}})
                                ])
                            ]),
                            m('.col-sm-4', [
                                m('input.form-control', {placeholder: 'Search ...', value: globalSearch(), oninput: m.withAttr('value', globalSearch)})
                            ])
                        ]),

                        studies()
                            .filter(typeFilter(type()))
                            .filter(tagFilter(tags().filter(uesedFilter()).map(function (tag){ return tag.text; })))
                            .filter(permissionFilter(permissionChoice()))
                            .filter(searchFilter(globalSearch()))
                            .map(function (study) { return m('a', {href: m.route() != '/studies' ? ("/translate/" + (study.id)) : ("/editor/" + (study.id)),config:routeConfig, key: study.id}, [
                                m('.row.study-row', [
                                    m('.col-sm-3', [
                                        m('.study-text', [
                                            m('i.fa.fa-fw.owner-icon', {
                                                class: classNames({
                                                    'fa-lock': study.is_locked,
                                                    'fa-globe': study.is_public,
                                                    'fa-flag': study.is_template,
                                                    'fa-users': !study.is_public && study.permission !== 'owner'
                                                }),
                                                title: classNames({
                                                    'Public' : study.is_public,
                                                    'Collaboration' : !study.is_public && study.permission !== 'owner'
                                                })
                                            }),
                                            study.name
                                        ])
                                    ]),
                                    m('.col-sm-3', [
                                        study.tags.map(function (tag){ return m('span.study-tag',  {style: {'background-color': '#' + tag.color}}, tag.text); })
                                    ]),
                                    m('.col-sm-3', [
                                        m('.study-text', formatDate(new Date(study.last_modified)))
                                    ]),
                                    m('.col-sm-1', [
                                        m('.btn-toolbar.pull-right', [
                                            m('.btn-group.btn-group-sm', [
                                                study.is_template || study.permission =='read only' || study.is_public ?  '' : dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-toggle', toggleContent: 'Actions', elements: [
                                                    m('a.dropdown-item.dropdown-onclick', {onmousedown: do_tags({study_id: study.id, tags: tags, callback: loadStudies, loadTags:loadTags})}, [
                                                        m('i.fa.fa-fw.fa-tags'), ' Tags'
                                                    ]),

                                                    study.permission === 'read only' ? '' : [
                                                        study.is_locked ? '' : m('a.dropdown-item.dropdown-onclick', {onmousedown: do_delete(study.id, loadStudies)}, [
                                                            m('i.fa.fa-fw.fa-remove'), ' Delete Study'
                                                        ]),
                                                        study.is_locked ? '' : m('a.dropdown-item.dropdown-onclick', {onmousedown: do_rename(study.id, study.name, loadStudies)}, [
                                                            m('i.fa.fa-fw.fa-exchange'), ' Rename Study'
                                                        ]),
                                                        m('a.dropdown-item.dropdown-onclick', {onmousedown: do_duplicate(study.id, study.name, study.type)}, [
                                                            m('i.fa.fa-fw.fa-clone'), ' Duplicate study'
                                                        ]),
                                                        m('a.dropdown-item.dropdown-onclick', {onmousedown: do_lock(study)}, [
                                                            m('i.fa.fa-fw', {class: study.is_locked ? 'fa-unlock' : 'fa-lock'}), study.is_locked  ? ' Unlock Study' :' Lock Study'
                                                        ])
                                                    ],

                                                    study.is_locked ? '' : m('a.dropdown-item', { href: ("/deploy/" + (study.id)), config: m.route }, 'Request Deploy'),
                                                    study.is_locked ? '' : m('a.dropdown-item', { href: ("/studyChangeRequest/" + (study.id)), config: m.route }, 'Request Change'),
                                                    study.is_locked ? '' : m('a.dropdown-item', { href: ("/studyRemoval/" + (study.id)), config: m.route }, 'Request Removal'),
                                                    m('a.dropdown-item', { href: ("/sharing/" + (study.id)), config: m.route }, [m('i.fa.fa-fw.fa-user-plus'), ' Sharing'])
                                                ]})
                                            ])
                                        ])
                                    ])
                                ])
                            ]); })
                    ])
                ])
            ]);
        }
    };


    var typeFilter = function (type) { return function (study) {
        return study.study_type === type;
    }; };

    var permissionFilter = function (permission) { return function (study) {
        if(permission === 'all') return !study.is_public;
        if(permission === 'public') return study.is_public;
        if(permission === 'collaboration') return study.permission !== 'owner' && !study.is_public;
        if(permission === 'template') return study.is_template;
        return study.permission === permission;
    }; };

    var tagFilter = function (tags) { return function (study) {
        if (tags.length==0)
            return true;
        return study.tags.map(function (tag){ return tag.text; }).some(function (tag) { return tags.indexOf(tag) != -1; });
    }; };

    var uesedFilter = function () { return function (tag) {
        return tag.used;
    }; };


    var searchFilter = function (searchTerm) { return function (study) { return !study.name || study.name.match(new RegExp(searchTerm, 'i')); }; };

    function routeConfig(el, isInit, ctx, vdom) {

        el.href = location.pathname + '?' + vdom.attrs.href;

        if (!isInit) el.addEventListener('click', route);

        function route(e){
            var el = e.currentTarget;

            if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return;
            if (e.defaultPrevented) return;

            e.preventDefault();
            if (e.target.tagName === 'A' && e.target !== el) return;

            m.route(el.search.slice(1));
        }
    }

    var deploy_url$1 = baseUrl + "/deploy_list";

    function get_study_list(){
        return fetchJson(deploy_url$1);
    }

    var thConfig$2 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    var deployComponent$1 = {
        controller: function controller(){
            var ctrl = {
                list: m.prop(''),
                sortBy: m.prop('CREATION_DATE')
            };
            get_study_list()
                .then(function (response) {ctrl.list(response.requests);
                })
                .catch(function (error) {
                    throw error;
                })
                .then(m.redraw);
            return {ctrl: ctrl};
        },
        view: function view(ref){
            var ctrl = ref.ctrl;

            var list = ctrl.list;
            return ctrl.list().length === 0
            ?
            m('.loader')
            :
            m('table', {class:'table table-nowrap table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                m('thead', [
                    m('tr', [
                        m('th', thConfig$2('CREATION_DATE',ctrl.sortBy), 'Creation date'),
                        m('th', thConfig$2('FOLDER_LOCATION',ctrl.sortBy), 'Folder location'),
                        m('th', thConfig$2('RULE_FILE',ctrl.sortBy), 'Rule file'),
                        m('th', thConfig$2('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                        m('th', thConfig$2('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                        m('th', thConfig$2('TARGET_NUMBER',ctrl.sortBy), 'Target number'),
                        m('th', thConfig$2('APPROVED_BY_A_REVIEWER',ctrl.sortBy), 'Approved by a reviewer'),
                        m('th', thConfig$2('EXPERIMENT_FILE',ctrl.sortBy), 'Experiment file'),
                        m('th', thConfig$2('LAUNCH_CONFIRMATION',ctrl.sortBy), 'Launch confirmation'),
                        m('th', thConfig$2('COMMENTS',ctrl.sortBy), 'Comments')
                    ])
                ]),
                m('tbody', [
                    ctrl.list().map(function (study) { return m('tr', [
                        m('td', study.CREATION_DATE),
                        m('td', m('a', {href:study.FOLDER_LOCATION}, study.FOLDER_LOCATION)),
                        m('td', study.RULE_FILE),
                        m('td', m('a', {href:'mailto:' + study.RESEARCHER_EMAIL}, study.RESEARCHER_EMAIL)),
                        m('td', study.RESEARCHER_NAME),
                        m('td', study.TARGET_NUMBER),
                        m('td', study.APPROVED_BY_A_REVIEWER),
                        m('td', study.EXPERIMENT_FILE),
                        m('td', study.LAUNCH_CONFIRMATION),
                        m('td', study.COMMENTS)
                    ]); })
                ])
            ]);
        }
    };

    var change_request_url = baseUrl + "/change_request_list";


    function get_change_request_list(){
        return fetchJson(change_request_url);
    }

    var thConfig$1 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };
    var changeRequestListComponent = {
        controller: function controller(){

            var ctrl = {
                list: m.prop(''),
                sortBy: m.prop('CREATION_DATE')
            };
            get_change_request_list()
              .then(function (response) {ctrl.list(response.requests);
                  sortTable(ctrl.list, ctrl.sortBy);
              })
                .catch(function (error) {
                    throw error;
                })
                .then(m.redraw);
            return {ctrl: ctrl};
        },

        view: function view(ref){
            var ctrl = ref.ctrl;

            var list = ctrl.list;


            return ctrl.list().length === 0
                ?
                m('.loader')
                :
                m('table', {class:'table table-nowrap table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                    m('thead', [
                        m('tr', [
                            m('th', thConfig$1('CREATION_DATE',ctrl.sortBy), 'Creation date'),
                            m('th', thConfig$1('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                            m('th', thConfig$1('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                            m('th', thConfig$1('FILE_NAMES',ctrl.sortBy), 'File names'),
                            m('th', thConfig$1('TARGET_SESSIONS',ctrl.sortBy), 'Target sessions'),
                            m('th', thConfig$1('STUDY_SHOWFILES_LINK',ctrl.sortBy), 'Study showfiles link'),
                            m('th', thConfig$1('STATUS',ctrl.sortBy), 'Status'),
                            m('th', thConfig$1('COMMENTS',ctrl.sortBy), 'Comments')
                        ])
                    ]),
                    m('tbody', [
                        ctrl.list().map(function (study) { return m('tr', [
                            m('td', study.CREATION_DATE),
                            m('td', m('a', {href:'mailto:' + study.RESEARCHER_EMAIL}, study.RESEARCHER_EMAIL)),
                            m('td', study.RESEARCHER_NAME),
                            m('td', study.FILE_NAMES),
                            m('td', study.TARGET_SESSIONS),
                            m('td', m('a', {href:study.STUDY_SHOWFILES_LINK}, study.STUDY_SHOWFILES_LINK)),
                            m('td', study.STATUS),
                            m('td', study.COMMENTS)
                        ]); })
                    ])
                ]);
        }
    };

    var removal_url = baseUrl + "/removal_list";

    function get_removal_list(){
        return fetchJson(removal_url);
    }

    var thConfig = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    var removalListComponent = {
        controller: function controller(){
            var ctrl = {
                list: m.prop(''),
                sortBy: m.prop('CREATION_DATE')
            };
            get_removal_list()
              .then(function (response) {ctrl.list(response.requests);
                  sortTable(ctrl.list, ctrl.sortBy);
              })
                .catch(function (error) {
                    throw error;
                })
                .then(m.redraw);
            return {ctrl: ctrl};
        },
        view: function view(ref){
            var ctrl = ref.ctrl;

            var list = ctrl.list;

            return ctrl.list().length === 0
                ?
                m('.loader')
                :
            m('table', {class:'table table-nowrap table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                m('thead', [
                    m('tr', [
                        m('th', thConfig('CREATION_DATE',ctrl.sortBy), 'Creation date'),
                        m('th', thConfig('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                        m('th', thConfig('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                        m('th', thConfig('STUDY_NAME',ctrl.sortBy), 'Study name'),
                        m('th', thConfig('COMPLETED_N',ctrl.sortBy), 'Completed n'),
                        m('th', thConfig('COMMENTS',ctrl.sortBy), 'Comments')
                    ])
                ]),
                m('tbody', [
                    ctrl.list().map(function (study) { return m('tr', [
                        m('td', study.CREATION_DATE),
                        m('td', m('a', {href:'mailto:' + study.RESEARCHER_EMAIL}, study.RESEARCHER_EMAIL)),
                        m('td', study.RESEARCHER_NAME),
                        m('td', study.STUDY_NAME),
                        m('td', study.COMPLETED_N),
                        m('td', study.COMMENTS)
                    ]); })
                ])
            ]);
        }
    };

    function deploy_url(study_id)
    {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/deploy");
    }

    var get_study_prop = function (study_id) { return fetchJson(deploy_url(study_id), {
        method: 'get'
    }); };

    var study_removal = function (study_id, ctrl) { return fetchJson(deploy_url(study_id), {
        method: 'delete',
        body: {study_name: ctrl.study_name, completed_n: ctrl.completed_n, comments: ctrl.comments}
    }); };

    var deploy = function (study_id, ctrl) { return fetchJson(deploy_url(study_id), {
        method: 'post',
        body: {target_number: ctrl.target_number, approved_by_a_reviewer: ctrl.approved_by_a_reviewer, experiment_file: ctrl.experiment_file, launch_confirmation: ctrl.launch_confirmation, comments: ctrl.comments, rulesValue: ctrl.rulesValue}
    }); };

    var Study_change_request = function (study_id, ctrl) { return fetchJson(deploy_url(study_id), {
        method: 'put',
        body: {file_names: ctrl.file_names, target_sessions: ctrl.target_sessions, status: ctrl.status, comments: ctrl.comments}
    }); };

    function rulesEditor (args) { return m.component(rulesComponent, args); }
    var rulesComponent = {
        controller: function controller(ref){
            var visual = ref.visual;
            var value = ref.value;
            var comments = ref.comments;
            var exist_rule_file = ref.exist_rule_file;

            return {visual: visual, value: value, edit: edit, remove: remove, addcomments: addcomments, exist_rule_file: exist_rule_file};

            function edit(){
                window.open('../ruletable.html');
            }

            function remove(){
                visual('None');
                value('parent'); // this value is defined by the rule generator
            }

            function addcomments(){
                messages.prompt({
                    prop: comments,
                    header: 'Edit rule comments'
                });
            }
        },
        view: function (ref) {
            var visual = ref.visual;
            var value = ref.value;
            var edit = ref.edit;
            var remove = ref.remove;
            var exist_rule_file = ref.exist_rule_file;

            return m('div', [
                !exist_rule_file() ? '' : m('.small.text-muted', [
                    'You already have a rule file by the name of "',
                    exist_rule_file(),
                    '", it will be overwritten if you create a new one.'
                ]),
                m('.btn-group', [
                    m('.btn.btn-secondary.btn-sm', {onclick: edit},  [
                        m('i.fa.fa-edit'), ' Rule editor'
                    ]),
                    m('.btn.btn-secondary.btn-sm', {onclick: remove},  [
                        m('i.fa.fa-remove'), ' Clear rules'
                    ])
                ]),
                m('#ruleGenerator.card', {config: getInputs(visual, value)}, [
                    m('.card-block', visual())
                ])
            ]);
        }
    };

    var getInputs = function (visual, value) { return function (element, isInit) {
        if (isInit) return true;
        element.ruleGeneratorVisual = visual;
        element.ruleGeneratorValue = value;
    }; };

    var ASTERIX$2 = m('span.text-danger', '*');

    var deployComponent = {
        controller: function controller(){
            var studyId = m.route.param('studyId');
            var form = formFactory();
            var ctrl = {
                sent:false,
                error: m.prop(''),
                folder_location: m.prop(''),
                researcher_email: m.prop(''),
                researcher_name: m.prop(''),
                target_number: m.prop(''),
                
                rulesValue: m.prop('parent'), // this value is defined by the rule generator
                rulesVisual: m.prop('None'),
                rulesComments: m.prop(''),
                rule_file: m.prop(''),
                exist_rule_file: m.prop(''),

                approved_by_a_reviewer: m.prop(''),
                zero_unnecessary_files: m.prop(''),

                // unnecessary
                completed_checklist: m.prop(''),
                approved_by_irb: m.prop(''),
                valid_study_name: m.prop(''),
    			m_version: m.prop(''),
    			e_version: m.prop(''),
                realstart: m.prop(''),

                experiment_file: m.prop(''),
                experiment_files: m.prop(''),
                launch_confirmation: m.prop(''),
                comments: m.prop('')   
                
            };

            get_study_prop(studyId)
                .then(function (response) {
                    ctrl.exist_rule_file(response.have_rule_file ? response.study_name+'.rules.xml' : '');
                    ctrl.study_name = response.study_name;
                    ctrl.researcher_name(response.researcher_name);
                    ctrl.researcher_email(response.researcher_email);
                    ctrl.folder_location(response.folder);
                    ctrl.experiment_files(response.experiment_file.reduce(function (obj, row) {obj[row.file_name] = row.file_name;
                        return obj;
                    }, {}));
                })
                .catch(function (response) {
                    ctrl.error(response.message);
                })
                .then(m.redraw);
        
            return {ctrl: ctrl, form: form, submit: submit, studyId: studyId};
            function submit(){
                form.showValidation(true);
                if (!form.isValid())
                {
                    ctrl.error('Missing parameters');
                    return;
                }

                deploy(studyId, ctrl)
                .then(function (response) {
                    ctrl.rule_file(response.rule_file);
                    ctrl.sent = true;
                })
                .catch(function (response) {
                    ctrl.error(response.message);
                })
                .then(m.redraw);
            }
        },
        view: function view(ref){
            var form = ref.form;
            var ctrl = ref.ctrl;
            var submit = ref.submit;

            if (ctrl.sent) return m('.deploy.centrify',[
                m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                m('h5', ['The Deploy form was sent successfully ', m('a', {href:'/deployList', config: m.route}, 'View Deploy Requests')]),
                ctrl.rule_file() !='' ? m('h5', ['Rule File: ', m('a', {href: ("/editor/" + (m.route.param('studyId')) + "/file/" + (ctrl.rule_file()) + ".xml"), config: m.route}, ctrl.rule_file())]) : ''
            ]);
            
            return m('.deploy.container', [
                m('h3', [
                    'Request Deploy ',
                    m('small', ctrl.study_name)
                ]),

                m('.row', [
                    m('.col-sm-3', m('strong', 'Researcher Name: ')),
                    m('.col-sm-9', ctrl.researcher_name())
                ]),
                m('.row', [
                    m('.col-sm-3', m('strong', 'Researcher Email Address: ')),
                    m('.col-sm-9', ctrl.researcher_email())
                ]),
                m('.row.m-b-1', [
                    m('.col-sm-3', m('strong', 'Study Folder Location: ')),
                    m('.col-sm-9', ctrl.folder_location())
                ]),

                radioInput({
                    label:m('span', ['Name of Experiment File', ASTERIX$2]),
                    prop: ctrl.experiment_file,
                    values:ctrl.experiment_files(),
                    form: form, required:true, isStack:true
                }),

                textInput({help: 'For private studies (not in the Project Implicit research pool), enter n/a', label:['Target Number of Completed Study Sessions', ASTERIX$2],  placeholder: 'Target Number of Completed Study Sessions', prop: ctrl.target_number, form: form, required:true, isStack:true}),

                m('.font-weight-bold', 'Participant Restrictions'),
                rulesEditor({value:ctrl.rulesValue, visual: ctrl.rulesVisual, comments: ctrl.rulesComments, exist_rule_file: ctrl.exist_rule_file}),

                m('.font-weight-bold', 'Study is ready for deploy: ', ASTERIX$2),
                m('.m-b-1', [
                    checkbox({description: 'The study\'s study-id starts with my user name', prop: ctrl.valid_study_name, form: form, required:true, isStack:true}),
    				checkbox({description: 'The expt.xml file refers to "1.0.jsp" & Minno-Time tasks refer to "type: time"', prop: ctrl.m_version, form: form, required:true, isStack:true}),
    				checkbox({description: ['I am using the latest versions of the implicit measure extensions at this page ',m('a', {href:'https://github.com/baranan/minno-tasks/blob/master/implicitmeasures.md', target:'_blank'}, 'this page')], prop: ctrl.e_version, form: form, required:true, isStack:true}),
                    checkbox({
                        description:  'This study has been approved by the appropriate IRB ', 
                        prop: ctrl.approved_by_irb,
                        required:true,
                        form: form, isStack:true
                    }),
                    checkbox({
                        description:  [
                            'I have completed all items on "Study Testing" and "Study Approval" from the ',  
                            m('a', {href:'https://docs.google.com/document/d/1pglAQELqNLWbV1yscE2IVd7G5xVgZ8b4lkT8PYeumu8/edit#heading=h.e07cxg4g4wcx', target:'_blank'}, 'Study Development Guide')
                        ],
                        prop: ctrl.completed_checklist,
                        form: form, isStack:true,
                        required:true
                    }),
                    checkbox({
                        description: 'My study folder includes ZERO files that aren\'t necessary for the study (e.g., word documents, older versions of files, items that were dropped from the final version)',
                        prop: ctrl.zero_unnecessary_files,
                        required:true,
                        form: form, isStack:true
                    }),
                    checkbox({description: 'I used a realstart and lastpage tasks', prop: ctrl.realstart, form: form, required:true, isStack:true})
                ]),
                radioInput({
                    label:['Study has been approved by a *User Experience* Reviewer: ', ASTERIX$2],
                    prop: ctrl.approved_by_a_reviewer,
                    values: {
                        'No, this study is not for the Project Implicit pool.' : 'No, this study is not for the Project Implicit pool.',
                        'Yes' : 'Yes'
                    },
                    form: form, required:true, isStack:true
                }),

                radioInput({
                    label: ['If you are building this study for another researcher (e.g. a contract study), has the researcher received the standard final launch confirmation email and confirmed that the study is ready to be launched? ', ASTERIX$2],
                    prop: ctrl.launch_confirmation,
                    values: {
                        'No,this study is mine': 'No,this study is mine',
                        'Yes' : 'Yes'
                    },
                    form: form, required:true, isStack:true
                }),

                textInput({isArea: true, label: m('span', 'Additional comments'),  placeholder: 'Additional comments', prop: ctrl.comments, form: form, isStack:true}),
                !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                m('button.btn.btn-primary', {onclick: submit}, 'Request Deploy')
            ]);
        }
    };

    var checkbox = function (args) { return m.component({
        controller: function controller(ref){
            var prop = ref.prop;
            var form = ref.form;
            var required = ref.required;

            var validity = function () { return !required || prop(); };
            if (!form) throw new Error('Form not defined');
            form.register(validity);

            return {validity: validity, showValidation: form.showValidation};
        },
        view: function (ctrl, ref) {
            var prop = ref.prop;
            var description = ref.description; if ( description === void 0 ) description = '';
            var help = ref.help;
            var required = ref.required;
            var form = ref.form;

            return m('.checkmarked', 
            { onclick: function (){ return prop(!prop()); } },
            [
                m('i.fa.fa-fw', {
                    class: classNames({
                        'fa-square-o' : !prop(),
                        'fa-check-square-o' : prop(),
                        'text-success' : required && form.showValidation() && prop(),
                        'text-danger' : required && form.showValidation() && !prop()
                    })
                }),
                m.trust('&nbsp;'),
                description,
                !help ? '' : m('small.text-muted', help)
            ]);
        }
    }, args); };

    var ASTERIX$1 = m('span.text-danger', '*');

    var StudyRemovalComponent = {
        controller: function controller(){
            var studyId = m.route.param('studyId');
            var form = formFactory();
            var ctrl = {
                sent:false,
                researcher_name: m.prop(''),
                researcher_email: m.prop(''),
                global_study_name: m.prop(''),
                study_name: m.prop(''),
                study_names: m.prop(''),
                completed_n: m.prop(''),
                comments: m.prop(''),
                error: m.prop('')
            };

            get_study_prop(studyId)
                .then(function (response) {
                    ctrl.researcher_name(response.researcher_name);
                    ctrl.researcher_email(response.researcher_email);
                    ctrl.global_study_name(response.study_name);
                    ctrl.study_names(response.experiment_file.reduce(function (obj, row) {
                        obj[row.file_id] = row.file_id;
                        return obj;
                    }, {}));
                })
                .catch(function (response) {
                    ctrl.error(response.message);
                })
                .then(m.redraw);

            function submit(){
                form.showValidation(true);
                if (!form.isValid())
                {
                    ctrl.error('Missing parameters');
                    return;
                }
                study_removal(studyId, ctrl)
                    .then(function () {
                        ctrl.sent = true;
                    })
                    .catch(function (response) {
                        ctrl.error(response.message);
                    })
                    .then(m.redraw);
            }
            return {ctrl: ctrl, form: form, submit: submit};
        },
        view: function view(ref){
            var form = ref.form;
            var ctrl = ref.ctrl;
            var submit = ref.submit;

            return ctrl.sent
            ?
            m('.deploy.centrify',[
                m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                m('h5', ['The removal form was sent successfully ', m('a', {href:'/removalList', config: m.route}, 'View removal requests')])
            ])
            :
            m('.StudyRemoval.container', [
                m('h3', [
                    'Study Removal Request ',
                    m('small', ctrl.global_study_name())
                ]),

                m('.row', [
                    m('.col-sm-3', m('strong', 'Researcher Name: ')),
                    m('.col-sm-9', ctrl.researcher_name())
                ]),
                m('.row.m-b-1', [
                    m('.col-sm-3', m('strong', 'Researcher Email Address: ')),
                    m('.col-sm-9', ctrl.researcher_email())
                ]),

                radioInput({
                    label:m('span', ['Study name', ASTERIX$1]), 
                    prop: ctrl.study_name,
                    values:ctrl.study_names(),
                    help: 'This is the name you submitted to the RDE (e.g., colinsmith.elmcogload) ',
                    form: form, required:true, isStack:true
                }),
                textInput({label: m('span', ['Please enter your completed n below ', m('span.text-danger', ' *')]), help: m('span', ['you can use the following link: ', m('a', {href:'https://app-prod-03.implicit.harvard.edu/implicit/research/pitracker/PITracking.html#3'}, 'https://app-prod-03.implicit.harvard.edu/implicit/research/pitracker/PITracking.html#3')]),  placeholder: 'completed n', prop: ctrl.completed_n, form: form, required:true, isStack:true}),
                textInput({isArea: true, label: m('span', 'Additional comments'), help: '(e.g., anything unusual about the data collection, consistent participant comments, etc.)',  placeholder: 'Additional comments', prop: ctrl.comments, form: form, isStack:true}),
                !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                m('button.btn.btn-primary', {onclick: submit}, 'Submit')
            ]);
        }
    };

    var ASTERIX = m('span.text-danger', '*');

    var studyChangeRequestComponent = {
        controller: function controller(){
            var studyId = m.route.param('studyId');
            var form = formFactory();
            var ctrl = {
                sent:false,
                user_name: m.prop(''),
                researcher_name: m.prop(''),
                researcher_email: m.prop(''),
                study_name: m.prop(''),
                target_sessions: m.prop(''),
                status: m.prop(''),
                file_names: m.prop(''),
                comments: m.prop(''),
                error: m.prop('')
            };
            get_study_prop(studyId)
                .then(function (response) {
                    ctrl.researcher_name(response.researcher_name);
                    ctrl.researcher_email(response.researcher_email);
                    ctrl.user_name(response.user_name);
                    ctrl.study_name(response.study_name);
                })
                .catch(function (response) {
                    ctrl.error(response.message);
                })
                .then(m.redraw);

            function submit(){
                form.showValidation(true);
                if (!form.isValid())
                {
                    ctrl.error('Missing parameters');
                    return;
                }
                Study_change_request(studyId, ctrl)
                    .then(function () {
                        ctrl.sent = true;
                    })
                    .catch(function (response) {
                        ctrl.error(response.message);
                    }).then(m.redraw);
            }
            return {ctrl: ctrl, form: form, submit: submit, studyId: studyId};
        },
        view: function view(ref){
            var form = ref.form;
            var ctrl = ref.ctrl;
            var submit = ref.submit;

            var study_showfiles_link = document.location.origin + '/implicit/showfiles.jsp?user=' + ctrl.user_name() + '&study=' + ctrl.study_name();

            if (ctrl.sent) return m('.deploy.centrify',[
                m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                m('h5', ['The change request form was sent successfully ', m('a', {href:'/changeRequestList', config: m.route}, 'View change request  requests')])
            ]);
                
            return m('.StudyChangeRequest.container', [
                m('h3', [
                    'Study Change Request ',
                    m('small', ctrl.study_name())
                ]),

                m('.row', [
                    m('.col-sm-3', m('strong', 'Researcher Name: ')),
                    m('.col-sm-9', ctrl.researcher_name())
                ]),
                m('.row', [
                    m('.col-sm-3', m('strong', 'Researcher Email Address: ')),
                    m('.col-sm-9', ctrl.researcher_email())
                ]),
                m('.row.m-b-1', [
                    m('.col-sm-3', m('strong', 'Study showfiles link: ')),
                    m('.col-sm-9', m('a', {href:study_showfiles_link, target: '_blank'}, study_showfiles_link))
                ]),


                textInput({label: m('span', ['Target number of additional sessions (In addition to the sessions completed so far)', m('span.text-danger', ' *')]),  placeholder: 'Target number of additional sessions', prop: ctrl.target_sessions, form: form, required:true, isStack:true}),

                radioInput({
                    label: m('span', ['What\'s the current status of your study?', ASTERIX]),
                    prop: ctrl.status,
                    values: {
                        'Currently collecting data and does not need to be unpaused': 'Currently collecting data and does not need to be unpaused',
                        'Manually paused and needs to be unpaused' : 'Manually paused and needs to be unpaused',
                        'Auto-paused due to low completion rates or meeting target N.' : 'Auto-paused due to low completion rates or meeting target N.'
                    },
                    form: form, required:true, isStack:true
                }),
                textInput({isArea: true, label: m('span', ['Change Request', m('span.text-danger', ' *')]), help: 'List all file names involved in the change request. Specify for each file whether file is being updated or added to production.)',  placeholder: 'Change Request', prop: ctrl.file_names, form: form, required:true, isStack:true}),
                textInput({isArea: true, label: m('span', 'Additional comments'),  placeholder: 'Additional comments', prop: ctrl.comments, form: form, isStack:true}),
                !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                m('button.btn.btn-primary', {onclick: submit}, 'Submit')
            ]);
        }
    };

    var add_userUrl = baseUrl + "/add_user";

    var add = function (username, first_name , last_name, email, iscu) { return fetchJson(add_userUrl, {
        method: 'post',
        body: {username: username, first_name: first_name , last_name: last_name, email: email, iscu: iscu}
    }); };

    var addComponent = {
        controller: function controller(){
            var username = m.prop('');
            var first_name = m.prop('');
            var last_name = m.prop('');
            var email = m.prop('');
            var iscu = m.prop(false);
            var ctrl = {
                username: username,
                first_name: first_name,
                last_name: last_name,
                email: email,
                iscu: iscu,
                error: m.prop(''),
                added:false,
                add: addAction
            };
            return ctrl;

            function addAction(){
                add(username, first_name , last_name, email, iscu)
                    .then(function () {
                        ctrl.added = true;
                        m.redraw();
                    })
                    .catch(function (response) {
                        ctrl.error(response.message);
                        m.redraw();
                    });
            }
        },
        view: function view(ctrl){
            return m('.add.centrify', {config:fullHeight},[
                ctrl.added
                    ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', [ctrl.username(), ' successfully added (email sent)!'])
                    ]
                    :
                    m('.card.card-inverse.col-md-4', [
                        m('.card-block',[
                            m('h4', 'Please fill the following details'),
                            m('form', {onsubmit:ctrl.add}, [
                                m('fieldset.form-group',
                                    m('input.form-control', {
                                        type:'username',
                                        placeholder: 'User name',
                                        value: ctrl.username(),
                                        oninput: m.withAttr('value', ctrl.username),
                                        onchange: m.withAttr('value', ctrl.username),
                                        config: getStartValue$4(ctrl.username)
                                    }
                                )),
                                m('fieldset.form-group',
                                    m('input.form-control', {
                                        type:'first_name',
                                        placeholder: 'first name',
                                        value: ctrl.first_name(),
                                        oninput: m.withAttr('value', ctrl.first_name),
                                        onchange: m.withAttr('value', ctrl.first_name),
                                        config: getStartValue$4(ctrl.first_name)
                                    }
                                )),
                                m('fieldset.form-group',
                                        m('input.form-control', {
                                            type:'last_name',
                                            placeholder: 'last name',
                                            value: ctrl.last_name(),
                                            oninput: m.withAttr('value', ctrl.last_name),
                                            onchange: m.withAttr('value', ctrl.last_name),
                                            config: getStartValue$4(ctrl.last_name)
                                        }
                                )),
                                m('fieldset.form-group',
                                    m('input.form-control', {
                                        type:'email',
                                        placeholder: 'email',
                                        value: ctrl.email(),
                                        oninput: m.withAttr('value', ctrl.email),
                                        onchange: m.withAttr('value', ctrl.email),
                                        config: getStartValue$4(ctrl.email)
                                    }
                                )),
                                m('fieldset.form-group',

                                    m('label.c-input.c-checkbox', [
                                        m('input.form-control', {
                                            type: 'checkbox',
                                            onclick: m.withAttr('checked', ctrl.iscu)}),
                                        m('span.c-indicator'),
                                        m.trust('&nbsp;'),
                                        m('span', 'contract user')
                                    ])
                                )
                            ]),

                            !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                            m('button.btn.btn-primary.btn-block', {onclick: ctrl.add},'Add')
                        ])
                    ])
            ]);
        }
    };

    function getStartValue$4(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    var change_password_url = baseUrl + "/change_password";
    var change_email_url = baseUrl + "/change_email";
    var present_templates_url = baseUrl + "/present_templates";
    var dropbox_url = baseUrl + "/dropbox";

    function apiURL$2(code)
    {   
        return (change_password_url + "/" + (encodeURIComponent(code)));
    }

    var is_recovery_code = function (code) { return fetchJson(apiURL$2(code), {
        method: 'get'
    }); };

    var set_password$1 = function (code, password, confirm) { return fetchJson(apiURL$2(code), {
        method: 'post',
        body: {password: password, confirm: confirm}
    }); };

    var set_email = function (email) { return fetchJson(change_email_url, {
        method: 'post',
        body: {email: email}
    }); };

    var get_email = function () { return fetchJson(change_email_url, {
        method: 'get'
    }); };


    var check_if_present_templates = function () { return fetchJson(present_templates_url, {
        method: 'get'
    }); };

    var set_present_templates = function (value) {
        if (value)
            return do_present_templates();
        return do_hide_templates();
    };



    var do_present_templates = function () { return fetchJson(present_templates_url, {
        method: 'post'
    }); };

    var do_hide_templates = function () { return fetchJson(present_templates_url, {
        method: 'delete'
    }); };

    var check_if_dbx_synchronized = function () { return fetchJson(dropbox_url, {
        method: 'get'
    }); };

    var stop_dbx_synchronized = function () { return fetchJson(dropbox_url, {
        method: 'delete'
    }); };

    var password_body = function (ctrl) { return m('.card.card-inverse.col-md-4', [
        m('.card-block',[
            m('h4', 'Enter New Password'),
            m('form', [
                m('input.form-control', {
                    type:'password',
                    placeholder: 'Password',
                    value: ctrl.password(),
                    oninput: m.withAttr('value', ctrl.password),
                    onchange: m.withAttr('value', ctrl.password),
                    config: getStartValue$3(ctrl.password)
                }),

                m('input.form-control', {
                    type:'password',
                    placeholder: 'Confirm password',
                    value: ctrl.confirm(),
                    oninput: m.withAttr('value', ctrl.confirm),
                    onchange: m.withAttr('value', ctrl.confirm),
                    config: getStartValue$3(ctrl.confirm)
                })
            ]),
            !ctrl.password_error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.password_error()),
            m('button.btn.btn-primary.btn-block', {onclick: ctrl.do_set_password},'Update')
        ])
    ]); };

    function getStartValue$3(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    var emil_body = function (ctrl) { return m('.card.card-inverse.col-md-4', [
        m('.card-block',[
            m('h4', 'Enter New Email Address'),
            m('form', [
                m('input.form-control', {
                    type:'email',
                    placeholder: 'New Email Address',
                    value: ctrl.email(),
                    oninput: m.withAttr('value', ctrl.email),
                    onchange: m.withAttr('value', ctrl.email),
                    config: getStartValue$2(ctrl.email)
                })
            ])
            ,
            !ctrl.email_error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.email_error()),
            m('button.btn.btn-primary.btn-block', {onclick: ctrl.do_set_email},'Update')

        ])

    ]); };

    function getStartValue$2(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    function start_dbx_sync(ctrl){
        var error = m.prop('');
        // ctrl.dbx_auth_link()
        messages.confirm({okText: 'Continue', cancelText: 'Cancel', header:'Synchronization with Dropbox', content:m('p', [
            m('p','This feature creates a backup for all your studies by copying all your study files to your Dropbox account. Every time you change a file here, on the Dashboard, it will send that update to your Dropbox account. Using the Dropbox website, you will be able to see previous versions of all the files you changed.'),
            m('ul',
                [
                    m('li', 'Dropbox will create a folder under Apps/minno.js/username and will copy all your studies under that folder.'),
                    m('li', 'We will not have access to any of your files on other folders.'),
                    m('li', [m('span' ,'This feature is only for backup. If you edit or delete your study files on your computer\'s file-system, these edits will not be synchronized with the study files on this website. '), m('strong', 'Updates work only in one direction: from this website to your Dropbox, not from your Dropbox to this website.')]),
                    m('li', 'If you want to see an older version of any of your study files, you can go to Dropbox and request to see previous versions of the file. If you want to restore an older version of a file, you will need to copy and paste its text to the Dashboard\'s editor on this website, or to download the old file to your computer and upload it to this website.')
                ]
            ),
            !error() ? '' : m('p.alert.alert-danger', error())])
        })
        .then(function (response) {
            if (response)
                window.location = ctrl.dbx_auth_link();
        });

    }

    function stop_dbx_sync(ctrl){
        stop_dbx_synchronized()
            .then(m.route('/settings'))
            .catch(function (response) {
                ctrl.synchronization_error(response.message);
            });
    }

    var dropbox_body = function (ctrl) { return m('.card.card-inverse.col-md-4', [
        m('.card-block',[
            !ctrl.is_dbx_synchronized()?
                m('button.btn.btn-primary.btn-block', {onclick: function(){start_dbx_sync(ctrl);}},[
                    m('i.fa.fa-fw.fa-dropbox'), ' Synchronize with your Dropbox account'
                ])
            :
            m('button.btn.btn-primary.btn-block', {onclick: function(){start_dbx_sync(ctrl);}}, {onclick: function(){stop_dbx_sync(ctrl);}},[

                m('i.fa.fa-fw.fa-dropbox'), ' Stop Synchronize with your Dropbox account'
            ])
        ])
    ]); };

    var templates_body = function (ctrl) { return m('.card.card-inverse.col-md-4', [
        m('.card-block',[
            !ctrl.present_templates()
            ?
            m('a', {onclick: function(){ctrl.do_set_templete(true);}},
                m('button.btn.btn-primary.btn-block', [
                    m('i.fa.fa-fw.fa-flag'), ' Show template studies'
                ])
            )
            :
            m('button.btn.btn-primary.btn-block', {onclick: function(){ctrl.do_set_templete(false);}},[
                m('i.fa.fa-fw.fa-flag'), ' Hide template studies'
            ])
        ])
    ]); };

    var changePasswordComponent = {
        controller: function controller(){

            var ctrl = {
                role:m.prop(''),
                password:m.prop(''),
                confirm:m.prop(''),
                is_dbx_synchronized: m.prop(),
                is_gdrive_synchronized: m.prop(),
                present_templates: m.prop(),
                dbx_auth_link: m.prop(''),
                gdrive_auth_link: m.prop(''),
                synchronization_error: m.prop(''),
                present_templates_error: m.prop(''),
                email: m.prop(''),
                password_error: m.prop(''),
                password_changed:false,
                email_error: m.prop(''),
                email_changed:false,
                do_set_password: do_set_password,
                do_set_email: do_set_email,
                do_set_templete: do_set_templete

            };
            getAuth().then(function (response) {
                ctrl.role(response.role);
            });

            get_email()
            .then(function (response) {
                ctrl.email(response.email);
            })
            .catch(function (response) {
                ctrl.email_error(response.message);
            })
            .then(m.redraw);
            check_if_dbx_synchronized()
                .then(function (response) {
                    ctrl.is_dbx_synchronized(response.is_synchronized);
                    ctrl.dbx_auth_link(response.auth_link);
                })
                .catch(function (response) {
                    ctrl.synchronization_error(response.message);
                })
                .then(m.redraw);

            // check_if_gdrive_synchronized()
            //     .then((response) => {
            //         ctrl.is_gdrive_synchronized(response.is_synchronized);
            //         ctrl.gdrive_auth_link(response.auth_link);
            //     })
            //     .catch(response => {
            //         ctrl.synchronization_error(response.message);
            //     })
            //     .then(m.redraw);

            check_if_present_templates()
                .then(function (response) {
                    ctrl.present_templates(response.present_templates);
                })
                .catch(function (response) {
                    ctrl.present_templates_error(response.message);
                })
                .then(m.redraw);
            return ctrl;


            function do_set_password(){
                set_password$1('', ctrl.password, ctrl.confirm)
                    .then(function () {
                        ctrl.password_changed = true;
                    })
                    .catch(function (response) {
                        ctrl.password_error(response.message);
                    })
                    .then(m.redraw);
            }

            function do_set_email(){
                set_email(ctrl.email)
                    .then(function () {
                        ctrl.email_changed = true;
                    })
                    .catch(function (response) {
                        ctrl.email_error(response.message);
                    })
                    .then(m.redraw);
            }


            function do_set_templete(value){
                set_present_templates(value)
                    .then(function () {
                        ctrl.present_templates(value);
                    })
                    .catch(function (response) {
                        ctrl.present_templates_error(response.message);
                    })
                    .then(m.redraw);
            }

        },
        view: function view(ctrl){
            return m('.activation.centrify', {config:fullHeight},[
                ctrl.password_changed
                ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', 'Password successfully updated!')
                    ]
                :
                ctrl.email_changed
                ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', 'Email successfully updated!')
                    ]
                :
                    [
                        password_body(ctrl),
                        emil_body(ctrl),
                        ctrl.role()=='CU' ? '' : dropbox_body(ctrl),
                        ctrl.role()=='CU' ? '' : templates_body(ctrl)
                        // ,gdrive_body(ctrl)
                    ]
            ]);
        }
    };

    var massMailUrl = baseUrl + "/mass_mail";

    var send = function (subject, body , ru, su, cu) { return fetchJson(massMailUrl, {
        method: 'post',
        body: {subject: subject, body: body , ru: ru, su: su, cu: cu}
    }); };

    var massMailComponent = {
        controller: function controller(){
            var subject = m.prop('');
            var body = m.prop('');
            var ru = m.prop(false);
            var su = m.prop(false);
            var cu = m.prop(false);
            var ctrl = {
                subject: subject,
                body: body,
                ru: ru,
                su: su,
                cu: cu,
                error: m.prop(''),
                sent:false,
                send: sendAction
            };
            return ctrl;

            function sendAction(){
                send(subject, body , ru, su, cu)
                    .then(function () {
                        ctrl.sent = true;
                        m.redraw();
                    })
                    .catch(function (response) {
                        ctrl.error(response.message);
                        m.redraw();
                    });
            }
        },
        view: function view(ctrl){
            return m('.add.centrify', {config:fullHeight},[
                ctrl.sent
                    ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', 'Mail successfully sent!')
                    ]
                    :
                    m('.card.card-inverse.col-md-4', [
                        m('.card-block',[
                            m('h4', 'Please fill the following details'),
                            m('form', {onsubmit:ctrl.send}, [
                                m('fieldset.form-group',
                                    m('input.form-control', {
                                        type:'Subject',
                                        placeholder: 'Subject',
                                        value: ctrl.subject(),
                                        oninput: m.withAttr('value', ctrl.subject),
                                        onchange: m.withAttr('value', ctrl.subject),
                                        config: getStartValue$1(ctrl.subject)
                                    }
                                )),
                                m('fieldset.form-group',
                                    m('textarea.form-control', {
                                        type:'Body',
                                        placeholder: 'Body',
                                        value: ctrl.body(),
                                        oninput: m.withAttr('value', ctrl.body),
                                        onchange: m.withAttr('value', ctrl.body),
                                        config: getStartValue$1(ctrl.body)
                                    }
                                )),
                                m('fieldset.form-group',

                                    m('label.c-input.c-checkbox', [
                                        m('input.form-control', {
                                            type: 'checkbox',
                                            onclick: m.withAttr('checked', ctrl.ru)}),
                                        m('span.c-indicator'),
                                        m.trust('&nbsp;'),
                                        m('span', 'Regular users')
                                    ]),
                                    m('label.c-input.c-checkbox', [
                                        m('input.form-control', {
                                            type: 'checkbox',
                                            onclick: m.withAttr('checked', ctrl.su)}),
                                        m('span.c-indicator'),
                                        m.trust('&nbsp;'),
                                        m('span', 'Super users')
                                    ]),
                                    m('label.c-input.c-checkbox', [
                                        m('input.form-control', {
                                            type: 'checkbox',
                                            onclick: m.withAttr('checked', ctrl.cu)}),
                                        m('span.c-indicator'),
                                        m.trust('&nbsp;'),
                                        m('span', 'Contract users')
                                    ])

                                )
                            ]),

                            !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                            m('button.btn.btn-primary.btn-block', {onclick: ctrl.send},'Send')
                        ])
                    ])
            ]);
        }
    };

    function getStartValue$1(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    function apiURL$1(code)
    {   
        return (activationUrl + "/" + (encodeURIComponent(code)));
    }

    var is_activation_code = function (code) { return fetchJson(apiURL$1(code), {
        method: 'get'
    }); };

    var set_password = function (code, password, confirm) { return fetchJson(apiURL$1(code), {
        method: 'post',
        body: {password: password, confirm: confirm}
    }); };

    var activationComponent = {
        controller: function controller(){
            var ctrl = {
                password: m.prop(''),
                confirm: m.prop(''),
                password_error: m.prop(''),
                activated:false,
                do_set_password: do_set_password
            };
           
            is_activation_code(m.route.param('code'))
            .catch(function () {
                m.route('/');
            });

            return ctrl;

            function do_set_password(){
                set_password(m.route.param('code'), ctrl.password, ctrl.confirm)
                    .then(function () {
                        ctrl.activated = true;
                    })
                    .catch(function (response) {
                        ctrl.password_error(response.message);
                    })
                    .then(m.redraw);
            }
        },
        view: function view(ctrl){
            return m('.activation.centrify', {config:fullHeight},[
                ctrl.activated
                ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', 'Password successfully updated!')
                    ]
                :
                password_body(ctrl)]);
        }
    };

    function apiURL(code)
    {   
        return (collaborationUrl + "/" + (encodeURIComponent(code)));
    }

    var is_collaboration_code = function (code) { return fetchJson(apiURL(code), {
        method: 'get'
    }); };

    var collaborationComponent$1 = {
        controller: function controller(){

            is_collaboration_code(m.route.param('code'))
            .then(function () {
                m.route('/');
            }).catch().then(m.redraw);



        },
        view: function view(){
            return m('.activation.centrify', {config:fullHeight},[
                m('i.fa.fa-thumbs-down.fa-5x.m-b-1'),
                m('h5', 'There is a problem! please check your code...')]);
        }
    };

    var resetPasswordComponent = {
        controller: function controller(){
            var ctrl = {
                password:m.prop(''),
                confirm:m.prop(''),
                password_error: m.prop(''),
                password_changed:false,
                code: m.prop(''),
                do_set_password: do_set_password
            };
            ctrl.code(m.route.param('code')!== undefined ? m.route.param('code') : '');
            is_recovery_code(ctrl.code())
                .catch(function () {
                    m.route('/');
                })
                .then(function () {
                    m.redraw();
                });

            return ctrl;
            
            function do_set_password(){
                set_password$1(ctrl.code(), ctrl.password, ctrl.confirm)
                    .then(function () {
                        ctrl.password_changed = true;
                    })
                    .catch(function (response) {
                        ctrl.password_error(response.message);
                    })
                    .then(m.redraw);
            }
        },
        view: function view(ctrl){
            return m('.activation.centrify', {config:fullHeight},[
                ctrl.password_changed
                ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', 'Password successfully updated!')
                    ]
                :
                password_body(ctrl)
            ]);
        }
    };

    var recoveryUrl = baseUrl + "/recovery";


    var recovery = function (username) { return fetchJson(recoveryUrl, {
        method: 'post',
        body: {username: username}
    }); };

    var recoveryComponent = {
        controller: function controller(){
            var ctrl = {
                sent:false,
                username: m.prop(''),
                error: m.prop(''),
                recoveryAction: recoveryAction
            };
            return ctrl;

            function recoveryAction(){
                recovery(ctrl.username)
                    .catch(function (response) {
                        ctrl.error(response.message);
                    })
                    .then(function (){ctrl.sent = true; m.redraw();});
            }
        },
        view: function view(ctrl){
            return  m('.recovery.centrify', {config:fullHeight},[
                ctrl.sent
                    ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', 'Recovery request successfully sent!')
                    ]
                    :
                m('.card.card-inverse.col-md-4', [
                    m('.card-block',[
                        m('h4', 'Password Reset Request'),
                        m('p', 'Enter your username or your email address in the space below and we will mail you the password reset instructions'),

                        m('form', {onsubmit:ctrl.recoveryAction}, [
                            m('input.form-control', {
                                type:'username',
                                placeholder: 'Username / Email',
                                value: ctrl.username(),
                                oninput: m.withAttr('value', ctrl.username),
                                onchange: m.withAttr('value', ctrl.username),
                                config: getStartValue(ctrl.username)
                            })
                        ]),

                        !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                        m('button.btn.btn-primary.btn-block', {onclick: ctrl.recoveryAction},'Request')
                    ])
                ])
            ]);
        }
    };

    function getStartValue(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    function collaboration_url(study_id)
    {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/collaboration");
    }

    function link_url(study_id)
    {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/link");
    }



    function public_url(study_id)
    {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/public");
    }

    var get_collaborations = function (study_id) { return fetchJson(collaboration_url(study_id), {
        method: 'get'
    }); };

    var remove_collaboration = function (study_id, user_id) { return fetchJson(collaboration_url(study_id), {
        method: 'delete',
        body: {user_id: user_id}
    }); };


    var add_collaboration = function (study_id, user_name, permission) { return fetchJson(collaboration_url(study_id), {
        method: 'post',
        body: {user_name: user_name, permission: permission}
    }); };


    var add_link = function (study_id) { return fetchJson(link_url(study_id), {
        method: 'post'
    }); };

    var revoke_link = function (study_id) { return fetchJson(link_url(study_id), {
        method: 'delete'
    }); };



    var make_pulic = function (study_id, is_public) { return fetchJson(public_url(study_id), {
        method: 'post',
        body: {is_public: is_public}
    }); };

    var collaborationComponent = {
        controller: function controller(){
            var ctrl = {
                users:m.prop(),
                is_public:m.prop(),

                link_data:m.prop(),
                link:m.prop(''),
                link_type:m.prop(''),
                link_list:m.prop([]),
                link_add_list:m.prop([]),
                link_remove_list:m.prop([]),
                study_name:m.prop(),
                user_name:m.prop(''),
                permission:m.prop(''),
                loaded:false,
                col_error:m.prop(''),
                pub_error:m.prop(''),
                share_error:m.prop(''),
                remove: remove,
                do_add_collaboration: do_add_collaboration,
                do_add_link: do_add_link,
                do_revoke_link: do_revoke_link,
                do_make_public: do_make_public
            };
            function load() {
                get_collaborations(m.route.param('studyId'))
                    .then(function (response) {ctrl.users(response.users);
                        ctrl.is_public(response.is_public);
                        ctrl.study_name(response.study_name);
                        ctrl.link(response.link_data.link);
                        ctrl.link_type(response.link_data.link_type);
                        ctrl.link_list(response.link_data.link_list);

                        ctrl.loaded = true;})
                    .catch(function (error) {
                        ctrl.col_error(error.message);
                    }).then(m.redraw);

            }
            function remove(user_id){
                messages.confirm({header:'Delete collaboration', content:'Are you sure?'})
                    .then(function (response) {
                        if (response)
                            remove_collaboration(m.route.param('studyId'), user_id)
                                .then(function (){
                                    load();
                                })
                                .catch(function (error) {
                                    ctrl.col_error(error.message);
                                })
                                .then(m.redraw);
                    });
            }

            function do_add_collaboration()
            {
                messages.confirm({
                    header:'Add a Collaborator',
                    content: m.component({view: function () { return m('p', [
                        m('p', 'Enter collaborator\'s user name:'),
                        m('input.form-control', {placeholder: 'User name', value: ctrl.user_name(), onchange: m.withAttr('value', ctrl.user_name)}),
                        m('select.form-control', {value:ctrl.permission(), onchange: m.withAttr('value',ctrl.permission)}, [
                            m('option',{value:'', disabled: true}, 'Permission'),
                            m('option',{value:'can edit', selected: ctrl.permission() === 'can edit'}, 'Can edit'),
                            m('option',{value:'read only', selected: ctrl.permission() === 'read only'}, 'Read only')
                        ]),
                        m('p', {class: ctrl.col_error()? 'alert alert-danger' : ''}, ctrl.col_error())
                    ]); }
                    })})
                    .then(function (response) {
                        if (response)
                            add_collaboration(m.route.param('studyId'), ctrl.user_name, ctrl.permission)
                                .then(function (){
                                    ctrl.col_error('');
                                    load();
                                })
                                .catch(function (error) {
                                    ctrl.col_error(error.message);
                                    do_add_collaboration();
                                })
                                .then(m.redraw);
                    });
            }

            function do_add_link() {
                add_link(m.route.param('studyId'))
                    .then(function (response) {ctrl.link(response.link);})
                    .catch(function (error) {
                        ctrl.col_error(error.message);
                    }).then(m.redraw);
            }

            function do_revoke_link() {
                revoke_link(m.route.param('studyId'))
                    .then(function () {ctrl.link('');})
                    .catch(function (error) {
                        ctrl.col_error(error.message);
                    }).then(m.redraw);
            }

            function do_make_public(is_public){
                messages.confirm({okText: ['Yes, make ', is_public ? 'public' : 'private'], cancelText: ['No, keep ', is_public ? 'private' : 'public' ], header:'Are you sure?', content:m('p', [m('p', is_public
                                                                                    ?
                                                                                    'Making the study public will allow everyone to view the files. It will NOT allow others to modify the study or its files.'
                                                                                    :
                                                                                    'Making the study private will hide its files from everyone but you.'),
                    m('span', {class: ctrl.pub_error()? 'alert alert-danger' : ''}, ctrl.pub_error())])})
                    .then(function (response) {
                        if (response) make_pulic(m.route.param('studyId'), is_public)
                            .then(function (){
                                ctrl.pub_error('');
                                load();
                            })
                            .catch(function (error) {
                                ctrl.pub_error(error.message);
                                do_make_public(is_public);
                            })
                            .then(m.redraw);
                    });

            }
            load();
            return ctrl;
        },
        view: function view(ctrl){
            return  !ctrl.loaded
                ?
                m('.loader')
                :
                m('.container.sharing-page', [
                    m('.row',[
                        m('.col-sm-7', [
                            m('h3', [ctrl.study_name(), ' (Sharing Settings)'])
                        ]),
                        m('.col-sm-5', [
                            m('button.btn.btn-secondary.btn-sm.m-r-1', {onclick:ctrl.do_add_collaboration}, [
                                m('i.fa.fa-plus'), '  Add a new collaborator'
                            ]),
                            m('button.btn.btn-secondary.btn-sm', {onclick:function() {ctrl.do_make_public(!ctrl.is_public());}}, ['Make ', ctrl.is_public() ? 'Private' : 'Public'])
                        ])
                    ]),
                    m('table', {class:'table table-striped table-hover'}, [
                        m('thead', [
                            m('tr', [
                                m('th', 'User name'),
                                m('th',  'Permission'),
                                m('th',  'Remove')
                            ])
                        ]),
                        m('tbody', [
                            ctrl.users().map(function (user) { return m('tr', [
                                m('td', user.USERNAME),
                                m('td', user.PERMISSION),
                                m('td', m('button.btn.btn-secondary', {onclick:function() {ctrl.remove(user.USER_ID);}}, 'Remove'))
                            ]); })

                        ]),
                        m('.row.space',
                            m('.col-sm-12', [
                                m('button.btn.btn-secondary.btn-sm.m-r-1', {onclick:ctrl.do_add_link},
                                    [m('i.fa.fa-plus'), '  Create / Re-create public link']
                                ),
                                m('button.btn.btn-secondary.btn-sm.m-r-1', {onclick:ctrl.do_revoke_link},
                                    [m('i.fa.fa-fw.fa-remove'), '  Revoke public link']
                                ),
                                m('label.input-group.space',[
                                    m('.input-group-addon', {onclick: function() {copy(ctrl.link());}}, m('i.fa.fa-fw.fa-copy')),
                                    m('input.form-control', { value: ctrl.link(), onchange: m.withAttr('value', ctrl.link)})
                                ])
                            ])
                        )

                    ])
                ]);
        }
    };

    function copy(text){
        return new Promise(function (resolve, reject) {
            var input = document.createElement('input');
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

    // it makes sense to use this for cotnrast:
    // https://24ways.org/2010/calculating-color-contrast/

    var editTag = function (args) { return m.component(editTagComponent, args); };

    var editTagComponent = {
        view: function (ctrl, ref) {
            var tag_color = ref.tag_color;
            var tag_text = ref.tag_text;
            var error = ref.error;

            return m('div', [
            m('.form-group.row', [
                m('.col-sm-3', [
                    m('label.form-control-label', 'Tag name')
                ]),
                m('.col-sm-9', [
                    m('input.form-control', {placeholder: 'tag_text', value: tag_text(), oninput: m.withAttr('value', tag_text)})
                ])
            ]),

            m('.form-group.row', [
                m('.col-sm-3', [
                    m('label.form-control-label', 'Preview')
                ]),
                m('.col-sm-9.form-control-static', [
                    !tag_text()
                        ? m('small.text-muted', 'No tag name yet')
                        : m('span.study-tag',  {style: {'background-color': '#'+tag_color()}}, tag_text())
                ])
            ]),

            m('.form-group.row', [
                m('.col-sm-3', [
                    m('label.form-control-label', 'Color')
                ]),
                m('.col-sm-9', [
                    m('div',[
                        colorButton('E7E7E7', tag_color),
                        colorButton('B6CFF5', tag_color),
                        colorButton('98D7E4', tag_color),
                        colorButton('E3D7FF', tag_color),
                        colorButton('FBD3E0', tag_color),
                        colorButton('F2B2A8', tag_color),
                        colorButton('C2C2C2', tag_color),
                        colorButton('4986E7', tag_color)
                    ]),
                    m('div', [
                        colorButton('2DA2BB', tag_color),
                        colorButton('B99AFF', tag_color),
                        colorButton('F691B2', tag_color),
                        colorButton('FB4C2F', tag_color),
                        colorButton('FFC8AF', tag_color),
                        colorButton('FFDEB5', tag_color),
                        colorButton('FBE9E7', tag_color),
                        colorButton('FDEDC1', tag_color)
                    ]),
                    m('div', [
                        colorButton('B3EFD3', tag_color),
                        colorButton('A2DCC1', tag_color),
                        colorButton('FF7537', tag_color),
                        colorButton('FFAD46', tag_color),
                        colorButton('EBDBDE', tag_color),
                        colorButton('CCA6AC', tag_color),
                        colorButton('42D692', tag_color),
                        colorButton('16A765', tag_color)
                    ])
                ])
            ]),


            m('p', {class: error()? 'alert alert-danger' : ''}, error())
        ]);
    }
    };

    function colorButton(color, prop){
        return m('button',  {style: {'background-color': ("#" + color)}, onclick: prop.bind(null, color)}, ' A ');
    }

    var tagsComponent = {
        controller: function controller(){
            var ctrl = {
                tags:m.prop(),
                tag_text:m.prop(''),
                tag_color:m.prop(''),
                loaded:false,
                error:m.prop(''),
                remove: remove,
                add: add,
                edit: edit
            };

            function load() {
                get_tags()
                    .then(function (response) {
                        ctrl.tags(response.tags);
                        ctrl.loaded = true;
                    })
                    .catch(function (error) {
                        ctrl.error(error.message);
                    }).then(m.redraw);
            }

            function remove(tag_id){
                return function () { return messages.confirm({header:'Delete tag', content:'Are you sure?'})
                    .then(function (response) {
                        if (response)
                            remove_tag(tag_id)
                                .then(load)
                                .catch(function (error) {
                                    ctrl.error(error.message);
                                })
                                .then(m.redraw);
                    }); };
            }

            function edit(tag_id, tag_text, tag_color){
                return function () {
                    ctrl.tag_text(tag_text);
                    ctrl.tag_color(tag_color);

                    messages.confirm({
                        header:'Edit tag',
                        content: editTag(ctrl)
                    })
                        .then(function (response) {
                            if (response)
                                edit_tag(tag_id, ctrl.tag_text, ctrl.tag_color)
                            .then(function (){
                                ctrl.error('');
                                ctrl.tag_text('');
                                ctrl.tag_color('');
                                load();
                            })
                            .catch(function (error) {
                                ctrl.error(error.message);
                                edit_tag(tag_id, ctrl.tag_text, ctrl.tag_color);
                            })
                            .then(m.redraw);
                        });
                };
            }

            function add(){
                ctrl.tag_text('');
                ctrl.tag_color('E7E7E7');
                messages.confirm({
                    header:'Add a new tag',
                    content: editTag(ctrl)
                })
                    .then(function (response) {
                        if (response) add_tag(ctrl.tag_text, ctrl.tag_color)
                            .then(function (){
                                ctrl.error('');
                                ctrl.tag_text('');
                                ctrl.tag_color('');
                                load();
                            })
                            .catch(function (error) {
                                ctrl.error(error.message);
                                add(); // retry
                            })
                            .then(m.redraw);
                    });
            }

            load();
            return ctrl;
        },
        view: function view(ref){
            var loaded = ref.loaded;
            var add = ref.add;
            var tags = ref.tags;
            var edit = ref.edit;
            var remove = ref.remove;

            if (!loaded) return m('.loader');

            return m('.container.tags-page', [
                m('.row',[
                    m('.col-sm-7', [
                        m('h3', 'Tags')
                    ]),
                    m('.col-sm-5', [
                        m('button.btn.btn-success.btn-sm.pull-right', {onclick:add}, [
                            m('i.fa.fa-plus'), '  Create new tag'
                        ])
                    ])
                ]),

                !tags().length
                    ? m('.alert.alert-info', 'You have no tags yet') 
                    : m('.row', [
                        m('.list-group.col-sm-6', [
                            tags().map(function (tag) { return m('.list-group-item', [
                                m('.row', [
                                    m('.col-sm-6', [
                                        m('span.study-tag',  {style: {'background-color': '#'+tag.color}}, tag.text)
                                    ]),
                                    m('.col-sm-6', [
                                        m('btn-group', [
                                            m('a.btn.btn-sm.btn-secondary', {onclick:edit(tag.id, tag.text, tag.color)}, [
                                                m('i.fa.fa-edit'),
                                                ' Edit'
                                            ]),
                                            m('a.btn.btn-sm.btn-secondary', {onclick:remove(tag.id)}, [
                                                m('i.fa.fa-remove'),
                                                ' Remove'
                                            ])
                                        ])
                                    ])
                                ])
                            ]); })
                        ])
                    ])
            ]);
        }
    };

    function template_url(templateId)
    {
        return (translateUrl + "/" + (encodeURIComponent(templateId)));
    }

    function page_url(templateId, pageId)
    {
        return (translateUrl + "/" + (encodeURIComponent(templateId)) + "/" + (encodeURIComponent(pageId)));
    }

    var getListOfPages = function (templateId) { return fetchJson(template_url(templateId), {
        method: 'get'
    }); };


    var getStrings = function (templateId, pageId) { return fetchJson(page_url(templateId, pageId), {
        method: 'get'
    }); };


    var saveStrings = function (strings, templateId, pageId) { return fetchJson(page_url(templateId, pageId), {
        body: {strings: strings},
        method: 'put'
    }); };

    function textareaConfig(el, isInit){
        var resize = function () {
            el.style.height = ''; // reset before recaluculating
            var height = el.scrollHeight + 'px';
            requestAnimationFrame(function () {
                el.style.overflow = 'hidden';
                el.style.height = height;
            });
        };

        if (!isInit) {
            el.addEventListener('input',  resize);
            requestAnimationFrame(resize);
        }
    }

    var pagesComponent = {
        controller: function controller(){
            var templateId = m.route.param('templateId');
            var pageId = m.route.param('pageId');
            var ctrl = {
                pages:m.prop(),
                study_name:m.prop(),
                strings:m.prop(),
                loaded:false,
                has_changed:m.prop(false),
                error:m.prop(''),
                pageId: pageId,
                templateId: templateId,
                save: save,
                onunload: onunload
            };

            function load() {
                getListOfPages(templateId)
                    .then(function (response) {
                        ctrl.pages(response.pages);
                        ctrl.study_name(response.study_name);
                        ctrl.loaded = true;
                    })
                    .catch(function (error) {
                        ctrl.error(error.message);
                    }).then(m.redraw);
                if(pageId)
                    getStrings(templateId, pageId)
                        .then(function (response) {
                            ctrl.strings(response.strings.map(propifyTranslation).map(propifyChanged));
                            ctrl.loaded = true;

                        })
                        .catch(function (error) {
                            ctrl.error(error.message);
                        }).then(m.redraw);

            }
            function save() {
                ctrl.has_changed(false);
                var changed_studies = ctrl.strings().filter(changedFilter());
                if(!changed_studies.length)
                    return;
                saveStrings(changed_studies, templateId, pageId)
                    .then(function (){ return load(); });
            }
            load();

            function beforeunload(event) {
                if (ctrl.has_changed())
                    event.returnValue = 'You have unsaved data are you sure you want to leave?';
            }

            function onunload(e){
                if (ctrl.has_changed() && !window.confirm('You have unsaved data are you sure you want to leave?')){
                    e.preventDefault();
                } else {
                    window.removeEventListener('beforeunload', beforeunload);
                }
            }
            return ctrl;
        },
        view: function view(ref){
            var loaded = ref.loaded;
            var pages = ref.pages;
            var strings = ref.strings;
            var save = ref.save;
            var templateId = ref.templateId;
            var pageId = ref.pageId;
            var study_name = ref.study_name;
            var has_changed = ref.has_changed;

            return m('.study',  [
                !loaded ? m('.loader') : splitPane({
                    leftWidth: leftWidth,
                    left:m('div.translate-page', [
                        m('h5', m('a.no-decoration',  (" " + (study_name())))),
                        m('.files', [
                            m('ul', pages().map(function (page) { return m('li.file-node',{onclick: select(templateId, page)}, [
                                m('a.wholerow',{
                                    unselectable:'on',
                                    class:classNames({
                                        'current': page.pageName===pageId
                                    })
                                }, m.trust('&nbsp;')),

                                m('a', {class:classNames({'text-primary': /\.expt\.xml$/.test(page.pageName)})}, [
                                    // icon
                                    m('i.fa.fa-fw.fa-file-o.fa-files-o', {
                                    }),
                                    // page name
                                    m('span', (" " + (page.pageName)))
                                ])
                            ]); }))
                        ])
                    ]),
                    right:  !strings()
                        ?  m('.centrify', [
                            m('i.fa.fa-smile-o.fa-5x'),
                            m('h5', 'Please select a page to start working')
                        ])
                        :
                        [
                            m('.study',
                            m('.editor',
                            m('.btn-toolbar.editor-menu', [
                                m('.file-name', {class: has_changed() ? 'text-danger' : ''},
                                    m('span',{class: has_changed() ? '' : 'invisible'}, '*'),
                                    pageId
                                ),
                                m('.btn-group.btn-group-sm.pull-xs-right', [
                                    m('a.btn.btn-secondary', { title:'Save', onclick:save
                                        , class: classNames({'btn-danger-outline' : has_changed(), 'disabled': !has_changed()})
                                    },[
                                        m('strong.fa.fa-save')
                                    ])]
                            )]))),
                            m('div.translate-page', {config: fullHeight},
                            [strings().map(function (string) { return m('.list-group-item', [
                                m('.row', [
                                    m('.col-sm-5', [
                                        m('span',  string.text),
                                        m('p.small.text-muted.m-y-0', string.comment)
                                    ]),
                                    m('.col-sm-7', [
                                        m('textarea.form-control', {
                                            placeholder: 'translation',
                                            oninput: m.withAttr('value', function(value){string.translation(value); has_changed(true); string.changed=true; }),
                                            onchange: m.withAttr('value', function(value){string.translation(value); has_changed(true); string.changed=true; }),
                                            config: textareaConfig
                                        }, string.translation())
                                    ])

                                    // ,m('.col-sm-6', [
                                    //     m('input.form-control', {
                                    //         type:'text',
                                    //         placeholder: 'translation',
                                    //         value: string.translation(),
                                    //         oninput: m.withAttr('value', function(value){string.translation(value); string.changed=true; has_changed(true);}),
                                    //         onchange: m.withAttr('value', function(value){string.translation(value); string.changed=true; has_changed(true);}),
                                    //         config: getStartValue(string.translation)
                                    //     })
                                    // ])
                                ])
                            ]); })
                    ])

                        ]
                })
            ]);
        }
    };

    // a clone of m.prop that users localStorage so that width changes persist across sessions as well as files.
    // Essentially this is a global variable
    function leftWidth(val){
        if (arguments.length) localStorage.fileSidebarWidth = val;
        return localStorage.fileSidebarWidth;
    }
    // function do_onchange(string){
    //     m.withAttr('value', string.translation);
    // }


    function propifyTranslation(obj){
        obj = Object.assign({}, obj); // copy obj
        obj.translation = m.prop(obj.translation);
        return obj;
    }

    function propifyChanged(obj) {
        obj.changed = false;
        return obj;
    }


    var changedFilter = function () { return function (string) {
        return string.changed==true;
    }; };

    var select = function (templateId, page) { return function (e) {
        e.stopPropagation();
        e.preventDefault();
        m.route(("/translate/" + templateId + "/" + (page.pageName)));
    }; };

    var routes = {
        '/tags':  tagsComponent,
        '/translate/:templateId':  pagesComponent,
        '/translate/:templateId/:pageId':  pagesComponent,
        '/template_studies' : mainComponent,


        '/recovery':  recoveryComponent,
        '/activation/:code':  activationComponent,
        '/collaboration/:code':  collaborationComponent$1,
        '/settings':  changePasswordComponent,
        '/reset_password/:code':  resetPasswordComponent,

        '/deployList': deployComponent$1,
        '/removalList': removalListComponent,
        '/changeRequestList': changeRequestListComponent,
        '/addUser':  addComponent,
        '/massMail':  massMailComponent,

        '/studyChangeRequest/:studyId':  studyChangeRequestComponent,
        '/studyRemoval/:studyId':  StudyRemovalComponent,
        '/deploy/:studyId': deployComponent,
        '/login': loginComponent,
        '/studies' : mainComponent,
        '/studies/statistics_old' : statisticsComponent,
        '/studies/statistics' : statisticsComponent$1,

        '/view/:code': editorLayoutComponent,
        '/view/:code/:resource/:fileId': editorLayoutComponent,


        '/editor/:studyId': editorLayoutComponent$1,
        '/editor/:studyId/:resource/:fileId': editorLayoutComponent$1,
        '/pool': poolComponent$1,
        '/pool/history': poolComponent,
        '/downloads': downloadsComponent,
        '/downloadsAccess': downloadsAccessComponent,
        '/sharing/:studyId': collaborationComponent
    };

    var timer = 0;
    var countdown = 0;
    var role = '';
    var isloggedin = true;

    var layout = function (route) {
        return {
            controller: function controller(){
                var ctrl = {
                    isloggedin: isloggedin,
                    role: m.prop(role),
                    present_templates: m.prop(false),
                    doLogout: doLogout,
                    timer:m.prop(0)
                };
                is_loggedin();
                function is_loggedin(){
                    getAuth().then(function (response) {
                        role = ctrl.role(response.role);
                        isloggedin = ctrl.isloggedin = response.isloggedin;
                        ctrl.present_templates(response.present_templates);
                        var is_view = (m.route() == ("/view/" + (m.route.param('code'))) || m.route() == ("/view/" + (m.route.param('code')) + "/" + (m.route.param('resource')) + "/" + (encodeURIComponent(m.route.param('fileId')))));

                        if(ctrl.role()=='ro' && !is_view)
                            return doLogout();
                        if (!is_view &&  !ctrl.isloggedin  && m.route() !== '/login' && m.route() !== '/recovery' && m.route() !== '/activation/'+ m.route.param('code') && m.route() !== '/change_password/'+ m.route.param('code')  && m.route() !== '/reset_password/'+ m.route.param('code')){
                            // doLogout();
                            var url = m.route();
                            m.route('/login');
                            location.hash = encodeURIComponent(url);
                        }
                        if(ctrl.role()=='CU' && m.route() == '/studies')
                            m.route('/downloads');


                        timer = response.timeoutInSeconds;
                        run_countdown();
                        m.redraw();
                    });
                }

                function run_countdown(){
                    clearInterval(countdown);
                    countdown = setInterval(function () {
                        if(timer<=0)
                            return;
                        if(timer<10) {
                            messages.close();
                            doLogout();
                        }
                        if(timer==70)
                            messages.confirm({header:'Timeout Warning', content:'The session is about to expire. Do you want to keep working?',okText:'Yes, stay signed-in', cancelText:'No, sign out'})
                                .then(function (response) {
                                    if (!response)
                                        return doLogout();
                                    return is_loggedin();
                                });
                        timer--;
                    }, 1000);
                }
                return ctrl;

                function doLogout(){
                    clearInterval(countdown);
                    logout().then(function () {
                        var url = m.route();
                        m.route('/login');
                        location.hash = encodeURIComponent(url);
                    });
                }
            },
            view: function view(ctrl){
                return  m('.dashboard-root', {class: window.top!=window.self ? 'is-iframe' : ''}, [
                    !ctrl.isloggedin || ctrl.role()=='ro'
                    ?
                    ''
                    :
                    m('nav.navbar.navbar-dark', [
                        m('a.navbar-brand', {href:'', config:m.route}, 'Dashboard'),
                        m('ul.nav.navbar-nav',[
                            ctrl.role()=='CU'
                             ?
                            ''
                            :
                            m('li.nav-item', [
                                m('.dropdown', [
                                    m('a.nav-link',{href:'/studies', config:m.route},'Studies'),
                                    !ctrl.present_templates()
                                        ?
                                        ''
                                        :
                                        m('.dropdown-menu', [
                                            m('a.dropdown-item',{href:'/template_studies', config:m.route},'Template Studies')
                                        ])
                                ])
                            ]),

                            m('li.nav-item', [
                                m('.dropdown', [
                                    m('a.nav-link', 'Data'),
                                    m('.dropdown-menu', [
                                        m('a.dropdown-item',{href:'/downloads', config:m.route}, 'Downloads'),
                                        m('a.dropdown-item',{href:'/downloadsAccess', config:m.route}, 'Downloads access'),
                                        m('a.dropdown-item',{href:'/studies/statistics', config:m.route}, 'Statistics')
                                    ])
                                ])
                            ]),
                            ctrl.role()=='CU'
                            ?
                            ''
                            :
                            m('li.nav-item',[
                                m('a.nav-link',{href:'/pool', config:m.route},'Pool')
                            ]),
                            m('li.nav-item',[
                                m('a.nav-link',{href:'/tags', config:m.route},'Tags')
                            ]),
                            ctrl.role()!='SU'
                            ?
                            ''
                            :
                            m('li.nav-item', [
                                m('.dropdown', [
                                    m('a.nav-link', 'Admin'),
                                    m('.dropdown-menu', [
                                        m('a.dropdown-item',{href:'/deployList', config:m.route}, 'Deploy List'),
                                        m('a.dropdown-item',{href:'/removalList', config:m.route}, 'Removal List'),
                                        m('a.dropdown-item',{href:'/changeRequestList', config:m.route}, 'Change Request List'),
                                        m('a.dropdown-item',{href:'/addUser', config:m.route}, 'Add User'),
                                        m('a.dropdown-item',{href:'/massMail', config:m.route}, 'Send MassMail')
                                    ])
                                ])
                            ]),
                            m('li.nav-item.pull-xs-right', [
                                m('a.nav-link',{href:'/settings', config:m.route},m('i.fa.fa-cog.fa-lg'))
                            ]),
                            !ctrl.isloggedin ? '' : m('li.nav-item.pull-xs-right',[
                                m('button.btn.btn-info', {onclick:ctrl.doLogout}, [
                                    m('i.fa.fa-sign-out'), '  Logout'
                                ])
                            ])
                        ])
                    ]),

                    m('.main-content.container-fluid', [
                        route,

                        m.component(contextMenuComponent), // register context menu
                        m.component(messages), // register modal
                        m.component(spinner) // register spinner
                    ])

                ]);
            }
        };

    };

    var wrappedRoutes = mapObject(routes, layout);
    m.route(document.body, '/studies', wrappedRoutes);

    /**
     * Map Object
     * A utility function to transform objects
     * @param  {Object}     obj     The object to transform
     * @param  {Function}   cb      The transforming function
     * @return {Object}        [description]
     *
     * Signature:
     *
     * Object mapObject(Object obj, callbackFunction cb)
     *
     * where:
     *  callbackFunction :: any Function(any value, String key, Object object)
     */
    function mapObject(obj, cb) {
        return Object.keys(obj)
            .reduce(function(result, key) {
                result[key] = cb(obj[key], key, obj);
                return result;
            }, {});
    }

}());
//# sourceMappingURL=main.js.map
