/**
 * Course Management Module
 * File parsing and course tree rendering
 */

import { state, resetCourseData } from './state.js';
import { generateId } from './utils.js';
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
        // Filter videos only
        if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mkv|webm|avi|mov)$/i)) {
            return;
        }
        
        hasVideo = true;
        
        // Extract topic from path
        const pathParts = file.webkitRelativePath.split('/');
        let topic = "General";
        
        // If nested structure (Folder -> Subfolder -> File)
        if (pathParts.length > 2) {
            topic = pathParts[pathParts.length - 2];
        }
        
        // Initialize topic array if needed
        if (!state.courseData[topic]) {
            state.courseData[topic] = [];
        }
        
        // Create video object
        // Strip file extension for display name
        const displayName = file.name.replace(/\.[^/.]+$/, '');
        
        const videoObj = {
            id: generateId(),
            name: file.name,
            displayName: displayName,
            file: file,
            topic: topic,
            url: URL.createObjectURL(file)
        };
        
        state.courseData[topic].push(videoObj);
    });
    
    if (!hasVideo) {
        Swal.fire('Lỗi', 'Không tìm thấy video nào trong thư mục này!', 'error');
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
    Swal.fire({
        icon: 'success',
        title: 'Đã nhập khóa học',
        text: `Đã phân loại ${sortedTopics.length} chủ đề.`,
        timer: 1500,
        showConfirmButton: false
    });
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
function createVideoNode(video) {
    const vidEl = document.createElement('div');
    vidEl.className = 'video-node';
    vidEl.dataset.id = video.id;
    vidEl.dataset.title = video.displayName; // For tooltip (no extension)
    
    // Find index in flat list
    const flatIndex = state.flatPlaylist.findIndex(v => v.id === video.id);
    
    vidEl.innerHTML = `
        <span class="status-icon"><i class="far fa-circle-play"></i></span>
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
