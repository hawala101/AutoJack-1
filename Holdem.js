const puppeteer = require('puppeteer');
const axios = require('axios');
const { app, BrowserWindow, ipcMain } = require('electron');
const { log } = console;  // Simplified logging

let mainWindow;
let isGameActive = false;
let playerCards = [];
let communityCards = [];
let roundSummary = {
    totalBet: 0,
    totalWin: 0,
    balanceBefore: 0,
    balanceAfter: 0,
};
let totalBet = 0;  // Running total of amount bet
let totalWin = 0;  // Running total of amount won

let gamesWon = 0;
let gamesLost = 0;
let gamesTied = 0;

let startTime = Date.now();

function calculatePlaythroughRate(totalBet) {
    const elapsedTime = (Date.now() - startTime) / (1000 * 60 * 60); // in hours
    return totalBet / elapsedTime;
}

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 200, // Set the height to 200px
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('Holdem.html');
}

function isCard(card) {
    const ranks = '123456789tjqka';
    const suits = 'hsdc';
    const rank = card.rank.toLowerCase();
    const suit = card.suit.toLowerCase();
    return ranks.includes(rank) && suits.includes(suit);
}

function convertCard(card) {
    const ranks = '23456789tjqk1';
    const suits = 'hsdc';
    const rank = card.rank.toLowerCase();
    const suit = card.suit.toLowerCase();
    return ranks.indexOf(rank) + 13 * suits.indexOf(suit);
}

function formatCard(card) {
    const rankMap = { '10': 't', 'J': 'j', 'Q': 'q', 'K': 'k', 'A': 'a' };
    const suitMap = { 'hearts': 'h', 'diamonds': 'd', 'clubs': 'c', 'spades': 's' };
    const rank = rankMap[card.rank] || card.rank.toLowerCase();
    const suit = suitMap[card.suit.toLowerCase()];
    return rank + suit;
}

function evaluateHandRank(playerCards) {
    const ranks = "23456789tjqka";
    const suited = (playerCards[0].suit.toLowerCase() === playerCards[1].suit.toLowerCase());
    const min = Math.min(ranks.indexOf(playerCards[0].rank.toLowerCase()), ranks.indexOf(playerCards[1].rank.toLowerCase()));
    const max = Math.max(ranks.indexOf(playerCards[0].rank.toLowerCase()), ranks.indexOf(playerCards[1].rank.toLowerCase()));

    if ((!suited) && (min === 0) && (max > 0) && (max < 6)) {
        return 'Fold';
    }
    return 'Call';
}

async function fetchEV(playerCards, communityCards) {
    const player = playerCards.map(formatCard).join(' ');
    const board = communityCards.map(formatCard).join(' ');

    const response = await axios.post(`https://www.beatingbonuses.com/holdembonus_exec.php?player=${player}&board=${board}`);
    const data = response.data.split('\n');

    const played = Number(data[0]);
    const won = Number(data[1]);
    const lost = Number(data[2]);
    const tied = Number(data[3]);

    return {
        played,
        won,
        lost,
        tied,
        winPercentage: (won / played) * 100,
        losePercentage: (lost / played) * 100,
        tiePercentage: (tied / played) * 100,
        ev: ((won - lost) / played)
    };
}

async function determineBestStrategy(playerCards, communityCards, round) {
    if (round === 'Pre-flop') {
        if (playerCards.length === 2) {
            const action = evaluateHandRank(playerCards);
            log(`Pre-flop - ${action}`);
            return { action, winPercentage: 0, losePercentage: 0, tiePercentage: 0 }; // No EV data pre-flop
        }
        log('Pre-flop - ERROR');
        return { action: 'ERROR', winPercentage: 0, losePercentage: 0, tiePercentage: 0 };
    }

    if (round === 'Flop' || round === 'Turn' || round === 'River') {
        const evData = await fetchEV(playerCards, communityCards);
        log(`${round} - EV Data:`, evData);

        const raise = (evData.losePercentage - evData.winPercentage) < 0.53;
        log("Lose minus Win")
        log(evData.losePercentage - evData.winPercentage)
        log(raise)
        const action = raise ? 'Raise' : 'Check';
        log(`${round} - Action: ${action}`);
        return { action, winPercentage: evData.winPercentage, losePercentage: evData.losePercentage, tiePercentage: evData.tiePercentage };
    }

    return { action: 'Play?', winPercentage: 0, losePercentage: 0, tiePercentage: 0 };
}

