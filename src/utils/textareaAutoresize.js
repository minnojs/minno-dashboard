export default function textareaConfig(el, isInit){
    const resize = () => {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }
    const delayedResize = () => setTimeout(resize, 0);
    if (!isInit) {
        el.addEventListener('change',  resize);
        el.addEventListener('cut',     delayedResize);
        el.addEventListener('paste',   delayedResize);
        el.addEventListener('drop',    delayedResize);
        el.addEventListener('keydown', delayedResize);
        resize();   
    }
}
