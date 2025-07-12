// Field Management
let field = [];

function createFieldGrid(displayElement) {
    gameState.display = displayElement;
    
    // Clear any existing field
    while (displayElement.firstChild) {
        displayElement.removeChild(displayElement.firstChild);
    }
    
    // Create LED grid X_MAX x Y_MAX
    field = [];
    for (let y = 0; y <= Y_MAX; y++) {
        field[y] = [];
        for (let x = 0; x <= X_MAX; x++) {
            const led = document.createElement("div");
            led.className = "field off";
            if (x > GOAL_LINE_PIXEL) {
                led.classList.add("end-zone");
            }
            led.style.left = x * 8 + "px";
            led.style.top = y * 8 + "px";
            displayElement.appendChild(led);
            field[y][x] = led;
        }
    }
}

function updateField() {
    if (!gameState.gameRunning) return;

    // Clear all LEDs
    for (let y = 0; y <= Y_MAX; y++) {
        for (let x = 0; x <= X_MAX; x++) {
            field[y][x].className = "field off";
            // Add end-zone class for x positions at the field end
            if (x > GOAL_LINE_PIXEL) {
                field[y][x].classList.add("end-zone");
            }
        }
    }

    // Draw player (green)
    if (gameState.playerPos.y <= Y_MAX && gameState.playerPos.x <= X_MAX) {
        field[Math.round(gameState.playerPos.y)][Math.round(gameState.playerPos.x)].className = "field player";
    }

    // Draw defenders (red)
    for (let defender of gameState.defenders) {
        const x = Math.round(defender.x);
        const y = Math.round(defender.y);
        if (y >= 0 && y <= Y_MAX && x >= 0 && x <= X_MAX) {
            field[y][x].className = "field defender";
            // Add end-zone
            if (x > GOAL_LINE_PIXEL) {
                field[y][x].classList.add("end-zone");
            }
        }
    }
}
