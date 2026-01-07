/**
 * Main Application Entry Point
 * Initialization and event listeners
 */

import { 
    ui, initUI, loadSettings, toggleTheme, toggleSidebar, 
    toggleNotesPanel, closeNotesPanel, showStatsModal, hideStatsModal,
    showShortcutsModal 
} from './ui.js';
import { initPlyr } from './player.js';
import { initQuill } from './notes.js';
import { initPomodoro } from './pomodoro.js';
import { updateStatsModal } from './stats.js';
import { handleFilesSelected } from './course.js';
import { checkAndStartTour, startTour } from './tour.js';

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Folder input
    if (ui.folderInput) {
        ui.folderInput.addEventListener('change', handleFilesSelected);
    }
    
    // Sidebar toggle
    if (ui.sidebarToggle) {
        ui.sidebarToggle.onclick = toggleSidebar;
    }
    
    // Theme toggle
    if (ui.themeToggle) {
        ui.themeToggle.onclick = () => toggleTheme();
    }
    
    // Notes panel
    if (ui.notesToggle) {
        ui.notesToggle.onclick = toggleNotesPanel;
    }
    if (ui.closeNotes) {
        ui.closeNotes.onclick = closeNotesPanel;
    }
    
    // Stats modal
    if (ui.analyticsBtn) {
        ui.analyticsBtn.onclick = () => {
            showStatsModal();
            updateStatsModal();
        };
    }
    if (ui.closeStats) {
        ui.closeStats.onclick = hideStatsModal;
    }
    
    // Shortcuts info
    const shortcutsBtn = document.getElementById('shortcutsInfo');
    if (shortcutsBtn) {
        shortcutsBtn.onclick = showShortcutsModal;
    }
}

/**
 * Initialize application
 */
function init() {
    // Initialize UI references
    initUI();
    
    // Load saved settings
    loadSettings();
    
    // Initialize components
    initPlyr();
    initQuill();
    initPomodoro();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check for tour
    checkAndStartTour();
}

// Expose startTour globally for HTML onclick
window.startTour = startTour;

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
