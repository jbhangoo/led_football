const NROWS = 20;
const NCOLS = 50;
const START_LINE = 20; // Which yard line to start at
const START_X = 5;
const START_Y = 7;
const GOAL_LINE = 45;
const TURN_DELAY = 500; // Controls speed of defenders turns
const MIN_DELAY = 150; // Don't let the speed get too fast
const BLINKS = 3; // How many times to blink the LEDs at end of play
const BLINK_SPEED = 300;
const HALO = 5; // Safety radius around player after tackle

var isPaused = false;
var defenderTimeoutId = null;

class LedFootball {
    constructor() {
        this.display = document.getElementById("display");
        this.gameRunning = false;
        this.playerPos = { x: START_X, y: START_Y }; // Starting position
        this.defenders = [];
        this.score = 0;
        this.curdown = 1;
        this.yardsToGo = 10;
        this.fieldPosition = START_LINE; // Yards from goal line
        this.gameSpeed = TURN_DELAY;
        this.leds = [];

        this.initDisplay();
        this.setupControls();
    }

    initDisplay() {
        // Create LED grid (50x37 approximate LEDs)
        this.leds = [];
        for (let y = 0; y < NROWS; y++) {
            this.leds[y] = [];
            for (let x = 0; x < NCOLS; x++) {
                const led = document.createElement("div");
                led.className = "led off";
                led.style.left = x * 8 + "px";
                led.style.top = y * 8 + "px";
                this.display.appendChild(led);
                this.leds[y][x] = led;
            }
        }
    }

    setupControls() {
        document.getElementById("up").addEventListener("click", () => this.movePlayer(0, -1));
        document.getElementById("down").addEventListener("click", () => this.movePlayer(0, 1));
        document.getElementById("left").addEventListener("click", () => this.movePlayer(-1, 0));
        document.getElementById("right").addEventListener("click", () => this.movePlayer(1, 0));

        // Keyboard controls
        document.addEventListener("keydown", (e) => {
            if (!this.gameRunning) return;

            if (!isPaused) {
                switch (e.key) {
                    case "ArrowUp":
                        this.movePlayer(0, -1);
                        break;
                    case "ArrowDown":
                        this.movePlayer(0, 1);
                        break;
                    case "ArrowLeft":
                        this.movePlayer(-1, 0);
                        break;
                    case "ArrowRight":
                        this.movePlayer(1, 0);
                        break;
                }
            }
        });
    }

    start() {
        this.gameRunning = true;
        this.score = 0;
        this.curdown = 1;
        this.yardsToGo = 10;
        this.fieldPosition = START_LINE;

        this.playerPos = { x: START_X, y: START_Y };
        /*
         * 4 defenders in a diamond position.
         * Either move horizontally or vertically.
         */
        this.defenders = [
            { x: 20, y: 5, dx: 0, dy: 1 }, // High defender moves down
            { x: 10, y: 10, dx: 1, dy: 0 }, // Front defender moves back
            { x: 20, y: 15, dx: 0, dy: -1 }, // Low defender moves up
            { x: 35, y: 10, dx: -1, dy: 0 } // Back defender moves forward
        ];

        document.getElementById("startBtn").style.display = "none";
        document.getElementById("gameOver").innerHTML = "";

        this.updateDisplay();
        this.updateStats();
        this.moveDefenders();
    }

    movePlayer(dx, dy) {
        if (!this.gameRunning) return;

        // Move player and check for the boundaries
        const newX = Math.max(0, Math.min(NCOLS, this.playerPos.x + dx));
        const newY = Math.max(0, Math.min(NROWS, this.playerPos.y + dy));

        this.playerPos.x = newX;
        this.playerPos.y = newY;

        // Check for collision with defenders
        for (let defender of this.defenders) {
            if (Math.abs(this.playerPos.x - defender.x) <= 1 && Math.abs(this.playerPos.y - defender.y) <= 1) {
                this.tackled();
                return;
            }
        }

        // Check for touchdown
        if (this.playerPos.x >= GOAL_LINE) {
            this.touchdown();
        }

        this.updateDisplay();
    }

