# แอพพลิเคชันแสดงไฟล์ PDF

โปรเจคนี้เป็นเว็บแอพพลิเคชันสำหรับอัพโหลดและแสดงไฟล์ PDF พร้อมระบบนำทางและการควบคุมที่ใช้งานง่าย

## โครงสร้างโปรเจค

```
pdf-viewer-app
├── src
│   ├── css
│   │   └── styles.css       # ไฟล์สำหรับจัดการรูปแบบการแสดงผล
│   ├── js
│   │   ├── app.js          # จัดการการทำงานหลักและการโต้ตอบกับผู้ใช้
│   │   └── pdfViewer.js    # ระบบแสดงผลไฟล์ PDF
│   └── index.html          # หน้าหลักของแอพพลิเคชัน
├── package.json            # ไฟล์กำหนดค่าสำหรับ npm
└── README.md              # เอกสารอธิบายโปรเจค
```

## ฟังก์ชันการทำงาน

### การแสดงผล PDF
- แสดงไฟล์ PDF แบบหลายหน้า
- ปรับขนาดอัตโนมัติให้พอดีกับหน้าจอ
- รองรับการเลื่อนดูเอกสารแบบ scroll
- แสดงเงาที่ขอบเอกสารเพื่อแยกแต่ละหน้า
- ปรับขนาดอัตโนมัติเมื่อเปลี่ยนขนาดหน้าจอ

### การจัดการไฟล์
- อัพโหลดไฟล์ PDF ผ่านปุ่ม "Choose File"
- ตรวจสอบประเภทไฟล์อัตโนมัติ (รองรับเฉพาะ .pdf)
- แจ้งเตือนเมื่ออัพโหลดไฟล์ผิดประเภท

### การแสดงผลหน้าเอกสาร
- รองรับการแสดงผล PDF ทุกหน้า
- จัดเรียงหน้าในแนวตั้ง
- ระยะห่างระหว่างหน้าอัตโนมัติ
- จัดกึ่งกลางเอกสารในพื้นที่แสดงผล

### การนำทางเอกสาร
- แถบควบคุมด้านขวาแสดงหน้าปัจจุบันและจำนวนหน้าทั้งหมด
- ปุ่มลูกศรขึ้น-ลงสำหรับเปลี่ยนหน้า
- รองรับการกดค้างปุ่มเพื่อเลื่อนหน้าอย่างต่อเนื่อง
- แสดงผลแบบ smooth scrolling เมื่อเปลี่ยนหน้า
- รองรับการใช้ปุ่มลูกศรบนคีย์บอร์ด

### การจัดการการแสดงผล
- ซูมเข้า-ออกด้วย Ctrl + เลื่อนเมาส์
- ปรับขนาดอัตโนมัติให้พอดีกับความกว้างหน้าจอ
- แสดง loading indicator ระหว่างโหลดเอกสาร
- รองรับการแสดงผลบนอุปกรณ์มือถือ
- อัพเดตหน้าปัจจุบันอัตโนมัติตามตำแหน่งการเลื่อน

### การควบคุมการทำงาน
- กดปุ่มครั้งเดียวเพื่อเปลี่ยนทีละหน้า
- กดค้างปุ่มเพื่อเลื่อนอย่างต่อเนื่อง
- ป้องกันการเปลี่ยนหน้าซ้ำซ้อน
- แสดงสถานะปุ่มเมื่อถึงหน้าแรกหรือหน้าสุดท้าย
- รองรับการยกเลิกการเลื่อนเมื่อเมาส์ออกนอกปุ่ม

## วิธีการติดตั้ง

1. โคลนโปรเจค:
   ```
   git clone <repository-url>
   ```

2. เข้าไปยังโฟลเดอร์โปรเจค:
   ```
   cd pdf-viewer-app
   ```

3. ติดตั้ง dependencies:
   ```
   npm install
   ```

4. เปิดไฟล์ `src/index.html` ในเว็บบราวเซอร์เพื่อเริ่มใช้งาน

## เทคโนโลยีที่ใช้
- PDF.js: ไลบรารีสำหรับแสดงผลไฟล์ PDF
- JavaScript Modules: ระบบโมดูลสำหรับจัดการโค้ด
- Flexbox: ระบบจัดการ Layout
- CSS Grid: ระบบจัดการการแสดงผลแบบตาราง

## ข้อจำกัด
- รองรับเฉพาะไฟล์ PDF เท่านั้น
- ต้องใช้งานผ่านเว็บเซิร์ฟเวอร์เพื่อให้ JavaScript Modules ทำงานได้
- ขนาดไฟล์ PDF ขึ้นอยู่กับความสามารถของเบราว์เซอร์

## การใช้งานปุ่มควบคุม

### การเปลี่ยนหน้า
- คลิกปุ่มลูกศรเพื่อเปลี่ยนทีละหน้า
- กดค้างปุ่มลูกศรเพื่อเลื่อนต่อเนื่อง
- ใช้ปุ่มลูกศรขึ้น-ลงบนคีย์บอร์ด
- เลื่อนเมาส์เพื่อดูทุกหน้า

### การซูม
- กด Ctrl + เลื่อนเมาส์ขึ้นเพื่อซูมเข้า
- กด Ctrl + เลื่อนเมาส์ลงเพื่อซูมออก
- ซูมได้ตั้งแต่ 50% ถึง 300%

## การปรับปรุงล่าสุด
- เพิ่มระบบนำทางด้วยปุ่มลูกศร
- ปรับปรุงการเลื่อนหน้าให้นุ่มนวลขึ้น
- เพิ่มการแสดงหน้าปัจจุบันและจำนวนหน้าทั้งหมด
- แก้ไขปัญหาการแสดงผลหน้าซ้ำ
- ปรับปรุงประสิทธิภาพการโหลดและแสดงผล

## สิทธิ์การใช้งาน
โปรเจคนี้อยู่ภายใต้ MIT License