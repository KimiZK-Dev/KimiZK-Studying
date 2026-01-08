/**
 * Pomodoro Timer Module
 * Focus timer for study sessions
 */

import { CONFIG } from './config.js';
import { state } from './state.js';
import { ui } from './ui.js';
import { showToast } from './utils.js';

/**
 * Initialize Pomodoro timer
 */
export function initPomodoro() {
    if (ui.pomoStart) ui.pomoStart.onclick = togglePomodoro;
    if (ui.pomoReset) ui.pomoReset.onclick = resetPomodoro;
    renderTimer();
}

/**
 * Toggle Pomodoro timer (start/pause)
 */
export function togglePomodoro() {
    if (state.pomodoro.isRunning) {
        pausePomodoro();
    } else {
        startPomodoro();
    }
}

/**
 * Start Pomodoro timer
 */
function startPomodoro() {
    state.pomodoro.isRunning = true;
    updateStartButton(true);
    
    state.pomodoro.interval = setInterval(() => {
        state.pomodoro.timeLeft--;
        renderTimer();
        
        if (state.pomodoro.timeLeft <= 0) {
            completePomodoro();
        }
    }, 1000);
}

/**
 * Pause Pomodoro timer
 */
function pausePomodoro() {
    clearInterval(state.pomodoro.interval);
    state.pomodoro.isRunning = false;
    updateStartButton(false);
}

/**
 * Complete Pomodoro session
 */
function completePomodoro() {
    clearInterval(state.pomodoro.interval);
    state.pomodoro.isRunning = false;
    updateStartButton(false);
    
    const minutes = state.settings?.pomodoroMinutes || CONFIG.pomodoro.defaultMinutes;
    showToast(`Đã xong ${minutes} phút tập trung!`, { type: 'success', duration: 5000 });
}

/**
 * Reset Pomodoro timer
 */
export function resetPomodoro() {
    clearInterval(state.pomodoro.interval);
    state.pomodoro.isRunning = false;
    // Use settings if available, otherwise use config default
    const minutes = state.settings?.pomodoroMinutes || CONFIG.pomodoro.defaultMinutes;
    state.pomodoro.timeLeft = minutes * 60;
    updateStartButton(false);
    renderTimer();
}

/**
 * Set Pomodoro minutes from settings
 * @param {number} minutes
 */
export function setPomodoroMinutes(minutes) {
    // Only update if timer is not running
    if (!state.pomodoro.isRunning) {
        state.pomodoro.timeLeft = minutes * 60;
        renderTimer();
    }
}

/**
 * Render timer display
 */
export function renderTimer() {
    if (!ui.pomoTimer) return;
    
    const m = Math.floor(state.pomodoro.timeLeft / 60);
    const s = state.pomodoro.timeLeft % 60;
    ui.pomoTimer.textContent = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
}

/**
 * Update start button icon
 * @param {boolean} isRunning
 */
function updateStartButton(isRunning) {
    if (!ui.pomoStart) return;
    ui.pomoStart.innerHTML = isRunning
        ? '<i class="fas fa-pause"></i>'
        : '<i class="fas fa-play"></i>';
}
