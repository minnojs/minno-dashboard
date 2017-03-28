
// it makes sense to use this for cotnrast:
// https://24ways.org/2010/calculating-color-contrast/

export let editTag = args => m.component(editTagComponent, args);

let editTagComponent = {
    view: (ctrl, {tag_color, tag_text, error}) => m('div', [
        m('.form-group.row', [
            m('.col-sm-3', [
                m('label.form-control-label', 'Tag name')
            ]),
            m('.col-sm-9', [
                m('input.form-control', {placeholder: 'tag_text', value: tag_text(), oninput: m.withAttr('value', tag_text)})
            ])
        ]),

        m('.form-group.row', [
            m('.col-sm-3', [
                m('label.form-control-label', 'Preview')
            ]),
            m('.col-sm-9.form-control-static', [
                !tag_text()
                    ? m('small.text-muted', 'No tag name yet')
                    : m('span.study-tag',  {style: {'background-color': '#'+tag_color()}}, tag_text())
            ])
        ]),

        m('.form-group.row', [
            m('.col-sm-3', [
                m('label.form-control-label', 'Color')
            ]),
            m('.col-sm-9', [
                m('div',[
                    colorButton('E7E7E7', tag_color),
                    colorButton('B6CFF5', tag_color),
                    colorButton('98D7E4', tag_color),
                    colorButton('E3D7FF', tag_color),
                    colorButton('FBD3E0', tag_color),
                    colorButton('F2B2A8', tag_color),
                    colorButton('C2C2C2', tag_color),
                    colorButton('4986E7', tag_color)
                ]),
                m('div', [
                    colorButton('2DA2BB', tag_color),
                    colorButton('B99AFF', tag_color),
                    colorButton('F691B2', tag_color),
                    colorButton('FB4C2F', tag_color),
                    colorButton('FFC8AF', tag_color),
                    colorButton('FFDEB5', tag_color),
                    colorButton('FBE9E7', tag_color),
                    colorButton('FDEDC1', tag_color)
                ]),
                m('div', [
                    colorButton('B3EFD3', tag_color),
                    colorButton('A2DCC1', tag_color),
                    colorButton('FF7537', tag_color),
                    colorButton('FFAD46', tag_color),
                    colorButton('EBDBDE', tag_color),
                    colorButton('CCA6AC', tag_color),
                    colorButton('42D692', tag_color),
                    colorButton('16A765', tag_color)
                ])
            ])
        ]),


        m('p', {class: error()? 'alert alert-danger' : ''}, error())
    ])
};

function colorButton(color, prop){
    return m('button',  {style: {'background-color': `#${color}`}, onclick: prop.bind(null, color)}, ' A ');
}

