import elementComponent from './elementComponent.js';
import biatElementComponent from '../BIAT/biatElementComponent.js';
import epPrimeComponent from '../EP/epPrimeComponent.js';
import epPrimeDesignComponent from '../EP/epPrimeDesignComponent.js';
import {showClearOrReset, resetClearButtons} from './utilities.js';


let categoriesComponent = {
    controller:controller,
    view:view
};

function controller(settings, defaultSettings, clearElement){

    return {reset, clear};

    function reset(curr_tab){showClearOrReset(settings[curr_tab], defaultSettings[curr_tab],'reset');}
    function clear(curr_tab){
        curr_tab === 'primeStimulusCSS' ? showClearOrReset(settings[curr_tab], {color:'#000000','font-size':'0em'}, 'clear')
            : showClearOrReset(settings[curr_tab], clearElement[0], 'clear');
    }
}

function view(ctrl, settings, defaultSettings, clearElement, subTabs, taskType, currTab) {
    return m('div', [
        taskType === 'BIAT' ?
            m.component(biatElementComponent,{key:currTab}, settings,
                defaultSettings[currTab].stimulusMedia, defaultSettings[currTab].title.startStimulus)
            : currTab === 'primeStimulusCSS' ? //in EP there is additional subtab called Prime Design, it needs different component.
                m.component(epPrimeDesignComponent, settings)
                : taskType === 'EP' ?
                    m.component(epPrimeComponent, {key:currTab}, settings, defaultSettings[currTab].mediaArray)
                    : m.component(elementComponent, {key:currTab}, settings, defaultSettings[currTab].stimulusMedia),
        m('hr')
        ,resetClearButtons(ctrl.reset, ctrl.clear, currTab)
    ]);
}

export default categoriesComponent;
