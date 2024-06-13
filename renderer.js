const { ipcRenderer } = require('electron');

let winCount = 0;
let loseCount = 0;
let tieCount = 0;

// Handle the "update-action" event from the main process
ipcRenderer.on('update-action', (event, { action, round, winPercentage, losePercentage, tiePercentage }) => {
    const raiseIndicator = document.getElementById('raise-indicator');
    const checkIndicator = document.getElementById('check-indicator');
    const winElement = document.getElementById('win-percentage');
    const loseElement = document.getElementById('lose-percentage');
    const tieElement = document.getElementById('tie-percentage');

    // Update percentages
    winElement.textContent = `Win: ${winPercentage.toFixed(2)}%`;
    loseElement.textContent = `Lose: ${losePercentage.toFixed(2)}%`;
    tieElement.textContent = `Tie: ${tiePercentage.toFixed(2)}%`;

    // Update indicators based on round and action
    if (round === 'Pre-flop') {
        if (action === 'Fold') {
            checkIndicator.classList.add('active');
            checkIndicator.textContent = 'Fold';
            raiseIndicator.classList.remove('active');
            raiseIndicator.textContent = 'Call';
        } else {
            raiseIndicator.classList.add('active');
            raiseIndicator.textContent = 'Call';
            checkIndicator.classList.remove('active');
            checkIndicator.textContent = 'Fold';
        }
    } else {
        if (action === 'Raise') {
            raiseIndicator.classList.add('active');
            raiseIndicator.textContent = 'Raise';
            checkIndicator.classList.remove('active');
            checkIndicator.textContent = 'Check';
        } else {
            checkIndicator.classList.add('active');
            checkIndicator.textContent = 'Check';
            raiseIndicator.classList.remove('active');
            raiseIndicator.textContent = 'Raise';
        }
    }
});

// Handle the "game-over" event from the main process
ipcRenderer.on('game-over', (event, { roundTotalBet, totalBet, totalWin, playthroughRate, gamesWon, gamesLost, gamesTied }) => {
    const rtpElement = document.getElementById('current-rtp');
    const unplayedInput = document.getElementById('unplayed-input');
    const estimatedTimeElement = document.getElementById('estimated-time');
    const winRecordElement = document.getElementById('win-record');
    const loseRecordElement = document.getElementById('lose-record');
    const tieRecordElement = document.getElementById('tie-record');

    // Update RTP
    const rtp = totalBet > 0 ? ((totalWin / totalBet) * 100).toFixed(2) : 0;
    rtpElement.textContent = `Current RTP: ${rtp}%`;

    // Update Unplayed balance
    let unplayedBalance = parseFloat(unplayedInput.value) || 0;
    unplayedBalance -= roundTotalBet;
    unplayedInput.value = unplayedBalance.toFixed(2);
    
    winRecordElement.textContent = `W: ${gamesWon}`;
    loseRecordElement.textContent = `L: ${gamesLost}`;
    tieRecordElement.textContent = `T: ${gamesTied}`;

    let timeLeft = unplayedBalance / playthroughRate;

    // Convert decimal hours to hours and minutes
    let hours = Math.floor(timeLeft);
    let minutes = Math.floor((timeLeft - hours) * 60);

    // Format hours and minutes
    let formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

    // Update the estimated time element
    estimatedTimeElement.textContent = `Estimated Time: ${formattedTime}`;
});

// Handle the "Connect" button click event
document.getElementById('start-button').addEventListener('click', () => {
    const game = document.getElementById('game-select').value;
    console.log(`Connect button pressed. Game selected: ${game}`);
    ipcRenderer.send('start-connection', game);
});

// Add listener for connection status
ipcRenderer.on('connection-status', (event, message) => {
    const connectionStatusElement = document.getElementById('connection-status');
    connectionStatusElement.textContent = message;
});
