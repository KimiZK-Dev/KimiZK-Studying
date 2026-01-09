/**
 * LocalStorage Operations
 * Centralized storage management with error handling
 */

import { CONFIG } from './config.js';
import { state } from './state.js';

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 */
export function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Storage save error:', e);
    }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any}
 */
export function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Storage load error:', e);
        return defaultValue;
    }
}

/**
 * Save notes for a video
 * @param {string} videoId - Video ID
 * @param {object} contents - Quill contents
 */
export function saveNotes(videoId, contents) {
    const allNotes = loadFromStorage(CONFIG.keys.NOTES_DATA, {});
    allNotes[videoId] = contents;
    saveToStorage(CONFIG.keys.NOTES_DATA, allNotes);
}

/**
 * Load notes for a video
 * @param {string} videoId - Video ID
 * @returns {object|null}
 */
export function loadNotes(videoId) {
    const allNotes = loadFromStorage(CONFIG.keys.NOTES_DATA, {});
    return allNotes[videoId] || null;
}

/**
 * Save statistics
 */
export function saveStats() {
    saveToStorage(CONFIG.keys.STATS, state.stats);
}

/**
 * Load statistics into state
 */
export function loadStats() {
    const stats = loadFromStorage(CONFIG.keys.STATS);
    if (stats) {
        state.stats = stats;
    }
}

/**
 * Save watch history
 */
export function saveHistory() {
    saveToStorage(CONFIG.keys.HISTORY, state.watchHistory);
}

/**
 * Load watch history
 */
export function loadHistory() {
    const history = loadFromStorage(CONFIG.keys.HISTORY);
    if (history) {
        state.watchHistory = history;
    }
}

/**
 * Save theme preference
 * @param {boolean} isDark
 */
export function saveTheme(isDark) {
    saveToStorage(CONFIG.keys.THEME, isDark);
}

/**
 * Load theme preference
 * @returns {boolean}
 */
export function loadTheme() {
    return loadFromStorage(CONFIG.keys.THEME, false);
}

/**
 * Check if tour has been seen
 * @returns {boolean}
 */
export function isTourSeen() {
    return !!localStorage.getItem(CONFIG.keys.TOUR_SEEN);
}

/**
 * Mark tour as seen
 */
export function markTourSeen() {
    localStorage.setItem(CONFIG.keys.TOUR_SEEN, 'true');
}

/**
 * Get default app settings
 * @returns {object}
 */
function getDefaultSettings() {
    return {
        autoPlay: true,
        pomodoroMinutes: 25,
        defaultSpeed: 1,
        theme: 'dark'
    };
}

/**
 * Save app settings
 * @param {object} settings
 */
export function saveAppSettings(settings) {
    saveToStorage(CONFIG.keys.SETTINGS, settings);
}

/**
 * Load app settings
 * @returns {object}
 */
export function loadAppSettings() {
    return loadFromStorage(CONFIG.keys.SETTINGS, getDefaultSettings());
}

/**
 * Save video progress (position and completion status)
 * @param {string} videoId
 * @param {number} currentTime - Current playback position in seconds
 * @param {number} duration - Total video duration
 * @param {boolean} completed - Whether video was watched completely
 */
export function saveVideoProgress(videoId, currentTime, duration, completed = false) {
    const allProgress = loadFromStorage(CONFIG.keys.VIDEO_PROGRESS, {});
    allProgress[videoId] = {
        currentTime,
        duration,
        completed,
        lastUpdated: Date.now()
    };
    saveToStorage(CONFIG.keys.VIDEO_PROGRESS, allProgress);
}

/**
 * Load video progress
 * @param {string} videoId
 * @returns {object|null} - { currentTime, duration, completed } or null
 */
export function loadVideoProgress(videoId) {
    const allProgress = loadFromStorage(CONFIG.keys.VIDEO_PROGRESS, {});
    return allProgress[videoId] || null;
}

/**
 * Mark video as completed
 * @param {string} videoId
 */
export function markVideoCompleted(videoId) {
    const allProgress = loadFromStorage(CONFIG.keys.VIDEO_PROGRESS, {});
    if (allProgress[videoId]) {
        allProgress[videoId].completed = true;
    } else {
        allProgress[videoId] = { completed: true, lastUpdated: Date.now() };
    }
    saveToStorage(CONFIG.keys.VIDEO_PROGRESS, allProgress);
}

/**
 * Check if video is completed
 * @param {string} videoId
 * @returns {boolean}
 */
export function isVideoCompleted(videoId) {
    const progress = loadVideoProgress(videoId);
    return progress?.completed || false;
}
