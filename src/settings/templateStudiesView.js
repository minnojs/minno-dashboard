export let templates_body = ctrl => m('.card.card-inverse.col-md-4', [
    m('.card-block',[
        !ctrl.present_templates()
        ?
        m('a', {onclick: function(){ctrl.do_set_templete(true);}},
            m('button.btn.btn-primary.btn-block', [
                m('i.fa.fa-fw.fa-flag'), ' Preset template studies'
            ])
        )
        :
        m('button.btn.btn-primary.btn-block', {onclick: function(){ctrl.do_set_templete(false);}},[
            m('i.fa.fa-fw.fa-flag'), ' Hide template studies'
        ])
    ])
]);
