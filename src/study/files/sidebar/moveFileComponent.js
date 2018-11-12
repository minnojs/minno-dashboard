import classNames from 'utils/classNames';
export default moveFileComponent;

const moveFileComponent = args => m.component(component, args);


const component = {
    controller({file, study}){
        const dirs = study
            .files()
            .filter(f => f.isDir)
            .filter(f => f !== file)
            .map(({name, basePath, path, id}) => ({name, basePath, path, id, isOpen: m.prop(study.vm(id).isOpen())}))
            .reduce((hash, dir)=>{
                const path = dir.basePath;
                if (!hash[path]) hash[path] = [];
                hash[path].push(dir);
                return hash;
            }, {'/': []});


        const root = {isOpen: m.prop(true), name:'/', path: '/'};
        return {root, dirs};
    },
    view({dirs, root}, {newPath}){
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
    const children = dirs[dir.path.replace(/\/?$/, '/')]; // optionally add a backslash at the end
    return m('li', [
        m('i.fa.fa-fw', {
            onclick: () => dir.isOpen(!dir.isOpen()),
            class: classNames({
                'fa-caret-right' : children && !dir.isOpen(),
                'fa-caret-down': children && dir.isOpen()
            })
        }),
        m('span', {onclick: () => newPath(dir.path)}, [
            m('i.fa.fa-folder-o.m-r-1'),
            dirName(dir.name)
        ]),
        !children || !dir.isOpen() ? '' : m('ul.bulletless', children.map(d => dirNode(d, dirs, newPath)))
    ]);
}

function dirName(name){
    return name === '/' ? m('span.text-muted', 'Root Directory') : name;
}
