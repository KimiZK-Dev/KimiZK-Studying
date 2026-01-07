/**
 * Video Player Module
 * Plyr initialization and video playback logic
 */

import { CONFIG } from './config.js';
import { state } from './state.js';
import { formatTime, showToast } from './utils.js';
import { saveStats } from './storage.js';
import { ui, showPlayer, updateVideoMeta, updateVideoTime } from './ui.js';
import { loadNotesForVideo } from './notes.js';
import { openMaterial } from './pdf-viewer.js';

// Plyr instance
let player = null;

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
    
    // Track time for statistics
    setInterval(trackPlayTime, 1000);
}

/**
 * Handle video ended event
 */
function handleVideoEnded() {
    state.stats.completedVideos++;
    saveStats();
    
    if (state.currentIndex < state.flatPlaylist.length - 1) {
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
        // Save every minute
        if (state.stats.totalSeconds % CONFIG.player.statsInterval === 0) {
            saveStats();
        }
    }
}

/**
 * Play video by index
 * @param {number} index - Index in flatPlaylist
 */
export function playVideo(index) {
    if (index < 0 || index >= state.flatPlaylist.length) return;
    
    state.currentIndex = index;
    const video = state.flatPlaylist[index];
    
    // Update Plyr source
    player.source = {
        type: 'video',
        title: video.name,
        sources: [{ src: video.url, type: video.file.type }]
    };
    
    // Start playback
    player.play();
    
    // Update UI
    showPlayer();
    updateVideoMeta(video.displayName, video.topic);
    
    // Check for materials (zip)
    if (ui.materialBtn) {
        // Debug: Log all zip files found in this topic
        console.log('--- ZIP DEBUG ---');
        console.log('Current Video:', video.name);
        console.log('Video Topic:', video.topic);
        
        const topicZips = state.zipFiles[video.topic] || [];
        console.log('Zips in Topic:', topicZips.map(f => f.name));

        // Strategy 1: Any zip file in the same topic folder
        const hasZip = topicZips.length > 0;

        console.log('Match Found:', hasZip ? 'YES' : 'NO');
        
        if (hasZip) {
            ui.materialBtn.classList.remove('hidden');
            // Check if multiple zips exist? For now, open the first one or finding the best match
            // We pass the topic to openMaterial
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
        playVideo(state.currentIndex + 1);
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
