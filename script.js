const Y_MAX = 20;
const X_MAX = 55;
const X_START = 5;              // start the runner 5 pixels from scrimmage
const Y_START = 7;
const X_ENDZONE = 5;            // make the end zone 5 pixels wide
const FIRST_DOWN_YARDAGE = 10;  // How many yards is a first down?

const GOAL_LINE_PIXEL = X_MAX - X_START - X_ENDZONE;
const YARDS_PER_PIXEL = GOAL_LINE_PIXEL / FIRST_DOWN_YARDAGE ;
const TURN_DELAY = 500; // Amount to delay between defenders' turns
const MIN_DELAY = 150; // Don't let the speed get too fast
const BLINKS = 3; // How many times to blink the LEDs after tackle
const BLINK_SPEED = 300;

var isPaused = false;
var defenderTimeoutId = null;

class LedFootball {
    constructor() {
        this.display = document.getElementById("display");
        this.gameRunning = false;
        this.playerPos = { x: X_START, y: Y_START }; // Starting position
        this.defenders = [];
        this.score = 0;
        this.curdown = 1;
        this.yardsToGo = FIRST_DOWN_YARDAGE;// Yards from the goal line
        this.gameSpeed = TURN_DELAY;
        this.leds = [];

        this.initDisplay();
        this.setupControls();
    }

    initDisplay() {
        // Create LED grid (50x37 approximate LEDs)
        this.leds = [];
        for (let y = 0; y < Y_MAX; y++) {
            this.leds[y] = [];
            for (let x = 0; x < X_MAX; x++) {
                const led = document.createElement("div");
                led.className = "field off";
                if (X_MAX - x < X_ENDZONE)
                    led.classList.add("end-zone");
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
        this.yardsToGo = FIRST_DOWN_YARDAGE;
        this.initialFormations();

        document.getElementById("startBtn").style.display = "none";
        document.getElementById("gameOver").innerHTML = "";

        this.updateDisplay();
        this.updateStats();
        this.moveDefenders();
    }

    initialFormations() {
        this.playerPos = {x: X_START, y: Y_START};
        /*
         * 4 defenders in a diamond position.
         * Either move horizontally or vertically.
         */
        this.defenders = [
            {x: 20, y: 5, dx: 0, dy: 1}, // High defender moves down
            {x: 10, y: 10, dx: 1, dy: 0}, // Front defender moves back
            {x: 20, y: 15, dx: 0, dy: -1}, // Low defender moves up
            {x: 35, y: 10, dx: -1, dy: 0} // Back defender moves forward
        ];
    }

    movePlayer(dx, dy) {
        if (!this.gameRunning) return;

        // Move player, limited by the boundaries
        const newX = Math.max(0, Math.min(X_MAX, this.playerPos.x + dx));
        const newY = Math.max(0, Math.min(Y_MAX, this.playerPos.y + dy));

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
        if (this.playerPos.x >= GOAL_LINE_PIXEL) {
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
            if (defender.x <= 0 || defender.x >= X_MAX) defender.dx *= -1;
            if (defender.y <= 0 || defender.y >= Y_MAX) defender.dy *= -1;

            // Slight homing behavior toward player
            const roll = Math.floor(Math.random() * 5);
            switch (roll) {
                case 0:
                    // Turn horizontally toward player
                    if (this.playerPos.x > defender.x) {
                        defender.dx = 1;
                    } else {
                        defender.dx = -1;
                    }
                    break;

                case 1:
                    // Turn vertically toward player
                    if (this.playerPos.y > defender.y) {
                        defender.dy = 1;
                    } else {
                        defender.dy = -1;
                    }
                    break;

                case 2:
                    // Turn 90 degrees
                    if (defender.dx === 0) {
                        defender.dx = defender.dy;
                        defender.dy = 0;
                    } else {
                        defender.dy = defender.dx;
                        defender.dx = 0;
                    }
                    break;

                case 3:
                    // Turn 180 degrees
                    if (defender.dx === 0) {
                        defender.dy = -defender.dy;
                    } else {
                        defender.dx = -defender.dx;
                    }
                    break;

                default:
                    // Continue in same direction
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

        // Update progress
        this.yardsToGo = FIRST_DOWN_YARDAGE - Math.round(this.playerPos.x / YARDS_PER_PIXEL);

        // a. Set the pause flag
        isPaused = true;

        // b. Stop any currently scheduled defender moves
        clearTimeout(defenderTimeoutId);

        // c. Tackling animation
        this.playOver();
    }

    touchdown() {
        this.score += 7;
        this.curdown = 1;
        this.yardsToGo = FIRST_DOWN_YARDAGE;
        this.playerPos.x = X_START;

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
        for (let y = 0; y < Y_MAX; y++) {
            for (let x = 0; x < X_MAX; x++) {
                this.leds[y][x].className = "field off";
                // Add end-zone class for x positions at the field end
                if (x >= GOAL_LINE_PIXEL) {
                    this.leds[y][x].classList.add("end-zone");
                }
            }
        }

        // Draw player (green)
        if (this.playerPos.y < Y_MAX && this.playerPos.x < X_MAX) {
            this.leds[this.playerPos.y][this.playerPos.x].className = "field player";
        }

        // Draw defenders (red)
        for (let defender of this.defenders) {
            const x = Math.round(defender.x);
            const y = Math.round(defender.y);
            if (y >= 0 && y < Y_MAX && x >= 0 && x < X_MAX) {
                this.leds[y][x].className = "field";
                // Add end-zone class for defenders in the end zone
                if (x >= GOAL_LINE_PIXEL) {
                    this.leds[y][x].classList.add("end-zone");
                }
            }
        }
    }

    updateStats() {
        document.getElementById("score").textContent = this.score;
        document.getElementById("downs").textContent = this.curdown;
        document.getElementById("yards").textContent = this.yardsToGo;
    }

    playOver() {
        endOfPlay([0, this]);
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
