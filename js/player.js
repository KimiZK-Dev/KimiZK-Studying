/**
 * Video Player Module
 * Plyr initialization and video playback logic
 */

import { CONFIG } from './config.js';
import { state } from './state.js';
import { formatTime, showToast } from './utils.js';
import { saveStats, saveVideoProgress, loadVideoProgress, markVideoCompleted } from './storage.js';
import { ui, showPlayer, updateVideoMeta, updateVideoTime } from './ui.js';
import { loadNotesForVideo } from './notes.js';
import { openMaterial } from './pdf-viewer.js';

// Plyr instance
let player = null;

// Progress save interval
let progressSaveInterval = null;

/**
 * Get player instance
 * @returns {Plyr}
 */
export function getPlayer() {
    return player;
}

/**
 * Initialize Plyr video player
 */
export function initPlyr() {
    player = new Plyr('#player', {
        controls: [
            'play-large', 'play', 'progress', 'current-time',
            'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
        ],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true }
    });
    
    // Video time display on metadata load
    player.on('loadedmetadata', () => {
        updateVideoTime(formatTime(player.duration));
    });
    
    // Update time display during playback
    player.on('timeupdate', () => {
        updateVideoTime(`${formatTime(player.currentTime)} / ${formatTime(player.duration)}`);
    });
    
    // Auto-next on video end
    player.on('ended', handleVideoEnded);
    
    // Save progress when pausing or leaving
    player.on('pause', saveCurrentProgress);
    window.addEventListener('beforeunload', saveCurrentProgress);
    
    // Track time for statistics
    setInterval(trackPlayTime, 1000);
    
    // Save progress every 10 seconds while playing
    progressSaveInterval = setInterval(() => {
        if (player && player.playing) {
            saveCurrentProgress();
        }
    }, 10000);
}

/**
 * Save current video progress
 */
function saveCurrentProgress() {
    const video = state.flatPlaylist[state.currentIndex];
    if (video && player && player.duration > 0) {
        const completed = player.currentTime >= player.duration - 2; // 2 seconds threshold
        saveVideoProgress(video.id, player.currentTime, player.duration, completed);
        
        if (completed) {
            updateVideoCompletionInSidebar(video.id);
        }
    }
}

/**
 * Handle video ended event
 */
function handleVideoEnded() {
    const video = state.flatPlaylist[state.currentIndex];
    
    // Mark as completed
    if (video) {
        markVideoCompleted(video.id);
        updateVideoCompletionInSidebar(video.id);
    }
    
    state.stats.completedVideos++;
    saveStats();
    
    // Check auto-play setting
    const autoPlay = state.settings?.autoPlay ?? true;
    
    if (autoPlay && state.currentIndex < state.flatPlaylist.length - 1) {
        showToast("Video tiếp theo sau 3s...", { type: 'info' });
        setTimeout(() => playVideo(state.currentIndex + 1), CONFIG.player.autoNextDelay);
    }
}

/**
 * Track play time for statistics
 */
function trackPlayTime() {
    if (player && player.playing) {
        state.stats.totalSeconds++;
        
        // Update daily activity
        const today = new Date().toISOString().split('T')[0];
        if (!state.stats.dailyActivity[today]) {
            state.stats.dailyActivity[today] = 0;
        }
        state.stats.dailyActivity[today] = Math.floor(state.stats.totalSeconds / 60);
        
        // Save every minute
        if (state.stats.totalSeconds % CONFIG.player.statsInterval === 0) {
            saveStats();
        }
    }
}

/**
 * Play video by index
 * @param {number} index - Index in flatPlaylist
 * @param {boolean} skipResumeCheck - Skip the resume prompt
 */
export function playVideo(index, skipResumeCheck = false) {
    if (index < 0 || index >= state.flatPlaylist.length) return;
    
    const video = state.flatPlaylist[index];
    const progress = loadVideoProgress(video.id);
    
    // Check if should show resume prompt
    if (!skipResumeCheck && progress && progress.currentTime > 10 && !progress.completed) {
        showResumePrompt(index, progress);
        return;
    }
    
    startVideoPlayback(index, skipResumeCheck ? 0 : (progress?.currentTime || 0));
}

/**
 * Show resume prompt modal
 * @param {number} index
 * @param {object} progress
 */
/**
 * Show resume prompt modal
 * @param {number} index
 * @param {object} progress
 */
