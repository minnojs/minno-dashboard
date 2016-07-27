(function () {
    'use strict';

    var checkStatus = function (response) {

        if (response.status >= 200 && response.status < 300) {
            return response;
        }

        var error = new Error(response.statusText);

        error.response = response;

        throw error;
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

    var urlPrefix = location.pathname.match(/^(?=\/)(.+?\/|$)/)[1]; // first pathname section with slashes

    var baseUrl        = urlPrefix + "dashboard";
    var studyUrl       = urlPrefix + "dashboard/studies";
    var url        = urlPrefix + "StudyData";
    var baseUrl$1        = urlPrefix + "dashboard";
    var STATISTICS_URL  = urlPrefix + "PITracking";
    var url$1   = urlPrefix + "DashboardData";
    var activation1_url  = urlPrefix + "dashboard/activation";

    function get_url(study_id) {
        return (studyUrl + "/" + (encodeURIComponent(study_id)));
    }

    /*CRUD*/
    var load_studies = function () { return fetchJson(studyUrl, {credentials: 'same-origin'}); };

    var create_study = function (study_name) { return fetchJson(studyUrl, {
        method: 'post',
        body: {study_name: study_name}
    }); };

    var rename_study = function (study_id, study_name) { return fetchJson(get_url(study_id), {
        method: 'put',
        body: {study_name: study_name}
    }); };


    var delete_study = function (study_id) { return fetchJson(get_url(study_id), {method: 'delete'}); };

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
                // bootstrap do this with a backdrop
                document.addEventListener('mousedown', onClick, false);
                ctx.onunload = function () { return document.removeEventListener('mousedown', onClick); };
            }

            function onClick(e){
                if (!isOpen()) return;

                // if we are within the dropdown do not close it
                // this is conditional to prevent IE problems
                if (e.target.closest && e.target.closest('.dropdown') === element) return; 
                isOpen(false);
                m.redraw();
            }
        }; }
    };

    var noop = function (){};

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
                        m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
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
                        m('a.btn.btn-secondary.btn-sm', {onclick:close(null)}, opts.cancelText || 'Cancel'),
                        m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
                    ])
                ];
            },

            /**
             * Promise prompt(Object opts{header: String, content: String, name: Prop})
             *
             * where:
             *   any Prop(any value)
             */
            prompt: function (opts) {
                if ( opts === void 0 ) opts={};

                var close = function (response) { return messages.close.bind(null, response); };
                var prop = opts.prop || noop;
                return [
                    m('h4', opts.header),
                    m('.card-text', opts.content),
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
                    m('.text-xs-right.btn-toolbar',[
                        m('a.btn.btn-secondary.btn-sm', {onclick:close(null)}, opts.okText || 'Cancel'),
                        m('a.btn.btn-primary.btn-sm', {onclick:close(true)}, opts.okText || 'OK')
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

    var do_create = function () {
        var study_name = m.prop('');
        var error = m.prop('');

        var ask = function () { return messages.prompt({
            header:'New Study', 
            content: m('div', [
                m('p', 'Enter Study Name:'),
                m('span.alert.alert-danger', error())
            ]),
            prop: study_name
        }).then(function (response) { return response && create(); }); };
        
        var create = function () { return create_study(study_name)
            .then(function (response) { return m.route('/editor/'+response.study_id); })
            .catch(function (e) {
                error(e.message);
                ask();
            }); };

        // activate creation
        ask();
    };

    var do_delete = function (study_id, callback) { return function () { return messages.confirm({header:'Delete study', content:'Are you sure?'})
        .then(function (response) {
            if (response) delete_study(study_id)
                .then(callback)
                .then(m.redraw)
                .catch(function (error) { return messages.alert({header: 'Delete study', content: m('p.alert.alert-danger', error.message)}); })
                .then(m.redraw);
        }); }; };

    var do_rename = function (study_id, name, callback) { return function () {
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

    var mainComponent = {
        controller: function(){
            var ctrl = {
                studies:m.prop([]),
                user_name:m.prop(''),
                globalSearch: m.prop(''),
                permissionChoice: m.prop('all'),
                loaded:false,
                loadStudies: loadStudies,
                sort_studies_by_name: sort_studies_by_name,
                sort_studies_by_date: sort_studies_by_date
            };

            loadStudies();
            return ctrl;
            function loadStudies() {
                load_studies()
                    .then(function (response) { return response.studies.sort(sort_studies_by_name); })
                    .then(ctrl.studies)
                    .then(function (){ return ctrl.loaded = true; })
                    .then(m.redraw);

            }
            function sort_studies_by_name(study1, study2){
                return study1.name === study2.name ? 0 : study1.name > study2.name ? 1 : -1;
            }
            function sort_studies_by_date2(study1, study2){
                return study1.last_modified === study2.last_modified ? 0 : study1.last_modified < study2.last_modified ? 1 : -1;
            }
            function sort_studies_by_date(){
                ctrl.studies(ctrl.studies().sort(sort_studies_by_date2));
                // m.redraw();
            }


        },
        view: function view(ref){
            var loaded = ref.loaded;
            var studies = ref.studies;
            var permissionChoice = ref.permissionChoice;
            var globalSearch = ref.globalSearch;
            var loadStudies = ref.loadStudies;
            var sort_studies_by_date = ref.sort_studies_by_date;

            if (!loaded) return m('.loader');
            return m('.container.studies', [
                m('.row.p-t-1', [
                    m('.col-sm-6', [
                        m('h3', 'My Studies')
                    ]),

                    m('.col-sm-6', [
                        m('button.btn.btn-success.btn-sm.pull-right', {onclick:do_create}, [
                            m('i.fa.fa-plus'), '  Add new study'
                        ]),

                        m('.input-group.pull-right.m-r-1', [
                            m('select.c-select.form-control.form-control-sm', {onchange: function (e) { return permissionChoice(e.target.value); }}, [
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
                        m('.row', [
                            m('.col-sm-3', [
                                
                                m('p.form-control-static',[m('strong', 'Study Name')])
                            ]),
                            m('.col-sm-5', [
                                m('p.form-control-static',{onclick:sort_studies_by_date},[m('strong', ' Last Changed')])
                            ]),
                            m('.col-sm-4', [
                                m('input.form-control', {placeholder: 'Search ...', value: globalSearch(), onkeyup: m.withAttr('value', globalSearch)})    
                            ])
                        ]),

                        studies()
                            .filter(permissionFilter(permissionChoice()))
                            .filter(searchFilter(globalSearch()))
                            .map(function (study) { return m('a', {href: ("/editor/" + (study.id)),config:routeConfig, key: study.id}, [
                                m('.row.study-row', [
                                    m('.col-sm-3', [
                                        m('.study-text', study.name),
                                        !study.is_public ? '' :  m('span.label.label-warning.m-l-1', 'Public'),
                                        study.is_public || study.permission === 'owner' ? '' :  m('span.label.label-info.m-l-1', 'Colaboration')
                                    ]),
                                    m('.col-sm-5', [
                                        m('.study-text', study.last_modified)
                                    ]),
                                    m('.col-sm-4', [
                                        m('.btn-toolbar.pull-right', [
                                            m('.btn-group.btn-group-sm', [
                                                study.permission =='read only' || study.is_public ?  '' : dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-toggle', toggleContent: 'Actions', elements: [
                                                    study.permission !== 'owner' ? '' : [
                                                        m('a.dropdown-item', {onclick: do_delete(study.id, loadStudies)}, [
                                                            m('i.fa.fa-fw.fa-remove'), ' Delete'
                                                        ]),
                                                        m('a.dropdown-item', {onclick: do_rename(study.id, study.name, loadStudies)}, [
                                                            m('i.fa.fa-fw.fa-exchange'), ' Rename'
                                                        ])
                                                    ],

                                                    m('a.dropdown-item', { href: ("/deploy/" + (study.id)), config: m.route }, 'Request Deploy'),
                                                    m('a.dropdown-item', { href: ("/studyChangeRequest/" + (study.id)), config: m.route }, 'Request Change'),
                                                    m('a.dropdown-item', { href: ("/studyRemoval/" + (study.id)), config: m.route }, 'Request Removal'),
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

    var permissionFilter = function (permission) { return function (study) {
        if(permission === 'all') return !study.is_public;
        if(permission === 'public') return study.is_public;
        if(permission === 'collaboration') return study.permission !== 'owner' && !study.is_public;
        return study.permission === permission;
    }; };

    var searchFilter = function (searchTerm) { return function (study) { return !study.name || study.name.match(new RegExp(searchTerm, 'i')); }; };

    function routeConfig(el, isInit, ctx, vdom) {

        el.href = location.pathname + '?' + vdom.attrs.href;

        if (!isInit) el.addEventListener('click', route);

        function route(e){
            var el = e.currentTarget;

            if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return;

            e.preventDefault();
            if (e.target.tagName === 'A' && e.target !== el) return;

            m.route(el.search.slice(1));
        }
    }

    var getStatistics = function (query) {
        return fetchText(STATISTICS_URL, {method:'post', body: parseQuery(query)})
            .then(function (response) {
                var csv = CSVToArray(response);
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

            var baseUrl = (location.origin) + "/implicit";
            var post = {
                db: source().match(/^(.*?):/)[1], // before colon
                current: source().match(/:(.*?)$/)[1], // after colon
                testDB:'newwarehouse',
                study: study(),
                task: task(),
                since: parseDate(startDate()),
                until: parseDate(endDate()),
                refresh:'no',
                endTask:'',
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

    // import $ from 'jquery';
    var Pikaday = window.Pikaday;

    var dateRangePicker = function (args) { return m.component(pikadayRange, args); };

    var pikaday = {
        view: function view(ctrl, ref){
            var prop = ref.prop;
            var options = ref.options;

            return m('div', {config: pikaday.config(prop, options)});
        },
        config: function config(prop, options){
            return function (element, isInitialized, ctx) {
                if (!isInitialized){
                    ctx.picker = new Pikaday(Object.assign({
                        onSelect: prop,
                        container: element
                    },options));

                    element.appendChild(ctx.picker.el);
                }

                ctx.picker.setDate(prop());
            };
        }
    };

    /**
     * args = {
     *  startValue: m.prop,
     *  endValue: m.prop,
     *  options: Object // specific daterange plugin options
     * }
     */

    var pikadayRange = {
        view: function(ctrl, args){
            return m('.date-range', {config: pikadayRange.config(args)}, [
                m('.figure', [
                    m('strong','Start Date'),
                    m('br'),
                    m('.figure')
                ]),
                m.trust('&nbsp;'),
                m('.figure', [
                    m('strong','End Date'),
                    m('br'),
                    m('.figure')
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
                    startPicker = ctx.startPicker = new Pikaday({
                        onSelect: onSelect(startDate)
                    });

                    endPicker = ctx.endPicker = new Pikaday({
                        onSelect: onSelect(endDate)
                    });

                    startPicker.setDate(startDate());
                    endPicker.setDate(endDate());

                    element.children[0].children[2].appendChild(startPicker.el);
                    element.children[1].children[2].appendChild(endPicker.el);

                    ctx.onunload = function () {
                        startPicker.destroy();
                        endPicker.destroy();
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
            var help = ref.help;
            var rows = ref.rows; if ( rows === void 0 ) rows = 3;
            var inputClass = ref$1.inputClass;

            return !isArea
                ? m('input.form-control', {
                    class: inputClass,
                    placeholder: placeholder,
                    value: prop(),
                    onkeyup: m.withAttr('value', prop),
                    config: function (element, isInit) { return isFirst && isInit && element.focus(); }
                })
                : m('textarea.form-control', {
                    class: inputClass,
                    placeholder: placeholder,
                    onkeyup: m.withAttr('value', prop),
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
                    onkeyup: m.withAttr('value', text),
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
        view: inputWrapper(function (ctrl, ref) {
            var prop = ref.prop;
            var values = ref.values; if ( values === void 0 ) values = {};

            return m('.c-inputs-stacked', Object.keys(values)
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
    var selectInput = function (args) { return m.component(selectInputComponent, args); };
    var radioInput = function (args) { return m.component(selectInputComponent$1, args); };
    var arrayInput = arrayInput$1;

    var statisticsForm = function (args) { return m.component(statisticsFormComponent, args); };
    var colWidth = 3;
    var SOURCES = {
        'Research pool - Current studies'   : 'Research:Current',
        'Research pool - Past studies'      : 'Research:History',
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

            return m('.row', [
                m('.col-sm-6', [
                    //sourceComponent({label:'Source', studyType: query.studyType, studyDb: query.studyDb, form}),
                    selectInput({label: 'Source', prop: query.source, values: SOURCES, form: form, colWidth: colWidth}),
                    textInput({label:'Study', prop: query.study , form: form, colWidth: colWidth}),
                    textInput({label:'Task', prop: query.task , form: form, colWidth: colWidth}),
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
                ]),
                m('.col-sm-6', [
                    dateRangePicker({startDate:query.startDate, endDate: query.endDate})
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

    var statisticsTable = function (args) { return m.component(statisticsTableComponent, args); };

    var statisticsTableComponent = {
        controller: function controller(){
            return {sortBy: m.prop()};
        },
        view: function view(ref, ref$1){
            var sortBy = ref.sortBy;
            var tableContent = ref$1.tableContent;

            var content = tableContent();
            if (!content) return m('.row'); 

            var list = m.prop(content.data);
            
            return m('.row.m-t-1', [
                m('.col-sm-12', [
                    m('table.table.table-sm', {onclick: sortTable(list, sortBy)}, [
                        m('thead', [
                            m('tr.table-default', tableContent().headers.map(function (header,index) { return m('th',{'data-sort-by':index, class: sortBy() === index ? 'active' : ''}, header); }))
                        ]),
                        m('tbody', tableContent().data.map(function (row) { return m('tr', row.map(function (column) { return m('td', column); })); }))
                    ])
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

            return {query: query, submit: submit, displayHelp: displayHelp, tableContent: tableContent};

            function submit(){
                getStatistics(query)
                    .then(tableContent)
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

            return m('.container.statistics', [
            m('h3', 'Statistics'),
            m('.row', [
                statisticsForm({query: query})
            ]),
            m('.row', [
                m('.col-sm-12',[
                    m('button.btn.btn-secondary.btn-sm', {onclick: function (){ return displayHelp(!displayHelp()); }}, ['Toggle help ', m('i.fa.fa-question-circle')]),
                    m('a.btn.btn-primary.pull-right', {onclick:submit}, 'Submit'),
                    !tableContent() ? '' : m('a.btn.btn-secondary.pull-right.m-r-1', {config:downloadFile(((tableContent().study) + ".csv"), tableContent().file)}, 'Download CSV')
                ])
            ]),
            !displayHelp() ? '' : m('.row', [
                m('.col-sm-12.p-a-2', statisticsInstructions())
            ]),
            m('.row', [
                statisticsTable({tableContent: tableContent})
            ])
        ]);
    }
    };

    var downloadFile = function (filename, text) { return function (element) {
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
    }; };

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
            return (baseUrl$1 + "/files/" + (encodeURIComponent(this.studyId)) + "/file/" + (encodeURIComponent(this.id)));
        },

        get: function get(){
            var this$1 = this;

            return fetchJson(this.apiUrl())
                .then(function (response) {
                    var content = response.content.replace(/\r\n?|\n?$/g, '\n'); // replace carriage returns and add new line to EOF. this makes sure all files are unix encoded...
                    this$1.sourceContent(content);
                    this$1.content(content);
                    this$1.loaded = true;
                    this$1.error = false;
                })
                .catch(function (reason) {
                    this$1.loaded = true;
                    this$1.error = true;
                    return Promise.reject(reason); // do not swallow error
                });
        },

        save: function save(){
            var this$1 = this;

            return fetchVoid(this.apiUrl(), {
                method:'put',
                body: {content: this.content}
            })
                .then(function (response) {
                    this$1.sourceContent(this$1.content()); // update source content
                    return response;
                });
        },

        move: function move(path, study){
            var this$1 = this;

            var basePath = (path.substring(0, path.lastIndexOf('/')));
            var folderExists = basePath === '' || study.files().some(function (f) { return f.isDir && f.path === basePath; });

            if (!folderExists) return Promise.reject({message: ("Folder " + basePath + " does not exist.")});
            if (study.files().some(function (f){ return f.path === path; })) return Promise.reject({message: ("File " + path + " already exists.")});

            var oldPath = this.path;
            this.setPath(path);
            this.content(this.content()); // in case where changing into a file type that needs syntax checking

            return fetchJson(this.apiUrl() + "/move/", {
                method:'put',
                body: {path: path, url:this.url}
            })
                .then(function (response) {
                    this$1.id = response.id;
                    this$1.url = response.url;
                })
                .catch(function (response) {
                    this$1.setPath(oldPath);
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
            var this$1 = this;
            if ( context === void 0 ) context = window;

            var requirejs = context.requirejs;
            return new Promise(function (resolve, reject) {
                requirejs([this$1.url], resolve,reject);
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
            syntaxData      : undefined
        });

        file.content(fileObj.content || '');

        if (fileObj.files) file.files = fileObj.files.map(fileFactory).map(function (file) { return Object.assign(file, {studyId: fileObj.studyId}); });

        return file;


        function contentProvider (store) {
            var this$1 = this;

            var prop = function () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                if (args.length) {
                    store = args[0];
                    this$1.type === 'js' && this$1.checkSyntax();
                }
                return store;
            };

            prop.toJSON = function () { return store; };

            return prop;
        }
    };

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

    var studyPrototype = {
        apiURL: function apiURL(path){
            if ( path === void 0 ) path = '';

            return (baseUrl + "/files/" + (encodeURIComponent(this.id)) + path);
        },

        get: function get(){
            var this$1 = this;

            return fetchJson(this.apiURL())
                .then(function (study) {
                    this$1.loaded = true;
                    this$1.isReadonly = study.is_readonly;
                    this$1.name = study.study_name;
                    var files = flattenFiles(study.files)
                        .map(assignStudyId(this$1.id))
                        .map(fileFactory);

                    this$1.files(files);
                    this$1.sort();
                })
                .catch(function (reason) {
                    this$1.error = true;
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

        getChosenFiles: function getChosenFiles(){
            var this$1 = this;

            return this.files().filter(function (file) { return this$1.vm(file.id).isChosen() === 1; }); // do not include half chosen dirs
        },

        createFile: function createFile(ref){
            var this$1 = this;
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
                    Object.assign(response, {studyId: this$1.id, content: content, path:name, isDir: isDir});
                    var file = fileFactory(response);
                    file.loaded = true;
                    this$1.files().push(file);
                    return response;
                })
                .then(this.sort.bind(this));
        },

        sort: function sort$1(response){
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

        uploadFiles: function uploadFiles(path, files){
            var this$1 = this;

            var paths = Array.from(files, function (file) { return path === '/' ? file.name : path + '/' + file.name; });
            var formData = buildFormData(path === '/' ? '' : path, files);
            // validation (make sure files do not already exist)
            var exists = this.files().find(function (file) { return paths.includes(file.path); });
            if (exists) return Promise.reject({message: ("The file \"" + (exists.path) + "\" already exists")});

            return fetchUpload(this.apiURL(("/upload/" + (path === '/' ? '' : path))), {method:'post', body:formData})
                .then(function (response) {
                    response.forEach(function (src) {
                        var file = fileFactory(Object.assign({studyId: this$1.id},src));
                        this$1.files().push(file);
                    });

                    return response;
                })
                .then(this.sort.bind(this));

            function buildFormData(path, files) {
                var formData = new FormData;
                // formData.append('path', path);

                // for (let file in files) {
                //  formData.append('files', files[file]);
                // }

                for (var i = 0; i < files.length; i++) {
                    formData.append(i, files[i]);
                }

                return formData;
            }
        },

        downloadFiles: function downloadFiles(files){
            var this$1 = this;

            return fetchJson(this.apiURL(), {method: 'post', body: {files: files}})
                .then(function (response) { return downloadLink((baseUrl + "/download?path=" + (response.zip_file) + "&study=_PATH"), this$1.name); });
        },

        delFiles: function delFiles(files){
            var this$1 = this;

            return fetchVoid(this.apiURL(), {method: 'delete', body: {files: files}})
                .then(function () {
                    var filesList = this$1.files()
                        .filter(function (f) { return files.indexOf(f.path) === -1; }); // only exact matches here, the choice mechanism takes care of nested folders

                    this$1.files(filesList);
                });
        },

        del: function del(fileId){
            var this$1 = this;

            var file = this.getFile(fileId);
            return file.del()
                .then(function () {
                    var files = this$1.files()
                        .filter(function (f) { return f.path.indexOf(file.path) !== 0; }); // all paths that start with the same path are deleted
                    this$1.files(files);
                });
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

    var studyFactory =  function (id) {
        var study = Object.create(studyPrototype);
        Object.assign(study, {
            id      : id,
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
    });
    };

    var unknownComponent = function () { return m('.centrify', [
        m('i.fa.fa-file.fa-5x'),
        m('h5', 'Unknow file type')
    ]); };

    var uploadFiles = function (path,study) { return function (files) {
        study
            .uploadFiles(path, files)
            .catch(function (response) { return messages.alert({
                header: 'Upload File',
                content: response.message
            }); })
            .then(m.redraw);
    }; };


    var moveFile = function (file,study) { return function () {
        var newPath = m.prop(file.path);
        return messages.prompt({
            header: 'Move/Rename File',
            prop: newPath
        })
            .then(function (response) {
                if (response) return moveAction(file,study);
            });

        function moveAction(file,study){
            var def = file
                .move(newPath(),study) // the actual movement
                .then(redirect)
                .catch(function (response) { return messages.alert({
                    header: 'Move/Rename File',
                    content: response.message
                }); })
                .then(m.redraw); // redraw after server response

            m.redraw();
            return def;
        }

        function redirect(response){
            m.route(("/editor/" + (study.id) + "/file/" + (file.id))); 
            return response;
        }
    }; };

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

    var save = function (file) { return function () {
        file.save()
            .then(m.redraw)
            .catch(function (err) { return messages.alert({
                header: 'Error Saving:',
                content: err.message
            }); });
    }; };

    var copyUrl = function (url) { return function () {
        var input = document.createElement('input');
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
                            config: function (el) { return el.select(); },
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
    }; };


    // add trailing slash if needed, and then remove proceeding slash
    // return prop
    var pathProp = function (path) { return m.prop(path.replace(/\/?$/, '/').replace(/^\//, '')); };

    var  createFile = function (study, name, content) {
        study.createFile({name:name(), content:content()})
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
        var name = pathProp(path);

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
        var name = pathProp(path);
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
        var chosenFiles = study.getChosenFiles().map(function (f){ return f.name; });
        if (!chosenFiles.length) {
            messages.alert({
                header:'Remve Files',
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
                .then(m.redraw)
                .catch(function (err) { return messages.alert({
                    header: 'Failed to delete files:',
                    content: err.message
                }); });
        }
    }; };

    var downloadFiles = function (study) { return function () {
        var chosenFiles = study.getChosenFiles().map(function (f){ return f.name; });
        if (!chosenFiles.length) {
            messages.alert({
                header:'Download Files',
                content: 'There are no files selected'
            });
            return;
        }

        study.downloadFiles(chosenFiles)
            .catch(function (err) { return messages.alert({
                header: 'Failed to download files:',
                content: err.message
            }); });
    }; };

    var ace = function (args) { return m.component(aceComponent, args); };

    var noop$1 = function(){};

    var aceComponent = {
        view: function editorView(ctrl, args){
            return m('.editor', {config: aceComponent.config(args)});
        },

        config: function(ref){
            var content = ref.content;
            var observer = ref.observer;
            var settings = ref.settings; if ( settings === void 0 ) settings = {};

            return function(element, isInitialized, ctx){
                var editor;
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
                        ace.config.set('packaged', true);
                        ace.config.set('basePath', require.toUrl('ace'));

                        editor = ctx.editor = ace.edit(element);
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
                        editor.session.on('changeMode', function(e, session){
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
                            exec: settings.onSave || noop$1
                        });
                        
                        if(observer) observer.on('paste',paste );
                        
                        setContent();
                        session.setUndoManager(new ace.UndoManager()); // reset undo manager so that ctrl+z doesn't erase file
                        editor.focus();
                        
                        ctx.onunload = function () {
                            editor.destroy();
                            if(observer) observer.off(paste );
                        };
                    });

                }
                
                // each redraw set content from model (the function makes sure that this is not done when not needed...)
                setContent();

                function setContent(){
                    var editor = ctx.editor;
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
            case 'quest' : return questComponent;
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

    var questComponent = {
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

    var questComponent$1 = {
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
            case 'text' : return textComponent;
            case 'textarea' : return textareaComponent;
            case 'selectOne' : return selectOneComponent;
            case 'selectMulti' : return selectOneComponent;
            case 'slider' : return sliderComponent;
            case undefined : return {view: function () { return m('div'); }};
            default:
                throw new Error('Unknown question type');
        }
    };

    var textComponent = {
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
    var questSnippet = snippetRunner(questComponent$1);

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
        var amdMatch = amdReg.exec(file.content());
        var APItype = amdMatch && amdMatch[1];

        return m('.btn-toolbar.editor-menu', [
            m('.file-name', {class: file.hasChanged() ? 'text-danger' : ''},
                m('span',{class: file.hasChanged() ? '' : 'invisible'}, '*'),
                file.path
            ),

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
            m('.btn-group.btn-group-sm.pull-xs-right', [
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
                
                !isExpt ? '' :  m('a.btn.btn-secondary', {href: ("https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=" + (file.url.replace(/^.*?\/implicit\//, ''))), target: '_blank', title:'Play this task'},[
                    m('strong.fa.fa-play')
                ]),

                m('a.btn.btn-secondary', {onclick: hasChanged && save(file), title:'Save (ctrl+s)',class: classNames({'btn-danger-outline' : hasChanged, 'disabled': !hasChanged || study.isReadonly})},[
                    m('strong.fa.fa-save')
                ])
            ])
        ]);
    };

    var textEditor = function (args) { return m.component(textEditorComponent, args); };

    var textEditorComponent = {
        controller: function(ref){
            var file = ref.file;

            file.loaded || file.get()
                .then(m.redraw)
                .catch(m.redraw);

            var ctrl = {mode:m.prop('edit'), observer: observer()};

            return ctrl;
        },

        view: function(ctrl, ref){
            var file = ref.file;
            var study = ref.study;

            var observer = ctrl.observer;

            if (!file.loaded) return m('.loader');

            if (file.error) return m('div', {class:'alert alert-danger'}, [
                m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
                ("The file \"" + (file.path) + "\" was not found")
            ]);

            return m('.editor', [
                textMenuView({mode: ctrl.mode, file: file, study: study, observer: observer}),
                textContent(ctrl, {file: file,observer: observer, study: study})
            ]);
        }
    };

    var textContent = function (ctrl, ref) {
        var file = ref.file;
        var study = ref.study;
        var observer = ref.observer;

        var textMode = modeMap[file.type] || 'javascript';
        switch (ctrl.mode()){
            case 'edit' : return ace({content:file.content, observer: observer, settings: {onSave: save(file), mode: textMode, jshintOptions: jshintOptions, isReadonly: study.isReadonly}});
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
        xml: 'xml'
    };

    var editors = {
        js: textEditor,
        jsp: textEditor,
        json: textEditor,
        html: textEditor,
        htm: textEditor,
        jst: textEditor,
        xml: textEditor,

        jpg: imgEditor,
        bmp: imgEditor,
        png: imgEditor,

        pdf: pdfEditor
    };

    var fileEditorComponent = {
        controller: function(ref) {
            var study = ref.study;

            var id = m.route.param('fileID');
            var file = study.getFile(id);
            var ctrl = {file: file,study: study};

            return ctrl;
        },

        view: function (ref, args) {
            var file = ref.file;
            var study = ref.study;
            if ( args === void 0 ) args = {};

            var editor = file && editors[file.type] || unknownComponent;

            return m('div', {config:fullHeight}, [
                file
                    ? editor({file: file, study: study,  settings: args.settings})
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
    var pathProp$1 = function (path) { return m.prop(path.replace(/\/?$/, '/').replace(/^\//, '')); };

    var createFromTemplate = function (ref) {
        var study = ref.study;
        var path = ref.path;
        var url = ref.url;
        var templateName = ref.templateName;

        return function () {
        var name = pathProp$1(path);
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
        'Empty': '/implicit/user/yba/wizards/emptymanager.js',
        'Typical': '/implicit/user/yba/wizards/emptymanager.js'
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
                    {text: 'Rating wizard', action: activateWizard("rating")}
                ]}
            ]);
        }
         
        // Allows to use as a button without a specific file
        if (file) {
            var isExpt = /\.expt\.xml$/.test(file.name);

            if (!isReadonly) menu.push({separator:true});

            menu = menu.concat([
                {icon:'fa-refresh', text: 'Refresh/Reset', action: refreshFile, disabled: isReadonly || file.content() == file.sourceContent()},
                {icon:'fa-download', text:'Download', action: downloadFile},
                {icon:'fa-link', text: 'Copy URL', action: copyUrl(file.url)},
                isExpt ?  { icon:'fa-play', href:("https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=" + (file.url.replace(/^.*?\/implicit/, ''))), text:'Play this task'} : '',
                isExpt ? {icon:'fa-link', text: 'Copy Launch URL', action: copyUrl(("https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=" + (file.url.replace(/^.*?\/implicit/, ''))))} : '',
                {icon:'fa-close', text:'Delete', action: deleteFile, disabled: isReadonly },
                {icon:'fa-exchange', text:'Move/Rename...', action: moveFile(file,study), disabled: isReadonly }
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

        function refreshFile(){
            file.content(file.sourceContent());
            m.redraw();
        }

        function downloadFile(){
            return downloadLink(file.url, file.name);
        }

        function deleteFile(){
            messages.confirm({
                header:['Delete ',m('small', file.name)],
                content: 'Are you sure you want to delete this file? This action is permanent!'
            })
            .then(function (ok) {
                if (ok) return study.del(file.id);
            })
            .then(m.redraw)
            .catch( function (err) {
                err.response.json()
                    .then(function (response) {
                        messages.alert({
                            header: 'Delete failed:',
                            content: response.message
                        });
                    });
                return err;
            });
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

    var node = function (file, args) { return m.component(nodeComponent, file, args); };

    var nodeComponent = {
        controller: function (file) {
            return {
                isCurrent: m.route.param('fileID') === file.id
            };
        },
        view: function (ctrl, file, ref) {
            var folderHash = ref.folderHash;
            var study = ref.study;

            var vm = study.vm(file.id); // vm is created by the studyModel
            return m('li.file-node',
                {
                    key: file.id,
                    class: classNames({
                        open : vm.isOpen()
                    }),
                    onclick: file.isDir ? function () { return vm.isOpen(!vm.isOpen()); } : select(file),
                    oncontextmenu: fileContext(file, study),
                    config: file.isDir ? uploadConfig({onchange:uploadFiles(file.path, study)}) : null
                },
                [
                    m('a.wholerow', {
                        unselectable:'on',
                        class:classNames({
                            'current': ctrl.isCurrent
                        })
                    }, m.trust('&nbsp;')),
                    m('i.fa.fa-fw', {
                        class: classNames({
                            'fa-caret-right' : file.isDir && !vm.isOpen(),
                            'fa-caret-down': file.isDir && vm.isOpen()
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
                        m('span',{class:classNames({'font-weight-bold':file.hasChanged()})},(" " + (file.name))),
                        file.isDir ? folder(file.path + '/', {folderHash: folderHash, study: study}) : ''
                    ])
                ]
            );
        }
    };

    // select specific file and display it
    var select = function (file) { return function (e) {
        e.stopPropagation();
        e.preventDefault();
        m.route(("/editor/" + (file.studyId) + "/file/" + (encodeURIComponent(file.id))));
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

        // update parent folders
        study
            .getParents(file)
            .sort(function (a,b) { return a.path.length === b.path.length ? 0 : a.path.length < b.path.length ? 1 : -1; })
            .forEach(function (f) {
                var files = f.files;
                var chosenCount = files.reduce(function (counter, f) { return counter + isChosen(f)(); }, 0);
                isChosen(f)(chosenCount === 0 ? 0 : chosenCount === files.length ? 1 : -1);
            });

        function isChosen(file){
            return study.vm(file.id).isChosen;
        }
    };
    };

    var folder = function (path, args) { return m.component(folderComponent, path, args); };

    var folderComponent = {
        view: function view(ctrl, path, ref){
            var folderHash = ref.folderHash;
            var study = ref.study;

            var files = folderHash[path] || [];

            return m('.files',[
                m('ul', files.map(function (file) { return node(file, {folderHash: folderHash, study: study}); }))
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
                study.name
            ]),
            folder('/', {folderHash: folderHash, study: study})
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
        var filesCount = study.files().length;
        var chosenCount = study.getChosenFiles().length;
        return !chosenCount ? 0 : filesCount === chosenCount ? 1 : -1;
    }

    var sidebarButtons = function (ref) {
        var study = ref.study;

        var readonly = study.isReadonly;
        var studyId = m.route.param('studyId');

        return m('.btn-toolbar', [
            m('.btn-group.btn-group-sm', [
                m('a.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', onclick: readonly || fileContext(null, study), title: 'Create new files'}, [
                    m('i.fa.fa-plus')
                ]),
                m('a.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', onclick: readonly || deleteFiles(study), title: 'Delete selected files'}, [
                    m('i.fa.fa-close')
                ]),
                m('a.btn.btn-secondary.btn-sm', {onclick: downloadFiles(study), title: 'Download selected files'}, [
                    m('i.fa.fa-download')
                ]),
                m('label.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', title: 'Drag files over the file list in order to upload easily'}, [
                    m('i.fa.fa-upload'),
                    readonly ? '' : m('input[type="file"]', {style: 'display:none', multiple:'true', onchange: uploadButton(study)})
                ])
            ]),
            m('.btn-group.btn-group-sm', [
                dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-menu-right', toggleContent: m('i.fa.fa-bars'), right: true,  elements: [
                    readonly ? '' : [
                        m('a.dropdown-item', {onclick: do_delete(study.id, function () { return m.route('/studies'); })}, [
                            m('i.fa.fa-fw.fa-remove'), ' Delete'
                        ]),
                        m('a.dropdown-item', {onclick: do_rename(study.id, study.name, function (name) { return study.name = name; })}, [
                            m('i.fa.fa-fw.fa-exchange'), ' Rename'
                        ])
                    ],
                    m('a.dropdown-item', { href: ("/deploy/" + studyId), config: m.route }, 'Request Deploy'),
                    m('a.dropdown-item', { href: ("/studyChangeRequest/" + studyId), config: m.route }, 'Request Change'),
                    m('a.dropdown-item', { href: ("/studyRemoval/" + studyId), config: m.route }, 'Request Removal'),
                    m('a.dropdown-item', { href: ("/sharing/" + studyId), config: m.route }, [m('i.fa.fa-fw.fa-user-plus'), ' Sharing'])
                ]})
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

            return m('.sidebar', [
                sidebarButtons({study: study}),
                filesList({study: study})
            ]);
        }
    };

    var study;

    var editorLayoutComponent = {
        controller: function (){
            var id = m.route.param('studyId');

            if (!study || (study.id !== id)){
                study = studyFactory(id);
                study
                    .get()
                    .then(m.redraw);
            }

            var ctrl = {study: study, onunload: onunload};

            window.addEventListener('beforeunload', beforeunload);

            return ctrl;

            function hasUnsavedData(){
                return study.files().some(function (f) { return f.content() !== f.sourceContent(); });
            }

            function beforeunload(event) {
                if (hasUnsavedData()) return event.returnValue = 'You have unsaved data are you sure you want to leave?';
            }

            function onunload(e){
                var leavingEditor = function () { return !/^\/editor\//.test(m.route()); };
                if (leavingEditor() && hasUnsavedData() && !window.confirm('You have unsaved data are you sure you want to leave?')){
                    e.preventDefault();
                } else {
                    window.removeEventListener('beforeunload', beforeunload);
                }
            }
        },
        view: function (ref) {
            var study = ref.study;

            return m('.row.study', [
                !study.loaded ? '' : [
                    m('.col-md-2', [
                        m.component(sidebarComponent, {study: study})
                    ]),
                    m('.col-md-10',[
                        m.route.param('resource') === 'wizard'
                            ? m.component(wizardComponent, {study: study})
                            : m.component(fileEditorComponent, {study: study})
                    ])
                ]
            ]);
        }
    };

    var STATUS_RUNNING = 'R';
    var STATUS_PAUSED = 'P';
    var STATUS_STOP = 'S';

    function createStudy(study){
        var body = Object.assign({
            action:'insertRulesTable',
            creationDate: new Date(),
            studyStatus: STATUS_RUNNING
        }, study);

        return fetchJson(url, {method: 'post', body: body})
            .then(interceptErrors);
    }

    function updateStudy(study){
        var body = Object.assign({
            action:'updateRulesTable'
        }, study);

        return  fetchJson(url, {method: 'post',body:body})
            .then(interceptErrors);
    }

    function updateStatus(study, status){
        var body = Object.assign({
            action:'updateStudyStatus'
        }, study,{studyStatus: status});

        return  fetchJson(url, {method: 'post',body:body})
            .then(interceptErrors);
    }

    function getAllPoolStudies(){
        return fetchJson(url, {method:'post', body: {action:'getAllPoolStudies'}})
            .then(interceptErrors);
    }

    function getLast100PoolUpdates(){
        return fetchJson(url, {method:'post', body: {action:'getLast100PoolUpdates'}})
            .then(interceptErrors);
    }

    function getStudyId(study){
        var body = Object.assign({
            action:'getStudyId'
        }, study);

        return  fetchJson(url, {method: 'post',body:body});
    }

    function resetStudy(study){
        return fetchJson(url, {method:'post', body: Object.assign({action:'resetCompletions'}, study)})
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
                            config: focusConfig,
                            placeholder:'Rules file URL',
                            value: study.rulesUrl(),
                            onkeyup: m.withAttr('value', study.rulesUrl),
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
                            onkeyup: m.withAttr('value', study.autopauseUrl),
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
                            onkeyup: m.withAttr('value', study.targetCompletions),
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
                            onkeyup: m.withAttr('value', study.userEmail),
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

    var focusConfig = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    /**
     * Create edit component
     * Promise editMessage({output:Prop})
     */
    var createMessage = function (args) { return messages.custom({
        content: m.component(createComponent, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var createComponent = {
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
                            config: focusConfig$1,
                            placeholder:'Study URL',
                            value: study.studyUrl(),
                            onkeyup: m.withAttr('value', study.studyUrl),
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

    var focusConfig$1 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    function play$1(study){
        return messages.confirm({
            header: 'Continue Study:',
            content: ("Are you sure you want to continue \"" + (study.studyId) + "\"?")
        })
        .then(function (response) {
            if(response) {
                studyPending(study, true)();
                return updateStatus(study, STATUS_RUNNING)
                    .then(function (){ return study.studyStatus = STATUS_RUNNING; })
                    .catch(reportError('Continue Study'))
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
                    .catch(reportError('Pause Study'))
                    .then(studyPending(study, false));
            }
        });
    }

    var remove  = function (study, list) {
        return messages.confirm({
            header: 'Remove Study:',
            content: ("Are you sure you want to remove \"" + (study.studyId) + "\" from the pool?")
        })
        .then(function (response) {
            if(response) {
                studyPending(study, true)();
                return updateStatus(study, STATUS_STOP)
                    .then(function () { return list(list().filter(function (el) { return el !== study; })); })
                    .catch(reportError('Remove Study'))
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
                    var study = Object.assign({}, input, unPropify(output()));
                    return updateStudy(study)
                        .then(function () { return Object.assign(input, study); }) // update study in view
                        .catch(reportError('Study Editor'))
                        .then(studyPending(input, false));
                }
            });
    };

    var create = function (list) {
        var output = m.prop();
        return createMessage({output: output})
            .then(function (response) {
                if (response) {
                    spinner.show();
                    getStudyId(output())
                        .then(function (response) { return Object.assign(unPropify(output()), response); }) // add response data to "newStudy"
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
                            studyStatus: STATUS_RUNNING
                        }, input, unPropify(output()));
                        return createStudy(study)
                            .then(function () { return list().push(study); })
                            .then(m.redraw)
                            .catch(reportError('Create Study'));
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
                    .catch(reportError('Restart study'));
            }
        });
    };

    var reportError = function (header) { return function (err) { return messages.alert({header: header, content: err.message}); }; };

    var studyPending = function (study, state) { return function () {
        study.$pending = state;
        m.redraw();
    }; };

    var unPropify = function (obj) { return Object.keys(obj).reduce(function (result, key) {
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

    function formatDate(date){
        var pad = function (num) { return num < 10 ? '0' + num : num; };
        return ((pad(date.getMonth() + 1)) + "\\" + (pad(date.getDate())) + "\\" + (date.getFullYear()));
    }

    var PRODUCTION_URL = 'https://implicit.harvard.edu/implicit/';
    var TABLE_WIDTH = 8;

    var poolComponent = {
        controller: function () {
            var ctrl = {
                play: play$1, pause: pause, remove: remove, edit: edit, reset: reset, create: create,
                canCreate: false,
                list: m.prop([]),
                globalSearch: m.prop(''),
                sortBy: m.prop(),
                error: m.prop('')
            };

            getAuth().then(function (response) {ctrl.canCreate = response.role === 'SU';});
            getAllPoolStudies()
                .then(ctrl.list)
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
                                m('th', {colspan:TABLE_WIDTH - 1}, [
                                    m('input.form-control', {placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch)})
                                ]),
                                m('th', [
                                    m('a.btn.btn-secondary', {href:'/pool/history', config:m.route}, [
                                        m('i.fa.fa-history'), '  History'
                                    ])
                                ])
                            ]),
                            ctrl.canCreate ? m('tr', [
                                m('th.text-xs-center', {colspan:TABLE_WIDTH}, [
                                    m('button.btn.btn-secondary', {onclick:ctrl.create.bind(null, list)}, [
                                        m('i.fa.fa-plus'), '  Add new study'
                                    ])
                                ])
                            ]) : '',
                            m('tr', [
                                m('th', thConfig('studyId',ctrl.sortBy), 'ID'),
                                m('th', thConfig('studyUrl',ctrl.sortBy), 'Study'),
                                m('th', thConfig('rulesUrl',ctrl.sortBy), 'Rules'),
                                m('th', thConfig('autopauseUrl',ctrl.sortBy), 'Autopause'),
                                m('th', thConfig('completedSessions',ctrl.sortBy), 'Completion'),
                                m('th', thConfig('creationDate',ctrl.sortBy), 'Date'),
                                m('th','Status'),
                                m('th','Actions')
                            ])
                        ]),
                        m('tbody', [
                            list().length === 0
                                ?
                                m('tr.table-info',
                                    m('td.text-xs-center', {colspan: TABLE_WIDTH},
                                        m('strong', 'Heads up! '), 'There are no pool studies yet'
                                    )
                                )
                                :
                                list().filter(studyFilter(ctrl)).map(function (study) { return m('tr', [
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
                                                study.canPause && study.studyStatus === STATUS_RUNNING ? m('button.btn.btn-sm.btn-secondary', {onclick: ctrl.pause.bind(null, study)}, [
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
    var thConfig = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    function studyFilter(ctrl){
        return function (study) { return includes(study.studyId, ctrl.globalSearch()) ||
            includes(study.studyUrl, ctrl.globalSearch()) ||
            includes(study.rulesUrl, ctrl.globalSearch()); };

        function includes(val, search){
            return typeof val === 'string' && val.includes(search);
        }
    }

    var PRODUCTION_URL$1 = 'https://implicit.harvard.edu/implicit/';
    var poolComponent$1 = {
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
                m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                    m('thead', [
                        m('tr', [
                            m('th.row', {colspan:8}, [
                                m('.col-sm-4',
                                    m('input.form-control', {placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch)})
                                ),
                                m('.col-sm-8',
                                    dateRangePicker(ctrl),
                                    m('.btn-group-vertical.history-button-group',[
                                        dayButtonView(ctrl, 'Last 7 Days', 7),
                                        dayButtonView(ctrl, 'Last 30 Days', 30),
                                        dayButtonView(ctrl, 'Last 90 Days', 90),
                                        dayButtonView(ctrl, 'All times', 3650)
                                    ])


                                )
                            ])
                        ]),
                        m('tr', [
                            m('th', thConfig$1('studyId',ctrl.sortBy), 'ID'),
                            m('th', thConfig$1('studyUrl',ctrl.sortBy), 'Study'),
                            m('th', thConfig$1('rulesUrl',ctrl.sortBy), 'Rules'),
                            m('th', thConfig$1('autopauseUrl',ctrl.sortBy), 'Autopause'),     
                            m('th', thConfig$1('creationDate',ctrl.sortBy), 'Creation Date'),
                            m('th', thConfig$1('completedSessions',ctrl.sortBy), 'Completion'),
                            m('th','New Status'),
                            m('th','Old Status'),
                            m('th', thConfig$1('updaterId',ctrl.sortBy), 'Updater')
                        ])
                    ]),
                    m('tbody', [
                        list().filter(studyFilter$1(ctrl)).map(function (study) { return m('tr', [
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
    var thConfig$1 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    function studyFilter$1(ctrl){
        return function (study) { return (includes(study.studyId, ctrl.globalSearch()) ||    includes(study.updaterId, ctrl.globalSearch()) || includes(study.rulesUrl, ctrl.globalSearch())
                || includes(study.targetCompletions, ctrl.globalSearch()))
            && (new Date(study.creationDate)).getTime() >= ctrl.startDate().getTime()
        && (new Date(study.creationDate)).getTime() <= ctrl.endDate().getTime()+86000000; }; //include the end day selected

        function includes(val, search){
            return typeof val === 'string' && val.includes(search);
        }
    }

    var dayButtonView = function (ctrl, name, days) { return m('button.btn.btn-secondary.btn-sm', {onclick: function () {
        var d = new Date();
        d.setDate(d.getDate() - days);
        ctrl.startDate(d);
        ctrl.endDate(new Date());
    }}, name); };

    var STATUS_RUNNING$1 = 'R';
    var STATUS_COMPLETE = 'C';
    var STATUS_ERROR = 'X';

    var getAllDownloads = function () { return fetchJson(url$1, {
        method:'post',
        body: {action:'getAllDownloads'}
    }).then(interceptErrors$1); };

    var removeDownload = function (download) { return fetchVoid(url$1, {
        method:'post',
        body: Object.assign({action:'removeDownload'}, download)
    }).then(interceptErrors$1); };

    var createDownload = function (download) { return fetchJson(url$1, {
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
    }); };


    var createComponent$1 = {
        controller: function controller(ref){
            var output = ref.output;
            var close = ref.close;

            var download ={
                studyId: m.prop(''),
                db: m.prop('test'),
                startDate: m.prop(new Date(0)),
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

                    if (isValid) close(true);
                },
                cancel: function cancel() {
                    close(null);
                }
            };

            return ctrl;
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
                                    config: focusConfig$2,
                                    placeholder:'Study Id',
                                    value: download.studyId(),
                                    onkeyup: m.withAttr('value', download.studyId),
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
                                m('label', 'Date Range'),
                                m('p.text-muted.btn-toolbar', [
                                    dayButtonView$1(download, 'Last 7 Days', 7),
                                    dayButtonView$1(download, 'Last 30 Days', 30),
                                    dayButtonView$1(download, 'Last 90 Days', 90),
                                    dayButtonView$1(download, 'All times', 3650)
                                ]),
                                m('.text-xs-center', dateRangePicker(download))
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

    var focusConfig$2 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    var dayButtonView$1 = function (download, name, days) { return m('button.btn.btn-secondary.btn-sm', {onclick: function () {
        var d = new Date();
        d.setDate(d.getDate() - days);
        download.startDate(d);
        download.endDate(new Date());
    }}, name); };

    var DURATION = 5000;

    /**
     * Get all downloads
     */

    var recursiveGetAll = debounce(getAll, DURATION);
    function getAll(ref){
        var list = ref.list;
        var cancel = ref.cancel;
        var error = ref.error;

        return getAllDownloads()
            .then(list)
            .then(function (response) {
                if (!cancel() && response.some(function (download) { return download.studyStatus === STATUS_RUNNING$1; })) {
                    recursiveGetAll({list: list, cancel: cancel, error: error});
                }
            })
            .catch(error)
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

    function create$1(list, cancel){
        var output = m.prop();
        return createMessage$1({output: output})
            .then(function (response) {
                if (response){
                    var download = unPropify$1(output());
                    list().unshift(Object.assign({
                        studyStatus: STATUS_RUNNING$1,
                        creationDate: new Date()
                    },download));
                    cancel(true);
                    return createDownload(download)
                        .then(function () {
                            cancel(false);
                            getAll({list: list, cancel: cancel});
                        })
                        .catch(reportError$1)
                        .then(cancel.bind(null, false));
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
            var cancelDownload = m.prop(false);

            var ctrl = {
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

            getAll({list:ctrl.list, cancel: cancelDownload, error: ctrl.error});

            return ctrl;
        },

        view: function view(ctrl) {
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
                        m('button.btn.btn-secondary.pull-right', {onclick:ctrl.create.bind(null, list, ctrl.cancelDownload)}, [
                            m('i.fa.fa-plus'), ' Request Data'
                        ])
                    ]),
                    m('.col-sm-3',[
                        m('input.form-control', {placeholder: 'Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch)})
                    ])
                ]),

                m('table', {class:'table table-striped table-hover',onclick:sortTable(list, ctrl.sortBy)}, [
                    m('thead', [
                        m('tr', [
                            m('th', thConfig$2('studyId',ctrl.sortBy), 'ID'),
                            m('th', 'Data file'),
                            m('th', thConfig$2('db',ctrl.sortBy), 'Database'),
                            m('th', thConfig$2('fileSize',ctrl.sortBy), 'File Size'),
                            m('th', thConfig$2('creationDate',ctrl.sortBy), 'Date Added'),
                            m('th','Status'),
                            m('th','Actions')
                        ])
                    ]),
                    m('tbody', [
                        list().length === 0
                            ? m('tr.table-info', [
                                m('td.text-xs-center', {colspan: TABLE_WIDTH$1}, 'There are no downloads running yet')
                            ])
                            : list().filter(studyFilter$2(ctrl)).map(function (download) { return m('tr', [
                                // ### ID
                                m('td', download.studyId),

                                // ### Study url
                                m('td', download.studyStatus == STATUS_RUNNING$1
                                    ? m('i.text-muted', 'Loading...')
                                    : download.fileSize
                                        ? m('a', {href:download.studyUrl, download:true, target: '_blank'}, 'Download')
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
    var thConfig$2 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    function studyFilter$2(ctrl){
        var search = ctrl.globalSearch();
        return function (study) { return includes(study.studyId, search) ||
            includes(study.studyUrl, search); };

        function includes(val, search){
            return typeof val === 'string' && val.includes(search);
        }
    }

    statusLabelsMap[STATUS_COMPLETE] = m('span.label.label-success', 'Complete');
    statusLabelsMap[STATUS_RUNNING$1] = m('span.label.label-info', 'Running');
    statusLabelsMap[STATUS_ERROR] = m('span.label.label-danger', 'Error');

    var url$2 = '/dashboard/DownloadsAccess';
    var STATUS_APPROVED = true;
    var STATUS_SUBMITTED = false;

    function createDataAccessRequest(dataAccessRequest){
        var body = Object.assign({
            action:'createDataAccessRequest'
        }, dataAccessRequest);

        return fetchJson(url$2, {method: 'post', body: body})
            .then(interceptErrors$2);
    }

    function deleteDataAccessRequest(dataAccessRequest){
        var body = Object.assign({
            action:'deleteDataAccessRequest'
        }, dataAccessRequest);

        return  fetchJson(url$2, {method: 'post',body:body})
            .then(interceptErrors$2);
    }

    function updateApproved(dataAccessRequest, approved){
        var body = Object.assign({
            action:'updateApproved'
        }, dataAccessRequest,{approved: approved});

        return  fetchJson(url$2, {method: 'post',body:body})
            .then(interceptErrors$2);
    }

    function getAllOpenRequests(){
        return fetchJson(url$2, {method:'post', body: {action:'getAllOpenRequests'}})
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

    var createMessage$2 = function (args) { return messages.custom({
        content: m.component(createComponent$2, Object.assign({close:messages.close}, args)),
        wide: true
    }); };

    var createComponent$2 = {
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
                            config: focusConfig$3,
                            placeholder:'Study Id',
                            value: downloadAccess.studyId(),
                            onkeyup: m.withAttr('value', downloadAccess.studyId),
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

    var focusConfig$3 = function (element, isInitialized) {
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
                            config: focusConfig$4,
                            placeholder:'Study Id',
                            value: downloadAccess.studyId(),
                            onkeyup: m.withAttr('value', downloadAccess.studyId),
                            class:inputClasses(validity.studyId)
                        }),
                        m('label', 'Username'),
                        m('input.form-control', {
                            config: focusConfig$4,
                            placeholder:'Username',
                            value: downloadAccess.username(),
                            onkeyup: m.withAttr('value', downloadAccess.username),
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

    var focusConfig$4 = function (element, isInitialized) {
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
                            config: focusConfig$5,
                            placeholder:'Study Id',
                            value: downloadAccess.studyId(),
                            onkeyup: m.withAttr('value', downloadAccess.studyId),
                            class:inputClasses(validity.studyId)
                        }),
                        m('label', 'Username'),
                        m('input.form-control', {
                            config: focusConfig$5,
                            placeholder:'Username',
                            value: downloadAccess.username(),
                            onkeyup: m.withAttr('value', downloadAccess.username),
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

    var focusConfig$5 = function (element, isInitialized) {
        if (!isInitialized) element.focus();
    };

    function play$2(downloadAccess, list){
        return messages.confirm({
            header: 'Approve Access Request:',
            content: ("Are you sure you want to grant access of '" + (downloadAccess.studyId) + "' to '" + (downloadAccess.username) + "'?")
        })
        .then(function (response) {
            if(response) {
                return updateApproved(downloadAccess, STATUS_APPROVED)
                    .then(function () { return list(list().filter(function (el) { return el !== downloadAccess; })); })
                    .then(messages.alert({header:'Grant access completed', content: 'Access granted'}))
                    .catch(reportError$2('Grant Access'))
                    .then(m.redraw());
            }
        });
    }


    var remove$2  = function (downloadAccess, list) {
        return messages.confirm({
            header: 'Delete request:',
            content: ("Are you sure you want to delete the access request for'" + (downloadAccess.studyId) + "'? If access has already been granted you will lose it")
        })
        .then(function (response) {
            if(response) {
                
                return deleteDataAccessRequest(downloadAccess)
                    .then(function () { return list(list().filter(function (el) { return el !== downloadAccess; })); })
                    .then(messages.alert({header:'Deletion complete', content: 'Access has been deleted'}))
                    .catch(reportError$2('Remove Download Request'))
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
                }, null, unPropify$2(output()));
                return createDataAccessRequest(downloadAccess)
                .then(messages.alert({header:'Grant access completed', content: 'Access granted'}))
                .catch(reportError$2('Grant Access'));
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
                }, null, unPropify$2(output()));
                return deleteDataAccessRequest(downloadAccess)
                .then(messages.alert({header:'Revoke access completed', content: 'Access revoked'}))
                .catch(reportError$2('Revoke Access'));
            }
        });
    };
    var create$2 = function (list) {
        var output = m.prop();
        return createMessage$2({output: output})
            .then(function (response) {
                if (response) {
                    var now = new Date();
                    var downloadAccess = Object.assign({
                        creationDate: now,
                        approved: 'access pending'
                    }, null, unPropify$2(output()));
                    return createDataAccessRequest(downloadAccess)
                        .then(function () { return list().unshift(downloadAccess); })
                        .then(m.redraw)
                        .catch(reportError$2('Data Access Request'));
                }
            });
    };

    var reportError$2 = function (header) { return function (err) { return messages.alert({header: header, content: err.message}); }; };

    var unPropify$2 = function (obj) { return Object.keys(obj).reduce(function (result, key) {
        result[key] = obj[key]();
        return result;
    }, {}); };

    var TABLE_WIDTH$2 = 6;

    var downloadsAccessComponent = {
        controller: function () {
            var ctrl = {
                play: play$2,
                remove: remove$2,
                create: create$2,
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
                .then(m.redraw);

            return ctrl;
        },
        view: function (ctrl) {
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
                                m('th', {colspan: TABLE_WIDTH$2}, [ 
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
                                            m('input.form-control', {placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch)})
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
                                    m('td.text-xs-center', {colspan: TABLE_WIDTH$2},
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
                login(ctrl.username, ctrl.password)
                    .then(function () {
                        m.route('/');
                    })
                    .catch(function (response) {
                        ctrl.error(response.message);
                        m.redraw();
                    })
                ;
            }

            function is_loggedin(){
                getAuth().then(function (response) {
                    ctrl.isloggedin = response.isloggedin;
                    m.redraw();
                });
            }
        },
        view: function view(ctrl){
            return m('.login.centrify', {config:fullHeight},[
                ctrl.isloggedin
                ?
                    [
                        m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                        m('h5', 'You are already logged in!')
                    ]
                    :
                    m('.card.card-inverse.col-md-4', [
                        m('.card-block',[
                            m('h4', 'Please sign in'),

                            m('form', {onsubmit:ctrl.login}, [
                                m('input.form-control', {
                                    type:'username',
                                    placeholder: 'Username / Email',
                                    value: ctrl.username(),
                                    onkeyup: m.withAttr('value', ctrl.username),
                                    onchange: m.withAttr('value', ctrl.username),
                                    config: getStartValue(ctrl.username)
                                }),
                                m('input.form-control', {
                                    type:'password',
                                    placeholder: 'Password',
                                    value: ctrl.password(),
                                    onkeyup: m.withAttr('value', ctrl.password),
                                    onchange: m.withAttr('value', ctrl.password),
                                    config: getStartValue(ctrl.password)
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

    function getStartValue(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    var deploy_url = baseUrl + "/deploy_list";

    function get_study_list(){
        return fetchJson(deploy_url);
    }

    var thConfig$4 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

    var deployComponent = {
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
                        m('th', thConfig$4('CREATION_DATE',ctrl.sortBy), 'Creation date'),
                        m('th', thConfig$4('FOLDER_LOCATION',ctrl.sortBy), 'Folder location'),
                        m('th', thConfig$4('RULE_FILE',ctrl.sortBy), 'Rule file'),
                        m('th', thConfig$4('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                        m('th', thConfig$4('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                        m('th', thConfig$4('TARGET_NUMBER',ctrl.sortBy), 'Target number'),
                        m('th', thConfig$4('APPROVED_BY_A_REVIEWER',ctrl.sortBy), 'Approved by a reviewer'),
                        m('th', thConfig$4('EXPERIMENT_FILE',ctrl.sortBy), 'Experiment file'),
                        m('th', thConfig$4('LAUNCH_CONFIRMATION',ctrl.sortBy), 'Launch confirmation'),
                        m('th', thConfig$4('COMMENTS',ctrl.sortBy), 'Comments')
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

    var thConfig$5 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };
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
                        m('th', thConfig$5('CREATION_DATE',ctrl.sortBy), 'Creation date'),
                        m('th', thConfig$5('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                        m('th', thConfig$5('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                        m('th', thConfig$5('FILE_NAMES',ctrl.sortBy), 'File names'),
                        m('th', thConfig$5('TARGET_SESSIONS',ctrl.sortBy), 'Target sessions'),
                        m('th', thConfig$5('STUDY_SHOWFILES_LINK',ctrl.sortBy), 'Study showfiles link'),
                        m('th', thConfig$5('STATUS',ctrl.sortBy), 'Status'),
                        m('th', thConfig$5('COMMENTS',ctrl.sortBy), 'Comments')
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

    var thConfig$6 = function (prop, current) { return ({'data-sort-by':prop, class: current() === prop ? 'active' : ''}); };

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
                        m('th', thConfig$6('CREATION_DATE',ctrl.sortBy), 'Creation date'),
                        m('th', thConfig$6('RESEARCHER_EMAIL',ctrl.sortBy), 'Researcher email'),
                        m('th', thConfig$6('RESEARCHER_NAME',ctrl.sortBy), 'Researcher name'),
                        m('th', thConfig$6('STUDY_NAME',ctrl.sortBy), 'Study name'),
                        m('th', thConfig$6('COMPLETED_N',ctrl.sortBy), 'Completed n'),
                        m('th', thConfig$6('COMMENTS',ctrl.sortBy), 'Comments')
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

    function deploy_url$1(study_id)
    {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/deploy");
    }

    var get_study_prop = function (study_id) { return fetchJson(deploy_url$1(study_id), {
        method: 'get'
    }); };

    var study_removal = function (study_id, ctrl) { return fetchJson(deploy_url$1(study_id), {
        method: 'delete',
        body: {study_name: ctrl.study_name, completed_n: ctrl.completed_n, comments: ctrl.comments}
    }); };

    var deploy = function (study_id, ctrl) { return fetchJson(deploy_url$1(study_id), {
        method: 'post',
        body: {target_number: ctrl.target_number, approved_by_a_reviewer: ctrl.approved_by_a_reviewer, experiment_file: ctrl.experiment_file, launch_confirmation: ctrl.launch_confirmation, comments: ctrl.comments, rulesValue: ctrl.rulesValue}
    }); };

    var Study_change_request = function (study_id, ctrl) { return fetchJson(deploy_url$1(study_id), {
        method: 'put',
        body: {file_names: ctrl.file_names, target_sessions: ctrl.target_sessions, status: ctrl.status, comments: ctrl.comments}
    }); };

    function rulesEditor (args) { return m.component(rulesComponent, args); };

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

    var ASTERIX = m('span.text-danger', '*');

    var deployComponent$1 = {
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
            var studyId = ref.studyId;

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
                    label:m('span', ['Name of Experiment File', ASTERIX]),
                    prop: ctrl.experiment_file,
                    values:ctrl.experiment_files(),
                    form: form, required:true, isStack:true
                }),

                textInput({help: 'For private studies (not in the Project Implicit research pool), enter n/a', label:['Target Number of Completed Study Sessions', ASTERIX],  placeholder: 'Target Number of Completed Study Sessions', prop: ctrl.target_number, form: form, required:true, isStack:true}),

                m('.font-weight-bold', 'Participant Restrictions'),
                rulesEditor({value:ctrl.rulesValue, visual: ctrl.rulesVisual, comments: ctrl.rulesComments, exist_rule_file: ctrl.exist_rule_file}),

                m('.font-weight-bold', 'Study is ready for deploy: ', ASTERIX),
                m('.m-b-1', [
                    checkbox({description: 'The study\'s study-id starts with my user name', prop: ctrl.valid_study_name, form: form, required:true, isStack:true}),
                    checkbox({
                        description:  'This study has been approved by the appropriate IRB ', 
                        prop: ctrl.approved_by_irb,
                        required:true,
                        form: form, isStack:true
                    }),
                    checkbox({
                        description:  [
                            'All items on "Study Testing" and "Study Approval" from ',  
                            m('a', {href:'http://peoplescience.org/node/105', target:'_blank'}, 'Project Implicit Study Development Checklist'), 
                            ' completed (items 9 - 17) '
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
                    label:['Study has been approved by a *User Experience* Reviewer (Calvin Lai): ', ASTERIX],
                    prop: ctrl.approved_by_a_reviewer,
                    values: {
                        'No, this study is not for the Project Implicit pool.' : 'No, this study is not for the Project Implicit pool.',
                        'Yes' : 'Yes'
                    },
                    form: form, required:true, isStack:true
                }),

                radioInput({
                    label: ['If you are building this study for another researcher (e.g. a contract study), has the researcher received the standard final launch confirmation email and confirmed that the study is ready to be launched? ', ASTERIX],
                    prop: ctrl.launch_confirmation,
                    values: {
                        'No,this study is mine': 'No,this study is mine',
                        'Yes' : 'Yes'
                    },
                    form: form, required:true, isStack:true
                }),

                textInput({isArea: true, label: m('span', 'Additional comments'),  placeholder: 'Additional comments', prop: ctrl.comments, form: form, isStack:true}),
                !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                m('button.btn.btn-primary', {onclick: submit}, 'Deploy')
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

    var ASTERIX$2 = m('span.text-danger', '*');

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
                    label: m('span', ['What\'s the current status of your study?', ASTERIX$2]),
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
                                        onkeyup: m.withAttr('value', ctrl.username),
                                        onchange: m.withAttr('value', ctrl.username),
                                        config: getStartValue$1(ctrl.username)
                                    }
                                )),
                                m('fieldset.form-group',
                                    m('input.form-control', {
                                        type:'first_name',
                                        placeholder: 'first name',
                                        value: ctrl.first_name(),
                                        onkeyup: m.withAttr('value', ctrl.first_name),
                                        onchange: m.withAttr('value', ctrl.first_name),
                                        config: getStartValue$1(ctrl.first_name)
                                    }
                                )),
                                m('fieldset.form-group',
                                        m('input.form-control', {
                                            type:'last_name',
                                            placeholder: 'last name',
                                            value: ctrl.last_name(),
                                            onkeyup: m.withAttr('value', ctrl.last_name),
                                            onchange: m.withAttr('value', ctrl.last_name),
                                            config: getStartValue$1(ctrl.last_name)
                                        }
                                )),
                                m('fieldset.form-group',
                                    m('input.form-control', {
                                        type:'email',
                                        placeholder: 'email',
                                        value: ctrl.email(),
                                        onkeyup: m.withAttr('value', ctrl.email),
                                        onchange: m.withAttr('value', ctrl.email),
                                        config: getStartValue$1(ctrl.email)
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

    function getStartValue$1(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    function apiURL(code)
    {   
        return (activation1_url + "/" + (encodeURIComponent(code)));
    }

    var is_activation_code = function (code) { return fetchJson(apiURL(code), {
        method: 'get'
    }); };

    var set_password = function (code, password, confirm) { return fetchJson(apiURL(code), {
        method: 'post',
        body: {password: password, confirm: confirm}
    }); };

    var password_body = function (ctrl) { return m('.card.card-inverse.col-md-4', [
        m('.card-block',[
            m('h4', 'Enter New Password'),
            m('form', [
                m('input.form-control', {
                    type:'password',
                    placeholder: 'Password',
                    value: ctrl.password(),
                    onkeyup: m.withAttr('value', ctrl.password),
                    onchange: m.withAttr('value', ctrl.password),
                    config: getStartValue$2(ctrl.password)
                }),

                m('input.form-control', {
                    type:'password',
                    placeholder: 'Confirm password',
                    value: ctrl.confirm(),
                    onkeyup: m.withAttr('value', ctrl.confirm),
                    onchange: m.withAttr('value', ctrl.confirm),
                    config: getStartValue$2(ctrl.confirm)
                })
            ]),
            !ctrl.password_error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.password_error()),
            m('button.btn.btn-primary.btn-block', {onclick: ctrl.do_set_password},'Update')
        ])
    ]); };

    function getStartValue$2(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    var activationComponent = {
        controller: function controller(){
            var ctrl = {
                password: m.prop(''),
                confirm: m.prop(''),
                error: m.prop(''),
                activated:false,
                do_set_password: do_set_password
            };
           
            is_activation_code(m.route.param('code'))
            .catch(function () {
                m.route('/');
            })
            .then(m.redraw);
            return ctrl;

            function do_set_password(){
                set_password(m.route.param('code'), ctrl.password, ctrl.confirm)
                    .then(function () {
                        ctrl.activated = true;
                    })
                    .catch(function (response) {
                        ctrl.error(response.message);
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

    var change_password_url = baseUrl + "/change_password";
    var change_email_url = baseUrl + "/change_email";

    function apiURL$1(code)
    {   
        return (change_password_url + "/" + (encodeURIComponent(code)));
    }

    var is_recovery_code = function (code) { return fetchJson(apiURL$1(code), {
        method: 'get'
    }); };

    var set_password$1 = function (code, password, confirm) { return fetchJson(apiURL$1(code), {
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

    var emil_body = function (ctrl) { return m('.card.card-inverse.col-md-4', [
        m('.card-block',[
            m('h4', 'Enter New Email Address'),
            m('form', [
                m('input.form-control', {
                    type:'email',
                    placeholder: 'New Email Address',
                    value: ctrl.email(),
                    onkeyup: m.withAttr('value', ctrl.email),
                    onchange: m.withAttr('value', ctrl.email),
                    config: getStartValue$3(ctrl.email)
                })
            ])
            ,
            !ctrl.email_error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.email_error()),
            m('button.btn.btn-primary.btn-block', {onclick: ctrl.do_set_email},'Update')

        ])

    ]); };

    function getStartValue$3(prop){
        return function (element, isInit) {// !isInit && prop(element.value);
            if (!isInit) setTimeout(function (){ return prop(element.value); }, 30);
        };
    }

    var changePasswordComponent = {
        controller: function controller(){

            var ctrl = {
                password:m.prop(''),
                confirm:m.prop(''),
                email: m.prop(''),
                password_error: m.prop(''),
                password_changed:false,
                email_error: m.prop(''),
                email_changed:false,
                do_set_password: do_set_password,
                do_set_email: do_set_email
            };

            get_email()
            .then(function (response) {
                ctrl.email(response.email);
            })
            .catch(function (response) {
                ctrl.email_error(response.message);
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
                        emil_body(ctrl)
                    ]
            ]);
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
                    .then(m.redraw);
            }
        },
        view: function view(ctrl){
            return  m('.recovery.centrify', {config:fullHeight},[
                m('.card.card-inverse.col-md-4', [
                    m('.card-block',[
                        m('h4', 'Password Reset Request'),
                        m('p', 'Enter your username or your email address in the space below and we will mail you the password reset instructions'),

                        m('form', {onsubmit:ctrl.recoveryAction}, [
                            m('input.form-control', {
                                type:'username',
                                placeholder: 'Username / Email',
                                value: ctrl.username(),
                                onkeyup: m.withAttr('value', ctrl.username),
                                onchange: m.withAttr('value', ctrl.username),
                                config: getStartValue$4(ctrl.username)
                            })
                        ]),

                        !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                        m('button.btn.btn-primary.btn-block', {onclick: ctrl.recovery},'Request')
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

    function collaboration_url(study_id)
    {
        return (studyUrl + "/" + (encodeURIComponent(study_id)) + "/collaboration");
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


    var make_pulic = function (study_id, is_public) { return fetchJson(public_url(study_id), {
        method: 'post',
        body: {is_public: is_public}
    }); };

    var collaborationComponent = {
        controller: function controller(){
            var ctrl = {
                users:m.prop(),
                is_public:m.prop(),
                study_name:m.prop(),
                user_name:m.prop(''),
                permission:m.prop(''),
                loaded:false,
                col_error:m.prop(''),
                pub_error:m.prop(''),
                remove: remove,
                do_add_collaboration: do_add_collaboration,
                do_make_public: do_make_public
            };
            function load() {
                get_collaborations(m.route.param('studyId'))
                    .then(function (response) {ctrl.users(response.users);
                        ctrl.is_public(response.is_public);
                        ctrl.study_name(response.study_name);
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
            function do_add_collaboration(){
                messages.confirm({
                    header:'Add a Collaborator',
                    content: m.component({view: function () { return m('p', [
                        m('p', 'Enter collaborator\'s user name:'),
                        m('input.form-control', {placeholder: 'User name', value: ctrl.user_name(), onchange: m.withAttr('value', ctrl.user_name)}),
                        m('select.form-control', {value:'Permission', onchange: m.withAttr('value',ctrl.permission)}, [
                            m('option',{disabled: true}, 'Permission'),
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
            function do_make_public(is_public){
                messages.confirm({okText: ['Yes, make ', is_public ? 'public' : 'private'], cancelText: ['No, keap ', is_public ? 'private' : 'public' ], header:'Are you sure?', content:m('p', [m('p', is_public
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
                m('.container', [
                    m('.row',[
                        m('.col-sm-7', [
                            m('h3', [ctrl.study_name(), ': Sharing'])
                        ]),
                        m('.col-sm-5', [
                            m('button.btn.btn-secondary.btn-sm.m-r-1', {onclick:ctrl.do_add_collaboration}, [
                                m('i.fa.fa-plus'), '  Add new collaboration'
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

                        ])
                    ])
                ]);
        }
    };

    var routes = { 
        '/recovery':  recoveryComponent,
        '/activation/:code':  activationComponent,
        '/change_password':  changePasswordComponent,
        '/reset_password/:code':  resetPasswordComponent,
        '/addUser':  addComponent,
        '/studyChangeRequest/:studyId':  studyChangeRequestComponent,
        '/studyRemoval/:studyId':  StudyRemovalComponent,
        '/deploy/:studyId': deployComponent$1,
        '/deployList': deployComponent,
        '/removalList': removalListComponent,
        '/changeRequestList': changeRequestListComponent,
        '/login': loginComponent,
        '/studies' : mainComponent,
        '/studies/statistics' : statisticsComponent,
        '/editor/:studyId': editorLayoutComponent,
        '/editor/:studyId/:resource/:fileID': editorLayoutComponent,
        '/pool': poolComponent,
        '/pool/history': poolComponent$1,
        '/downloads': downloadsComponent,
        '/downloadsAccess': downloadsAccessComponent,
        '/sharing/:studyId': collaborationComponent
    };

    var timer = 0;
    var countdown = 0;

    var layout = function (route) {
        return {
            controller: function controller(){
                var ctrl = {
                    isloggedin: false,
                    role: m.prop(''),
                    doLogout: doLogout,
                    timer:m.prop(0)
                };

                is_loggedin();

                function is_loggedin(){
                    getAuth().then(function (response) {
                        ctrl.role(response.role);
                        ctrl.isloggedin = response.isloggedin;
                        if (!ctrl.isloggedin  && m.route() !== '/login' && m.route() !== '/recovery' && m.route() !== '/activation/'+ m.route.param('code') && m.route() !== '/change_password/'+ m.route.param('code'))
                            m.route('/login');

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
                    logout().then(function () { return m.route('/login'); });
                }
            },
            view: function view(ctrl){
                return  m('.dashboard-root', {class: window.top!=window.self ? 'is-iframe' : ''}, [
                    m('nav.navbar.navbar-dark.navbar-fixed-top', [
                        m('a.navbar-brand', {href:baseUrl}, 'Dashboard'),
                        m('ul.nav.navbar-nav',[
                            m('li.nav-item',[
                                m('a.nav-link',{href:'/studies', config:m.route},'Studies')
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
                            m('li.nav-item',[
                                m('a.nav-link',{href:'/pool', config:m.route},'Pool')
                            ]),
                            ctrl.role()!='SU'
                            ?
                            ''
                            :
                            m('li.nav-item', [
                                m('.dropdown', [
                                    m('a.nav-link', 'Admin'),
                                    m('.dropdown-menu', [
                                        m('a.dropdown-item',{href:'/addUser', config:m.route}, 'Add User')
                                    ])
                                ])
                            ]),
                            m('li.nav-item.pull-xs-right', [
                                m('a.nav-link',{href:'/change_password', config:m.route},m('i.fa.fa-cog.fa-lg'))
                            ]),
                            !ctrl.isloggedin ? '' : m('li.nav-item.pull-xs-right',[
                                m('button.btn.btn-info', {onclick:ctrl.doLogout}, [
                                    m('i.fa.fa-sign-out'), '  Logout'
                                ])
                            ])
                        ])
                    ]),

                    m('.main-content.container-fluid', [
                        route
                    ]),

                    m.component(contextMenuComponent), // register context menu
                    m.component(messages), // register modal
                    m.component(spinner) // register spinner
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