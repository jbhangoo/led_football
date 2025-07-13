// UI Management
function setupControls({ onUp, onDown, onLeft, onRight }) {
    // Touch controls
    document.getElementById("up").addEventListener("click", onUp);
    document.getElementById("down").addEventListener("click", onDown);
    document.getElementById("left").addEventListener("click", onLeft);
    document.getElementById("right").addEventListener("click", onRight);

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
        if (!gameState.gameRunning) return;

        // Prevent default for arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }

        if (!gameState.isPaused && !gameState.isKeyDown) {
            gameState.isKeyDown = true;
            switch (e.key) {
                case "ArrowUp":
                    onUp();
                    break;
                case "ArrowDown":
                    onDown();
                    break;
                case "ArrowLeft":
                    onLeft();
                    break;
                case "ArrowRight":
                    onRight();
                    break;
            }
        }
    });

    document.addEventListener("keyup", (e) => {
        gameState.isKeyDown = false;
    });

    // Start button
    document.getElementById("startBtn").addEventListener("click", () => {
        if (!gameState.gameRunning) {
            gameState.startGame();
        }
    });
}

function showGameOver() {
    document.getElementById("gameOver").innerHTML = "GAME OVER";
    document.getElementById("startBtn").style.display = "inline-block";
}

function hideStartButton() {
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("gameOver").innerHTML = "";
}

// Make functions globally available
window.ui = {
    setupControls,
    showGameOver,
    hideStartButton
};
