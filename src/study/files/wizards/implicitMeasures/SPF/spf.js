import tabsComponent from '../resources/tabsComponent.js';
import defaultSettings from './spfDefaultSettings.js';
import tabs from './spfTabs.js';
import {clone, pageHeadLine} from '../resources/utilities.js';
import {save, saveToJS} from '../../../../generator/implicitMeasuresGeneratorModel';
import {createNotifications} from '../../../../../utils/notifyComponent.js';
import {toString, validityCheck} from './spfOutputComponent.js';
import messages from '../../../../../utils/messagesComponent';

export default spf;

const spf = (args, external) => m.component(spfComponent, args, external);

let spfComponent = {
    controller: controller,
    view: view
};

function controller({file, study}, external = false){
    let ctrl = {
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
        show_do_save,
        is_settings_changed
    };

    ctrl.settings.external = ctrl.external;

    function load() {
        return ctrl.file.get()
            .catch(ctrl.err)
            .then(() => {
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
        let error_msg = [];
        let blocksObject = tabs.blocks.rowsDesc; //blockDesc inside output attribute
        error_msg = validityCheck(error_msg, ctrl.settings, blocksObject);
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
                .then(response => {
                    if (response) do_save();
                }).catch(error => messages.alert({
                    content: m('p.alert.alert-danger', error.message)
                }))
                .then(m.redraw());
        }
        else do_save();
    }

    function do_save(){
        ctrl.err([]);
        let studyId  =  m.route.param('studyId');
        let fileId = m.route.param('fileId');
        let jsFileId =  fileId.split('.')[0]+'.js';
        save('spf', studyId, fileId, ctrl.settings, ctrl.last_modify)
            .then (() => saveToJS('spf', studyId, jsFileId, toString(ctrl.settings, ctrl.external), ctrl.last_modify))
            .then(ctrl.study.get())
            .then(() => ctrl.notifications.show_success(`SPF Script successfully saved`))
            .then(m.redraw)
            .catch(err => ctrl.notifications.show_danger('Error Saving:', err.message));
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
    return m('.container-fluid',
        pageHeadLine('SPF'),
        m.component(messages),
        m.component(tabsComponent, tabs, ctrl.settings, ctrl.defaultSettings, ctrl.external)
    );
}
