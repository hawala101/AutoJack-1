const puppeteer = require('puppeteer');
const axios = require('axios');
const querystring = require('querystring');
const { app, BrowserWindow } = require('electron');

let mainWindow;

const strategy_chart = {
    2: {
        5: 'HIT',
        6: 'HIT',
        7: 'HIT',
        8: 'HIT',
        9: 'HIT',
        10: 'x2',
        11: 'x2',
        12: 'HIT',
        13: 'STAND',
        14: 'STAND',
        15: 'STAND',
        16: 'STAND',
        17: 'STAND',
        18: 'STAND',
        19: 'STAND',
        '3/13': 'HIT',
        '4/14': 'HIT',
        '5/15': 'HIT',
        '6/16': 'HIT',
        '7/17': 'HIT',
        '8/18': 'STAND',
        '9/19': 'STAND',
        '10/20': 'STAND',
        22: 'SPLIT',
        33: 'SPLIT',
        44: 'HIT',
        55: 'x2',
        66: 'SPLIT',
        77: 'SPLIT',
        88: 'SPLIT',
        99: 'SPLIT',
        20: 'STAND',
        '2/12': 'SPLIT',
        '21': '21',
        '11/21': 'BJ!',
    },
    3: {
        5: 'HIT',
        6: 'HIT',
        7: 'HIT',
        8: 'HIT',
        9: 'x2',
        10: 'x2',
        11: 'x2',
        12: 'HIT',
        13: 'STAND',
        14: 'STAND',
        15: 'STAND',
        16: 'STAND',
        17: 'STAND',
        18: 'STAND',
        19: 'STAND',
        '3/13': 'HIT',
        '4/14': 'HIT',
        '5/15': 'HIT',
        '6/16': 'HIT',
        '7/17': 'HIT',
        '8/18': 'STAND',
        '9/19': 'STAND',
        '10/20': 'STAND',
        22: 'SPLIT',
        33: 'SPLIT',
        44: 'HIT',
        55: 'x2',
        66: 'SPLIT',
        77: 'SPLIT',
        88: 'SPLIT',
        99: 'SPLIT',
        20: 'STAND',
        '2/12': 'SPLIT',
        '21': '21',
        '11/21': 'BJ!',
    },
    4: {
        5: 'HIT',
        6: 'HIT',
        7: 'HIT',
        8: 'HIT',
        9: 'x2',
        10: 'x2',
        11: 'x2',
        12: 'STAND',
        13: 'STAND',
        14: 'STAND',
        15: 'STAND',
        16: 'STAND',
        17: 'STAND',
        18: 'STAND',
        19: 'STAND',
        '3/13': 'HIT',
        '4/14': 'HIT',
        '5/15': 'HIT',
        '6/16': 'HIT',
        '7/17': 'HIT',
        '8/18': 'STAND',
        '9/19': 'STAND',
        '10/20': 'STAND',
        22: 'SPLIT',
        33: 'SPLIT',
        44: 'HIT',
        55: 'x2',
        66: 'SPLIT',
        77: 'SPLIT',
        88: 'SPLIT',
        99: 'SPLIT',
        20: 'STAND',
        '2/12': 'SPLIT',
        '21': '21',
        '11/21': 'BJ!',
    },
    5: {
        5: 'HIT',
        6: 'HIT',
        7: 'HIT',
        8: 'HIT',
        9: 'x2',
        10: 'x2',
        11: 'x2',
        12: 'STAND',
        13: 'STAND',
        14: 'STAND',
        15: 'STAND',
        16: 'STAND',
        17: 'STAND',
        18: 'STAND',
        19: 'STAND',
        '3/13': 'HIT',
        '4/14': 'HIT',
        '5/15': 'HIT',
        '6/16': 'HIT',
        '7/17': 'HIT',
        '8/18': 'STAND',
        '9/19': 'STAND',
        '10/20': 'STAND',
        22: 'SPLIT',
        33: 'SPLIT',
        44: 'SPLIT',
        55: 'x2',
        66: 'SPLIT',
        77: 'SPLIT',
        88: 'SPLIT',
        99: 'SPLIT',
        20: 'STAND',
        '2/12': 'SPLIT',
        '21': '21',
        '11/21': 'BJ!',
    },
    6: {
        5: 'HIT',
        6: 'HIT',
        7: 'HIT',
        8: 'HIT',
        9: 'x2',
        10: 'x2',
        11: 'x2',
        12: 'STAND',
        13: 'STAND',
        14: 'STAND',
        15: 'STAND',
        16: 'STAND',
        17: 'STAND',
        18: 'STAND',
        19: 'STAND',
        '3/13': 'HIT',
        '4/14': 'HIT',
        '5/15': 'HIT',
        '6/16': 'HIT',
        '7/17': 'HIT',
        '8/18': 'STAND',
        '9/19': 'STAND',
        '10/20': 'STAND',
        22: 'SPLIT',
        33: 'SPLIT',
        44: 'SPLIT',
        55: 'x2',
        66: 'SPLIT',
        77: 'SPLIT',
        88: 'SPLIT',
        99: 'SPLIT',
        20: 'STAND',
        '2/12': 'SPLIT',
        '21': '21',
        '11/21': 'BJ!',
    },
    7: {
        5: 'HIT',
        6: 'HIT',
        7: 'HIT',
        8: 'HIT',
        9: 'HIT',
        10: 'x2',
        11: 'x2',
        12: 'HIT',
        13: 'HIT',
        14: 'HIT',
        15: 'HIT',
        16: 'HIT',
        17: 'STAND',
        18: 'STAND',
        19: 'STAND',
        '3/13': 'HIT',
        '4/14': 'HIT',
        '5/15': 'HIT',
        '6/16': 'HIT',
        '7/17': 'HIT',
        '8/18': 'STAND',
        '9/19': 'STAND',
        '10/20': 'STAND',
        22: 'SPLIT',
        33: 'SPLIT',
        44: 'HIT',
        55: 'x2',
        66: 'HIT',
        77: 'SPLIT',
        88: 'SPLIT',
        99: 'STAND',
        20: 'STAND',
        '2/12': 'SPLIT',
        '21': '21',
        '11/21': 'BJ!',
    },
    8: {
        5: 'HIT',
        6: 'HIT',
        7: 'HIT',
        8: 'HIT',
        9: 'HIT',
        10: 'x2',
        11: 'x2',
        12: 'HIT',
        13: 'HIT',
        14: 'HIT',
        15: 'HIT',
        16: 'HIT',
        17: 'STAND',
        18: 'STAND',
        19: 'STAND',
        '3/13': 'HIT',
        '4/14': 'HIT',
        '5/15': 'HIT',
        '6/16': 'HIT',
        '7/17': 'HIT',
        '8/18': 'STAND',
        '9/19': 'STAND',
        '10/20': 'STAND',
        22: 'HIT',
        33: 'HIT',
        44: 'HIT',
        55: 'x2',
        66: 'HIT',
        77: 'HIT',
        88: 'SPLIT',
        99: 'SPLIT',
        20: 'STAND',
        '2/12': 'SPLIT',
        '21': '21',
        '11/21': 'BJ!',
    },
    9: {
        5: 'HIT',
        6: 'HIT',
        7: 'HIT',
        8: 'HIT',
        9: 'HIT',
        10: 'x2',
        11: 'x2',
        12: 'HIT',
        13: 'HIT',
        14: 'HIT',
        15: 'HIT',
        16: 'HIT',
        17: 'STAND',
        18: 'STAND',
        19: 'STAND',
        '3/13': 'HIT',
        '4/14': 'HIT',
        '5/15': 'HIT',
        '6/16': 'HIT',
        '7/17': 'HIT',
        '8/18': 'HIT',
        '9/19': 'STAND',
        '10/20': 'STAND',
        22: 'HIT',
        33: 'HIT',
        44: 'HIT',
        55: 'x2',
        66: 'HIT',
        77: 'HIT',
        88: 'SPLIT',
        99: 'SPLIT',
        20: 'STAND',
        '2/12': 'SPLIT',
        '21': '21',
        '11/21': 'BJ!',
    },
    10: {
        5: 'HIT',
        6: 'HIT',
        7: 'HIT',
        8: 'HIT',
        9: 'HIT',
        10: 'HIT',
        11: 'HIT',
        12: 'HIT',
        13: 'HIT',
        14: 'HIT',
        15: 'HIT',
        16: 'HIT',
        17: 'STAND',
        18: 'STAND',
        19: 'STAND',
        '3/13': 'HIT',
        '4/14': 'HIT',
        '5/15': 'HIT',
        '6/16': 'HIT',
        '7/17': 'HIT',
        '8/18': 'HIT',
        '9/19': 'STAND',
        '10/20': 'STAND',
        22: 'HIT',
        33: 'HIT',
        44: 'HIT',
        55: 'HIT',
        66: 'HIT',
        77: 'HIT',
        88: 'HIT',
        99: 'STAND',
        20: 'STAND',
        '2/12': 'SPLIT',
        '21': '21',
        '11/21': 'BJ!',
    },
    A: {
        5: 'HIT',
        6: 'HIT',
        7: 'HIT',
        8: 'HIT',
        9: 'HIT',
        10: 'HIT',
        11: 'HIT',
        12: 'HIT',
        13: 'HIT',
        14: 'HIT',
        15: 'HIT',
        16: 'HIT',
        17: 'STAND',
        18: 'STAND',
        19: 'STAND',
        '3/13': 'HIT',
        '4/14': 'HIT',
        '5/15': 'HIT',
        '6/16': 'HIT',
        '7/17': 'HIT',
        '8/18': 'HIT',
        '9/19': 'STAND',
        '10/20': 'STAND',
        22: 'HIT',
        33: 'HIT',
        44: 'HIT',
        55: 'HIT',
        66: 'HIT',
        77: 'HIT',
        88: 'HIT',
        99: 'STAND',
        20: 'STAND',
        '2/12': 'SPLIT',
        '21': '21',
        '11/21': 'BJ!',
    },
};

