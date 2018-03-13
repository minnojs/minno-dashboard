import fileListComponent from './fileListComponent';
import sidebarButtons from './sidebarButtons';

export default sidebarComponent;

let sidebarComponent = {
    view: (ctrl , {study}) => {
        return m('.sidebar', [
            sidebarButtons({study}),
            fileListComponent({study})
        ]);
    }
};
