import classNames from 'utils/classNames';
import {play, save} from '../sidebar/fileActions';
import {pageSnippet, questSnippet, taskSnippet} from './snippetActions';

export default textMenuView;

const amdReg = /(?:define\(\[['"])(.*?)(?=['"])/;

let textMenuView = ({mode, file, study, observer}) => {
    let setMode = value => () => mode(value);
    let modeClass = value => mode() === value ? 'active' : '';
    let isJs = file.type === 'js';
    let hasChanged = file.hasChanged();
    let isExpt = /\.expt\.xml$/.test(file.path);
    let amdMatch = amdReg.exec(file.content());
    let APItype = amdMatch && amdMatch[1];

    return m('.btn-toolbar.editor-menu', [
        m('.file-name', {class: file.hasChanged() ? 'text-danger' : ''},
            m('span',{class: file.hasChanged() ? '' : 'invisible'}, '*'),
            file.path
        ),

        m('.btn-group.btn-group-sm.pull-xs-right', [
            m('a.btn.btn-secondary', {href: `http://projectimplicit.github.io/PIquest/0.0/basics/overview.html`, target: '_blank', title:'API documentation'},[
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
            m('a.btn.btn-secondary', {onclick:() => observer.trigger('paste', '{\n<%= %>\n}'), title:'Paste a template wizard'},[
                m('strong.fa.fa-percent')
            ])
        ]),
        m('.btn-group.btn-group-sm.pull-xs-right', [
            !isJs ? '' :  m('a.btn.btn-secondary', {onclick: play(file,study), title:'Play this task'},[
                m('strong.fa.fa-play')
            ]),
            
            !isExpt ? '' :  m('a.btn.btn-secondary', {href: `https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=${file.url.replace(/^.*?\/implicit\//, '')}`, target: '_blank', title:'Play this task'},[
                m('strong.fa.fa-play')
            ]),

            m('a.btn.btn-secondary', {onclick: hasChanged && save(file), title:'Save (ctrl+s)',class: classNames({'btn-danger-outline' : hasChanged, 'disabled': !hasChanged || study.isReadonly})},[
                m('strong.fa.fa-save')
            ])
        ])
    ]);
};

