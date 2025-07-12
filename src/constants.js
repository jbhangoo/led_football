// Game Constants
const Y_MAX = 20;
const X_MAX = 55;
const X_START = 5;
const Y_START = 7;
const X_ENDZONE = 5;
const FIRST_DOWN_YARDAGE = 10;
const GOAL_LINE_PIXEL = X_MAX - X_ENDZONE;
const YARDS_PER_PIXEL = GOAL_LINE_PIXEL / 80; // 80 yards to travel
const BLINKS = 3;
const BLINK_SPEED = 300;
const MOVE_DELAY = 500;
const MIN_DELAY = 150;

// Make constants globally available
window.constants = {
    Y_MAX, X_MAX, X_START, Y_START, X_ENDZONE,
    FIRST_DOWN_YARDAGE, GOAL_LINE_PIXEL, YARDS_PER_PIXEL,
    BLINKS, BLINK_SPEED, MOVE_DELAY, MIN_DELAY
};

// For backward compatibility
const { Y_MAX: yMax, X_MAX: xMax, X_START: xStart, Y_START: yStart, 
    X_ENDZONE: xEndzone, FIRST_DOWN_YARDAGE: firstDownYardage, 
    GOAL_LINE_PIXEL: goalLinePixel, YARDS_PER_PIXEL: yardsPerPixel, 
    BLINKS: blinks, BLINK_SPEED: blinkSpeed, 
    MOVE_DELAY: moveDelay, MIN_DELAY: minDelay } = window.constants;
