/**
 * Course Management Module
 * File parsing and course tree rendering
 */

import { state, resetCourseData } from './state.js';
import { generateId, showToast } from './utils.js';
import { ui, updateTotalVideos } from './ui.js';
import { playVideo } from './player.js';

/**
 * Handle files selected from folder input
 * @param {Event} e - Change event
 */
export function handleFilesSelected(e) {
    const files = Array.from(e.target.files);
    
    // Reset data
    resetCourseData();
    
    // Filter and group video files
    let hasVideo = false;
    
    files.forEach(file => {
        // Extract topic from path first (needed for both video and zip)
        const pathParts = file.webkitRelativePath.split('/');
        let topic = "General";
        if (pathParts.length > 2) {
            topic = pathParts[pathParts.length - 2];
        }

        // Handle Zip files
        if (file.name.toLowerCase().endsWith('.zip')) {
            if (!state.zipFiles[topic]) {
                state.zipFiles[topic] = [];
            }
            state.zipFiles[topic].push(file);
            return;
        }

        // Filter videos only
        if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mkv|webm|avi|mov)$/i)) {
            return;
        }
        
        hasVideo = true;
        
        // Initialize topic array if needed
        if (!state.courseData[topic]) {
            state.courseData[topic] = [];
        }
        
        // Create video object
        // Strip file extension for display name
        const displayName = file.name.replace(/\.[^/.]+$/, '');
        
        // Generate stable ID based on topic and filename
        // This ensures progress/notes are restored when re-uploading the same folder
        const stableId = btoa(unescape(encodeURIComponent(`${topic}_${file.name}`)));
        
        const videoObj = {
            id: stableId,
            name: file.name,
            displayName: displayName,
            file: file,
            topic: topic,
            url: URL.createObjectURL(file)
        };
        
        state.courseData[topic].push(videoObj);
    });
    
    if (!hasVideo) {
        showToast('Không tìm thấy video nào!', { type: 'error' });
        return;
    }
    
    // Sort and flatten
    const sortedTopics = sortAndFlattenCourse();
    
    // Update UI
    updateTotalVideos(state.flatPlaylist.length);
    renderCourseTree(sortedTopics);
    
    // Play first video
    playVideo(0);
    
    // Show success notification
    showToast(`Đã nhập ${sortedTopics.length} chủ đề`, { type: 'success' });
}

/**
 * Sort topics and create flat playlist
 * @returns {string[]} Sorted topic names
 */
function sortAndFlattenCourse() {
    const sortedTopics = Object.keys(state.courseData).sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
    
    sortedTopics.forEach(topic => {
        // Sort videos within topic
        state.courseData[topic].sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        });
        
        // Add to flat playlist
        state.flatPlaylist.push(...state.courseData[topic]);
    });
    
    return sortedTopics;
}

/**
 * Render course tree in accordion style
 * @param {string[]} topics - Sorted topic names
 */
export function renderCourseTree(topics) {
    if (!ui.courseTree) return;
    
    ui.courseTree.innerHTML = '';
    
    topics.forEach(topic => {
        const videos = state.courseData[topic];
        const groupEl = createTopicGroup(topic, videos);
        ui.courseTree.appendChild(groupEl);
    });
}

/**
 * Create topic group element
 * @param {string} topic - Topic name
 * @param {object[]} videos - Videos in topic
 * @returns {HTMLElement}
 */
function createTopicGroup(topic, videos) {
    const groupEl = document.createElement('div');
    groupEl.className = 'topic-group';
    
    // Header
    const header = document.createElement('div');
    header.className = 'topic-header';
    header.dataset.topic = topic; // For tooltip
    header.innerHTML = `
        <i class="fas fa-chevron-right"></i>
        <span>${topic}</span>
        <span class="badge">${videos.length}</span>
    `;
    header.onclick = () => groupEl.classList.toggle('expanded');
    
    // Content
    const content = document.createElement('div');
    content.className = 'topic-content';
    
    videos.forEach(video => {
        const videoNode = createVideoNode(video);
        content.appendChild(videoNode);
    });
    
    groupEl.appendChild(header);
    groupEl.appendChild(content);
    
    return groupEl;
}

/**
 * Create video node element
 * @param {object} video - Video object
 * @returns {HTMLElement}
 */
/**
 * Create video node element
 * @param {object} video - Video object
 * @returns {HTMLElement}
 */
function createVideoNode(video) {
    const vidEl = document.createElement('div');
    vidEl.className = 'video-node';
    vidEl.dataset.id = video.id;
    vidEl.dataset.title = video.displayName; // For tooltip (no extension)
    
    // Check completion status from storage
    // We import dynamically to avoid circular dependency issues at top level if any
    const isCompleted = localStorage.getItem('edu_video_progress_v3') 
        ? JSON.parse(localStorage.getItem('edu_video_progress_v3'))[video.id]?.completed 
        : false;

    if (isCompleted) {
        vidEl.classList.add('completed');
    }
    
    // Find index in flat list
    const flatIndex = state.flatPlaylist.findIndex(v => v.id === video.id);
    
    vidEl.innerHTML = `
        <span class="status-icon"><i class="${isCompleted ? 'fas fa-check-circle' : 'far fa-circle-play'}"></i></span>
        <span class="v-title">${video.displayName}</span>
    `;
    
    vidEl.onclick = () => {
        // Remove active class from all
        document.querySelectorAll('.video-node').forEach(el => el.classList.remove('active'));
        vidEl.classList.add('active');
        playVideo(flatIndex);
    };
    
    return vidEl;
}
