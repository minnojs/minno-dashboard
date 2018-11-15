import {stop_gdrive_sync} from './settingsActions';

export let gdrive_body = ctrl => m('.card.card-inverse.col-md-4', [
    m('.card-block',[
        !ctrl.is_gdrive_synchronized()?
            m('a', {href:ctrl.gdrive_auth_link()},
                m('button.btn.btn-primary.btn-block', [
                    m('i.fa.fa-fw.fa-google'), ' Synchronize with your Google Drive account'
                ])
            )
            :
            m('button.btn.btn-primary.btn-block', {onclick: function(){stop_gdrive_sync(ctrl);}},[

                m('i.fa.fa-fw.fa-dropbox'), ' Stop Synchronize with your Google Drive account'
            ])

    ])

]);
