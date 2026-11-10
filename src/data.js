export const services = [
  {
    id: 'class',
    name: 'Kỷ yếu lớp',
    price: 350000,
    unit: '/người',
    description: 'Một bộ ảnh chung để cả lớp lưu lại những năm tháng bên nhau.',
  },
  {
    id: 'graduation',
    name: 'Tốt nghiệp',
    price: 1800000,
    description: 'Ảnh tốt nghiệp cá nhân với lịch make-up và buổi chụp rõ ràng.',
  },
  {
    id: 'portrait',
    name: 'Chân dung/CV',
    price: 690000,
    description: 'Ảnh chân dung dùng cho CV, hồ sơ nghề nghiệp hoặc portfolio.',
  },
];

export const conversationStatuses = {
  unanswered: 'Chưa trả lời',
  advising: 'Đang tư vấn',
  agreed: 'Đã chốt lịch',
  completed: 'Hoàn thành',
};

export const bookingStatuses = {
  awaitingDeposit: 'Chờ cọc 30%',
  confirmed: 'Đã đặt lịch',
  completed: 'Hoàn thành',
};

export const appointment = {
  code: 'GS-1024',
  customer: 'Linh',
  admin: 'Thảo',
  date: '2026-10-24',
  dateLabel: 'Thứ Bảy, 24/10/2026',
  shortDate: '24/10',
  requested: '09:00',
  makeup: { staff: 'Mai', start: '13:00', end: '14:00' },
  shoot: { staff: 'Tuấn', room: 'Phòng B', start: '14:00', end: '16:00' },
  conflict: { staff: 'Mai', start: '08:00', end: '12:00' },
  packageName: 'Gói Tốt nghiệp Premium',
  shootType: 'Tốt nghiệp cá nhân',
  durationHours: 2,
  editedPhotos: 30,
  price: 1800000,
  depositRate: 30,
};

export const formatPrice = (amount) => `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
export const formatInterval = ({ start, end }) => `${start}–${end}`;
export const deposit = appointment.price * appointment.depositRate / 100;
export const remaining = appointment.price - deposit;
export const agreedStatus = `Đã thống nhất lịch · ${bookingStatuses.awaitingDeposit}`;
export const holdPolicy = 'Lịch được giữ sau khi thanh toán cọc thành công và studio kiểm tra lại tài nguyên.';

const { customer, admin, shortDate, requested, conflict, makeup, shoot } = appointment;

export const initialMessages = [
  {
    from: customer,
    time: '09:18',
    side: 'customer',
    text: `Gói tốt nghiệp có makeup còn lịch ${shortDate} lúc ${requested} không?`,
  },
  {
    from: 'GradStudio',
    time: '09:20',
    side: 'studio',
    text: 'Để mình kiểm tra lịch make-up, thợ chụp và phòng cho bạn nhé.',
  },
];

export const agreedMessages = [
  ...initialMessages,
  {
    from: admin,
    time: '09:24',
    side: 'studio',
    text: `${requested} bị trùng lịch vì ${conflict.staff} bận ${formatInterval(conflict)}. Studio đề xuất make-up ${formatInterval(makeup)} với ${makeup.staff}, sau đó chụp ${formatInterval(shoot)} với ${shoot.staff} tại ${shoot.room}.`,
  },
  {
    from: customer,
    time: '09:29',
    side: 'customer',
    text: `Dạ em đồng ý make-up lúc ${makeup.start} và chụp lúc ${shoot.start} ạ.`,
  },
];
