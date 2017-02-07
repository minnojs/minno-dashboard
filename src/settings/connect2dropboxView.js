import {stop_dbx_sync} from './settingsActions';

export let dropbox_body = ctrl => m('.card.card-inverse.col-md-4', [
    m('.card-block',[
        !ctrl.is_dbx_synchronized()?
        m('a', {href:ctrl.dbx_auth_link()},
            m('button.btn.btn-primary.btn-block', [
                m('i.fa.fa-fw.fa-dropbox'), ' Synchronize with your Dropbox account'
            ])
        )
        :
        m('button.btn.btn-primary.btn-block', {onclick: function(){stop_dbx_sync(ctrl);}},[

            m('i.fa.fa-fw.fa-dropbox'), ' Stop Synchronize with your Dropbox account'
        ])

    ])

]);
