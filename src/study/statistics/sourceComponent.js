import inputWrapper from 'utils/forms/inputWrapper';
export default source;

const STUDYTYPES = ['Research', 'Demo', 'Both'];
const STUDYDBS = ['Any', 'Current', 'History'];

let source = (args) => m.component(sourceComponent, args);

let sourceComponent = {
    view: inputWrapper((ctrl, {studyType, studyDb}) => {
        return m('.form-inline', [
            m('select.c-select', {
                onchange: m.withAttr('value', studyType)
            }, STUDYTYPES.map(key => m('option', {value:key, selected: key === studyType()},key))),
            studyType() !== 'Research' 
                ? ''
                : m('select.c-select', {
                    onchange: m.withAttr('value', studyDb)
                }, STUDYDBS.map(key => m('option', {value:key},key)))
        ]);
    })
};
