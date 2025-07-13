// Game Constants
const Y_MAX = 20;                                   // Width of the field
const X_MAX = 55;                                   // Length of the field (for first down distance)
const X_START = 0;                                  // start the runner this many pixels from start
const Y_START = 7;                                  // start the runner this many pixels from the top
const X_ENDZONE = 5;                                // make the end zone this many pixels wide
const TOTAL_YARDS = 100;
const FIRST_DOWN_YARDAGE = 10;
const X_GOAL_LINE = X_MAX - X_ENDZONE;              // First down distance in pixels
const YARDS_PER_PIXEL = FIRST_DOWN_YARDAGE / X_GOAL_LINE;  // Yards per "arrow" move

const BLINKS = 3;
const BLINK_SPEED = 300;
const MOVE_DELAY = 400;
const MIN_DELAY = 150;

// Make constants globally available
window.constants = {
    Y_MAX, X_MAX, X_START, Y_START, X_ENDZONE, TOTAL_YARDS, FIRST_DOWN_YARDAGE,
    X_GOAL_LINE, YARDS_PER_PIXEL, BLINKS, BLINK_SPEED, MOVE_DELAY, MIN_DELAY
};

// For backward compatibility
/*const { Y_MAX: yMax, X_MAX: xMax, X_START: xStart, Y_START: yStart,
    X_ENDZONE: xEndzone, GOAL_LINE_PIXEL: goalLinePixel,
    YARDS_PER_PIXEL: yardsPerPixel,
    TOTAL_YARDS: totalYards, FIRST_DOWN_YARDAGE: firstDownYardage,
    BLINKS: blinks, BLINK_SPEED: blinkSpeed, 
    MOVE_DELAY: moveDelay, MIN_DELAY: minDelay } = window.constants;
*/