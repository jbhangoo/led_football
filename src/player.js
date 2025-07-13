// Player Management
function movePlayer(dx, dy) {
    if (!gameState.gameRunning || gameState.isPaused) return;

    const newX = Math.max(0, Math.min(X_MAX, gameState.playerPos.x + dx));
    const newY = Math.max(0, Math.min(Y_MAX, gameState.playerPos.y + dy));

    gameState.playerPos.x = newX;
    gameState.playerPos.y = newY;
    gameState.curyard += dx*YARDS_PER_PIXEL;
    console.log('Moved ' + dx + ' to ' + gameState.curyard);

    // Check for collision with defenders
    if (checkCollisions()) {
        tackled();
        return;
    }

    // Check for touchdown
    if (gameState.playerPos.x >= X_GOAL_LINE) {
        if (gameState.curyard > TOTAL_YARDS) {
            touchdown();
        } else {
            firstdown();
        }
    }
}

function resetPlayer() {
    gameState.playerPos = { x: X_START, y: Y_START };
}

function getPlayerPosition() {
    return { ...gameState.playerPos };
}

function firstdown() {
    // Reset down status but let player keep running
    gameState.curdown = 1;
    gameState.yardsToGo = FIRST_DOWN_YARDAGE;
    gameState.playerPos.x = X_START;
}

function touchdown() {
    // Play stops at touchdown and resets
    gameState.score += 7;
    gameState.curdown = 1;
    gameState.curyard = 0;
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
