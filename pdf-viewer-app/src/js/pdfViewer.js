let pdfDoc = null;
let currentScale = 1.0;
const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;

const pagesContainer = document.getElementById('pages-container');

async function displayPDF(pdfUrl) {
    try {
        pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
        // เคลียร์หน้าเก่าก่อนแสดงไฟล์ใหม่
        pagesContainer.innerHTML = '';
        // แสดงทุกหน้าของ PDF
        for(let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            await renderPage(pageNum);
        }
    } catch (error) {
        console.error('Error loading PDF:', error);
    }
}

async function renderPage(pageNumber) {
    const page = await pdfDoc.getPage(pageNumber);
    
    // คำนวณขนาดพื้นฐาน
    const container = document.getElementById('pdfViewer');
    const containerWidth = container.clientWidth - 80;
    const containerHeight = window.innerHeight - 200;
    
    const originalViewport = page.getViewport({ scale: 1 });
    
    // คำนวณ scale เริ่มต้นที่พอดีกับหน้าจอ
    const scaleWidth = containerWidth / originalViewport.width;
    const scaleHeight = containerHeight / originalViewport.height;
    const baseScale = Math.min(scaleWidth, scaleHeight);
    
    // ใช้ scale ที่รวมการ zoom แล้ว
    const viewport = page.getViewport({ scale: baseScale * currentScale });

    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page';
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const ctx = canvas.getContext('2d');
    pagesContainer.appendChild(canvas);

    const renderContext = {
        canvasContext: ctx,
        viewport: viewport
    };

    await page.render(renderContext).promise;
}

// เพิ่มการจัดการ zoom ด้วย mouse wheel
function handleZoom(event) {
    event.preventDefault();

    const delta = Math.sign(event.deltaY);
    const oldScale = currentScale;

    // ปรับ scale ตาม mouse wheel
    if (delta > 0) {
        currentScale = Math.max(MIN_SCALE, currentScale - ZOOM_STEP);
    } else {
        currentScale = Math.min(MAX_SCALE, currentScale + ZOOM_STEP);
    }

    // ถ้า scale เปลี่ยน ให้ render ใหม่
    if (oldScale !== currentScale && pdfDoc) {
        pagesContainer.innerHTML = '';
        for(let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            renderPage(pageNum);
        }
    }
}

// ผูก event listener สำหรับ zoom
document.getElementById('pdfViewer').addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
        handleZoom(e);
    }
});

// ปรับการแสดงผลเมื่อมีการ resize หน้าต่าง
window.addEventListener('resize', () => {
    if (pdfDoc) {
        displayPDF(document.querySelector('#upload').files[0]);
    }
});

export { displayPDF };