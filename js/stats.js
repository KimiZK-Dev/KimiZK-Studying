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
    renderDailyStatsTable();
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
    
    // Get last 7 days of activity for the chart
    const dailyData = state.stats.dailyActivity || {};
    const dates = Object.keys(dailyData).sort().slice(-7);
    const values = dates.map(d => dailyData[d] || 0);
    
    // Format dates for display
    const labels = dates.map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    });
    
    studyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length > 0 ? labels : ['Hôm nay'],
            datasets: [{
                label: 'Thời gian học (phút)',
                data: values.length > 0 ? values : [Math.floor(state.stats.totalSeconds / 60)],
                backgroundColor: 'rgba(79, 70, 229, 0.6)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Phút'
                    }
                }
            }
        }
    });
}

/**
 * Render daily stats table
 */
function renderDailyStatsTable() {
    const tbody = document.querySelector('#dailyStatsTable tbody');
    if (!tbody) return;
    
    const dailyActivity = state.stats.dailyActivity || {};
    const dates = Object.keys(dailyActivity).sort().reverse(); // Most recent first
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (dates.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="no-data-row">Chưa có dữ liệu học tập</td>
            </tr>
        `;
        return;
    }
    
    // Render each day
    dates.forEach(dateStr => {
        const minutes = dailyActivity[dateStr] || 0;
        const row = document.createElement('tr');
        
        // Format date
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        });
        
        // Format time
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        
        // Determine rating
        let ratingHtml;
        if (minutes >= 60) {
            ratingHtml = '<span class="rating-badge rating-excellent"><i class="fas fa-star"></i> Xuất sắc</span>';
        } else if (minutes >= 30) {
            ratingHtml = '<span class="rating-badge rating-good"><i class="fas fa-check"></i> Tốt</span>';
        } else {
            ratingHtml = '<span class="rating-badge rating-low"><i class="fas fa-exclamation"></i> Cần cố gắng</span>';
        }
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${timeStr}</td>
            <td>${ratingHtml}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Get chart instance
 * @returns {Chart}
 */
export function getStudyChart() {
    return studyChart;
}
