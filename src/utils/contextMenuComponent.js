import classNames from './classNames';
export default contextMenuComponent;

/**
 * Set this component into your layout then use any mouse event to open the context menu:
 * oncontextmenu: contextMenuComponent.open([...menu])
 *
 * Example menu:
 * [
 * 	{icon:'fa-play', text:'begone'},
 *	{icon:'fa-play', text:'asdf'},
 *	{separator:true},
 *	{icon:'fa-play', text:'wertwert', menu: [
 *		{icon:'fa-play', text:'asdf'}
 *	]}
 * ]
 */

let contextMenuComponent = {
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

		contextMenuComponent.vm.menu(menu);
		contextMenuComponent.vm.show(true);
		contextMenuComponent.vm.style({
			left:e.pageX + 'px',
			top:e.pageY + 'px'
		});

		document.addEventListener('mousedown', onClick, false);
		function onClick(){
			m.redraw();
			contextMenuComponent.vm.show(false);
			document.removeEventListener('mousedown', onClick);
		}
	}
};

let menuNode = (node, key) => {
	return node.separator
		? m('.context-menu-separator', {key:key})
		: m('.context-menu-item', {class: classNames({disabled: node.disabled, submenu:node.menu, key: key})}, [
			m('button.context-menu-btn',{onmousedown: node.disabled || node.action}, [
				m('i.fa', {class:node.icon}),
				m('span.context-menu-text', node.text)
			]),
			node.menu ? m('.context-menu', node.menu.map(menuNode)) : ''
		]);
};