export default spinner;

const spinner = {
    display: m.prop(false),
    show(response){
        spinner.display(true);
        m.redraw();
        return response;
    },
    hide(response){
        spinner.display(false);
        m.redraw();
        return response;
    },
    view(){
        return m('.backdrop', {hidden:!spinner.display()}, // spinner.show()
            m('.overlay'),
            m('.backdrop-content.spinner.icon.fa.fa-cog.fa-spin')
        );
    }
};
