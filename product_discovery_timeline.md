# ScholarLens: Product Discovery Timeline & Q&A

Tài liệu này lưu trữ các câu hỏi, phân tích kỹ thuật và quyết định kiến trúc trong quá trình phát triển sản phẩm ScholarLens.

---

## Ngày 12 Tháng 04 Năm 2026

### Câu hỏi: Export LaTeX/Markdown có dùng trên Client-side được không?
**Ngữ cảnh:** Hệ thống có thể dùng chính sức mạnh trình duyệt, GPU, CPU máy tính của User (Client-side) để convert file PDF (kích thước tối đa 50MB) sang LaTeX và Markdown được không?

### Trả lời & Đánh giá phân tích kỹ thuật của Antigravity AI
Về mặt lý thuyết là **CÓ THỂ**, nhưng về mặt thực tiễn phát triển sản phẩm thì **KHÔNG NÊN** và rất khó để đạt chất lượng độ chính xác chuẩn học thuật. Dưới đây là phân tích chi tiết:

#### 1. Bản chất của file PDF học thuật
PDF là một định dạng **hiển thị tọa độ** (draw text A ở tọa độ x, y), chứ không phải là định dạng **cấu trúc** (như HTML hay Markdown). Khi bạn muốn lấy LaTeX/Markdown, hệ thống không chỉ đọc text mà còn phải:
- Giải quyết bố cục hai cột (2-column layout) để text không bị đọc trộn kẽ ngang.
- Nhận dạng lại các công thức toán học bị vỡ thành các ký tự rời rạc.
- Dóng hàng lại lưới ma trận của các bảng biểu (Tables) phức tạp.

#### 2. Nếu cố gắng xử lý 100% trên Client-Side (Trình duyệt User)
Chúng ta sẽ có 2 lựa chọn công nghệ, nhưng cả 2 đều có tử huyệt lớn đối với file PDF 50MB:

**Cơ chế 1: Dùng Parsing truyền thống (Text Extraction qua JavaScript/WASM)**
* **Cách làm:** Bạn dùng thư viện như `pdf.js` hoặc biên dịch `poppler` (viết bằng C++) sang WebAssembly (WASM) để chạy ở trình duyệt. Phương pháp này quét toàn bộ text và dùng Regex/Logic quy tắc để đoán cấu trúc.
* **Hệ quả:** 
  - **Ưu điểm:** Nhẹ, chạy nhanh, ít tốn tài nguyên máy tính.
  - **Nhược điểm:** Các công thức toán (Math formulas) sẽ biến thành chuỗi mã rác, bảng biểu sẽ bị dồn hàng, và chế độ 2 cột sẽ đọc text lộn xộn theo phương ngang. Bản Markdown/LaTeX xuất ra bị hỏng cấu trúc.

**Cơ chế 2: Dùng Local AI / Vision Models (WebGPU & Transformers.js)**
* **Cách làm:** Trích xuất file PDF dưới dạng hàng loạt file ảnh (hình chụp từng trang). Kéo một model AI như Nougat (Meta) hoặc Marker xuống trình duyệt qua *Transformers.js*, sử dụng GPU của User (qua WebGPU) để lấy LaTeX/Markdown từ các bức ảnh đó.
* **Hệ quả:** 
  - Một file PDF 50MB có thể chứa 40-70 trang. Lần đầu vào web, máy người dùng sẽ mất thời gian tải bộ tham số Model AI nặng khoảng **0.5GB - 1GB** về bộ nhớ đệm (cache browser). 
  - Khi bắt đầu convert, quá trình Model chạy nội suy trên máy người dùng nội bộ sẽ ngốn rất nhiều RAM GPU. Một laptop văn phòng thông thường (8GB RAM, không có GPU rời, không cài đặt Metal/Vulkan API chuẩn) sẽ dễ dàng bị trình duyệt báo lỗi `Out of Memory` và làm **Force Close (Sập tab Chrome/Safari)** ngay lập tức. Ngay cả với máy mạnh thì tiến trình cũng phải mất vài phút mới kết thúc.

#### 3. Quyết định & Khuyến nghị Kiến trúc
Nếu tính năng trích xuất chính xác cấu trúc LaTeX/Markdown là Core Value của chức năng:
* **Tuyệt đối không đẩy tác vụ inference nặng xuống Client-side** đối với các file PDF size lớn (50MB+).
* **Kiến trúc Cloud-API:** Client chỉ đóng vai trò upload/đẩy file PDF đi. Xử lý nặng bằng các mô hình Vision LLM chuyên môn trên Backend/Server chứa NVIDIA GPU để bảo chứng trải nghiệm người dùng không bị sập. (Ví dụ: gọi API của MathPix, Groq LLaVA, thư viện Marker chạy server, hoặc Claude 3.5 Sonnet Vision).
* **Kết luận tạm thời:** Ở giai đoạn V2/mới mở rộng của ScholarLens, chúng ta tiếp tục giữ vai trò của Client-side gói gọn ở việc parse metadata và render PDF liên tục thân thiện, chưa nên nhúng AI extraction tại Front-end.

