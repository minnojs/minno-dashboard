import {showClearOrReset, showRestrictions, editStimulusObject, resetClearButtons} from './utilities.js';

let parametersComponent = {
    controller:controller,
    view:view
};

function controller(settings, defaultSettings, rows) {
    let parameters = settings.parameters;
    let external = settings.external;
    let qualtricsParameters = ['leftKey', 'rightKey', 'fullscreen', 'showDebriefing'];
    return {reset, clear, set, get, rows, qualtricsParameters, external};

    function reset(){showClearOrReset(parameters, defaultSettings.parameters, 'reset');}

    function clear(){showClearOrReset(parameters, rows.slice(-1)[0], 'clear');}

    function get(name, object, parameter) {
        if (name === 'base_url')
            return parameters[name][object];
        if (name === 'isTouch')
            if (parameters[name] === true) return 'Touch';
            else return 'Keyboard';
        if (name === 'isQualtrics')
            if (parameters[name] === true) {
                return 'Qualtrics';
            } else return 'Regular';
        if (object && parameter) {
            if (parameter === 'font-size')
                return parseFloat((parameters[name][object][parameter].replace('em', '')));
            return parameters[name][object][parameter];
        }
        return parameters[name];
    }

    function set(name, object, parameter) {
        return function (value) {
            if (name === 'base_url')
                return parameters[name][object] = value;
            if (name === 'isTouch')
                if (value === 'Keyboard') return parameters[name] = false;
                else return parameters[name] = true;
            if (name === 'isQualtrics')
                if (value === 'Regular') return parameters[name] = false;
                else return parameters[name] = true;
            if (name.includes('Duration')) return parameters[name] = Math.abs(value);
            if (object && parameter) {
                if (parameter === 'font-size') {
                    value = Math.abs(value);
                    if (value === 0) {
                        showRestrictions('error', 'Font\'s size must be bigger than 0.', 'Error');
                        return parameters[name][object][parameter];
                    }
                    return parameters[name][object][parameter] = value + 'em';
                }
                return parameters[name][object][parameter] = value;
            }
            return parameters[name] = value;
        };
    }

}

function view(ctrl, settings){
    return m('.space' ,[
        ctrl.rows.slice(0,-1).map((row) => {
            if(!ctrl.external && row.name === 'isQualtrics') return;
            if ((ctrl.qualtricsParameters.includes(row.name)) && ctrl.get('isQualtrics') === 'Regular') return;
            if(settings.parameters.isTouch && row.name.toLowerCase().includes('key')) return;
            return m('.row.line', [
                m('.col-md-4',
                    row.desc ?
                        [
                            m('span', [' ', row.label, ' ']),
                            m('i.fa.fa-info-circle.text-muted',{title:row.desc})
                        ]
                        : m('span', [' ', row.label])
                ),
                row.name === ('base_url') ?
                    m('.col-md-6',
                        m('input[type=text].form-control', {value:ctrl.get('base_url','image'), oninput: m.withAttr('value', ctrl.set(row.name, 'image'))}))
                    : row.name.toLowerCase().includes('key') ? //case of keys parameters
                        m('.col-md-2.col-lg-1',
                            m('input[type=text].form-control',{value:ctrl.get(row.name), oninput:m.withAttr('value', ctrl.set(row.name))}))
                        : (row.name === 'fixationStimulus') ||  (row.name === 'deadlineStimulus' || row.name === 'maskStimulus') ?
                            editStimulusObject(row.name, ctrl.get, ctrl.set)
                            : m('.col-md-4.col-lg-2',
                                row.options ? //case of isTouch and isQualtrics
                                    m('select.form-control',{value: ctrl.get(row.name), onchange:m.withAttr('value',ctrl.set(row.name)), style: {width: '8.3rem', height:'2.8rem'}},[
                                        row.options.map(function(option){return m('option', option);})])
                                    : row.name.includes('Duration') ? //case of duration parameter
                                        m('input[type=number].form-control',{placeholder:'0', min:0, value:ctrl.get(row.name), onchange:m.withAttr('value', ctrl.set(row.name))})
                                        : (row.name === 'sortingLabel1' || row.name === 'sortingLabel2' || row.name === 'targetCat') ?
                                            m('input[type=text].form-control', {value:ctrl.get(row.name) ,oninput:m.withAttr('value', ctrl.set(row.name))})
                                            : m('input[type=checkbox]', {onclick: m.withAttr('checked', ctrl.set(row.name)), checked: ctrl.get(row.name)})
                            )
            ]);
        }), resetClearButtons(ctrl.reset, ctrl.clear)
    ]);
}

export default parametersComponent;
