// Game State Management
const gameState = {
    // Game state
    display: null,
    gameRunning: false,
    isPaused: false,
    isKeyDown: false,
    playerPos: { x: X_START, y: Y_START },
    defenders: [],
    score: 0,
    curdown: 1,
    curyard: X_START*YARDS_PER_PIXEL,
    yardsToGo: FIRST_DOWN_YARDAGE,
    gameSpeed: MOVE_DELAY,
    lastTimestamp: 0,
    accumulator: 0,
    animationFrameId: null,

    initialFormations() {
        this.playerPos = { x: X_START, y: Y_START };
        this.defenders = [
            { x: 20, y: 5, dx: 0, dy: 1 },
            { x: 10, y: 10, dx: 1, dy: 0 },
            { x: 20, y: 15, dx: 0, dy: -1 },
            { x: 35, y: 10, dx: -1, dy: 0 }
        ];
    },
    // Game loop
    gameLoop(timestamp = 0) {
        if (!this.gameRunning) return;

        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }

        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        if (!this.isPaused) {
            // Update game state at a fixed interval
            this.accumulator += deltaTime;
            const fixedTimeStep = this.gameSpeed;
            let collisionDetected = false;

            while (this.accumulator >= fixedTimeStep) {
                if (!moveDefenders()) {
                    collisionDetected = true;
                    break;
                }
                this.accumulator -= fixedTimeStep;
            }

            // Handle collision if one was detected
            if (collisionDetected) {
                tackled();
            }

            updateField();
            this.updateStats();
        }

        this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
    },

    // Game control methods
    startGame() {
        hideStartButton();
        this.gameRunning = true;
        this.score = 0;
        this.curdown = 1;
        this.curyard = 0;
        this.yardsToGo = FIRST_DOWN_YARDAGE;
        this.gameSpeed = MOVE_DELAY;
        this.lastTimestamp = 0;
        this.accumulator = 0;
        this.isPaused = false;

        resetPlayer();
        resetDefenders();
        updateField();
        this.updateStats();

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
    },

    gameOver() {
        this.gameRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        showGameOver();
    },

    // Method to be called when the play is over (after tackle animation)
    playOver() {
        if (!this.gameRunning) return;
        
        // Reset positions
        this.initialFormations();
        
        // Update the display
        updateField();
        this.updateStats();
        
        // Clear any pending animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Reset game state
        this.isPaused = false;
        this.lastTimestamp = 0;
        this.accumulator = 0;
        
        // Start a new game loop with a small delay
        if (this.gameRunning) {
            // Add a small delay to ensure all state is properly reset
            setTimeout(() => {
                if (this.gameRunning) {
                    this.animationFrameId = requestAnimationFrame((ts) => {
                        this.lastTimestamp = 0;
                        this.accumulator = 0;
                        this.gameLoop(ts);
                    });
                }
            }, 100);
        }
    },

    updateStats() {
        document.getElementById("score").textContent = this.score;
        document.getElementById("downs").textContent = this.curdown;
        document.getElementById("yards").textContent = this.yardsToGo.toString();
        document.getElementById("line").textContent = Math.round(this.curyard * 10) / 10;
    }
};

// Make gameState globally available
window.gameState = gameState;