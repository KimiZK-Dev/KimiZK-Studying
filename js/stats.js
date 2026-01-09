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
    renderWatchHistory(); // New history table
    setupStatsTabs();
    calculateStreak();
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
    
    // Format dates for display (shorter format)
    const labels = dates.map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
    });
    
    // Get CSS variable colors
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#4f46e5';
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#64748b';
    
    studyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length > 0 ? labels : ['Hôm nay'],
            datasets: [{
                label: 'Phút học',
                data: values.length > 0 ? values : [Math.floor(state.stats.totalSeconds / 60)],
                backgroundColor: 'rgba(79, 70, 229, 0.7)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                hoverBackgroundColor: 'rgba(124, 58, 237, 0.9)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2, // Sharper text
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { size: 13, weight: '600' },
                    bodyFont: { size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: (items) => `Ngày ${items[0].label}`,
                        label: (item) => `${item.raw} phút học`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        font: { size: 11, weight: '500' },
                        padding: 8,
                        callback: (value) => value + 'm'
                    },
                    border: { display: false }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        font: { size: 11, weight: '500' },
                        padding: 8
                    },
                    border: { display: false }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
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

/**
 * Render watch history table
 */
function renderWatchHistory() {
    const tbody = document.querySelector('#watchHistoryTable tbody');
    if (!tbody) return;
    
    // Clear existing
    tbody.innerHTML = '';
    
    const history = state.watchHistory || [];
    
    if (history.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="no-data-row">Chưa có lịch sử xem</td>
            </tr>
        `;
        return;
    }
    
    import('./utils.js').then(({ formatTime }) => {
        history.forEach(item => {
            const row = document.createElement('tr');
            
            // Date formatting
            const date = new Date(item.lastWatched);
            const dateStr = date.toLocaleDateString('vi-VN', { 
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            });
            
            // Progress calculation
            const progressPercent = Math.min(100, Math.round((item.timestamp / item.duration) * 100));
            const progressClass = progressPercent >= 90 ? 'completed' : 'in-progress';
            
            row.innerHTML = `
                <td class="history-video-cell">
                    <div class="video-name" title="${item.name}">${item.name}</div>
                    <div class="video-topic">${item.topic}</div>
                </td>
                <td>
                    <div class="progress-bar-mini">
                        <div class="fill ${progressClass}" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="duration-text">${formatTime(item.timestamp)} / ${formatTime(item.duration)}</span>
                </td>
                <td class="time-cell">${dateStr}</td>
            `;
            
            tbody.appendChild(row);
        });
    });
}

/**
 * Setup stats tabs functionality
 */
function setupStatsTabs() {
    const tabs = document.querySelectorAll('.stats-tab');
    const contents = document.querySelectorAll('.stats-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${targetTab}`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

/**
 * Calculate and display current streak
 */
function calculateStreak() {
    const streakEl = document.getElementById('currentStreak');
    if (!streakEl) return;
    
    const dailyActivity = state.stats.dailyActivity || {};
    const dates = Object.keys(dailyActivity).sort().reverse();
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < dates.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (dailyActivity[dateStr] && dailyActivity[dateStr] > 0) {
            streak++;
        } else if (i === 0) {
            // Today has no activity yet, don't break streak
            continue;
        } else {
            break;
        }
    }
    
    streakEl.textContent = streak;
}
