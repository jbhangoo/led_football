function endOfPlay(args) {
    const blinkCount = args[0];
    const game = args[1];

    // Turn off all defender LEDs
    for (let y = 0; y <= Y_MAX; y++) {
        for (let x = 0; x <= X_MAX; x++) {
            game.field[y][x].className = "field off";
        }
    }

    // Keep player visible during blink
    if (game.playerPos.y <= Y_MAX && game.playerPos.x <= X_MAX) {
        game.field[game.playerPos.y][game.playerPos.x].className = "field player";
    }

    // Schedule the next frame
    setTimeout(() => {
        // Turn defender LEDs back on
        for (let defender of game.defenders) {
            const x = Math.round(defender.x);
            const y = Math.round(defender.y);
            if (y >= 0 && y <= Y_MAX && x >= 0 && x <= X_MAX) {
                game.field[y][x].className = "field";
                // Add end-zone
                if (x > GOAL_LINE_PIXEL) {
                    game.field[y][x].classList.add("end-zone");
                }
            }
        }

        // Keep player visible during blink
        if (game.playerPos.y <= Y_MAX && game.playerPos.x <= X_MAX) {
            game.field[game.playerPos.y][game.playerPos.x].className = "field player";
        }

        if (blinkCount < BLINKS - 1) {
            // Continue blinking
            setTimeout(() => endOfPlay([blinkCount + 1, game]), BLINK_SPEED);
        } else {
            // Finished blinking, resume game
            isPaused = false;
            game.updateStats();

            // Reset positions of defenders and player
            game.initialFormations();

            // Restart the game loop
            if (game.animationFrameId) {
                cancelAnimationFrame(game.animationFrameId);
            }
            game.animationFrameId = requestAnimationFrame((ts) => game.gameLoop(ts));
        }
    }, BLINK_SPEED);
}
