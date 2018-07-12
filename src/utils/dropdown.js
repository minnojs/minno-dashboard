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
let dropdown = args => m.component(dropdownComponent, args);

let dropdownComponent = {
    controller(){
        let isOpen = m.prop(false);
        return {isOpen};
    },

    view({isOpen}, {toggleSelector, toggleContent, elements, right}){
        return m('.dropdown.dropdown-component', {class: isOpen() ? 'open' : '', config: dropdownComponent.config(isOpen)}, [
            m(toggleSelector, {onmousedown: () => {isOpen(!isOpen());}}, toggleContent), 
            m('.dropdown-menu', {class: right ? 'dropdown-menu-right' : ''}, elements)
        ]);
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
