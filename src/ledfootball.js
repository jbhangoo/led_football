// Main Game Class
class LedFootball {
    constructor(displayElement) {
        // Initialize the game display
        createFieldGrid(displayElement);
        
        // Set up game controls
        setupControls({
            onUp: () => movePlayer(0, -1),
            onDown: () => movePlayer(0, 1),
            onLeft: () => movePlayer(-1, 0),
            onRight: () => movePlayer(1, 0),
        });
        
        // Store reference to playOver in gameState for blinker.js to access
        gameState.playOver = () => endOfPlay([0, gameState]);
    }
    
    startGame() {
        gameState.startGame();
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const game = new LedFootball(display);
    
    // Make startGame available globally for the HTML button
    window.startGame = () => game.startGame();
    
    // Also add event listener for better reliability
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => game.startGame());
    }
});
