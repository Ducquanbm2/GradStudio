import { Conversation, UnavailableComposer } from '../components/Conversation.jsx';
import {
  agreedMessages, alternateShoot, appointment, bookingStatuses, conversationStatuses,
  deposit, formatInterval, formatPrice, inbox, remaining,
} from '../data.js';

const { admin, code, conflict, customer, date, dateLabel, depositRate, durationHours,
  editedPhotos, makeup, packageName, price, requested, shoot, shootType } = appointment;

function Inbox() {
  return (
    <section className="surface stack inbox" aria-labelledby="inbox-title">
      <h2 id="inbox-title">Danh sách hội thoại</h2>
      <ul className="inbox-list">
        {inbox.map(({ name, preview, status, current }) => (
          <li key={name} className={current ? 'inbox-entry current' : 'inbox-entry'} aria-current={current ? 'true' : undefined}>
            <p><strong>{name}</strong>{current && <span className="muted"> · Đang mở</span>}</p>
            <p className="muted">{preview}</p>
            <p className={current ? 'status agreed' : 'status'}>{status}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BookingDraft() {
  const fields = [
    ['Khách hàng', customer],
    ['Mã booking', code],
    ['Loại buổi chụp', shootType],
    ['Gói', `${packageName} · ${durationHours} giờ · ${editedPhotos} ảnh chỉnh`],
    ['Ngày', <time dateTime={date}>{dateLabel}</time>],
    ['Giờ chụp', formatInterval(shoot)],
    ['Make-up', `${formatInterval(makeup)} · ${makeup.staff}`],
    ['Thợ chụp và phòng', `${shoot.staff} · ${shoot.room}`],
    ['Giá gói', formatPrice(price)],
    [`Cọc ${depositRate}% và phần còn lại`, `${formatPrice(deposit)} / ${formatPrice(remaining)}`],
  ];

  return (
    <section className="surface stack" aria-labelledby="booking-draft-title">
      <h2 id="booking-draft-title">Booking mới</h2>
      <p className="muted">Thông tin điền sẵn từ hội thoại đã chốt với {customer}.</p>
      <dl className="facts">
        {fields.map(([label, value]) => (
          <div key={label} className="fact">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="muted">Booking bắt đầu ở trạng thái <strong>{bookingStatuses.awaitingDeposit}</strong>. {customer} tiếp tục ở mục Lịch chụp của tôi.</p>
      <div>
        <a className="button" href="#/review">Tạo booking <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}

function ResourceCalendar() {
  return (
    <section className="surface stack resources" aria-labelledby="resources-title">
      <h2 id="resources-title">Lịch tài nguyên</h2>
      <p className="muted"><time dateTime={date}>{dateLabel}</time></p>
      <ul className="resource-list">
        <li className="resource-entry conflict">
          <strong>{requested} · Trùng lịch</strong>
          <p>{conflict.staff} bận {formatInterval(conflict)}. Khung giờ yêu cầu không đủ người làm make-up.</p>
        </li>
        <li className="resource-entry">
          <strong>{formatInterval(makeup)} · Make-up</strong>
          <p>{makeup.staff} có lịch trống.</p>
        </li>
        <li className="resource-entry">
          <strong>{formatInterval(shoot)} · Chụp ảnh</strong>
          <p>{shoot.staff} và {shoot.room} có lịch trống.</p>
        </li>
      </ul>
      <h3>Giờ đề xuất</h3>
      <ul className="resource-list">
        <li className="resource-entry agreed-slot">
          <strong>{shoot.start} đã chọn</strong>
          <p>Make-up từ {makeup.start}. {customer} đã đồng ý trong chat.</p>
        </li>
        <li className="resource-entry">
          <strong>{alternateShoot}</strong>
          <p>Khung giờ thay thế trong danh sách đề xuất.</p>
        </li>
      </ul>
    </section>
  );
}

export default function Advice() {
  return (
    <div className="stack advice-page">
      <div className="stack">
        <p className="eyebrow">ĐIỀU PHỐI STUDIO</p>
        <h1>Tư vấn và lịch tài nguyên</h1>
        <p className="intro">{admin} xem giờ đã thống nhất với {customer} trước khi tạo booking chờ cọc.</p>
      </div>
      <div className="advice-layout">
        <Inbox />
        <div className="stack advice-main">
          <section className="surface stack" aria-labelledby="studio-chat-title">
            <div className="panel-heading">
              <h2 id="studio-chat-title">Hội thoại với {customer}</h2>
              <p className="status agreed">{conversationStatuses.agreed}</p>
            </div>
            <Conversation messages={agreedMessages} />
            <UnavailableComposer />
          </section>
          <BookingDraft />
        </div>
        <ResourceCalendar />
      </div>
    </div>
  );
}
