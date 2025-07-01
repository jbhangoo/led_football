const Y_MAX = 20;
const X_MAX = 55;
const X_START = 5;              // start the runner 5 pixels from scrimmage
const Y_START = 7;
const X_ENDZONE = 5;            // make the end zone 5 pixels wide
const FIRST_DOWN_YARDAGE = 10;  // How many yards is a first down?

const GOAL_LINE_PIXEL = X_MAX - X_ENDZONE;
const YARDS_PER_PIXEL = GOAL_LINE_PIXEL / FIRST_DOWN_YARDAGE;
const BLINKS = 3; // How many times to blink the LEDs after tackle
const BLINK_SPEED = 300;
const MOVE_DELAY = 500; // ms to pause between defenders' turns. This will adjust during game play
const MIN_DELAY = 150; // Don't let the defenders get too fast

/* Game play variables */
var game = undefined;
var isPaused = false;
var isKeyDown = false; // Prevent holding down the arrow keys

class LedFootball {
    constructor() {
        this.display = document.getElementById("display");
        this.gameRunning = false;
        this.playerPos = { x: X_START, y: Y_START }; // Starting position
        this.defenders = [];
        this.score = 0;
        this.curdown = 1;
        this.yardsToGo = FIRST_DOWN_YARDAGE; // Yards from the goal line
        this.gameSpeed = MOVE_DELAY;        // number of milliseconds between defender turns
        this.field = [];
        this.animationFrameId = null;
        this.lastTimestamp = 0;
        this.accumulator = 0;

        this.initDisplay();
        this.setupControls();
    }

    initDisplay() {
        // Create LED grid X_MAX x Y_MAX
        this.field = [];
        for (let y = 0; y <= Y_MAX; y++) {
            this.field[y] = [];
            for (let x = 0; x <= X_MAX; x++) {
                const led = document.createElement("div");
                led.className = "field off";
                if (x > GOAL_LINE_PIXEL) {
                    led.classList.add("end-zone");
                }
                led.style.left = x * 8 + "px";
                led.style.top = y * 8 + "px";
                this.display.appendChild(led);
                this.field[y][x] = led;
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

            // Prevent default for arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            if (!isPaused && !isKeyDown) {
                isKeyDown = true;
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
        document.addEventListener("keyup", (e) => {
            isKeyDown = false;
        });

    }


    gameStart() {
        document.getElementById("startBtn").style.display = "none";
        document.getElementById("gameOver").innerHTML = "";

        this.gameRunning = true;
        this.score = 0;
        this.curdown = 1;
        this.yardsToGo = FIRST_DOWN_YARDAGE;
        this.lastTimestamp = 0;
        this.accumulator = 0;
        isPaused = false;

        this.initialFormations();
        this.updateDisplay();
        this.updateStats();

        // Start the game loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    gameOver() {
        this.gameRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        document.getElementById("gameOver").innerHTML = "GAME OVER";
        document.getElementById("startBtn").style.display = "inline-block";
    }

    initialFormations() {
        this.playerPos = { x: X_START, y: Y_START };
        this.defenders = [
            { x: 20, y: 5, dx: 0, dy: 1 },
            { x: 10, y: 10, dx: 1, dy: 0 },
            { x: 20, y: 15, dx: 0, dy: -1 },
            { x: 35, y: 10, dx: -1, dy: 0 }
        ];
    }

    movePlayer(dx, dy) {
        if (!this.gameRunning) return;

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
    updateDefenders() {
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
            if (Math.abs(this.playerPos.x - defender.x) <= 1 &&
                Math.abs(this.playerPos.y - defender.y) <= 1) {
                this.tackled();
                return false; // Collision occurred
            }
        }
        return true; // No collision
    }

    gameLoop(timestamp = 0) {
        if (!this.gameRunning) return;

        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }

        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        if (!isPaused) {
            // Update game state at a fixed interval
            this.accumulator += deltaTime;
            const fixedTimeStep = this.gameSpeed;

            while (this.accumulator >= fixedTimeStep) {
                if (!this.updateDefenders()) {
                    break; // Stop updates if collision occurred
                }
                this.accumulator -= fixedTimeStep;
            }

            this.updateDisplay();
        }


        this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    tackled() {
        this.curdown++;
        if (this.curdown > 4) {
            this.gameOver();
            return;
        }

        // Update progress
        this.yardsToGo = FIRST_DOWN_YARDAGE - Math.round(this.playerPos.x / YARDS_PER_PIXEL);
        
        // Set the pause flag
        isPaused = true;

        // Stop the game loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Start tackling animation
        this.playOver();
    }

    touchdown() {
        this.score += 7;
        this.curdown = 1;
        this.yardsToGo = FIRST_DOWN_YARDAGE;
        this.playerPos.x = X_START;

        // Bump up the speed by reducing the delay
        this.gameSpeed = Math.max(MIN_DELAY, this.gameSpeed - 10);
        this.updateStats();
    }
    updateDisplay() {
        // Clear all LEDs
        for (let y = 0; y <= Y_MAX; y++) {
            for (let x = 0; x <= X_MAX; x++) {
                this.field[y][x].className = "field off";
                // Add end-zone class for x positions at the field end
                if (x > GOAL_LINE_PIXEL) {
                    this.field[y][x].classList.add("end-zone");
                }
            }
        }

        // Draw player (green)
        if (this.playerPos.y <= Y_MAX && this.playerPos.x <= X_MAX) {
            this.field[this.playerPos.y][this.playerPos.x].className = "field player";
        }

        // Draw defenders (red)
        for (let defender of this.defenders) {
            const x = Math.round(defender.x);
            const y = Math.round(defender.y);
            if (y >= 0 && y <= Y_MAX && x >= 0 && x <= X_MAX) {
                this.field[y][x].className = "field";
                // Add end-zone
                if (x > GOAL_LINE_PIXEL) {
                    this.field[y][x].classList.add("end-zone");
                }
            }
        }
    }
    updateStats() {
        document.getElementById("score").textContent = this.score;
        document.getElementById("downs").textContent = this.curdown;
        document.getElementById("yards").textContent = this.yardsToGo.toString();
    }
    playOver() {
        endOfPlay([0, this]);
    }
}

// "New Game" button click handler
function startGame() {
    if (!game) {
        game = new LedFootball();
    }
    game.gameStart();
}
