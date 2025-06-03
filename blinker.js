function doBlink(args) {
    blinkCount = args[0];
    game = args[1];

    // Turn off all defender LEDs
    for (let y = 0; y < NROWS; y++) {
        for (let x = 0; x < NCOLS; x++) {
            game.leds[y][x].className = "led off";
        }
    }

    setTimeout(() => {
        // Turn defender LEDs back on
        for (let defender of game.defenders) {
            const x = Math.round(defender.x);
            const y = Math.round(defender.y);
            if (y >= 0 && y < NROWS && x >= 0 && x < NCOLS) {
                game.leds[y][x].className = "led";
            }
        }

        // Keep player visible during blink
        if (game.playerPos.y < NROWS && game.playerPos.x < NCOLS) {
            game.leds[game.playerPos.y][game.playerPos.x].className = "led player";
        }

        blinkCount++;
        if (blinkCount < BLINKS) {
            setTimeout(doBlink, BLINK_SPEED, [blinkCount, game]);
        } else {
            isPaused = false;
            game.updateStats();
            // Brief pause then continue the game loop
            defenderTimeoutId = setTimeout(() => game.moveDefenders(), game.gameSpeed);

            // Reset position of defenders that are near the player
            game.playerPos = { x: START_X, y: START_Y };
            for (let defender of game.defenders) {
                if (
                    Math.abs(game.playerPos.x - defender.x) <= HALO &&
                    Math.abs(game.playerPos.y - defender.y) <= HALO
                ) {
                    defender.x += 3 * HALO;
                }
            }
        }
    }, BLINK_SPEED);
}
