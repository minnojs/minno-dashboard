import {update_study_description, do_delete, do_duplicate, do_rename, do_tags, do_data, do_lock, do_publish, do_copy_url, do_make_public} from './studyActions';

const always = () => true;
const can_edit = study => !study.isReadonly && study.permission !== 'read only';

const is_locked = study => study.is_locked;
const is_published = study => study.is_published;
const not = fn => study => !fn(study);

const settings = {
    'tags':[],
    'data':[],
    'delete':[],
    'rename':[],
    'description':[],
    'duplicate':[],
    'publish':[],
    'unpublish':[],
    'lock':[],
    'unlock':[],
    // 'deploy':[],
    // 'studyChangeRequest':[],
    // 'studyRemoval':[],
    'sharing':[],
    'public':[],
    // 'unpublic':[],
    'copyUrl':[]
};

const settings_hash = {
    tags: {text: 'Tags',
        config: {
            display: [can_edit],
            onmousedown: do_tags,
            class: 'fa-tags'
        }},
    data: {text: 'Data',
        config: {
            display: [can_edit],
            onmousedown: do_data,
            class: 'fa-download'
        }},
    delete: {text: 'Delete Study',
        config: {
            display: [can_edit, not(is_locked)],
            onmousedown: do_delete,
            class: 'fa-remove'
        }},
    rename: {text: 'Rename Study',
        config: {
            display: [can_edit, not(is_locked)],
            onmousedown: do_rename,
            class: 'fa-exchange'
        }},
    description: {text: 'Change description',
        config: {
            display: [can_edit, not(is_locked)],
            onmousedown: update_study_description,
            class: 'fa-comment'
        }},
    duplicate: {text: 'Duplicate study',
        config: {
            onmousedown: do_duplicate,
            class: 'fa-clone'
        }},
    lock: {text: 'Lock Study',
        config: {
            display: [can_edit, not(is_locked)],
            onmousedown: do_lock,
            class: 'fa-lock'
        }},
    publish: {text: 'Publish Study',
        config: {
            display: [can_edit, not(is_locked), not(is_published)],
            onmousedown: do_publish,
            class: 'fa-cloud-upload'
        }},
    unpublish: {text: 'Unpublish Study', config: {
        display: [can_edit, is_published],
        onmousedown: do_publish,
        class: 'fa-cloud-upload'
    }},

    republish: {text: 'Republish Study', config: {
        display: [can_edit, not(is_published)],
        onmousedown: do_publish,
        class: 'fa-cloud-upload'
    }},

    public: {text: 'Make public / private', config: {
        display: [can_edit, not(is_locked)],
        onmousedown: do_make_public,
        class: 'fa-globe'
    }},

    unlock: {text: 'Unlock Study',
        config: {
            display: [can_edit, is_locked],
            onmousedown: do_lock,
            class: 'fa-unlock'
        }},
    deploy: {text: 'Request Deploy',
        config: {
            display: [can_edit, not(is_locked)],
            href: `/deploy/`
        }},
    studyChangeRequest: {text: 'Request Change',
        config: {
            display: [can_edit, not(is_locked)],
            href: `/studyChangeRequest/`
        }},
    studyRemoval: {text: 'Request Removal',
        config: {
            display: [can_edit, not(is_locked)],
            href: `/studyRemoval/`
        }},
    sharing: {text: 'Sharing',
        config: {
            display: [can_edit],
            href: `/sharing/`,
            class: 'fa-user-plus'
        }},
    copyUrl: {text: 'Copy Base URL',
        config: {
            onmousedown: do_copy_url,
            class: 'fa-link'
        }}
};


export const draw_menu = study => Object.keys(settings)
    .map(comp => {
        const config = settings_hash[comp].config;
        return !should_display(config, study) 
            ? '' 
            : config.href
                ? m('a.dropdown-item', { href: config.href+study.id, config: m.route }, settings_hash[comp].text)
                : m('a.dropdown-item.dropdown-onclick', {onmousedown: config.onmousedown(study)}, [
                    m('i.fa.fa-fw.'+config.class),
                    settings_hash[comp].text
                ]);
    });


function should_display(config, study){
    return !config.display || config.display.every(fn => fn(study));
}
