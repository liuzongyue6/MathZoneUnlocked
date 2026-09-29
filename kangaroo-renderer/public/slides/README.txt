课件是自动识别的，不用手动改代码：

1. 转格式：PowerPoint/Keynote/WPS 另存为 PDF，或 Google Slides 用
   文件 -> 下载 -> PDF 文档导出。批量转换可用 LibreOffice：
   soffice --headless --convert-to pdf *.pptx

2. 把 PDF 放进对应年级文件夹即可（文件名随意）：
   MK_G1_2/<任意文件名>.pdf
   MK_G5_6/<任意文件名>.pdf
   PreCalculus/<任意文件名>.pdf   （显示在主页 PreCalculus 卡片里，不在袋鼠「上课课件」里）
   除了 PDF，也支持 .md（网页里直接排版显示，支持表格和 $公式$）
   和 .docx（只提供下载，浏览器无法预览）。
   新增其它课程文件夹：在 scripts/build-slides-manifest.mjs 的 COURSE_DIRS
   和 src/ui/slides/slidesContent.ts 的 SlideGrade 里登记。

3. 跑一次 `npm run dev` 或 `npm run build`（会自动先跑
   scripts/build-slides-manifest.mjs 重新扫描并生成
   public/slides/manifest.json），网页「上课课件」里就会自动出现新文件。
   也可以手动跑：cd kangaroo-renderer && npm run slides:manifest

4. 默认标题是文件名（下划线/横线换成空格）。想要更好看的中文标题/日期，
   在这个文件夹新建 titles.json，按文件名登记覆盖值，例如：
   {
     "MathKangaroo_G1_2_26_Summer_10_Classes.pdf": {
       "title": "2026 暑假班 · Grade 1-2 · 10 讲合集",
       "date": "2026-06-01"
     }
   }
   没有登记的文件仍会用文件名自动生成标题，titles.json 是可选的。
