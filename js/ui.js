/**
 * UI Elements & Helpers
 * DOM references and UI utility functions
 */

import { state } from './state.js';
import { saveTheme, loadTheme, loadStats } from './storage.js';

// DOM Element References
export const ui = {
    sidebar: null,
    courseTree: null,
    folderInput: null,
    
    // Displays
    videoTitle: null,
    videoTopic: null,
    videoTime: null,
    currentCourse: null,
    totalVideosBadge: null,
    
    // Pomodoro
    pomoTimer: null,
    pomoStart: null,
    pomoReset: null,
    
    // Panels & Modals
    notesPanel: null,
    statsModal: null,
    emptyState: null,
    playerContainer: null,
    
    // Buttons
    sidebarToggle: null,
    themeToggle: null,
    notesToggle: null,
    analyticsBtn: null,
    closeNotes: null,
    closeStats: null
};

/**
 * Initialize UI element references
 */
export function initUI() {
    ui.sidebar = document.getElementById('appSidebar');
    ui.courseTree = document.getElementById('courseTree');
    ui.folderInput = document.getElementById('folderInput');
    
    ui.videoTitle = document.getElementById('videoTitle');
    ui.videoTopic = document.getElementById('videoTopic');
    ui.videoTime = document.getElementById('videoTime');
    ui.currentCourse = document.getElementById('currentCourseName');
    ui.totalVideosBadge = document.getElementById('totalVideosBadge');
    
    ui.pomoTimer = document.getElementById('pomoTimer');
    ui.pomoStart = document.getElementById('pomoStart');
    ui.pomoReset = document.getElementById('pomoReset');
    
    ui.notesPanel = document.getElementById('notesPanel');
    ui.statsModal = document.getElementById('statsModal');
    ui.emptyState = document.getElementById('emptyState');
    ui.playerContainer = document.getElementById('playerContainer');
    
    ui.sidebarToggle = document.getElementById('sidebarToggle');
    ui.themeToggle = document.getElementById('themeToggle');
    ui.notesToggle = document.getElementById('notesToggle');
    ui.analyticsBtn = document.getElementById('analyticsBtn');
    ui.closeNotes = document.getElementById('closeNotes');
    ui.closeStats = document.getElementById('closeStats');
}

/**
 * Toggle dark/light theme
 * @param {boolean} forceDark - Force dark mode
 */
export function toggleTheme(forceDark) {
    const isDark = typeof forceDark === 'boolean' ? forceDark : !state.isDark;
    state.isDark = isDark;
    
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (ui.themeToggle) {
            ui.themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Giao diện</span>';
        }
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (ui.themeToggle) {
            ui.themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Giao diện</span>';
        }
    }
    
    saveTheme(isDark);
}

/**
 * Load saved settings
 */
export function loadSettings() {
    const isDark = loadTheme();
    if (isDark) {
        toggleTheme(true);
    }
    loadStats();
}

/**
 * Show keyboard shortcuts modal
 */
export function showShortcutsModal() {
    Swal.fire({
        title: '<strong>Phím tắt</strong>',
        html: `
            <div style="text-align: left; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div><kbd>Space</kbd> Play/Pause</div>
                <div><kbd>←</kbd> <kbd>→</kbd> Seek 10s</div>
                <div><kbd>↑</kbd> <kbd>↓</kbd> Volume</div>
                <div><kbd>F</kbd> Fullscreen</div>
                <div><kbd>M</kbd> Mute</div>
            </div>
        `,
        showCloseButton: true,
        showConfirmButton: false
    });
}

/**
 * Toggle sidebar collapsed state
 */
export function toggleSidebar() {
    ui.sidebar?.classList.toggle('collapsed');
}

/**
 * Toggle notes panel
 */
export function toggleNotesPanel() {
    ui.notesPanel?.classList.toggle('open');
}

/**
 * Close notes panel
 */
export function closeNotesPanel() {
    ui.notesPanel?.classList.remove('open');
}

/**
 * Show stats modal
 */
export function showStatsModal() {
    ui.statsModal?.classList.remove('hidden');
}

/**
 * Hide stats modal
 */
export function hideStatsModal() {
    ui.statsModal?.classList.add('hidden');
}

/**
 * Show player container, hide empty state
 */
export function showPlayer() {
    if (ui.emptyState) ui.emptyState.style.display = 'none';
    if (ui.playerContainer) ui.playerContainer.style.display = 'flex';
}

/**
 * Update video metadata display
 * @param {string} title - Video title
 * @param {string} topic - Video topic
 */
export function updateVideoMeta(title, topic) {
    if (ui.videoTitle) ui.videoTitle.textContent = title;
    if (ui.videoTopic) ui.videoTopic.textContent = topic;
}

/**
 * Update video time display
 * @param {string} timeStr - Formatted time string
 */
export function updateVideoTime(timeStr) {
    if (ui.videoTime) ui.videoTime.textContent = timeStr;
}

/**
 * Update total videos badge
 * @param {number} count
 */
export function updateTotalVideos(count) {
    if (ui.totalVideosBadge) ui.totalVideosBadge.textContent = count;
}
