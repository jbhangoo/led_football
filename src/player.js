// Player Management
function movePlayer(dx, dy) {
    if (!gameState.gameRunning || gameState.isPaused) return;

    const newX = Math.max(0, Math.min(X_MAX, gameState.playerPos.x + dx));
    const newY = Math.max(0, Math.min(Y_MAX, gameState.playerPos.y + dy));

    gameState.playerPos.x = newX;
    gameState.playerPos.y = newY;

    // Check for collision with defenders
    if (checkCollisions()) {
        tacklePlayer();
        return;
    }

    // Check for touchdown
    if (gameState.playerPos.x >= GOAL_LINE_PIXEL) {
        touchdown();
    }
}

function resetPlayer() {
    gameState.playerPos = { x: X_START, y: Y_START };
}

function getPlayerPosition() {
    return { ...gameState.playerPos };
}

function touchdown() {
    gameState.score += 7;
    gameState.curdown = 1;
    gameState.yardsToGo = FIRST_DOWN_YARDAGE;
    resetPlayer();

    // Increase game speed
    gameState.gameSpeed = Math.max(MIN_DELAY, gameState.gameSpeed - 10);
}

// Make functions globally available
window.player = {
    movePlayer,
    resetPlayer,
    getPlayerPosition
};
