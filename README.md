# Magic English Cubes

Website trình bày và minh họa chủ đề STEM/STEAM **Magic English Cubes – Khối lập phương kỳ diệu** cho Tiếng Anh 6, *Global Success*, **Unit 3 – My Friends**.

Website gồm bốn khu vực dùng chung trạng thái:

| Khu vực | Nội dung |
| --- | --- |
| **Trình bày** | 9 cảnh (~10 phút, gồm demo trực tiếp), ghi chú người trình bày, chọn cảnh, toàn màn hình, phím tắt |
| **Demo 3D** | 3 khối lập phương bìa in màu: xoay góc nhìn, gieo cả 3 hoặc từng khối, khóa/mở khóa, bộ sưu tập 18 mặt, ví dụ có hướng dẫn, khám phá tự do, quy trình Roll → Read → Build → Speak → Ask → Answer & Switch |
| **Thiết kế & Chế tạo** | Hình khai triển gấp thành khối và mở ra, cạnh 5–6 cm, tô nổi 6 mặt / 12 cạnh / 8 đỉnh, S = 6a², tai dán, vật liệu, quy trình, so sánh cách gia cố |
| **Đánh giá** | Cơ cấu 30% / 60% / 10%, rubric thiết kế và sản phẩm, quan sát nói cá nhân, phiếu thử nghiệm, nhật ký nhóm, vị trí minh chứng |

Website chạy hoàn toàn trong trình duyệt. Không cần máy chủ, đăng nhập hay dịch vụ AI. Phông chữ và hình vẽ đều nằm trong dự án nên vẫn dùng được khi không có mạng (sau khi đã cài đặt).

## Cài đặt

Cần Node.js 18 trở lên.

```bash
npm install
```

## Chạy khi phát triển

```bash
npm run dev
```

Sau đó mở <http://localhost:5173>.

## Đóng gói và chạy bản hoàn chỉnh

```bash
npm run build      # kiểm tra kiểu TypeScript và đóng gói vào dist/
npm run preview    # mở bản đóng gói tại http://localhost:4173
```

Thư mục `dist/` dùng đường dẫn tương đối nên có thể đặt trên bất kỳ máy chủ web tĩnh nào. Lưu ý: không mở trực tiếp `index.html` bằng cách nhấp đúp; cần chạy qua máy chủ (ví dụ `npm run preview`).

## Kiểm tra

```bash
npm test
```

Các bài kiểm tra tự động:

- **Từ vựng:** đúng 18 mặt theo hồ sơ. Mỗi khối dùng đủ 6 vị trí mặt.
- **Ghép câu:** cả 216 tổ hợp đều tạo được hai câu tương thích (`is` / `has`). Đại từ của Lan (she) và Nam (he) nhất quán. Với My best friend / My classmate có cả ba lựa chọn: lặp lại chủ ngữ, he, she.
- **Hội thoại A–B:** khớp với hai câu, bao gồm ví dụ trong hồ sơ ("Lan has long hair. She is friendly.").
- **Hướng mặt khối:** mỗi mặt khi ở trên đều nằm thẳng và chữ đọc được.
- **Hình khai triển:** gấp lại thành khối kín (8 đỉnh, 12 cạnh, 6 mặt); có 7 tai dán; S = 6a².

## Cách trình bày

1. Mở trang chủ, bấm **Bắt đầu thuyết trình**.
2. Phím tắt:

   | Phím | Tác dụng |
   | --- | --- |
   | `→` / `PageDown` / `Space` | Cảnh tiếp |
   | `←` / `PageUp` | Cảnh trước |
   | `Home` / `End` | Cảnh đầu / cảnh cuối |
   | `F` | Toàn màn hình |
   | `N` | Ghi chú người trình bày |

   Phím tắt không hoạt động khi đang gõ chữ hoặc đang thao tác trong vùng 3D.
3. Ở **cảnh 5**, bấm **Mở demo có hướng dẫn**. Demo đặt sẵn Lan / has long hair / is friendly. Làm lần lượt: đọc ba mặt, hiện hai câu, hỏi – đáp, đổi vai.
4. Bấm **← Quay lại bài thuyết trình** để trở về đúng cảnh 5. Từ vựng đã chọn trong demo được giữ nguyên và hiển thị ở các cảnh.

Trạng thái (cảnh hiện tại, mặt khối, khóa, lựa chọn he/she) được lưu trong phiên trình duyệt. Tải lại trang không làm mất chỗ đang trình bày.

## Chỉnh sửa nội dung

Toàn bộ nội dung nằm trong `src/content/`:

| Tệp | Nội dung |
| --- | --- |
| `project.ts` | Tên chủ đề, trường. **Điền `teacherName`, `department`, `schoolYear`** (đang để trống vì hồ sơ chưa có) |
| `vocabulary.ts` | 18 mặt: mã từ vựng, chữ in, mặt vật lý (`slot`), hình, mô tả hình, đại từ |
| `scenes.ts` | Tiêu đề và ghi chú người trình bày của 9 cảnh |
| `teaching.ts` | 5 hoạt động, các bước trên lớp, quy trình chơi, chủ đề mở rộng |
| `assessment.ts` | Cơ cấu điểm, rubric, phiếu quan sát, mẫu phiếu thử nghiệm (đánh dấu "Dữ liệu minh họa") |
| `build.ts` | Vật liệu, quy trình làm khối, so sánh gia cố, lưu ý an toàn |

Hình minh họa 18 mặt là SVG trong `public/art/`, được tạo từ `scripts/generate-art.mjs`. Chạy `npm run art` để tạo lại. Hai hình trong hồ sơ được dùng lại trong `public/reference/` và có ghi chú nguồn.

## Lưu ý về minh chứng

- Mô hình 3D và hình khối CSS là **hình minh họa**, không phải ảnh sản phẩm học sinh.
- Độ bền thật phải kiểm chứng bằng khối bìa thật (ít nhất 10 lượt gieo/khối).
- Phiếu thử nghiệm mặc định để trống. Phần "Ví dụ điền mẫu" luôn ghi **Dữ liệu minh họa**.
- Ảnh lớp học (Hình 3–5) được đánh dấu **[Bổ sung sau khi triển khai]**.

## Chế độ dự phòng và trợ năng

- Nếu trình duyệt không có WebGL, demo và trang chế tạo tự chuyển sang bản 2D, vẫn gieo, khóa và ghép câu được. Thêm `?mode=2d` vào địa chỉ để xem thử, ví dụ `http://localhost:4173/?mode=2d#/demo`.
- Khi thiết bị bật chế độ giảm chuyển động, khối xoay tới kết quả ngay lập tức.
- Cảnh 3D chỉ vẽ lại khi có thay đổi, không chạy liên tục khi đứng yên.
- Mọi nút đều dùng được bằng bàn phím và có viền tiêu điểm rõ.

## Công nghệ

React 18, TypeScript, Vite, Three.js, React Three Fiber và Drei. Phông Baloo 2 và Nunito (hỗ trợ tiếng Việt) được lưu cục bộ qua `@fontsource`.
