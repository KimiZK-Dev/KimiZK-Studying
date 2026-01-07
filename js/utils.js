/**
 * Utility Functions
 * Common helper functions used across the application
 */

/**
 * Generate unique ID
 * @returns {string} Random 9-character ID
 */
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Format seconds to time string (HH:MM:SS or MM:SS)
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "00:00";
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const pad = (n) => n < 10 ? '0' + n : n;
    
    if (h > 0) {
        return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${m}:${pad(s)}`;
}

/**
 * DOM selector helper
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element|null}
 */
export function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * DOM selector helper for multiple elements
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {NodeList}
 */
export function $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Custom Toast Notification
 * @param {string} message - Message to display
 * @param {object} options - Options { type: 'info'|'success'|'error', duration: ms }
 */
export function showToast(message, options = {}) {
    const { type = 'info', duration = 3000 } = options;
    
    // Icons for each type
    const icons = {
        info: '<i class="fas fa-info-circle"></i>',
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>'
    };
    
    // Create container if not exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
