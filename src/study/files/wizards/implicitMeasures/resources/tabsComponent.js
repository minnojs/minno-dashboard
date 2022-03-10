let tabsComponent = {
    controller: function(tabs){
        let tab = Object.keys(tabs)[0];
        let subTabs = null;
        let currSubTab = null;
        return {tab, subTabs, currSubTab};
    },
    view:
        function(ctrl, tabs, settings, defaultSettings, external = false, notifications,
            is_locked, is_settings_changed, show_do_save){
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
                                    onclick: () => show_do_save(),
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

export default tabsComponent;
