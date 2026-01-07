/**
 * Statistics Module
 * Chart.js integration for learning analytics
 */

import { state } from './state.js';

// Chart.js instance
let studyChart = null;

/**
 * Update and render stats modal
 */
export function updateStatsModal() {
    updateStatsSummary();
    renderStudyChart();
}

/**
 * Update stats summary display
 */
function updateStatsSummary() {
    const hours = Math.floor(state.stats.totalSeconds / 3600);
    const mins = Math.floor((state.stats.totalSeconds % 3600) / 60);
    
    const totalTimeEl = document.getElementById('totalStudyTime');
    const completedEl = document.getElementById('completedVideos');
    
    if (totalTimeEl) totalTimeEl.textContent = `${hours}h ${mins}m`;
    if (completedEl) completedEl.textContent = state.stats.completedVideos;
}

/**
 * Render study chart with Chart.js
 */
function renderStudyChart() {
    const canvas = document.getElementById('studyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (studyChart) {
        studyChart.destroy();
    }
    
    studyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Activity'],
            datasets: [{
                label: 'Current Session (Minutes)',
                data: [Math.floor(state.stats.totalSeconds / 60)],
                backgroundColor: 'rgba(79, 70, 229, 0.6)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Minutes'
                    }
                }
            }
        }
    });
}

/**
 * Get chart instance
 * @returns {Chart}
 */
export function getStudyChart() {
    return studyChart;
}
