import { displayPDF } from './pdfViewer.js';

document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('upload');

    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            const url = URL.createObjectURL(file);
            displayPDF(url);
        } else {
            alert('Please upload a valid PDF file.');
        }
    });
});