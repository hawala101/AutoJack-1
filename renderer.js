const { ipcRenderer } = require('electron');

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

ipcRenderer.on('game-over', (event, { roundTotalBet, totalBet, totalWin, playthroughRate }) => {
    const rtpElement = document.getElementById('current-rtp');
    const unplayedInput = document.getElementById('unplayed-input');
    const estimatedTimeElement = document.getElementById('estimated-time');

    //const rtp = totalBet > 0 ? ((totalWin / totalBet) * 100).toFixed(2) : 0;
    const rtp = ((totalWin / totalBet) * 100).toFixed(2);
    rtpElement.textContent = `Current RTP: ${rtp}%`;

    let unplayedBalance = parseFloat(unplayedInput.value) || 0;
    unplayedBalance -= roundTotalBet;
    unplayedInput.value = unplayedBalance.toFixed(2);

    let timeLeft = (unplayedBalance / playthroughRate);

    // calculate time left based on amount of remaining chips and playthrough
    //estimatedTimeElement.textContent = `Estimated Time: ${(playthroughRate).toFixed(2)} hours`;
    estimatedTimeElement.textContent = `Estimated Time: ${timeLeft.toFixed(2)} hours`;
});
