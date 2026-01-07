/**
 * PDF Viewer Module
 * Using native browser PDF viewer via object/embed for reliable display
 */

import { state } from './state.js';
import { showToast } from './utils.js';

let currentObjectUrl = null;

/**
 * Initialize PDF Viewer elements
 */
export function initPDFViewer() {
    document.getElementById('closePdfSplit')?.addEventListener('click', closeSplitView);
}

/**
 * Open Material (Zip -> PDF -> Native Browser Viewer)
 */
export async function openMaterial(video) {
    const topicZips = state.zipFiles[video.topic] || [];
    
    // Find Zip logic
    const baseName = video.name.substring(0, video.name.lastIndexOf('.'));
    let zipFile = topicZips.find(f => f.name === baseName + '.zip');
    if (!zipFile) zipFile = topicZips.find(f => f.name.includes(baseName));
    if (!zipFile && topicZips.length === 1) zipFile = topicZips[0];
    if (!zipFile && topicZips.length > 0) zipFile = topicZips[0]; 
    
    if (!zipFile) {
        showToast('Không tìm thấy tài liệu', { type: 'info' });
        return;
    }

    // UI Setup
    enterSplitView();
    showLoading(true);

    try {
        const zip = await JSZip.loadAsync(zipFile);
        const pdfFilename = Object.keys(zip.files).find(name => 
            name.toLowerCase().endsWith('.pdf') && !name.startsWith('__MACOSX')
        );
        
        if (!pdfFilename) throw new Error('Không tìm thấy file PDF.');
        
        // Get File as Blob with correct MIME type
        const pdfBlob = await zip.file(pdfFilename).async('blob');
        const pdfBlobWithType = new Blob([pdfBlob], { type: 'application/pdf' });
        
        // Clean up previous URL
        if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl);
        }
        currentObjectUrl = URL.createObjectURL(pdfBlobWithType);
        
        // Load into object element (native browser PDF viewer)
        const pdfObject = document.getElementById('pdfObject');
        if (pdfObject) {
            pdfObject.data = currentObjectUrl;
            pdfObject.type = 'application/pdf';
        }
        
        // Fallback for browsers without native PDF support
        const pdfFallback = document.getElementById('pdfFallback');
        if (pdfFallback) {
            pdfFallback.href = currentObjectUrl;
        }
        
    } catch (error) {
        console.error(error);
        showToast('Lỗi: ' + error.message, { type: 'error' });
        closeSplitView();
    } finally {
        showLoading(false);
    }
}

/**
 * Show/Hide loading overlay
 */
function showLoading(show) {
    const loading = document.getElementById('pdfLoading');
    if (loading) {
        loading.classList.toggle('hidden', !show);
    }
}

/**
 * Split View Toggles
 */
function enterSplitView() {
    document.getElementById('playerContainer').classList.add('split-mode');
    document.getElementById('pdfSection').classList.remove('hidden');
    window.dispatchEvent(new Event('resize'));
}

export function closeSplitView() {
    document.getElementById('playerContainer').classList.remove('split-mode');
    document.getElementById('pdfSection').classList.add('hidden');
    
    // Clear object to save memory
    const pdfObject = document.getElementById('pdfObject');
    if (pdfObject) pdfObject.data = "";
    
    // Clean up object URL
    if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
    }
    
    window.dispatchEvent(new Event('resize'));
}
