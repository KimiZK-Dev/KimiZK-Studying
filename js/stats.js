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
/**
 * Calculate and display current streak
 */
function calculateStreak() {
    const streakEl = document.getElementById('currentStreak');
    if (!streakEl) return;
    
    const dailyActivity = state.stats.dailyActivity || {};
    // Get unique dates sorted descending
    const dates = Object.keys(dailyActivity).sort().reverse();
    
    if (dates.length === 0) {
        streakEl.textContent = 0;
        return;
    }

    // Identify "Today" in the same format as storage (UTC YYYY-MM-DD)
    // proportional to how player.js saves it: new Date().toISOString().split('T')[0]
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Calculate Yesterday string (UTC)
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if the sequence is active (last study was Today or Yesterday)
    // Note: In strict mode, if you missed yesterday, streak is 0. 
    // But usually we allow "today" to be empty if checking early in the morning, 
    // as long as "yesterday" has data. 
    // If the latest data is OLDER than yesterday, streak is broken.
    
    const latestDate = dates[0];
    
    // Check if the streak is current
    // We allow the latest entry to be Today OR Yesterday.
    // If latest entry is older than yesterday, streak is 0.
    // However, timezone issues might mean "Today" local is "Yesterday" UTC.
    // So we'll limit the "broken" check to being older than 2 days just to be safe? 
    // No, standard logic:
    
    // Helper to calculate days diff
    const getDaysDiff = (d1, d2) => {
        const t1 = new Date(d1).getTime();
        const t2 = new Date(d2).getTime();
        return Math.floor((t1 - t2) / (1000 * 60 * 60 * 24));
    };

    const diffFromToday = getDaysDiff(todayStr, latestDate);
    
    // If latest activity is more than 1 day ago (i.e., day before yesterday), streak is 0
    if (diffFromToday > 1) {
        streakEl.textContent = 0;
        return;
    }

    let streak = 1;
    
    // Iterate and check gaps
    for (let i = 0; i < dates.length - 1; i++) {
        const current = dates[i];
        const next = dates[i + 1];
        
        const diff = getDaysDiff(current, next);
        
        if (diff === 1) {
            streak++;
        } else {
            break; // Gap found
        }
    }
    
    streakEl.textContent = streak;
}