function convertCard(cardValue) {
    cardValue = parseInt(cardValue, 10); // Convert string to integer explicitly

    if (cardValue > 99) { 
        cardValue -= 100;
    }

    if (cardValue > 38) {
        cardValue -= 39;
    } else if (cardValue > 25) {
        cardValue -= 26;
    } else if (cardValue > 12) {
        cardValue -= 13;
    }

    if (cardValue === 12) {
        cardValue = 'A';
    } else if (cardValue > 7) {
        cardValue = 10;
    } else {
        cardValue += 2;
    }

    return cardValue;
}

function checkPairs(hand, decision) {
    return hand.length === 2 && hand[0] === hand[1] ? hand[0] * 11 : decision;
}


function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile('Pulsz.html');
  //mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


async function run() {
    // Get webSocketDebuggerUrl
    const response = await axios.get('http://127.0.0.1:9222/json/version');
    const webSocketDebuggerUrl = response.data.webSocketDebuggerUrl;

    // Connect to the browser
    const browser = await puppeteer.connect({
        browserWSEndpoint: webSocketDebuggerUrl,
        defaultViewport: null,
    });

    console.log('Connecting to the browser...');
    const pages = await browser.pages();
    const targetPage = pages.find((page) => page.url().includes('pulsz'));
    if (!targetPage) {
        throw new Error('Target page not found');
    }
    console.log('Connected to the target page.');

    // Intercept and log network requests
    targetPage.on('response', async (response) => {
        const url = response.url();
        if (url.includes('gameService')) {
            //console.log('gameService Response:', url);
            const gameServicePacket = await response.text();
            updateGameState(gameServicePacket);
        }
    });

    console.log('Listening to gameService packets...');
}

