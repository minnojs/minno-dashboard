function defaultSettings(external) {

    return {
        parameters: {
            isQualtrics: false,
            base_url: {image: external ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/docs/images/' : './images'}
        },
        category: {
            name: 'Black people',
            title: {media: {word: 'Black people'}, css: {color: '#31b404', 'font-size': '2em'}, height: 4},
            stimulusMedia: [{word: 'Tayron'}, {word: 'Malik'}, {word: 'Terrell'}, {word: 'Jazamin'}, {word: 'Tiara'}, {word: 'Shanice'}],
            stimulusCss: {color: '#31b404', 'font-size': '2em'}
        },
        attribute1: {
            name: 'Unpleasant',
            title: {media: {word: 'Unpleasant'}, css: {color: '#31b404', 'font-size': '2em'}, height: 4},
            stimulusMedia: [{word: 'Bomb'}, {word: 'Abuse'}, {word: 'Sadness'}, {word: 'Pain'}, {word: 'Poison'}, {word: 'Grief'}],
            stimulusCss: {color: '#31b404', 'font-size': '2em'}
        },
        attribute2: {
            name: 'Pleasant',
            title: {media: {word: 'Pleasant'}, css: {color: '#31b404', 'font-size': '2em'}, height: 4},
            stimulusMedia: [{word: 'Paradise'}, {word: 'Pleasure'}, {word: 'Cheer'}, {word: 'Wonderful'}, {word: 'Splendid'}, {word: 'Love'}],
            stimulusCss: {color: '#31b404', 'font-size': '2em'}
        },
        trialsByBlock:
            [//Each object in this array defines a block
                {
                    instHTML: '',
                    block: 1,
                    miniBlocks: 1,
                    singleAttTrials: 10,
                    sharedAttTrials: 10,
                    categoryTrials: 0
                },
                {
                    instHTML: '',
                    block: 2,
                    miniBlocks: 2,
                    singleAttTrials: 10,
                    sharedAttTrials: 7,
                    categoryTrials: 7
                },
                {
                    instHTML: '',
                    block: 3,
                    miniBlocks: 2,
                    singleAttTrials: 10,
                    sharedAttTrials: 7,
                    categoryTrials: 7
                },
                {
                    instHTML: '',
                    block: 4,
                    miniBlocks: 2,
                    singleAttTrials: 10,
                    sharedAttTrials: 7,
                    categoryTrials: 7
                },
                {
                    instHTML: '',
                    block: 5,
                    miniBlocks: 2,
                    singleAttTrials: 10,
                    sharedAttTrials: 7,
                    categoryTrials: 7
                }
            ],
        blockOrder: 'random', //can be startRight/startLeft/random
        switchSideBlock: 4, //By default, we switch on block 4 (i.e., after blocks 2 and 3 showed the first pairing condition).
        text: {
            leftKeyText: 'Press "E" for',
            rightKeyText: 'Press "I" for',
            orKeyText: 'or',
            remindErrorText: '<p style="font-size:0.6em;font-family:arial sans-serif; text-align:center;">' +
                'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' +
                'Press the other key to continue.<p/>',
            finalText: 'You have completed this task<br/><br/>Press SPACE to continue.',
            instTemplatePractice: '<div><p align="center" style="font-size:20px; font-family:arial">' +
                '<font color="#000000"><u>Part blockNum of nBlocks</u><br/><br/></p>' +
                '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
                'Put a left finger on the <b>E</b> key for items that belong to the category ' +
                '<font color="#31b404">attribute1</font>.<br/>' +
                'Put a right finger on the <b>I</b> key for items that belong to the category ' +
                '<font color="#31b404">attribute2</font>.<br/>' +
                'Items will appear one at a time.<br/><br/>' +
                'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
                'Press the other key to continue.<br/><br/>' +
                '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
            instTemplateCategoryRight: '<div><p align="center" style="font-size:20px; font-family:arial">' +
                '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
                '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
                'Put a left finger on the <b>E</b> key for items that belong to the category ' +
                '<font color="#31b404">attribute1</font>.<br/>' +
                'Put a right finger on the <b>I</b> key for items that belong to the category ' +
                '<font color="#31b404">attribute2</font> ' +
                'and for items that belong to the category <font color="#31b404">thecategory</font>.<br/>' +
                'Items will appear one at a time.<br/><br/>' +
                'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
                'Press the other key to continue.<br/><br/>' +
                '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
            instTemplateCategoryLeft: '<div><p align="center" style="font-size:20px; font-family:arial">' +
                '<font color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
                '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
                'Put a left finger on the <b>E</b> key for items that belong to the category ' +
                '<font color="#31b404">attribute1</font> ' +
                'and for items that belong to the category <font color="#31b404">thecategory</font>.<br/>' +
                'Put a right finger on the <b>I</b> key for items that belong to the category ' +
                '<font color="#31b404">attribute2</font>.<br/>' +
                'Items will appear one at a time.<br/><br/>' +
                'If you make a mistake, a red <font color="#ff0000"><b>X</b></font> will appear. ' +
                'Press the other key to continue.<br/><br/>' +
                '<p align="center">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
        }
    };
}

export default defaultSettings;