/*
async function run() {
    // Get webSocketDebuggerUrl
    const response = await axios.get('http://127.0.0.1:9222/json/version');
    const webSocketDebuggerUrl = response.data.webSocketDebuggerUrl;

    const browser = await puppeteer.connect({
        browserWSEndpoint: webSocketDebuggerUrl,
        defaultViewport: null,
    });

    log('Connecting to browser');
    const pages = await browser.pages();
    log('Pages:', pages.map(page => page.url()));

    const targetPage = pages.find(page => page.url().includes('mcluck'));
    if (!targetPage) {
        log('Target page not found');
        return;
    }
    log('Connected to page:', targetPage.url());

    targetPage.on('response', async (response) => {
        if (response.url().includes('texasholdempoker3d')) {
            let text;
            try {
                text = await response.text();
            } catch (error) {
                log('Error fetching response body:', error);
                return;
            }

            let responseBody;
            try {
                responseBody = JSON.parse(text);
            } catch (error) {
                log('Error parsing response body:', error);
                return;
            }

            if (responseBody.spin) {
                const dealerStatus = responseBody.spin.dealer.status;
                const mutualCards = responseBody.spin.dealer.mutual_cards;

                if (dealerStatus === 'PLAY' && !isGameActive) {
                    // New game starts
                    isGameActive = true;
                    log('New game started');
                }

                if (isGameActive) {
                    // Convert playerCards to array
                    playerCards = Object.values(responseBody.spin.hands[0].cards);
                    let round = '';

                    switch (dealerStatus) {
                        case 'PLAY':
                            if (Object.keys(mutualCards).length === 0) {
                                // Pre-flop
                                round = 'Pre-flop';
                                log('Pre-flop - Player Cards:', playerCards);
                            } else if (Object.keys(mutualCards).length === 3) {
                                // Flop
                                communityCards = Object.values(mutualCards);
                                round = 'Flop';
                                log('Flop - Community Cards:', communityCards);
                            } else if (Object.keys(mutualCards).length === 4) {
                                // Turn
                                communityCards = Object.values(mutualCards);
                                round = 'Turn';
                                log('Turn - Community Cards:', communityCards);
                            } else if (Object.keys(mutualCards).length === 5) {
                                // River
                                communityCards = Object.values(mutualCards);
                                round = 'River';
                                log('River - Community Cards:', communityCards);
                            }

                            // Call the strategy function
                            const { action, winPercentage, losePercentage, tiePercentage } = await determineBestStrategy(playerCards, communityCards, round);
                            log(`Action: ${action}`);

                            // Send the action to the renderer process
                            mainWindow.webContents.send('update-action', { action, round, winPercentage, losePercentage, tiePercentage });
                            break;
                        case 'GAMEOVER':
                            const roundTotalBet = responseBody.spin.total_bet;
                            const roundTotalWin = responseBody.spin.total_win;

                            totalBet += roundTotalBet;
                            totalWin += roundTotalWin;

                            const playthroughRate = calculatePlaythroughRate(totalBet);
                            console.log(`Playthrough Rate: ${playthroughRate.toFixed(2)} chips/hour`);

                            const win = roundTotalWin > 0 ? 1 : 0;
                            const lose = roundTotalWin === 0 ? 1 : 0;
                            let tie = 0;
                            if (win == 0 && lose == 0) {
                                tie = 1;
                            }

                            gamesWon += win;
                            gamesLost += lose;
                            gamesTied += tie;
                            log(gamesWon, gamesLost, gamesTied);

                            mainWindow.webContents.send('game-over', { roundTotalBet, totalBet, totalWin, playthroughRate, gamesWon, gamesLost, gamesTied });

                            playerCards = [];
                            communityCards = [];
                            isGameActive = false;
                            break;
                        default:
                            log('Unknown dealer status:', dealerStatus);
                    }
                }
            }
        }
    });
}
*/