function getCurrentHand(hnd) {
    if (hnd === '0') return 'hand0';
    if (hnd === '2') return 'hand2';
    if (hnd === '4') return 'hand3';
    return null;  // default case if no hand is active
}

function getIdealMove(decision, dealerCard) {
    dealerCard = String(dealerCard);

    if (strategy_chart.hasOwnProperty(dealerCard)) {
        const decisionChart = strategy_chart[dealerCard];
        decision = String(decision);

        // Check if the specific player decision is in the decision chart
        if (decisionChart.hasOwnProperty(decision)) {
            const idealMove = decisionChart[decision];
            return idealMove;
        } else {
            console.log("No decision found for this player hand:", decision);
            return "X"; //or default move
        }
    } else {
        console.log("No entries for this dealer card:", dealerCard);
        return "X"; //or default move
    }
}


function updateGameState(gameServicePacket) {
    try {
        const data = querystring.parse(gameServicePacket.replace(/&amp;/g, '&'));
        console.log('data:', data);
        const currentHand = getCurrentHand(data.hnd);
        console.log('Active hand:', currentHand);
        let dealerUpCard = data.cd.split(',')[0];
        dealerUpCard = convertCard(dealerUpCard);
        console.log('Dealer up card:', dealerUpCard);

        const hands = [data.cp0, data.cp1, data.cp2, data.cp3, data.cp4, data.cp5];
        const moves = [];

        hands.forEach((handData, index) => {
            if (handData && typeof handData === 'string' && handData.trim() !== '') {
                const hand = handData.split(',').map(card => convertCard(card));
                console.log(`Hand ${index}:`, hand);
                let decision = data[`sp${index}`];
                if (hand.length === 2 && hand[0] === hand[1] && decision != 20) {
                    decision = checkPairs(hand, decision);
                }
                console.log(`Decision ${index}:`, decision);
                const move = getIdealMove(decision, dealerUpCard);
                console.log(`Move ${index}:`, move)
                moves[index] = move;
            }
        });

        if (mainWindow && !mainWindow.isDestroyed()) {
            console.log("Updating hands/moves");
            let valid_hands = [];
            let valid_moves = [];
            hands.forEach((hand, index) => {
                if (hand && hand.trim() !== '') {
                    hand = hand.split(',').map(card => convertCard(card));
                    valid_hands.push(hand);
                    valid_moves.push(moves[index]);
                }
            });
        
            valid_hands.reverse();
            valid_moves.reverse();
            console.log(valid_hands);
            console.log(valid_moves);
            mainWindow.webContents.send('update-hands', { valid_hands, valid_moves });
        }
        
    } catch (error) {
        console.error('Error updating game state:', error);
    }
}




run().catch(console.error);
