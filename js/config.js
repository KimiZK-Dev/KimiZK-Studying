/**
 * Configuration & Constants
 * Centralized configuration for the E-Learning Platform
 */

export const CONFIG = {
    keys: {
        THEME: 'edu_theme_v3',
        NOTES_DATA: 'edu_notes_v3',
        PROGRESS: 'edu_progress_v3',
        STATS: 'edu_stats_v3',
        TOUR_SEEN: 'edu_tour_seen_v3'
    },
    colors: {
        primary: '#4f46e5',
        surface: '#ffffff',
        text: '#1e293b'
    },
    pomodoro: {
        defaultMinutes: 25
    },
    player: {
        autoNextDelay: 3000, // ms
        statsInterval: 60   // seconds
    }
};