function showResumePrompt(index, progress) {
    const video = state.flatPlaylist[index];
    const timeStr = formatTime(progress.currentTime);
    
    // Create modal if not exists
    let modal = document.getElementById('resumeModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'resumeModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-card resume-modal animate__animated animate__zoomIn">
                <div class="modal-header">
                    <h3><i class="fas fa-play-circle"></i> Tiếp tục xem?</h3>
                </div>
                <div class="modal-body">
                    <h4 id="resumeVideoTitle" class="resume-video-title"></h4>
                    <p id="resumeMessage"></p>
                    <div class="resume-actions">
                        <button id="resumeFromStart" class="btn-resume secondary">
                            <i class="fas fa-redo"></i> Xem lại từ đầu
                        </button>
                        <button id="resumeContinue" class="btn-resume primary">
                            <i class="fas fa-play"></i> Tiếp tục xem
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Update content
    const titleEl = document.getElementById('resumeVideoTitle');
    if (titleEl) titleEl.textContent = video.displayName;
    
    document.getElementById('resumeMessage').innerHTML = 
        `Bạn đã xem đến <strong>${timeStr}</strong>`;
    
    // Show modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    // Button handlers
    // Clear previous event listeners to avoid duplicates if any
    const btnStart = document.getElementById('resumeFromStart');
    const btnContinue = document.getElementById('resumeContinue');
    
    btnStart.onclick = () => {
        modal.style.display = 'none';
        startVideoPlayback(index, 0);
    };
    
    btnContinue.onclick = () => {
        modal.style.display = 'none';
        startVideoPlayback(index, progress.currentTime);
    };
}

/**
 * Start video playback at a specific time
 * @param {number} index
 * @param {number} startTime
 */
function startVideoPlayback(index, startTime = 0) {
    state.currentIndex = index;
    const video = state.flatPlaylist[index];
    
    // Update Plyr source
    player.source = {
        type: 'video',
        title: video.name,
        sources: [{ src: video.url, type: video.file.type }]
    };
    
    // Resume Logic - "The Enforcer"
    // We bind a one-time listener for valid metadata or playing event
    // to force the time update.
    const enforceSeek = () => {
        // Only seek if we have a valid start time (> 1s)
        if (startTime > 1) {
            console.log(`Attempting to seek to: ${startTime}`);
            player.currentTime = startTime;
            
            // Check if seek stuck
            setTimeout(() => {
                if (Math.abs(player.currentTime - startTime) > 2) {
                    console.log(`Seek failed, retrying: ${startTime}`);
                    player.currentTime = startTime;
                }
            }, 300);
        }
        
        // Start playing
        const playPromise = player.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.warn("Auto-play prevented:", error));
        }
    };
    
    // Use 'ready' or 'loadedmetadata' depending on what fires first/reliably
    // We use 'once' to ensure it runs only for this load
    player.once('loadedmetadata', enforceSeek);
    
    // Fallback: If for some reason metadata event missed (race condition),
    // check on 'canplay' as well
    player.once('canplay', () => {
        if (startTime > 0 && Math.abs(player.currentTime - startTime) > 2) {
            enforceSeek();
        }
    });

    // Update UI
    showPlayer();
    updateVideoMeta(video.displayName, video.topic);
    
    // Check for materials (zip)
    if (ui.materialBtn) {
        const topicZips = state.zipFiles[video.topic] || [];
        const hasZip = topicZips.length > 0;
        
        if (hasZip) {
            ui.materialBtn.classList.remove('hidden');
            ui.materialBtn.onclick = () => openMaterial(video);
        } else {
            ui.materialBtn.classList.add('hidden');
        }
    }
    
    // Expand topic and highlight video in sidebar
    highlightVideoInSidebar(video.id);
    
    // Load notes for this video
    loadNotesForVideo(video.id);
}

/**
 * Update video completion checkmark in sidebar
 * @param {string} videoId
 */
function updateVideoCompletionInSidebar(videoId) {
    const videoNode = document.querySelector(`.video-node[data-id="${videoId}"]`);
    if (videoNode && !videoNode.classList.contains('completed')) {
        videoNode.classList.add('completed');
        const icon = videoNode.querySelector('.status-icon');
        if (icon) {
            icon.innerHTML = '<i class="fas fa-check-circle"></i>';
        }
    }
}

/**
 * Highlight active video in sidebar
 * @param {string} videoId
 */
function highlightVideoInSidebar(videoId) {
    const videoNode = document.querySelector(`.video-node[data-id="${videoId}"]`);
    if (videoNode) {
        // Remove active class from all
        document.querySelectorAll('.video-node').forEach(el => el.classList.remove('active'));
        videoNode.classList.add('active');
        
        // Expand parent topic
        const topicGroup = videoNode.closest('.topic-group');
        if (topicGroup) topicGroup.classList.add('expanded');
        
        // Scroll into view
        videoNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Play next video
 */
export function playNext() {
    if (state.currentIndex < state.flatPlaylist.length - 1) {
        playVideo(state.currentIndex + 1, true); // Skip resume for next
    }
}

/**
 * Play previous video
 */
export function playPrev() {
    if (state.currentIndex > 0) {
        playVideo(state.currentIndex - 1);
    }
}
