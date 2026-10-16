/**
 * The nine presentation scenes (about 10 minutes including the live demo).
 * `notes` are presenter notes, hidden by default (press N or open "Ghi chú").
 */
export interface SceneMeta {
  id: string;
  kicker: string;
  title: string;
  minutes: number;
  notes: string[];
}

export const SCENES: SceneMeta[] = [
  {
    id: 'intro',
    kicker: 'Chủ đề STEM/STEAM · Tiếng Anh 6',
    title: 'Magic English Cubes',
    minutes: 0.5,
    notes: [
      'Giới thiệu tên chủ đề: Khối lập phương kỳ diệu – học từ vựng, sáng tạo câu Tiếng Anh.',
      'Đối tượng: Lớp 6, SGK Global Success, Unit 3 – My Friends. Thời lượng: 02 tiết 45 phút, kết hợp chuẩn bị và chế tạo ở nhà.',
      'Sản phẩm: bộ 03 xúc xắc lập phương bằng bìa tái chế, thẻ hướng dẫn, nhật ký thiết kế – thử nghiệm và minh chứng giao tiếp.',
    ],
  },
  {
    id: 'problem',
    kicker: 'Vấn đề thực tiễn',
    title: 'Biết từ, nhưng chưa nói thành câu',
    minutes: 1,
    notes: [
      'Học sinh lớp 6 thường nhớ từ vựng rời rạc nhưng chưa vận dụng linh hoạt để tạo câu và nói với bạn.',
      'Một số em ít chủ động khi luyện nói; học cụ dùng một lần nhanh nhàm chán.',
      'Câu hỏi định hướng: làm sao để học sinh tự chế tạo bộ xúc xắc tái sử dụng, ghép được nhiều câu đúng ngữ pháp, dễ chơi, dễ thay chủ đề và khuyến khích giao tiếp tự nhiên?',
    ],
  },
  {
    id: 'solution',
    kicker: 'Giải pháp',
    title: 'Học sinh thiết kế, chế tạo, thử nghiệm và sử dụng 3 khối lập phương',
    minutes: 1,
    notes: [
      'Nhóm 4–5 học sinh nghiên cứu, phác thảo, chế tạo 03 khối có các mặt: chủ ngữ, ngoại hình, tính cách.',
      'Yêu cầu: khối cân đối, dễ lăn, bền, chữ rõ; thẻ nội dung có thể thay mới để dùng lại ở bài sau.',
      'Huy động kiến thức S – T – E – M – A: vật liệu và độ bền; thiết kế mẫu in; kết cấu tai dán; hình khai triển và diện tích; màu sắc, ký hiệu.',
    ],
  },
  {
    id: 'mechanism',
    kicker: 'Nguyên lý ngôn ngữ',
    title: 'Ba khối, hai câu đúng ngữ pháp',
    minutes: 1.5,
    notes: [
      'Không đặt rời rạc “he / hair / friendly” vì dễ tạo tổ hợp vô nghĩa. Mỗi mặt khối 2, 3 là một vị ngữ hoàn chỉnh có sẵn “is” hoặc “has”.',
      'Mọi chủ ngữ của khối 1 đều ở ngôi thứ ba số ít nên luôn tương thích với “is” và “has”.',
      'Câu 1 = WHO + LOOKS. Câu 2 = WHO (hoặc he/she) + PERSONALITY. Ví dụ: “Lan has long hair. She is friendly.”',
      'Lan và Nam là nhân vật hư cấu của trò chơi, không gán đặc điểm cho bạn thật.',
    ],
  },
  {
    id: 'demo',
    kicker: 'Trình diễn trực tiếp',
    title: 'Roll → Read → Build → Speak → Ask → Answer & Switch',
    minutes: 2.5,
    notes: [
      'Mở demo có hướng dẫn: ví dụ Lan / has long hair / is friendly.',
      'Lần lượt: đọc ba mặt, bấm hiện hai câu, đọc hội thoại A–B, sau đó đổi vai.',
      'Nếu còn thời gian, chuyển sang Khám phá tự do và gieo một tổ hợp ngẫu nhiên, ví dụ “He / is slim / is creative”.',
      'Bấm “Quay lại bài thuyết trình” để trở về đúng cảnh này.',
    ],
  },
  {
    id: 'build',
    kicker: 'STEM – Chế tạo',
    title: 'Từ hình khai triển đến khối lập phương',
    minutes: 1,
    notes: [
      'Hình khai triển: 4 ô thẳng hàng, thêm 1 ô phía trên và 1 ô phía dưới ô thứ hai.',
      'Cạnh a ≈ 5–6 cm; tai dán 0,7–1,0 cm; diện tích 6 mặt = 6a² (chưa tính tai dán).',
      'Hình lập phương có 6 mặt, 12 cạnh, 8 đỉnh. Thử ít nhất 10 lượt gieo/khối, ghi lỗi và cải tiến.',
      'Mô hình 3D chỉ là minh họa; độ bền thực tế phải kiểm chứng bằng sản phẩm bìa thật.',
    ],
  },
  {
    id: 'plan',
    kicker: 'Tiến trình dạy học',
    title: '5 hoạt động, 2 tiết học 45 phút',
    minutes: 1,
    notes: [
      'Trước tiết 1 (ở nhà): Hoạt động 1 xác định vấn đề; Hoạt động 2 nghiên cứu kiến thức, đề xuất giải pháp.',
      'Tiết 1: Hoạt động 3 trình bày, phản biện, lựa chọn thiết kế (5 + 25 + 10 + 5 phút).',
      'Sau tiết 1 (ở nhà): Hoạt động 4 chế tạo, thử nghiệm, cải tiến.',
      'Tiết 2: Hoạt động 5 vận hành trò chơi, giao tiếp và đánh giá chéo (5 + 25 + 10 + 5 phút).',
    ],
  },
  {
    id: 'assessment',
    kicker: 'Đánh giá',
    title: 'Đánh giá bằng minh chứng',
    minutes: 1,
    notes: [
      'Cơ cấu đề xuất: Thiết kế 30% + Sản phẩm và trình bày 60% + Hồ sơ học tập 10%.',
      'Phần Thiết kế và Sản phẩm: điểm nhóm có thể tổng hợp GV 70% + HS đánh giá chéo 30%.',
      'Kỹ năng nói được quan sát riêng từng học sinh, không thay thế điểm sản phẩm nhóm.',
      'Phiếu thử nghiệm: kích thước, 10 lượt gieo/khối, độ bền, đọc mặt, ≥ 5 lượt ghép câu, sự tham gia, lỗi – điều chỉnh – thử lại.',
    ],
  },
  {
    id: 'closing',
    kicker: 'Tổng kết',
    title: 'Một bộ khối, dùng lại cho nhiều bài học',
    minutes: 0.5,
    notes: [
      'Thẻ nội dung có thể thay mới; khung khối được dùng lại.',
      'Nhóm khá giỏi có thể viết thêm 6 mặt mới và chứng minh mọi tổ hợp vẫn đúng ngữ pháp.',
      'Mở rộng: Unit 4 – My Neighbourhood, Unit 5 – Natural Wonders of Viet Nam, nhưng phải thiết kế lại quy tắc ngữ pháp, không dùng máy móc 3 khối cũ.',
    ],
  },
];
