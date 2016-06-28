import node from './nodeComponent';
export default folder;

let folder = (path, args) => m.component(folderComponent, path, args);

let folderComponent = {
    view(ctrl, path, {folderHash, study}){
        let files = folderHash[path] || [];

        return m('.files',[
            m('ul', files.map(file => node(file, {folderHash, study})))
        ]);
    }
};
