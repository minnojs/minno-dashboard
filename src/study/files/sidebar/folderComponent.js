import node from './nodeComponent';
export default folder;

let folder = args => {
    args.key = args.path;
    return m.component(folderComponent, args);
};

let folderComponent = {
    view(ctrl, {path, folderHash, study}){
        let files = folderHash[path] || [];

        return m('.files', [
            m('ul', files.map(file => node({key: file.id, file, folderHash, study})))
        ]);
    }
};
