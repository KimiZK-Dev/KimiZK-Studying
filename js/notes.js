/**
 * Notes Module
 * Quill rich text editor for note-taking
 */

import { state, getCurrentVideo } from './state.js';
import { saveNotes, loadNotes } from './storage.js';
import { debounce } from './utils.js';

// Quill instance
let quill = null;

/**
 * Get Quill instance
 * @returns {Quill}
 */
export function getQuill() {
    return quill;
}

/**
 * Initialize Quill editor
 */
export function initQuill() {
    quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['clean']
            ]
        },
        placeholder: 'Ghi chú cho bài học này...'
    });
    
    // Auto-save with debounce
    const debouncedSave = debounce(handleTextChange, 1000);
    quill.on('text-change', () => {
        hideNoteStatus();
        debouncedSave();
    });
}

/**
 * Handle text change - save notes
 */
function handleTextChange() {
    const video = getCurrentVideo();
    if (video) {
        saveNotes(video.id, quill.getContents());
        showNoteStatus();
    }
}

/**
 * Load notes for a specific video
 * @param {string} videoId
 */
export function loadNotesForVideo(videoId) {
    const notes = loadNotes(videoId);
    quill.setContents(notes || []);
}

/**
 * Show note saved status
 */
function showNoteStatus() {
    const statusEl = document.getElementById('noteStatus');
    if (statusEl) statusEl.classList.add('visible');
}

/**
 * Hide note saved status
 */
function hideNoteStatus() {
    const statusEl = document.getElementById('noteStatus');
    if (statusEl) statusEl.classList.remove('visible');
}
