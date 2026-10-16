/** Construction content (proposal, "Các bước làm một khối hình lập phương bằng bìa tái chế"). */

export const MATERIALS = [
  { name: 'Bìa carton/bìa hộp giấy sạch', note: 'Phẳng, không ẩm, không bẩn' },
  { name: 'Thước kẻ', note: 'Đo và vẽ các ô vuông cạnh a' },
  { name: 'Kéo an toàn (đầu tròn)', note: 'Không dùng dao rọc giấy một mình' },
  { name: 'Keo giấy / hồ dán', note: 'Không dùng keo nóng một mình' },
  { name: 'Giấy màu', note: 'Màu phân biệt WHO – LOOKS – PERSONALITY' },
];

export const BUILD_STEPS = [
  { id: 'measure', name: 'Đo', text: 'Chọn cạnh a ≈ 5–6 cm (dễ thao tác nhất: a = 6 cm).' },
  { id: 'draw', name: 'Vẽ', text: 'Vẽ 6 ô vuông bằng nhau: 4 ô thẳng hàng, 1 ô trên và 1 ô dưới ô thứ hai; thêm tai dán 0,7–1,0 cm.' },
  { id: 'cut', name: 'Cắt', text: 'Cắt theo đường viền ngoài bằng kéo an toàn.' },
  { id: 'crease', name: 'Tạo nếp', text: 'Miết nếp nhẹ theo các cạnh chung; gấp thử không dán để kiểm tra 6 mặt và độ khít.' },
  { id: 'label', name: 'Ghi nhãn', text: 'Viết/dán 6 từ hoặc cụm từ đúng vai trò của khối; chữ lớn, màu tương phản.' },
  { id: 'glue', name: 'Dán', text: 'Dán tai vào bên trong, khép khối, gia cố nếu cần và chờ keo khô.' },
  { id: 'test', name: 'Thử nghiệm', text: 'Gieo mỗi khối ít nhất 10 lượt; gieo 3 khối cùng lúc ít nhất 5 lượt để kiểm tra câu.' },
  { id: 'improve', name: 'Cải tiến', text: 'Gia cố tai bung, chỉnh mép lệch, tăng cỡ chữ; thử lại sau khi sửa.' },
];

/** Qualitative comparison only: durability must be measured on real cardboard cubes. */
export const REINFORCEMENT = [
  {
    name: 'Bìa một lớp, tai dán thường',
    pros: 'Nhanh, ít vật liệu, dễ gấp',
    cons: 'Mép dễ bung, khối có thể móp sau nhiều lượt gieo',
    when: 'Gấp thử, làm mẫu nháp',
  },
  {
    name: 'Tai dán rộng (≈ 1 cm), dán vào bên trong',
    pros: 'Diện tích dán lớn hơn, mép chắc hơn',
    cons: 'Tốn thêm bìa; tai chồng dày nếu đặt sai vị trí',
    when: 'Phương án mặc định cho sản phẩm',
  },
  {
    name: 'Gia cố trong: lót thêm một lớp bìa hoặc vách chữ thập',
    pros: 'Khối cứng, khó móp, lăn đều hơn',
    cons: 'Khó lắp, nặng hơn, cần đo chính xác',
    when: 'Khi thử nghiệm thấy khối bị móp hoặc méo',
  },
];

export const SAFETY = [
  'Không lộ cạnh sắc hoặc ghim nhọn; mặt không bong, khối lăn được.',
  'Không dùng dao rọc giấy hoặc keo nóng một mình.',
  'Không dùng vật liệu bẩn, kim loại sắc hay mực có mùi mạnh.',
];
