/**
 * Main Application Entry Point
 * Initialization and event listeners
 */

import { 
    ui, initUI, loadSettings, toggleTheme, toggleSidebar, 
    toggleNotesPanel, closeNotesPanel, showStatsModal, hideStatsModal,
    showShortcutsModal, startVietnamClock, showSettingsModal, hideSettingsModal,
    saveSettingsFromForm, initSettings
} from './ui.js';
import { initPlyr, playNext, playPrev } from './player.js';
import { initQuill } from './notes.js';
import { initPomodoro } from './pomodoro.js';
import { initPDFViewer } from './pdf-viewer.js';
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
    
    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.onclick = showSettingsModal;
    }
    const closeSettingsBtn = document.getElementById('closeSettings');
    if (closeSettingsBtn) {
        closeSettingsBtn.onclick = hideSettingsModal;
    }
    const saveSettingsBtn = document.getElementById('saveSettings');
    if (saveSettingsBtn) {
        saveSettingsBtn.onclick = saveSettingsFromForm;
    }
    
    // Video navigation buttons
    const prevBtn = document.getElementById('prevVideoBtn');
    const nextBtn = document.getElementById('nextVideoBtn');
    if (prevBtn) prevBtn.onclick = playPrev;
    if (nextBtn) nextBtn.onclick = playNext;
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input/textarea/contenteditable
        if (e.target.matches('input, textarea, [contenteditable="true"]')) return;
        // Ignore if Quill editor is focused
        if (e.target.closest('.ql-editor')) return;
        
        const key = e.key.toLowerCase();
        
        switch(key) {
            case 'n':
                e.preventDefault();
                toggleNotesPanel();
                break;
            case '?':
                e.preventDefault();
                showShortcutsModal();
                break;
        }
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.onclick = () => {
            ui.sidebar?.classList.toggle('mobile-open');
            sidebarOverlay?.classList.toggle('active');
        };
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.onclick = () => {
            ui.sidebar?.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        };
    }
}

/**
 * Initialize application
 */
function init() {
    // Initialize UI references
    initUI();
    
    // Initialize and apply saved settings
    initSettings();
    
    // Load saved settings (theme, stats)
    loadSettings();
    // Initialize components
    initPlyr();
    initQuill();
    initPomodoro();
    initPDFViewer();
    
    // Start Vietnam clock
    startVietnamClock();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check for tour
    checkAndStartTour();
}

// Expose startTour globally for HTML onclick
window.startTour = startTour;

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
