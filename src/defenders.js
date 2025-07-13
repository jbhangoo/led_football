// Defenders Management
function moveDefenders() {
    // First, check for collisions without moving
    for (let defender of gameState.defenders) {
        if (Math.abs(gameState.playerPos.x - defender.x) <= 1 &&
            Math.abs(gameState.playerPos.y - defender.y) <= 1) {
            return false; // Collision detected, stop further processing
        }
    }
    
    // If no collision, move defenders
    for (let defender of gameState.defenders) {
        
        // Move defender
        defender.x += defender.dx;
        defender.y += defender.dy;

        // Bounce off walls with position correction
        if (defender.x <= 0 || defender.x >= X_MAX) {
            defender.dx *= -1;
            defender.x = Math.max(0, Math.min(X_MAX, defender.x));
        }
        if (defender.y <= 0 || defender.y >= Y_MAX) {
            defender.dy *= -1;
            defender.y = Math.max(0, Math.min(Y_MAX, defender.y));
        }

        // Change direction with random probability
        const r = Math.random();
        if (r < 0.3) {
            // 30%: Turn horizontally toward player
            if (gameState.playerPos.x > defender.x) {
                defender.dx = 1;
                defender.dy = 0;
            } else {
                defender.dx = -1;
                defender.dy = 0;
            }
        } else if (r < 0.6) {
            // 30%: Turn vertically toward player
            if (gameState.playerPos.y > defender.y) {
                defender.dy = 1;
                defender.dx = 0;
            } else {
                defender.dy = -1;
                defender.dx = 0;
            }
        } else if (r < 0.70) {
            // 10%: Turn 90 degrees right
            if (defender.dx === 0) {
                defender.dx = defender.dy;
                defender.dy = 0;
            } else {
                defender.dy = defender.dx;
                defender.dx = 0;
            }
        } else if (r < 0.80) {
            // 10%: Turn 90 degrees left
            if (defender.dx === 0) {
                defender.dx = -defender.dy;
                defender.dy = 0;
            } else {
                defender.dy = -defender.dx;
                defender.dx = 0;
            }
        } else if (r < 0.90) {
            // 10%: Turn around (180 degrees)
            defender.dx = -defender.dx;
            defender.dy = -defender.dy;
        } else {
            // 10%: No change, continue as before
        }

    }

    // Check for collisions after movement
    for (let defender of gameState.defenders) {
        if (Math.abs(gameState.playerPos.x - defender.x) <= 1 &&
            Math.abs(gameState.playerPos.y - defender.y) <= 1) {
            // Revert all defenders' positions
            return false; // Collision detected
        }
    }

    return true; // No collision
}

function checkCollisions() {
    for (let defender of gameState.defenders) {
        if (Math.abs(gameState.playerPos.x - defender.x) <= 1 &&
            Math.abs(gameState.playerPos.y - defender.y) <= 1) {
            return true; // Collision occurred
        }
    }
    return false; // No collision
}

function tackled() {
    gameState.curdown++;
    if (gameState.curdown > 4) {
        gameState.gameOver();
        return;
    }

    // Update progress
    gameState.yardsToGo = FIRST_DOWN_YARDAGE - Math.round(gameState.playerPos.x / (X_GOAL_LINE / FIRST_DOWN_YARDAGE));
    
    // Set the pause flag
    gameState.isPaused = true;

    // Stop the game loop
    if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
        gameState.animationFrameId = null;
    }

    // Start tackling animation
    if (gameState.playOver) {
        gameState.playOver();
    }
}

function resetDefenders() {
    gameState.defenders = [
        { x: 20, y: 5, dx: 1, dy: 0 },      // Left Linebacker; Goes Back
        { x: 10, y: 10, dx: 0, dy: -1 },    // Nose Guard; Goes Right
        { x: 20, y: 15, dx: -1, dy: 0 },    // Right Linebacker; Rushes Forward
        { x: 35, y: 10, dx: 0, dy: 1 }      // Safety; Goes Left
    ];
}

// Make functions globally available
window.defenders = {
    moveDefenders,
    checkCollisions,
    tackled,
    resetDefenders
};