async function run(game) {
    // Get webSocketDebuggerUrl
    const response = await axios.get('http://127.0.0.1:9222/json/version');
    const webSocketDebuggerUrl = response.data.webSocketDebuggerUrl;

    const browser = await puppeteer.connect({
        browserWSEndpoint: webSocketDebuggerUrl,
        defaultViewport: null,
    });

    log('Connecting to browser');
    const pages = await browser.pages();
    log('Pages:', pages.map(page => page.url()));

    const targetPage = pages.find(page => page.url().includes(game));
    if (!targetPage) {
        log('Target page not found');
        return;
    }
    log(`Connected to page: ${targetPage.url()} for game: ${game}`);

    targetPage.on('response', async (response) => {
        if (response.url().includes('texasholdempoker3d')) {
            let text;
            try {
                text = await response.text();
            } catch (error) {
                log('Error fetching response body:', error);
                return;
            }

            let responseBody;
            try {
                responseBody = JSON.parse(text);
            } catch (error) {
                log('Error parsing response body:', error);
                return;
            }

            if (responseBody.spin) {
                const dealerStatus = responseBody.spin.dealer.status;
                const mutualCards = responseBody.spin.dealer.mutual_cards;

                if (dealerStatus === 'PLAY' && !isGameActive) {
                    // New game starts
                    isGameActive = true;
                    log('New game started');
                }

                if (isGameActive) {
                    // Convert playerCards to array
                    playerCards = Object.values(responseBody.spin.hands[0].cards);
                    let round = '';

                    switch (dealerStatus) {
                        case 'PLAY':
                            if (Object.keys(mutualCards).length === 0) {
                                // Pre-flop
                                round = 'Pre-flop';
                                log('Pre-flop - Player Cards:', playerCards);
                            } else if (Object.keys(mutualCards).length === 3) {
                                // Flop
                                communityCards = Object.values(mutualCards);
                                round = 'Flop';
                                log('Flop - Community Cards:', communityCards);
                            } else if (Object.keys(mutualCards).length === 4) {
                                // Turn
                                communityCards = Object.values(mutualCards);
                                round = 'Turn';
                                log('Turn - Community Cards:', communityCards);
                            } else if (Object.keys(mutualCards).length === 5) {
                                // River
                                communityCards = Object.values(mutualCards);
                                round = 'River';
                                log('River - Community Cards:', communityCards);
                            }

                            // Call the strategy function
                            const { action, winPercentage, losePercentage, tiePercentage } = await determineBestStrategy(playerCards, communityCards, round);
                            log(`Action: ${action}`);

                            // Send the action to the renderer process
                            mainWindow.webContents.send('update-action', { action, round, winPercentage, losePercentage, tiePercentage });
                            break;
                        case 'GAMEOVER':
                            const roundTotalBet = responseBody.spin.total_bet;
                            const roundTotalWin = responseBody.spin.total_win;

                            totalBet += roundTotalBet;
                            totalWin += roundTotalWin;

                            const playthroughRate = calculatePlaythroughRate(totalBet);
                            console.log(`Playthrough Rate: ${playthroughRate.toFixed(2)} chips/hour`);

                            const win = roundTotalWin > 0 ? 1 : 0;
                            const lose = roundTotalWin === 0 ? 1 : 0;
                            let tie = 0;
                            if (win == 0 && lose == 0) {
                                tie = 1;
                            }

                            gamesWon += win;
                            gamesLost += lose;
                            gamesTied += tie;
                            log(gamesWon, gamesLost, gamesTied);

                            mainWindow.webContents.send('game-over', { roundTotalBet, totalBet, totalWin, playthroughRate, gamesWon, gamesLost, gamesTied });

                            playerCards = [];
                            communityCards = [];
                            isGameActive = false;
                            break;
                        default:
                            log('Unknown dealer status:', dealerStatus);
                    }
                }
            }
        }
    });
}


/*
app.whenReady().then(async () => {
    await createWindow();
    await run();
});
*/

ipcMain.on('start-connection', (event, game) => {
    run(game);
});


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

// Handle the 'update-action' event in the main process
ipcMain.on('update-action', (event, { action, round }) => {
    mainWindow.webContents.send('update-action', { action, round });
});
