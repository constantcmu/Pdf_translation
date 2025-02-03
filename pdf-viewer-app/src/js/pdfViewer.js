let pdfDoc = null;
let currentScale = 1.0;
const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
let pageRendering = false;
let renderQueue = new Set();
let currentPageNum = 1;
let isChangingPage = false;
let isHoldingButton = false;
let holdScrollInterval = null;
const SCROLL_SPEED = 20; // ความเร็วในการเลื่อน
const SCROLL_INTERVAL = 16; // 60fps

const pagesContainer = document.getElementById('pages-container');
let pageChangeInterval = null;
const PAGE_CHANGE_DELAY = 300; // ระยะเวลาระหว่างการเปลี่ยนหน้า (มิลลิวินาที)

async function displayPDF(pdfUrl) {
    try {
        // เคลียร์สถานะเดิม
        renderQueue.clear();
        pagesContainer.innerHTML = '';
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        
        loadingTask.onProgress = function(progress) {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            document.querySelector('.loading-spinner span').textContent = 
                `กำลังโหลดเอกสาร... ${percent}%`;
        };

        pdfDoc = await loadingTask.promise;
        
        // อัพเดตจำนวนหน้าทั้งหมด
        document.getElementById('total-pages').textContent = pdfDoc.numPages;
        updatePageControls();
        
        // render ทุกหน้าตามลำดับ
        for(let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            await renderPage(pageNum);
        }
        currentPageNum = 1; // รีเซ็ตกลับไปหน้าแรก
    } catch (error) {
        console.error('Error loading PDF:', error);
        document.querySelector('.loading-spinner span').textContent = 
            'เกิดข้อผิดพลาดในการโหลดเอกสาร';
    }
}

function updatePageControls() {
    document.getElementById('current-page-num').textContent = currentPageNum;
    
    // อัพเดตสถานะปุ่มนำทาง
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentPageNum <= 1;
        nextBtn.disabled = currentPageNum >= pdfDoc.numPages;
    }
}

async function changePage(delta) {
    if (isChangingPage) return;
    
    const newPageNum = currentPageNum + delta;
    if (newPageNum >= 1 && newPageNum <= pdfDoc.numPages) {
        isChangingPage = true;
        currentPageNum = newPageNum;
        updatePageControls();
        
        const targetPage = document.getElementById(`page-${currentPageNum}`);
        if (targetPage) {
            targetPage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
            
            setTimeout(() => {
                isChangingPage = false;
            }, 500);
        } else {
            isChangingPage = false;
        }
    }
}

function startSmoothScroll(direction) {
    if (holdScrollInterval) return;
    
    const container = document.getElementById('pdfViewer');
    holdScrollInterval = setInterval(() => {
        container.scrollBy({
            top: direction * SCROLL_SPEED,
            behavior: 'auto'
        });
        
        // อัพเดตหน้าปัจจุบันตามตำแหน่งการเลื่อน
        const pages = document.getElementsByClassName('pdf-page');
        for (let i = 0; i < pages.length; i++) {
            const rect = pages[i].getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                currentPageNum = i + 1;
                updatePageControls();
                break;
            }
        }
    }, SCROLL_INTERVAL);
}

function stopSmoothScroll() {
    if (holdScrollInterval) {
        clearInterval(holdScrollInterval);
        holdScrollInterval = null;
    }
    isHoldingButton = false;
}

async function renderPage(pageNumber) {
    try {
        const page = await pdfDoc.getPage(pageNumber);
        const container = document.getElementById('pdfViewer');
        const containerWidth = container.clientWidth - 80;
        
        const originalViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / originalViewport.width;
        const viewport = page.getViewport({ scale: scale * currentScale });

        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page';
        canvas.id = `page-${pageNumber}`; // เพิ่ม ID ให้กับ canvas
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
            enableWebGL: false // ปิด WebGL เพื่อความเสถียร
        };

        await page.render(renderContext).promise;
        pagesContainer.appendChild(canvas);

    } catch (error) {
        console.error(`Error rendering page ${pageNumber}:`, error);
    }
}

function handleZoom(event) {
    event.preventDefault();
    const delta = Math.sign(event.deltaY);
    const oldScale = currentScale;

    if (delta > 0) {
        currentScale = Math.max(MIN_SCALE, currentScale - ZOOM_STEP);
    } else {
        currentScale = Math.min(MAX_SCALE, currentScale + ZOOM_STEP);
    }

    if (oldScale !== currentScale && pdfDoc) {
        // รอให้การ render เสร็จสิ้นก่อนทำการ zoom
        setTimeout(() => {
            pagesContainer.innerHTML = '';
            for(let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                renderPage(pageNum);
            }
        }, 100);
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

// เพิ่ม Event Listeners สำหรับปุ่มนำทาง
document.getElementById('prev-page').addEventListener('click', () => changePage(-1));
document.getElementById('next-page').addEventListener('click', () => changePage(1));

// เพิ่มการจัดการ keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        changePage(-1);
    } else if (e.key === 'ArrowDown') {
        changePage(1);
    }
});

// อัพเดตการผูก Event Listeners สำหรับปุ่มนำทาง
function initializePageControls() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (prevBtn && nextBtn) {
        // จัดการการคลิกปุ่มก่อนหน้า
        prevBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isHoldingButton = true;
            changePage(-1);
            setTimeout(() => {
                if (isHoldingButton) {
                    startSmoothScroll(-1);
                }
            }, 500);
        });

        // จัดการการคลิกปุ่มถัดไป
        nextBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isHoldingButton = true;
            changePage(1);
            setTimeout(() => {
                if (isHoldingButton) {
                    startSmoothScroll(1);
                }
            }, 500);
        });

        // จัดการการปล่อยปุ่ม
        document.addEventListener('mouseup', stopSmoothScroll);
        document.addEventListener('mouseleave', stopSmoothScroll);
        prevBtn.addEventListener('mouseleave', stopSmoothScroll);
        nextBtn.addEventListener('mouseleave', stopSmoothScroll);
    }

    // จัดการ keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!isChangingPage) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                changePage(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                changePage(1);
            }
        }
    });
}

// เรียกใช้ฟังก์ชันเมื่อโหลดเอกสาร
document.addEventListener('DOMContentLoaded', initializePageControls);

export { displayPDF };