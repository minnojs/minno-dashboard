function defaultSettings(external) {

    return {
        parameters: {
            keyTopLeft: 'E', keyTopRight: 'I', keyBottomLeft: 'C', keyBottomRight: 'N',
            base_url: {image: external ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/docs/images/' : './images'}
        },
        objectCat1: {
            name: 'Mammals', title: {media: {word: 'Mammals'}, css: {color: '#31b404', 'font-size': '2em'}, height: 8},
            stimulusMedia: [{word: 'Dogs'}, {word: 'Horses'}, {word: 'Lions'}, {word: 'Cows'}],
            stimulusCss: {color: '#31b404', 'font-size': '2em'}
        },
        objectCat2: {
            name: 'Birds', title: {media: {word: 'Birds'}, css: {color: '#31b404', 'font-size': '2em'}, height: 8},
            stimulusMedia: [{word: 'Pigeons'}, {word: 'Swans'}, {word: 'Crows'}, {word: 'Ravens'}],
            stimulusCss: {color: '#31b404', 'font-size': '2em'}
        },
        attribute1: {
            name: 'Unpleasant',
            title: {media: {word: 'Unpleasant'}, css: {color: '#0000FF', 'font-size': '2em'}, height: 8},
            stimulusMedia: [{word: 'Bomb'}, {word: 'Abuse'}, {word: 'Sadness'}, {word: 'Pain'}, {word: 'Poison'}, {word: 'Grief'}],
            stimulusCss: {color: '#0000FF', 'font-size': '2em'}
        },
        attribute2: {
            name: 'Pleasant',
            title: {media: {word: 'Pleasant'}, css: {color: '#0000FF', 'font-size': '2em'}, height: 8},
            stimulusMedia: [{word: 'Paradise'}, {word: 'Pleasure'}, {word: 'Cheer'}, {word: 'Wonderful'}, {word: 'Splendid'}, {word: 'Love'}],
            stimulusCss: {color: '#0000FF', 'font-size': '2em'}
        },
        blocks: {
            nBlocks: 3,
            nTrialsPerPrimeTargetPair: 10,
            randomCategoryLocation: true,
            randomAttributeLocation: false
        },
        text: {
            firstBlock:
                '<div><p style="font-size:18px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                'Put your left middle and index finger on the <b>keyTopLeft</b> and <b>keyBottomLeft</b> keys. ' +
                'Put your right middle and index finger on the <b>keyTopRight</b> and <b>keyBottomRight</b> keys. ' +
                'Pairs of stimuli will appear in the middle of the screen. ' +
                'Four pairs of categories will appear in the corners of the screen. ' +
                'Sort each pair of items to the corner in which their two categories appear. ' +
                'If you make an error, an <font color="#FF0000"><b>X</b></font> will appear until you hit the correct key. ' +
                'This is a timed sorting task. <b>GO AS FAST AS YOU CAN</b> while making as few mistakes as possible.' +
                '</color></p><p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                'press SPACE to begin</p><p style="font-size:14px; text-align:center; font-family:arial">' +
                '<color="000000">[Round 1 of 3]</p></div>',
            middleBlock:
                '<div><p style="font-size:18px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                'Press SPACE to continue with the same task.<br/><br/>' +
                'Sort each pair of items to the corner in which their two categories appear. ' +
                'If you make an error, an <font color="#FF0000"><b>X</b></font> will appear until you hit the correct key. ' +
                'This is a timed sorting task. <b>GO AS FAST AS YOU CAN</b> while making as few mistakes as possible.</p>' +
                '<p style="font-size:14px; text-align:center; font-family:arial">' +
                '<color="000000">[Round 2 of 3]</p></div>',
            lastBlock:
                '<div><p style="font-size:18px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                'This task can be a little exhausting. ' +
                'Try to challenge yourself to respond as quickly as you can without making mistakes.<br/><br/>' +
                'Press SPACE for the final round.</p><br/><br/>' +
                '<p style="font-size:14px; text-align:center; font-family:arial">' +
                '<color="000000">[Round 3 of 3]</p></div>'
        }
    };
}

export default defaultSettings;