import classNames from './classNames';
export default contextMenuComponent;

let contextMenuComponent = {
	show: m.prop(false),
	style: m.prop({}),

	controller: args => {

	},

	view: (ctrl, args) => {
		return m(
			'.context-menu',
			{
				class: classNames({'show-menu': contextMenuComponent.show()}),
				style: contextMenuComponent.style(),
				onclick: e => e.stopPropagation()
			},
			args.menu.map(menuNode)
		);
	},

	oncontextmenu: e => {
		contextMenuComponent.show(true);
		contextMenuComponent.style({left:e.pageX, top:e.pageY});

		document.addEventListener('click', onClick, false);
		function onClick(){
			contextMenuComponent.show(false);
			document.removeEventListener('click', onClick);
		}
	}
};

let menuNode = node => {
	return node.separator
		? m('.context-menu-separator')
		: m('.context-menu-item', {class: classNames({disabled: node.disabled})}, [
			m('button.context-menu-btn',{onclick:node.action}, [
				m('i.fa', {class:node.icon}),
				m('span.context-menu-text', node.text),
				node.menu ? m('.context-menu', node.menu.map(menuNode)) : ''
			])
		]);
};




var menu = document.querySelector('.menu');

function showMenu(x, y){
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.add('show-menu');
}

function hideMenu(){
    menu.classList.remove('show-menu');
}

function onContextMenu(e){
    e.preventDefault();
    showMenu(e.pageX, e.pageY);
    document.addEventListener('click', onClick, false);
}

function onClick(e){
    hideMenu();
    document.removeEventListener('click', onClick);
}

document.addEventListener('contextmenu', onContextMenu, false);
