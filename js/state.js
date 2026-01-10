/**
 * Global State Management
 * Centralized reactive state for the application
 */

import { CONFIG } from './config.js';

export const state = {
    // Course data grouped by topic: { "Topic Name": [videoObj, ...] }
    courseData: {},
    
    // Zip files map: { "Topic Name": [fileObj, ...] }
    zipFiles: {},
    
    // Flattened playlist for sequential navigation
    flatPlaylist: [],
    
    // Current video index in flatPlaylist
    currentIndex: -1,
    
    // Theme state
    isDark: false,
    
    // Pomodoro timer state
    pomodoro: {
        timeLeft: CONFIG.pomodoro.defaultMinutes * 60,
        interval: null,
        isRunning: false
    },
    
    // Learning statistics
    stats: {
        totalSeconds: 0,
        completedVideos: 0,
        dailyActivity: {}, // "2023-10-25": 120 (mins)
        lastTrackedDate: null, // Track date for daily reset
        dailySecondsBuffer: 0 // Seconds accumulated today before converting to minutes
    },
    
    // Watch history: [{ videoId, name, topic, timestamp, duration, lastWatched }, ...]
    watchHistory: []
};

/**
 * Reset course data
 */
export function resetCourseData() {
    state.courseData = {};
    state.zipFiles = {};
    state.flatPlaylist = [];
    state.currentIndex = -1;
}

/**
 * Get current video
 */
export function getCurrentVideo() {
    if (state.currentIndex < 0 || state.currentIndex >= state.flatPlaylist.length) {
        return null;
    }
    return state.flatPlaylist[state.currentIndex];
}
