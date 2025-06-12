function endOfPlay(args) {
    blinkCount = args[0];
    game = args[1];

    // Turn off all defender LEDs
    for (let y = 0; y <= Y_MAX; y++) {
        for (let x = 0; x <= X_MAX; x++) {
            game.field[y][x].className = "field off";
        }
    }

    setTimeout(() => {
        // Turn defender LEDs back on
        for (let defender of game.defenders) {
            const x = Math.round(defender.x);
            const y = Math.round(defender.y);
            if (y >= 0 && y <= Y_MAX && x >= 0 && x <= X_MAX) {
                game.field[y][x].className = "field";
                // Add end-zone
                if (x > GOAL_LINE_PIXEL) {
                    this.field[y][x].classList.add("end-zone");
                }
            }
        }

        // Keep player visible during blink
        if (game.playerPos.y <= Y_MAX && game.playerPos.x <= X_MAX) {
            game.field[game.playerPos.y][game.playerPos.x].className = "field player";
        }

        blinkCount++;
        if (blinkCount < BLINKS) {
            setTimeout(endOfPlay, BLINK_SPEED, [blinkCount, game]);
        } else {
            isPaused = false;
            game.updateStats();
            // Brief pause then continue the game loop
            defenderTimeoutId = setTimeout(() => game.moveDefenders(), game.gameSpeed);

            // Reset positions of defenders and player
            game.initialFormations();
        }
    }, BLINK_SPEED);
}