---

### Câu hỏi: Bôi đen chọn text trong file pdf, sau đó note lại, tham khảo Paperpile. Có thể Save As file PDF mới có annotated data?
**Ngữ cảnh:** User muốn có khả năng bôi đen (Highlight) đoạn văn bản trực tiếp trên màn hình đọc PDF, ghi chú (Note) vào đó giống như công cụ quản lý tài liệu Paperpile đang làm, và sau đó bấm lưu ("Save As") để tải xuống một file PDF hoàn toàn mới có chứa vĩnh viễn các ghi chú đó.

### Trả lời & Đánh giá phân tích kỹ thuật của Antigravity AI
Đánh giá mức độ khả thi: **HOÀN TOÀN KHẢ THI 100% TRÊN CLIENT-SIDE (CỰC KỲ NÊN LÀM)**.

Đây là một Feature học thuật cực kỳ đắt giá, phù hợp hoàn hảo với định vị ScholarLens (Analyzer Dashboard) và hoàn toàn làm được mà không cần Server/Backend. Dưới đây là phân tích luồng kiến trúc (Architecture Flow) để bạn tham khảo phát triển:

#### 1. Vẽ Highlight và Text Layer trên Giao Diện (UI)
* **Text Selection:** Chúng ta đang sử dụng thư viện `pdf.js` để render các trang PDF lên thẻ `<canvas>`. Bản thân `pdf.js` có hỗ trợ kết xuất thêm một lớp `TextLayer` vô hình đè đúp lên trên Canvas. Lớp TextLayer này chứa văn bản thật, cho phép User dùng chuột **bôi đen (select text)** như một trang web bình thường.
* **Tạo Annotation UI:** Khi User bôi đen xong đoạn văn bản mong muốn, chúng ta sử dụng JavaScript bắt sự kiện (Event Listener) lấy tọa độ Bounding Box của vùng bôi đen đó. Sau đó, hiển thị một nút Pop-up nhỏ (giống Medium hoặc Paperpile) cho phép người dùng nhập Note/Comment hoặc chọn màu Highlight.

#### 2. Dữ liệu lưu trữ tạm thời (State Management)
* Những tọa độ Bounding Box (x, y, width, height) và Note mà User vừa tạo sẽ được lưu vào một biến `annotations` trong JavaScript state. Trình duyệt liên tục phủ màu (Highlight Box) dựa trên tọa độ này để người dùng nhìn thấy trực tiếp.

#### 3. Chức năng Xuất (Save As) File PDF Mới
Để User tải xuống một file PDF đã được nhúng vĩnh viễn các Highlight này (người khác mở bằng Adobe Reader cũng thấy được), chúng ta cần dùng thêm thư viện **`pdf-lib`**.
* **Nguyên lý:** Mọi file PDF mà người dùng đang đọc thực chất đang được lưu trữ dưới dạng bộ nhớ `ArrayBuffer` trong RAM của trình duyệt.
* **Thực thi:** Khi User bấm nút tải xuống `[⬇ Download Annotated PDF]`, chúng ta ném `ArrayBuffer` nguyên gốc này vào thư viện `pdf-lib`. Hàm API của `pdf-lib` cực kỳ mạnh, cho phép chúng ta vẽ thêm các Object Annotation chuẩn PDF (Highlight, Sticky Notes) vào đè lên các tọa độ mà ta đã bắt được từ Bước 1.
* **Hoàn tất:** `pdf-lib` sẽ compile (biên dịch) trực tiếp tại trình duyệt ra một file `Uint8Array` hoàn toàn mới và kích hoạt cơ chế tự động tải file xuống của Chrome/Safari. Không có một byte dữ liệu nào cần gửi lên Server.

#### Kết luận & Next Step
Flow kiến trúc này hoàn toàn khép kín, hoạt động siêu nhanh tại Client và là một công cụ tuyệt hảo. Nếu thống nhất đưa tính năng này vào Roadmap, Antigravity AI có thể lên kế hoạch viết module kết hợp giữa `pdf.js` (để đọc và hiển thị highlight tạm thời) và `pdf-lib` (để ghi đè và xuất file PDF cứng).
