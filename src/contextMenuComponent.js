import classNames from './classNames';
export default contextMenuComponent;

let contextMenuComponent = {
	controller: args => {

	},

	view: (ctrl, args) => {
		return m('.context-menu', args.menu.map(menuNode));
	}
};

let menuNode = node => {
	return m('.context-menu-item', {class: classNames({disabled: node.disabled})}, [
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
