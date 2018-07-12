import fileListComponent from './fileListComponent';
import sidebarButtons from './sidebarButtons';

export default sidebarComponent;

const sidebarComponent = {
    view: (ctrl , {study}) => {
        return m('.sidebar', {config}, [
            sidebarButtons({study}),
            fileListComponent({study})
        ]);
    }
};

function config(el, isInitialized, ctx){
    if (!isInitialized) el.addEventListener('scroll', listen, false);
    el.scrollTop = ctx.scrollTop || 0;

    function listen(){
        ctx.scrollTop = el.scrollTop;
    }
}
