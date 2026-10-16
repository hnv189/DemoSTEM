/** Assessment content (proposal, Phương án đánh giá + Phụ lục 1, 2, 3, 5, 6, 7). */

export const WEIGHTS = [
  { id: 'design', label: 'Thiết kế', percent: 30, note: 'Phụ lục 1 · điểm nhóm: GV 70% + HS đánh giá chéo 30%', color: '#69C7EE' },
  { id: 'product', label: 'Sản phẩm và trình bày', percent: 60, note: 'Phụ lục 2 · điểm nhóm: GV 70% + HS đánh giá chéo 30%', color: '#8BD8BC' },
  { id: 'portfolio', label: 'Hồ sơ học tập', percent: 10, note: 'Nhật ký nhóm, phiếu thử nghiệm, bài phản tư', color: '#FFB45F' },
];

export const DESIGN_RUBRIC = [
  'Thể hiện đúng cấu trúc 03 khối và vai trò ngữ liệu',
  'Có hình khai triển 6 mặt vuông đúng hình học',
  'Có ghi kích thước và danh sách vật liệu',
  'Có ít nhất 02 phương án và lý do chọn giải pháp',
  'Mô tả quy trình cắt – gấp – dán – kiểm tra',
  'Nội dung các mặt bảo đảm quy tắc ghép câu đúng ngữ pháp',
  'Bố cục, ký hiệu/màu phân biệt ba khối rõ ràng',
  'Thuyết trình rõ ràng, có minh họa 01 tổ hợp',
  'Giải đáp được câu hỏi phản biện về kỹ thuật hoặc ngữ pháp',
  'Tham gia đóng góp ý kiến có chất lượng cho nhóm bạn',
];

export const PRODUCT_RUBRIC = [
  { criterion: 'Hình học – kết cấu', good: '03 khối vuông vắn, bền, 6 mặt rõ', pass: 'Có lệch nhỏ, còn dùng được', fail: 'Sai hình/không sử dụng được', max: 2 },
  { criterion: 'Vật liệu – an toàn', good: 'Tái chế hợp lý, mép an toàn, đẹp', pass: 'Còn vài mép chưa gọn', fail: 'Mất an toàn hoặc lãng phí', max: 1 },
  { criterion: 'Nội dung từ vựng', good: '18 mặt đúng, dễ đọc, phù hợp Unit 3', pass: 'Lỗi nhỏ, chỉnh được', fail: 'Nhiều từ sai/khó đọc', max: 2 },
  { criterion: 'Ghép câu – giao tiếp', good: 'Ghép câu đúng, hỏi – đáp hai chiều', pass: 'Còn cần gợi ý', fail: 'Không thực hiện được', max: 3 },
  { criterion: 'Thử nghiệm – cải tiến', good: 'Có số liệu, sửa lỗi và thử lại', pass: 'Có thử nhưng ít chứng cứ', fail: 'Không thử/không cải tiến', max: 1 },
  { criterion: 'Báo cáo – hợp tác', good: 'Có chia vai, trả lời và phối hợp tốt', pass: 'Phối hợp chưa đều', fail: 'Thiếu tham gia', max: 1 },
];

export const SPEAKING_OBSERVATION = [
  'Từ vựng phù hợp',
  'Ngữ pháp, tạo 2 câu',
  'Phát âm, mức độ rõ ràng',
  'Hỏi – đáp và phản hồi bạn',
  'Mạnh dạn, tham gia đúng lượt',
];

export const PORTFOLIO_LOG = [
  'Xác định vấn đề và phân công',
  'Hai phương án thiết kế',
  'Chế tạo lần 1',
  'Thử nghiệm và ghi số liệu',
  'Sửa lỗi – thử lại',
  'Thuyết trình và rút kinh nghiệm',
];

/** Evidence the teacher adds after running the project (Phụ lục 7). */
export const EVIDENCE_SLOTS = [
  { figure: 'Hình 3', label: 'Ảnh bản vẽ thiết kế của học sinh' },
  { figure: 'Hình 4', label: 'Ảnh quá trình cắt, gấp, dán khối' },
  { figure: 'Hình 5', label: 'Ảnh sản phẩm hoàn thiện và hoạt động giao tiếp' },
];

/**
 * Example of a filled testing form, shown only when the user asks for it
 * and always labelled "Dữ liệu minh họa". These are not classroom results.
 */
export const SAMPLE_TEST_RECORD = {
  group: 'Nhóm minh họa',
  edges: ['6,0', '5,9', '6,1'],
  intact: [10, 9, 10],
  readable: [10, 10, 9],
  combos: [
    { roll: 'Nam / is slim / is funny', sentences: 'Nam is slim. He is funny.', ok: true },
    { roll: 'She / is tall / is confident', sentences: 'She is tall. She is confident.', ok: true },
    { roll: 'My classmate / has short hair / is creative', sentences: 'My classmate has short hair. My classmate is creative.', ok: true },
    { roll: 'Lan / has long hair / is friendly', sentences: 'Lan has long hair. She is friendly.', ok: true },
    { roll: 'He / has curly hair / is kind', sentences: 'He has curly hair. He is kind.', ok: true },
  ],
  members: { spoke: 5, total: 5 },
  problem: 'Ví dụ: một tai dán khối 2 bị bung sau lượt gieo thứ 7.',
  change: 'Ví dụ: dán lại tai rộng hơn và chờ keo khô lâu hơn.',
  retest: 'Ví dụ: gieo lại 10 lượt sau khi sửa.',
};
