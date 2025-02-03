import { displayPDF } from './pdfViewer.js';

document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('upload');
    const loadingSpinner = document.querySelector('.loading-spinner');

    uploadInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            loadingSpinner.classList.remove('hidden');
            const url = URL.createObjectURL(file);
            try {
                await displayPDF(url);
            } catch (error) {
                alert('เกิดข้อผิดพลาดในการโหลดไฟล์ PDF');
            } finally {
                loadingSpinner.classList.add('hidden');
            }
        } else {
            alert('กรุณาเลือกไฟล์ PDF เท่านั้น');
        }
    });
});