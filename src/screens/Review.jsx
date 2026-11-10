import {
  agreedStatus, appointment, appointmentWeek, deposit, formatInterval, formatPrice,
  holdPolicy, remaining,
} from '../data.js';

const {
  code, customer, date, dateLabel, depositRate, durationHours, editedPhotos, makeup,
  packageName, price, requested, shoot, shootType,
} = appointment;

function Schedule() {
  return (
    <section className="surface stack" aria-labelledby="schedule-title">
      <h2 id="schedule-title">Lịch tuần</h2>
      <p><strong>Ngày đã thống nhất</strong> · <time dateTime={date}>{dateLabel}</time></p>
      <ol className="week" aria-label="Tuần chứa ngày chụp">
        {appointmentWeek.map(({ weekday, date, day, current }) => (
          <li key={date} className="week-day" aria-current={current ? 'date' : undefined}>
            <span>{weekday}</span>
            <time dateTime={date}>{day}</time>
          </li>
        ))}
      </ol>

      <h3>Các mốc trong ngày chụp</h3>
      <ol className="timeline">
        <li className="timeline-entry original">
          <p><del><time dateTime={requested}>{requested}</time></del></p>
          <p>Giờ yêu cầu ban đầu · Đã thay bằng giờ chiều</p>
        </li>
        <li className="timeline-entry">
          <p><strong>{formatInterval(makeup)}</strong></p>
          <p>Make-up với {makeup.staff}</p>
        </li>
        <li className="timeline-entry">
          <p><strong>{formatInterval(shoot)}</strong></p>
          <p>Chụp ảnh với {shoot.staff} tại {shoot.room}</p>
        </li>
      </ol>
    </section>
  );
}

function BookingSummary() {
  const amounts = [
    ['Giá gói', price],
    [`Cọc ${depositRate}%`, deposit],
    [`Còn lại ${100 - depositRate}%`, remaining],
  ];

  return (
    <section className="surface stack booking-summary" aria-labelledby="booking-title">
      <p className="eyebrow">{code} · {customer}</p>
      <h2 id="booking-title">{packageName}</h2>
      <p className="status">{agreedStatus}</p>
      <p className="muted">{shootType} · {durationHours} giờ · {editedPhotos} ảnh chỉnh</p>
      <dl className="amounts">
        {amounts.map(([label, amount]) => (
          <div className="amount-row" key={label}>
            <dt>{label}</dt>
            <dd>{formatPrice(amount)}</dd>
          </div>
        ))}
      </dl>
      <p className="muted">Booking đang chờ cọc. {holdPolicy}</p>
      <button className="button" type="button" disabled aria-describedby="deposit-note">Thanh toán cọc {depositRate}%</button>
      <p id="deposit-note" className="muted">Thanh toán trực tuyến chưa khả dụng trong bản mẫu.</p>
    </section>
  );
}

export default function Review() {
  return (
    <div className="stack review-page">
      <div className="stack">
        <p className="eyebrow">LỊCH HẸN CỦA {customer.toLocaleUpperCase('vi-VN')}</p>
        <h1>Lịch chụp của tôi</h1>
        <p className="intro">Xem lại giờ make-up, giờ chụp và số tiền cọc của lịch đã thống nhất với studio.</p>
      </div>
      <div className="review-layout">
        <Schedule />
        <BookingSummary />
      </div>
    </div>
  );
}
