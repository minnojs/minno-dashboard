import {do_delete, do_duplicate, do_rename, do_tags, do_data, do_lock, do_publish, do_copy_url} from './studyActions';

function edit_permission(study){
    return study.permission !== 'read only';
}
function lock_permission(study){
    return study.is_locked !==true;
}
function unlock_permission(study){
    return study.is_locked ===true;
}

const settings = {
            'tags':[],
            'data':[],
            'delete':[],
            'rename':[],
            'duplicate':[],
            'publish':[],
            'lock':[],
            'unlock':[],
            // 'deploy':[],
            // 'studyChangeRequest':[],
            // 'studyRemoval':[],
            // 'sharing':[],
            'copyUrl':[]
        };

const settings_hash = {
    tags: {text: 'Tags',
        config: {
            onmousedown: do_tags,
            class: 'fa-tags'
        }},
    data: {text: 'Data',
        config: {
            onmousedown: do_data,
            class: 'fa-download'
        }},
    delete: {text: 'Delete Study',
        config: {
            permission: edit_permission,
            lock: lock_permission,
            onmousedown: do_delete,
            class: 'fa-remove'
        }},
    rename: {text: 'Rename Study',
        config: {
            permission: edit_permission,
            lock: lock_permission,
            onmousedown: do_rename,
            class: 'fa-exchange'
        }},
    duplicate: {text: 'Duplicate study',
        config: {
            permission: edit_permission,
            onmousedown: do_duplicate,
            class: 'fa-clone'
        }},
    lock: {text: 'Lock Study',
        config: {
            permission: edit_permission,
            lock: lock_permission,
            onmousedown: do_lock,
            class: 'fa-lock'
        }},
    publish: {text: 'Publish Study',
        config: {
            permission: edit_permission,
            lock: lock_permission,
            onmousedown: do_publish,
            class: 'fa-lock'
        }},
    unlock: {text: 'Unlock Study',
        config: {
            permission: edit_permission,
            lock: unlock_permission,
            onmousedown: do_lock,
            class: 'fa-unlock'
        }},
    deploy: {text: 'Request Deploy',
        config: {
            permission: edit_permission,
            lock: lock_permission,
            href: `/deploy/`
        }},
    studyChangeRequest: {text: 'Request Change',
        config: {
            permission: edit_permission,
            lock: lock_permission,
            href: `/studyChangeRequest/`
        }},
    studyRemoval: {text: 'Request Removal',
        config: {
            permission: edit_permission,
            lock: lock_permission,
            href: `/studyRemoval/`
        }},
    sharing: {text: 'Sharing',
        config: {
            permission: edit_permission,
            href: `/sharing/`,
            class: 'fa-user-plus'
        }},
    copyUrl: {text: 'Copy Base URL',
        config: {
            onmousedown: do_copy_url,
            class: 'fa-link'
        }}
};


export let draw_menu = (study) => {
    return Object.keys(settings).map(comp=>
        settings_hash[comp].config.permission && !settings_hash[comp].config.permission(study) ? '' :
            settings_hash[comp].config.lock && !settings_hash[comp].config.lock(study) ? '' :
                settings_hash[comp].config.href
                    ?
                    m('a.dropdown-item',
                        { href: settings_hash[comp].config.href+study.id, config: m.route },
                        settings_hash[comp].text)
                    :
                    m('a.dropdown-item.dropdown-onclick', {onmousedown: settings_hash[comp].config.onmousedown(study)}, [
                        m('i.fa.fa-fw.'+settings_hash[comp].config.class),
                        settings_hash[comp].text
                    ]));
};

