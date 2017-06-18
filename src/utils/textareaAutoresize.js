export default function textareaConfig(el, isInit){
    const resize = () => {
        el.style.height = ''; // reset before recaluculating
        const height = el.scrollHeight + 'px';
        requestAnimationFrame(() => {
            el.style.overflow = 'hidden';
            el.style.height = height;
        });
    }

    if (!isInit) {
        el.addEventListener('input',  resize);
        requestAnimationFrame(resize);
    }
}
