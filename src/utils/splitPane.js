export default splitPane;

const splitPane = args => m.component(splitComponent, args);

const splitComponent = {
    controller({leftWidth}){
        return {
            parentWidth: m.prop(),
            parentOffset: m.prop(),
            leftWidth: leftWidth || m.prop('auto')
        };
    },

    view({parentWidth, parentOffset, leftWidth}, {left = '', right = ''}){
        return m('.split-pane', {config: config(parentWidth, parentOffset, leftWidth)}, [
            m('.split-pane-col-left', {style: {flexBasis: leftWidth() + 'px'}}, left),
            m('.split-pane-divider', {onmousedown: onmousedown(parentOffset, leftWidth)}),
            m('.split-pane-col-right', right)
        ]);
    }
};

const config = (parentWidth, parentLeft, leftWidth) => (element, isInitialized, ctx) => {
    if (!isInitialized){
        update();
        if (leftWidth() === undefined) leftWidth(parentWidth()/6);
    }

    document.addEventListener('resize', update);
    ctx.onunload = () => document.removeEventListener('resize', update);
    
    function update(){
        parentWidth(element.offsetWidth);
        parentLeft(element.getBoundingClientRect().left);
    }
};

const onmousedown = (parentOffset, leftWidth) => () => {
    document.addEventListener('mouseup', mouseup);
    document.addEventListener('mousemove', mousemove);

    function mouseup() {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mousemove);
    }

    function mousemove(e){
        leftWidth(e.pageX - parentOffset());
        m.redraw();
    }
};
