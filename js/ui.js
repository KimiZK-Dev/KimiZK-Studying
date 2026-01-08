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
    materialBtn: null,
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
    ui.materialBtn = document.getElementById('materialBtn');
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
 * Show keyboard shortcuts modal (custom implementation)
 */
export function showShortcutsModal() {
    // Check if modal already exists
    let modal = document.getElementById('shortcutsModal');
    
    if (!modal) {
        // Create modal HTML
        modal = document.createElement('div');
        modal.id = 'shortcutsModal';
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal">
                <div class="custom-modal-header">
                    <h3><i class="fas fa-keyboard"></i> Phím tắt</h3>
                    <button class="custom-modal-close" id="closeShortcutsModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="custom-modal-body">
                    <div class="shortcuts-grid">
                        <div class="shortcut-item"><kbd>Space</kbd> <span>Play/Pause</span></div>
                        <div class="shortcut-item"><kbd>←</kbd> <kbd>→</kbd> <span>Tua 10s</span></div>
                        <div class="shortcut-item"><kbd>↑</kbd> <kbd>↓</kbd> <span>Âm lượng</span></div>
                        <div class="shortcut-item"><kbd>F</kbd> <span>Toàn màn hình</span></div>
                        <div class="shortcut-item"><kbd>M</kbd> <span>Tắt tiếng</span></div>
                        <div class="shortcut-item"><kbd>N</kbd> <span>Ghi chú</span></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close button
        document.getElementById('closeShortcutsModal').onclick = () => {
            modal.classList.remove('show');
        };
        
        // Click outside to close
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        };
        
        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                modal.classList.remove('show');
            }
        });
    }
    
    // Show modal
    requestAnimationFrame(() => {
        modal.classList.add('show');
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
    if (ui.videoTitle) {
        ui.videoTitle.textContent = title;
        ui.videoTitle.setAttribute('title', title); // Full title on hover
    }
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

/**
 * Start Vietnam real-time clock (UTC+7)
 */
export function startVietnamClock() {
    const clockEl = document.getElementById('vietnamClock');
    if (!clockEl) return;
    
    const update = () => {
        const now = new Date();
        const vnTime = now.toLocaleTimeString('vi-VN', { 
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false
        });
        clockEl.textContent = vnTime;
    };
    
    update();
    setInterval(update, 1000);
}

/**
 * Show settings modal
 */
export function showSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.remove('hidden');
        populateSettingsForm();
    }
}

/**
 * Hide settings modal
 */
export function hideSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Populate settings form with current values
 */
function populateSettingsForm() {
    // Import dynamically to avoid circular dependency
    import('./storage.js').then(({ loadAppSettings }) => {
        const settings = loadAppSettings();
        
        const autoPlayEl = document.getElementById('settingAutoPlay');
        const pomodoroEl = document.getElementById('settingPomodoro');
        const speedEl = document.getElementById('settingSpeed');
        const themeEl = document.getElementById('settingTheme');
        
        if (autoPlayEl) autoPlayEl.checked = settings.autoPlay;
        if (pomodoroEl) pomodoroEl.value = settings.pomodoroMinutes;
        if (speedEl) speedEl.value = settings.defaultSpeed;
        if (themeEl) themeEl.value = settings.theme;
    });
}

/**
 * Save settings from form
 */
export function saveSettingsFromForm() {
    import('./storage.js').then(({ saveAppSettings }) => {
        import('./utils.js').then(({ showToast }) => {
            const settings = {
                autoPlay: document.getElementById('settingAutoPlay')?.checked ?? true,
                pomodoroMinutes: parseInt(document.getElementById('settingPomodoro')?.value || '25'),
                defaultSpeed: parseFloat(document.getElementById('settingSpeed')?.value || '1'),
                theme: document.getElementById('settingTheme')?.value || 'dark'
            };
            
            saveAppSettings(settings);
            applySettings(settings);
            showToast('Đã lưu cài đặt!', { type: 'success' });
            hideSettingsModal();
        });
    });
}

/**
 * Apply settings immediately
 * @param {object} settings
 */
export function applySettings(settings) {
    // Apply theme
    if (settings.theme === 'dark') {
        toggleTheme(true);
    } else if (settings.theme === 'light') {
        toggleTheme(false);
    } else if (settings.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        toggleTheme(prefersDark);
    }
    
    // Store settings in state for other modules to use
    state.settings = settings;
    
    // Apply Pomodoro time
    import('./pomodoro.js').then(({ setPomodoroMinutes }) => {
        setPomodoroMinutes(settings.pomodoroMinutes);
    });
}

/**
 * Initialize settings on app load
 */
export function initSettings() {
    import('./storage.js').then(({ loadAppSettings }) => {
        const settings = loadAppSettings();
        applySettings(settings);
    });
}
