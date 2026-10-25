/**
 * Project information shown on the opening screen and the title scene.
 * Fields left as '' are still blank in the proposal. Fill them in here;
 * the site shows a dotted placeholder until then.
 */
export const PROJECT = {
  title: 'MAGIC ENGLISH CUBES',
  titleVi: 'Khối lập phương kỳ diệu: Học từ vựng, sáng tạo câu Tiếng Anh',
  competition: 'Bài thi thiết kế chủ đề dạy học STEM/STEAM, chủ đề dạy học số cấp Thành phố',
  subject: 'Tiếng Anh',
  grade: 'Lớp 6',
  textbook: 'Global Success',
  unit: 'Unit 3 – My Friends',
  school: 'Trường THCS Phan Chu Trinh',
  locality: 'Phường Phú Mỹ, TP. Hồ Chí Minh',
  duration: '02 tiết trên lớp (mỗi tiết 45 phút), kết hợp chuẩn bị và chế tạo ở nhà',
  product: 'Bộ 03 xúc xắc lập phương, thẻ hướng dẫn, nhật ký thiết kế – thử nghiệm và minh chứng giao tiếp',
  /** Editable: not provided in the proposal. */
  teacherName: 'Sung Thị Kiều Nga',
  department: 'Anh Văn',
  schoolYear: '2026',
};

export const blankOr = (value: string) => (value.trim() ? value : '…………');
