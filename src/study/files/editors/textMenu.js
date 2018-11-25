import classNames from 'utils/classNames';
import {copyUrl} from 'utils/copyUrl';
import {play, save, resetFile} from '../sidebar/fileActions';
import {pageSnippet, questSnippet, taskSnippet} from './snippetActions';

export default textMenuView;

const amdReg = /(?:define\(\[['"])(.*?)(?=['"])/;

const textMenuView = ({mode, file, study, observer}) => {
    const setMode = value => () => mode(value);
    const modeClass = value => mode() === value ? 'active' : '';
    const isJs = file.type === 'js';
    const hasChanged = file.hasChanged();
    const isExpt = /\.expt\.xml$/.test(file.path);
    const isHtml = ['html', 'htm', 'jst', 'ejs'].includes(file.type);
    const amdMatch = amdReg.exec(file.content());
    const APItype = amdMatch && amdMatch[1];
    const launchUrl = `https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=${file.url.replace(/^.*?\/implicit/, '')}&refresh=true`;

    return m('.btn-toolbar.editor-menu', [
        m('.file-name', {class: file.hasChanged() ? 'text-danger' : ''},
            m('span',{class: file.hasChanged() ? '' : 'invisible'}, '*'),
            file.path
        ),

        m('.btn-group.btn-group-sm.pull-xs-right', [
            m('button.btn.btn-secondary', {onclick: resetFile(file), title:'Reset any chnages made to this file since the last change'},[
                m('strong.fa.fa-refresh')
            ]),
            m('a.btn.btn-secondary', {onclick: ()=>observer.trigger('settings'), title:'Editor settings'},[
                m('strong.fa.fa-cog')
            ])
        ]),

        m('.btn-group.btn-group-sm.pull-xs-right', [
            m('a.btn.btn-secondary', {href: `https://minnojs.github.io/minno-quest/0.2/basics/overview.html`, target: '_blank', title:'API documentation'},[
                m('strong.fa.fa-book'),
                m('strong', ' Docs')
            ]),
            m('a.btn.btn-secondary', {href: `https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts`, target: '_blank', title:'Editor help'},[
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
        ]),

        /**
         * Snippets
         **/
        study.isReadonly ? '' : m('.btn-group.btn-group-sm.pull-xs-right', [
            !/^minno/.test(study.type) ? '' : [
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
                m('a.btn.btn-secondary', {onclick:() => observer.trigger('paste', '{\n<%= %>\n}'), title:'Paste a template wizard'},[
                    m('strong.fa.fa-percent')
                ])
            ],

            study.type !== 'html' || !isHtml ? '' : [
                m('a.btn.btn-secondary', {onclick:() => observer.trigger('paste', '<!-- os:base -->'), title:'Paste a base url template'},[
                    m('strong','base')
                ]),
                m('a.btn.btn-secondary', {onclick:() => observer.trigger('paste', '<!-- os:vars -->'), title:'Paste a variables template'},[
                    m('strong','vars')
                ])
            ]


        ]),

        /**
         * Play
         **/
        m('.btn-group.btn-group-sm.pull-xs-right', [

            !/^minno/.test(study.type) ? '' : [
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
            ],

            study.type !== 'html' ? '' : [
                !isHtml ? '' :  m('a.btn.btn-secondary', {onclick: play(file,study), title:'Play this task'},[
                    m('strong.fa.fa-play')
                ]),
            ],

            m('a.btn.btn-secondary', {onclick: hasChanged && save(file), title:'Save (ctrl+s)',class: classNames({'btn-danger-outline' : hasChanged, 'disabled': !hasChanged || study.isReadonly})},[
                m('strong.fa.fa-save')
            ])
        ])
    ]);
};

