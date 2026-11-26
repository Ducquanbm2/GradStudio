import Icon from '../components/Icon.jsx';
import {
  agreedStatus, appointment, appointmentWeek, deposit, formatInterval, formatPrice,
  holdPolicy, remaining,
} from '../data.js';

const {
  code, customer, date, dateLabel, depositRate, durationHours, editedPhotos, makeup,
  packageName, price, requested, shoot, shootType,
} = appointment;

function Week() {
  return (
    <section className="week-panel stack" aria-labelledby="schedule-title">
      <div className="section-heading">
        <h2 id="schedule-title">Lịch tuần</h2>
        <p className="muted"><strong>Ngày đã thống nhất</strong> · <time dateTime={date}>{dateLabel}</time></p>
      </div>
      <ol className="week" role="list" aria-label="Tuần chứa ngày chụp">
        {appointmentWeek.map(({ weekday, date, day, label, current }) => (
          <li key={date} className="week-day" aria-label={label} aria-current={current ? 'date' : undefined}>
            <span>{weekday}</span>
            <time dateTime={date}>{day}</time>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Milestones() {
  return (
    <section className="surface stack" aria-labelledby="milestones-title">
      <h2 id="milestones-title">Các mốc trong ngày chụp</h2>
      <ol className="timeline" role="list">
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
    { label: 'Giá gói', amount: price },
    { label: `Cọc ${depositRate}%`, amount: deposit, highlight: true },
    { label: `Còn lại ${100 - depositRate}%`, amount: remaining },
  ];

  return (
    <section className="surface stack booking-summary" aria-labelledby="booking-title">
      <div className="panel-heading">
        <span className="icon-tile"><Icon name="card" /></span>
        <p className="record-code">{code}</p>
      </div>
      <h2 id="booking-title">{packageName}</h2>
      <p className="status">{agreedStatus}</p>
      <p className="muted">{shootType} · {durationHours} giờ · {editedPhotos} ảnh chỉnh</p>
      <dl className="amounts">
        {amounts.map(({ label, amount, highlight }) => (
          <div className={highlight ? 'amount-row deposit-amount' : 'amount-row'} key={label}>
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
    <div className="review-page stack">
      <header className="review-heading">
        <div className="stack">
          <p className="eyebrow">LỊCH HẸN CỦA {customer.toLocaleUpperCase('vi-VN')}</p>
          <h1>Lịch chụp của tôi</h1>
          <p className="intro">Xem lại giờ make-up, giờ chụp và số tiền cọc của lịch đã thống nhất với studio.</p>
        </div>
        <span className="review-mark"><Icon name="calendar" /></span>
      </header>
      <Week />
      <div className="review-layout">
        <Milestones />
        <BookingSummary />
      </div>
    </div>
  );
}
