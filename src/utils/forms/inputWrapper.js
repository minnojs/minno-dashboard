export default inputWrapper;
let inputWrapper = (view) => (ctrl, args) => {
    let isValid = !ctrl.validity || ctrl.validity();
    let groupClass;
    let inputClass;
    let form = args.form;
    let colWidth = args.colWidth || 2;

    if (!form) throw new Error('Inputs require a form');
        
    if (form.showValidation()){
        groupClass = isValid ? 'has-success' : 'has-danger';
        inputClass = isValid ? 'form-control-success' : 'form-control-error';
    }

    return m('.form-group.row', {class: groupClass}, [
        args.isStack
            ? [ 
                m('.col-sm-12', [
                    args.label != null ? m('label', {class: 'strong'}, args.label) : '',
                    view(ctrl, args, {groupClass, inputClass}),
                    args.help && m('small.text-muted.m-y-0', args.help )
                ])
            ]
            : [
                m(`.col-sm-${colWidth}`, [
                    m('label.form-control-label', args.label)
                ]),
                m(`.col-sm-${12 - colWidth}`, [
                    view(ctrl, args, {groupClass, inputClass})
                ]),
                args.help && m('small.text-muted.col-sm-offset-2.col-sm-10.m-y-0', args.help )
            ]
    ]);
};