    moveDefenders() {
        if (!this.gameRunning) return;
        if (isPaused) return;

        // Move defenders
        for (let defender of this.defenders) {
            defender.x += defender.dx;
            defender.y += defender.dy;

            // Bounce off walls
            if (defender.x <= 0 || defender.x >= NCOLS) defender.dx *= -1;
            if (defender.y <= 0 || defender.y >= NROWS) defender.dy *= -1;

            // Slight homing behavior toward player
            const roll = Math.floor(Math.random() * 5);
            switch (roll) {
                case 0:
                    // moving horizontally toward player
                    if (this.playerPos.x > defender.x) {
                        defender.dx = Math.abs(defender.dx);
                    } else {
                        defender.dx = -Math.abs(defender.dx);
                    }
                    break;

                case 1:
                    // moving vertically toward player
                    if (this.playerPos.y > defender.y) {
                        defender.dy = Math.abs(defender.dy);
                    } else {
                        defender.dy = -Math.abs(defender.dy);
                    }
                    break;

                case 2:
                    // Switch horizontal/vertical direction
                    if (defender.dx === 0) {
                        defender.dx = defender.dy;
                        defender.dy = 0;
                    } else {
                        defender.dy = defender.dx;
                        defender.dx = 0;
                    }
                    break;

                case 3:
                    // Reverse in current direction
                    if (defender.dx === 0) {
                        defender.dy = -defender.dy;
                    } else {
                        defender.dx = defender.dx;
                    }
                    break;

                default:
                    // Coninue moving in same direction
                    break;
            }
        }

        // Check collisions
        for (let defender of this.defenders) {
            if (Math.abs(this.playerPos.x - defender.x) <= 1 && Math.abs(this.playerPos.y - defender.y) <= 1) {
                this.tackled();
                return;
            }
        }

        this.updateDisplay();
        defenderTimeoutId = setTimeout(() => this.moveDefenders(), this.gameSpeed);
    }

    tackled() {
        this.curdown++;
        if (this.curdown > 4) {
            this.gameOver();
            return;
        }

        // a. Set the pause flag
        isPaused = true;

        // b. Stop any currently scheduled defender moves
        clearTimeout(defenderTimeoutId);

        // c. Tackling animation
        this.blinkDefenders();
    }

    touchdown() {
        this.score += 7;
        this.fieldPosition = START_LINE;
        this.curdown = 1;
        this.yardsToGo = 10;
        this.playerPos.x = START_X;

        // Add more defenders
        /* disable for now 
        this.defenders.push({
            x: Math.random() * 40 + 10,
            y: Math.random() * 30 + 3,
            dx: (Math.random() > 0.5 ? 1 : -1),
            dy: (Math.random() > 0.5 ? 1 : -1)
        });*/

        // Bump up the speed by reducing the delay
        this.gameSpeed = Math.max(MIN_DELAY, this.gameSpeed - 10);
        this.updateStats();
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById("gameOver").innerHTML = "GAME OVER";
        document.getElementById("startBtn").style.display = "inline-block";
    }

    updateDisplay() {
        // Clear all LEDs
        for (let y = 0; y < NROWS; y++) {
            for (let x = 0; x < NCOLS; x++) {
                this.leds[y][x].className = "led off";
            }
        }

        // Draw player (green)
        if (this.playerPos.y < NROWS && this.playerPos.x < NCOLS) {
            this.leds[this.playerPos.y][this.playerPos.x].className = "led player";
        }

        // Draw defenders (red)
        for (let defender of this.defenders) {
            const x = Math.round(defender.x);
            const y = Math.round(defender.y);
            if (y >= 0 && y < NROWS && x >= 0 && x < NCOLS) {
                this.leds[y][x].className = "led";
            }
        }
    }

    updateStats() {
        document.getElementById("score").textContent = this.score;
        document.getElementById("downs").textContent = this.curdown;
        document.getElementById("yards").textContent = this.yardsToGo;
    }

    blinkDefenders() {
        doBlink([0, this]);
    }
}

let game;

// "New Game" button click handler
function startGame() {
    if (!game) {
        game = new LedFootball();
    }
    game.start();
}

// Initialize the game when page loads
window.addEventListener("load", () => {
    game = new LedFootball();
});
