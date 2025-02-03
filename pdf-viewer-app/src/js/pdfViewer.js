let pdfDoc = null;
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
    
    // สร้าง canvas สำหรับแต่ละหน้า
    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page';
    const ctx = canvas.getContext('2d');
    
    // คำนวณขนาดให้พอดีกับความกว้างของหน้าต่าง
    const container = document.getElementById('pdfViewer');
    const containerWidth = container.clientWidth - 20;
    const originalViewport = page.getViewport({ scale: 1 });
    
    // คำนวณอัตราส่วนเพื่อให้พอดีกับความกว้าง
    const scale = containerWidth / originalViewport.width;
    const viewport = page.getViewport({ scale: scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // เพิ่ม canvas เข้าไปใน container
    pagesContainer.appendChild(canvas);

    const renderContext = {
        canvasContext: ctx,
        viewport: viewport
    };

    await page.render(renderContext).promise;
}

// ปรับการแสดงผลเมื่อมีการ resize หน้าต่าง
window.addEventListener('resize', () => {
    if (pdfDoc) {
        displayPDF(document.querySelector('#upload').files[0]);
    }
});

export { displayPDF };