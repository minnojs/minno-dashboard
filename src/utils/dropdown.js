import classNames from './classNames';
export default dropdown;

/**
 * VirtualElement dropdown(Object {String toggleSelector, Element toggleContent, Element elements})
 *
 * where:
 *  Element String text | VirtualElement virtualElement | Component
 * 
 * @param toggleSelector the selector for the toggle element
 * @param toggleContent the: content for the toggle element
 * @param elements: a list of dropdown items (http://v4-alpha.getbootstrap.com/components/dropdowns/)
 **/
const dropdown = args => m.component(dropdownComponent, args);


const dropdownComponent = {
    controller(){
        return {
            isOpen : m.prop(false),
            inLowerViewport: m.prop(true)
        }
    },

    view({isOpen, inLowerViewport}, {toggleSelector, toggleContent, elements, right}){
        return m('.dropdown.dropdown-component', { class: classNames({ open: isOpen()}), config: dropdownComponent.config(isOpen)}, [
            m(toggleSelector, {onmousedown}, toggleContent), 
            m('.dropdown-menu', {class: classNames({'dropdown-menu-right' :right, 'dropdown-menu-up': inLowerViewport()})}, elements)
        ]);

        function onmousedown(e){
            inLowerViewport(document.documentElement.clientHeight / 2 < e.target.getBoundingClientRect().top);
            isOpen(!isOpen());
        }
    },

    config: isOpen => (element, isInit, ctx) => {
        if (!isInit) {
            // this is a bit memory intensive, but lets not preemptively optimse
            // bootstrap does this with a backdrop
            document.addEventListener('mousedown', onClick, false);
            ctx.onunload = () => document.removeEventListener('mousedown', onClick);
        }

        function onClick(e){
            if (!isOpen()) return;

            // if we are within the dropdown do not close it
            // this is conditional to prevent IE problems
            if (e.target.closest && e.target.closest('.dropdown') === element && !hasClass(e.target, 'dropdown-onclick')) return true;
            isOpen(false);
            m.redraw();
        }

        function hasClass(el, selector){
            return ( (' ' + el.className + ' ').replace(/[\n\t\r]/g, ' ').indexOf(' ' + selector + ' ') > -1 );
        }
    }
};
