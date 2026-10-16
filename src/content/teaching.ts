/** Teaching plan (proposal, Phần 3). */

export interface Activity {
  number: number;
  title: string;
  when: string;
  where: 'home' | 'class';
  duration?: string;
  goal: string;
  product: string;
  steps?: { label: string; minutes?: number; text: string }[];
}

export const ACTIVITIES: Activity[] = [
  {
    number: 1,
    title: 'Xác định vấn đề',
    when: 'Trước tiết 1',
    where: 'home',
    goal: 'Xác định nhu cầu tạo học cụ giúp ghép câu và luyện nói; hiểu tiêu chí sản phẩm lập phương.',
    product: 'Phiếu xác định vấn đề, tiêu chí và bảng phân nhiệm.',
  },
  {
    number: 2,
    title: 'Nghiên cứu kiến thức, đề xuất giải pháp',
    when: 'Trước tiết 1',
    where: 'home',
    goal: 'Vận dụng hình học, ngữ pháp và hiểu biết vật liệu để so sánh phương án thiết kế.',
    product: 'Hai bản phác thảo/nhóm, kế hoạch vật liệu, thử 3 câu ghép ngẫu nhiên.',
  },
  {
    number: 3,
    title: 'Trình bày và lựa chọn thiết kế',
    when: 'Tiết 1',
    where: 'class',
    duration: '45 phút',
    goal: 'Nhóm lựa chọn và bảo vệ phương án kỹ thuật cùng hệ thống ngữ liệu.',
    product: 'Bản thiết kế đã điều chỉnh, bảng phân công, kế hoạch chế tạo.',
    steps: [
      { label: 'Khởi động', minutes: 5, text: 'Ghép ba thẻ “Lan / has long hair / is funny” thành hai câu.' },
      { label: 'Báo cáo phương án', minutes: 25, text: 'Cạnh 5–6 cm, hình khai triển 6 mặt, tai dán, diễn thử tổ hợp từ.' },
      { label: 'Phản biện', minutes: 10, text: 'Đủ 6 mặt chưa? Làm sao khối không móp? “He / is slim / is creative” nói thế nào?' },
      { label: 'Kết luận', minutes: 5, text: 'Thống nhất phương án, kiểm tra ngữ pháp, giao nhiệm vụ chế tạo.' },
    ],
  },
  {
    number: 4,
    title: 'Chế tạo, thử nghiệm và cải tiến',
    when: 'Giữa hai tiết',
    where: 'home',
    goal: 'Tạo ba khối, kiểm tra độ bền, tính dễ đọc và khả năng ghép câu.',
    product: 'Bộ 03 khối, phiếu số liệu, mô tả cải tiến, bài giới thiệu ngắn.',
  },
  {
    number: 5,
    title: 'Chia sẻ, giao tiếp và đánh giá',
    when: 'Tiết 2',
    where: 'class',
    duration: '45 phút',
    goal: 'Dùng sản phẩm để nói Tiếng Anh, đánh giá dựa trên minh chứng, phản hồi cải tiến.',
    product: 'Sản phẩm STEM, minh chứng giao tiếp, phiếu rubric, nhật ký góp ý.',
    steps: [
      { label: 'Giới thiệu', minutes: 5, text: 'Quy tắc Roll → Read → Build → Speak → Ask → Answer và cách ứng xử tích cực.' },
      { label: 'Trải nghiệm', minutes: 25, text: 'Gieo, đọc hai câu, hỏi – đáp về nhân vật hư cấu, đổi vai.' },
      { label: 'Nhận xét', minutes: 10, text: 'Nhận xét 3–2–1, đối chiếu phiếu thử nghiệm, chấm rubric.' },
      { label: 'Tổng kết', minutes: 5, text: 'Tổng hợp kết quả, khả năng tái sử dụng, đề xuất chủ đề tiếp theo.' },
    ],
  },
];

export const PREPARATION = {
  teacher: [
    'Video/tình huống khó khăn khi ghép câu, nhiệm vụ học tập, nhật ký nhóm, bảng tiêu chí.',
    'Phiếu ôn tập Unit 3, sơ đồ khai triển hình lập phương, hướng dẫn kiểm tra tương thích ngữ pháp.',
    'Bảng thiết kế mẫu, phiếu phản biện, rubric thiết kế; phiếu 10 lượt gieo; bảng quan sát nói.',
  ],
  students: [
    'Nhóm 4–5: bìa hộp giấy hoặc lịch cũ, giấy màu, bút, kéo an toàn, thước, keo giấy, túi đựng 3 khối.',
    'Vai trò: nhóm trưởng, bản vẽ, chế tạo, kiểm tra Tiếng Anh, ghi số liệu/thuyết trình. Mọi thành viên đều có lượt nói.',
  ],
};

export const FLOW_STEPS = [
  { id: 'roll', en: 'Roll', vi: 'Gieo ba khối vào khay thấp để tránh thất lạc.' },
  { id: 'read', en: 'Read', vi: 'Đọc các mặt hướng lên, xác định WHO – LOOKS – PERSONALITY.' },
  { id: 'build', en: 'Build', vi: 'Ghép hai câu: chủ ngữ + ngoại hình; chủ ngữ/đại từ + tính cách.' },
  { id: 'speak', en: 'Speak', vi: 'Một bạn đọc to hai câu cho nhóm nghe.' },
  { id: 'ask', en: 'Ask', vi: 'Bạn khác hỏi: What does … look like? / What is … like?' },
  { id: 'answer', en: 'Answer & Switch', vi: 'Trả lời rõ ràng, bổ sung một câu, rồi đổi vai.' },
] as const;

export const FUTURE_TOPICS = [
  { unit: 'Unit 4 – My Neighbourhood', note: 'Thay thẻ, thiết kế lại quy tắc ngữ pháp phù hợp.' },
  { unit: 'Unit 5 – Natural Wonders of Viet Nam', note: 'Không dùng máy móc 3 khối cũ; kiểm tra lại mọi tổ hợp.' },
];
