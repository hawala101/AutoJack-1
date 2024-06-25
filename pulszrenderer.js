const { ipcRenderer } = require('electron');

ipcRenderer.on('update-hands', (event, data) => {
    const container = document.getElementById('handsContainer');
    container.innerHTML = ''; // Clear existing content

    data.valid_hands.forEach((hand, index) => {
        const move = data.valid_moves[index];
        const handText = hand.join(', '); // Convert hand array to a string
        const column = document.createElement('div');
        column.className = 'column';
        column.innerHTML = `<div class="hand">${handText || 'None'}</div><div class="move">${move || '—'}</div>`;
        container.appendChild(column);
    });
});
