let pdfDoc = null;
let currentScale = 1.0;
const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
let pageRendering = false;
let renderQueue = new Set(); // เปลี่ยนเป็น Set เพื่อป้องกันการซ้ำ

const pagesContainer = document.getElementById('pages-container');

async function displayPDF(pdfUrl) {
    try {
        renderQueue.clear(); // เคลียร์คิวเก่า
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        
        loadingTask.onProgress = function(progress) {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            document.querySelector('.loading-spinner span').textContent = 
                `กำลังโหลดเอกสาร... ${percent}%`;
        };

        pdfDoc = await loadingTask.promise;
        pagesContainer.innerHTML = '';
        
        // สร้าง placeholders สำหรับทุกหน้า
        for(let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'page-placeholder';
            placeholder.id = `page-${pageNum}`;
            pagesContainer.appendChild(placeholder);
        }

        // render หน้าแรกก่อน
        await renderPage(1);
        
        // render หน้าที่เหลือ
        for(let pageNum = 2; pageNum <= pdfDoc.numPages; pageNum++) {
            if (!renderQueue.has(pageNum)) {
                renderQueue.add(pageNum);
                renderPage(pageNum);
            }
        }
    } catch (error) {
        console.error('Error loading PDF:', error);
    }
}

async function renderPage(pageNumber) {
    if (pageRendering) {
        // ถ้ากำลัง render อยู่ให้รอ
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
        pageRendering = true;
        
        // ตรวจสอบว่าหน้านี้มีอยู่แล้วหรือไม่
        const existingPage = document.getElementById(`page-${pageNumber}`);
        if (existingPage && existingPage.tagName === 'CANVAS') {
            pageRendering = false;
            return; // ข้ามถ้ามีการ render แล้ว
        }

        const page = await pdfDoc.getPage(pageNumber);
        const container = document.getElementById('pdfViewer');
        const containerWidth = container.clientWidth - 80;
        const containerHeight = window.innerHeight - 200;
        
        const originalViewport = page.getViewport({ scale: 1 });
        const scaleWidth = containerWidth / originalViewport.width;
        const scaleHeight = containerHeight / originalViewport.height;
        const baseScale = Math.min(scaleWidth, scaleHeight);
        const viewport = page.getViewport({ scale: baseScale * currentScale });

        const canvas = document.createElement('canvas');
        canvas.id = `page-${pageNumber}`;
        canvas.className = 'pdf-page';
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const ctx = canvas.getContext('2d');
        
        // แทนที่ placeholder ด้วย canvas
        const placeholder = document.getElementById(`page-${pageNumber}`);
        if (placeholder) {
            placeholder.replaceWith(canvas);
        }

        await page.render({
            canvasContext: ctx,
            viewport: viewport,
            enableWebGL: true
        }).promise;

    } catch (error) {
        console.error(`Error rendering page ${pageNumber}:`, error);
    } finally {
        pageRendering = false;
        renderQueue.delete(pageNumber); // ลบออกจากคิวเมื่อ render เสร็จ
    }
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

    // ใช้ requestAnimationFrame เพื่อเพิ่มประสิทธิภาพ
    if (oldScale !== currentScale && pdfDoc) {
        cancelAnimationFrame(renderQueue);
        renderQueue = requestAnimationFrame(() => {
            pagesContainer.innerHTML = '';
            for(let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                renderPage(pageNum);
            }
        });
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