function endOfPlay(args) {
    const blinkCount = args[0];
    const gamestate = args[1];

    // Turn off all defender LEDs
    for (let y = 0; y <= Y_MAX; y++) {
        for (let x = 0; x <= X_MAX; x++) {
            field[y][x].className = "field off";
        }
    }

    // Keep player visible during blink
    if (gamestate.playerPos.y <= Y_MAX && gamestate.playerPos.x <= X_MAX) {
        field[gamestate.playerPos.y][gamestate.playerPos.x].className = "field player";
    }

    // Schedule the next frame
    setTimeout(() => {
        // Turn defender LEDs back on
        for (let defender of gamestate.defenders) {
            const x = Math.round(defender.x);
            const y = Math.round(defender.y);
            if (y >= 0 && y <= Y_MAX && x >= 0 && x <= X_MAX) {
                field[y][x].className = "field";
                // Add end-zone
                if (x > X_GOAL_LINE) {
                    field[y][x].classList.add("end-zone");
                }
            }
        }

        // Keep player visible during blink
        if (gamestate.playerPos.y <= Y_MAX && gamestate.playerPos.x <= X_MAX) {
            field[gamestate.playerPos.y][gamestate.playerPos.x].className = "field player";
        }

        if (blinkCount < BLINKS - 1) {
            // Continue blinking
            setTimeout(() => endOfPlay([blinkCount + 1, gamestate]), BLINK_SPEED);
        } else {
            // Finished blinking, resume gamestate
            gamestate.updateStats();

            // Reset positions of defenders and player
            gamestate.initialFormations();
            gamestate.isPaused = false;

            // Restart the gamestate loop
            if (gamestate.animationFrameId) {
                cancelAnimationFrame(gamestate.animationFrameId);
            }
            gamestate.animationFrameId = requestAnimationFrame((ts) => gamestate.gameLoop(ts));
        }
    }, BLINK_SPEED);
}
