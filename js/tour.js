/**
 * Tour Module
 * Driver.js onboarding tour
 */

import { markTourSeen, isTourSeen } from './storage.js';

/**
 * Start onboarding tour
 */
export function startTour() {
    if (!window.driver) return;
    
    const driver = window.driver.js.driver;
    
    const driverObj = driver({
        showProgress: true,
        steps: [
            {
                element: '#uploadBtnStep',
                popover: {
                    title: 'Bắt đầu',
                    description: 'Chọn thư mục chứa video bài học.'
                }
            },
            {
                element: '#courseTree',
                popover: {
                    title: 'Danh mục',
                    description: 'Video được phân nhóm theo thư mục.'
                }
            },
            {
                element: '#pomodoroWidget',
                popover: {
                    title: 'Tập trung',
                    description: 'Bộ đếm thời gian học Pomodoro.'
                }
            },
            {
                element: '#notesToggle',
                popover: {
                    title: 'Ghi chú',
                    description: 'Soạn thảo ghi chú thông minh cho từng video.'
                }
            }
        ]
    });
    
    driverObj.drive();
    markTourSeen();
}

/**
 * Check and start tour if not seen
 */
export function checkAndStartTour() {
    if (!isTourSeen()) {
        setTimeout(startTour, 1000);
    }
}
