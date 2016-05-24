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

    view({isOpen}, {toggleSelector, toggleContent, elements}){
        return m('.dropdown', {class: isOpen() ? 'open' : '', config: dropdownComponent.config(isOpen)}, [
            m(toggleSelector, {onmousedown: e => {isOpen(!isOpen()); e.stopPropagation();}}, toggleContent), // we need to stopPropagation so that this doesn't trigger the config closer function.
            m('.dropdown-menu', elements)
        ]);
    },

    config: isOpen => (element, isInit, ctx) => {
        if (!isInit) {
            // this is a bit memory intensive, but lets not preemptively optimse
            // bootstrap do this with a backdrop
            document.addEventListener('mousedown', onClick, false);
            ctx.onunload = () => document.removeEventListener('mousedown', onClick);
        }

        function onClick(e){
            if (!isOpen()) return;

            // if we are within the dropdown do not close it
            // this is conditional to prevent IE problems
            if (e.target.closest && e.target.closest('.dropdown') === element) return; 
            isOpen(false);
            m.redraw();
        }
    }
};
