import inputWrapper from 'utils/forms/inputWrapper';
export default inheritInput;

let inheritInput = args => m.component(inheritInputComponent, args);

let inheritInputComponent = {
    controller({prop}){
        let value = prop();
        let rawType = m.prop(typeof value === 'string' ? 'random' : value.type);
        let rawSet = m.prop(typeof value === 'string' ? value : value.set);

        return {type, set};

        function update(){
            let type = rawType();
            let set = rawSet();
            prop(type === 'random' ? set : {type, set});
        }
        
        function type(value){
            if (arguments){
                rawType(value);
                update();
            }

            return rawType();
        }
        
        function set(value){
            if (arguments){
                rawSet(value);
                update();
            }

            return rawSet();
        }
    },

    view: inputWrapper(({type,set}) => {

        return m('.form-inline', [
            m('.form-group.input-group', [
                m('input.form-control', {
                    placeholder:'Set',
                    onchange: m.withAttr('value', set)
                }),
                m('span.input-group-addon', {style:'display:none'}) // needed to make the corners of the input square...
            ]),
            m('select.c-select', {
                onchange: m.withAttr('value', type)
            }, TYPES.map(key => m('option', {value:key},key)))
        ]);
    })
};

const TYPES = ['random', 'exRandom', 'sequential'];
