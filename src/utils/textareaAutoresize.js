export default function textareaConfig(el, isInit){
    const resize = () => {
        const height = el.scrollHeight + 'px';
        requestAnimationFrame(() => {
            el.style.height = 'auto';
            el.style.height = height;
        });
    }

    if (!isInit) {
        el.addEventListener('input',  resize);
        resize();
    }
}
