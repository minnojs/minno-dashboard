import classNames from './classNames';
export default contextMenuComponent;

/**
 * Set this component into your layout then use any mouse event to open the context menu:
 * oncontextmenu: contextMenuComponent.open([...menu])
 *
 * Example menu:
 * [
 *  {icon:'fa-play', text:'begone'},
 *  {icon:'fa-play', text:'asdf'},
 *  {separator:true},
 *  {icon:'fa-play', text:'wertwert', menu: [
 *      {icon:'fa-play', text:'asdf'}
 *  ]}
 * ]
 */

const contextMenuComponent = {
    vm: {
        show: m.prop(false),
        style: m.prop({}),
        menu: m.prop([])
    },
    view: () => {
        return m(
            '.context-menu',
            {
                class: classNames({'show-context-menu': contextMenuComponent.vm.show()}),
                style: contextMenuComponent.vm.style()
            },
            contextMenuComponent.vm.menu().map(menuNode)
        );
    },

    open: menu => e => {
        e.preventDefault();
        e.stopPropagation();

        const left = e.pageX + 'px';
        const top = e.pageY + 'px';
        const bottom = (window.innerHeight - e.pageY) + 'px';
        const style = window.innerHeight/2 > e.pageY ? {left,top} : {left,bottom};

        contextMenuComponent.vm.menu(menu);
        contextMenuComponent.vm.show(true);
        contextMenuComponent.vm.style(style);

        document.addEventListener('mousedown', onClick, false);
        function onClick(){
            contextMenuComponent.vm.show(false);
            document.removeEventListener('mousedown', onClick);
            m.redraw();
        }
    }
};

let menuNode = (node, key) => {
    if (!node) return '';
    if (node.separator) return m('.context-menu-separator', {key:key});

    let action = node.action;
    if (node.href && !action) action = openTab;
    if (node.disabled) action = null;
    
    return m('.context-menu-item', {class: classNames({disabled: node.disabled, submenu:node.menu, key: key})}, [
        m('button.context-menu-btn',{onmousedown: action}, [
            m('i.fa', {class:node.icon}),
            m('span.context-menu-text', node.text)
        ]),
        node.menu ? m('.context-menu', node.menu.map(menuNode)) : ''
    ]);

    function openTab(){
        let win = window.open(node.href, '_blank');
        win.focus();
    }
};
