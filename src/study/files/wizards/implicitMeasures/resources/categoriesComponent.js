import elementComponent from './elementComponent.js';
import biatElementComponent from '../BIAT/biatElementComponent.js';
import epPrimeComponent from './primeComponent.js';
import epPrimeDesignComponent from './primeDesignComponent.js';
import {showClearOrReset, resetClearButtons} from './utilities.js';

let categoriesComponent = {
    controller:controller,
    view:view
};

function controller(settings, defaultSettings, clearElement) {
    return {reset, clear};

    function reset(curr_tab){showClearOrReset(settings[curr_tab], defaultSettings[curr_tab],'reset');}
    function clear(curr_tab){
        curr_tab.includes('StimulusCSS') ?
            showClearOrReset(settings[curr_tab], clearElement[1], 'clear')
            : showClearOrReset(settings[curr_tab], clearElement[0], 'clear');
    }
}

function view(ctrl, settings, defaultSettings, clearElement, taskType, currTab) {
    return m('div', [
        taskType === 'BIAT' ?
            m.component(biatElementComponent,{key:currTab}, settings,
                defaultSettings[currTab].stimulusMedia, defaultSettings[currTab].title.startStimulus)
            //in EP & AMP there is additional sub tab called Target/Prime Appearance, it needs a different component.
            : currTab.includes('StimulusCSS') ?
                m.component(epPrimeDesignComponent, taskType, settings, currTab)
                : taskType === 'EP' || taskType === 'AMP' ?
                    m.component(epPrimeComponent, {key:currTab}, settings, defaultSettings[currTab].mediaArray, taskType)
                    : m.component(elementComponent, {key:currTab}, settings, defaultSettings[currTab].stimulusMedia),
        m('hr')
        ,resetClearButtons(ctrl.reset, ctrl.clear, currTab)
    ]);
}

export default categoriesComponent;
