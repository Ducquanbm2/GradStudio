import { Conversation, UnavailableComposer } from '../components/Conversation.jsx';
import Icon from '../components/Icon.jsx';
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
      <ul className="inbox-list" role="list">
        {inbox.map(({ name, preview, status, current }) => (
          <li key={name} className={current ? 'inbox-entry current' : 'inbox-entry'} aria-current={current ? 'true' : undefined}>
            <span className="avatar" aria-hidden="true">{name[0]}</span>
            <div className="inbox-detail">
              <p><strong>{name}</strong>{current && <span className="muted"> · Đang mở</span>}</p>
              <p className="muted">{preview}</p>
              <p className={current ? 'status agreed' : 'status'}>{status}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BookingDraft() {
  const fields = [
    ['Khách hàng', customer],
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
    <section className="surface stack booking-draft" aria-labelledby="booking-draft-title">
      <div className="panel-heading">
        <h2 id="booking-draft-title">Booking mới</h2>
        <p className="record-code">{code}</p>
      </div>
      <p className="muted">Thông tin điền sẵn từ hội thoại đã chốt với {customer}.</p>
      <dl className="facts">
        {fields.map(([label, value]) => (
          <div key={label} className="fact">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="booking-handoff">
        <p>Booking bắt đầu ở trạng thái <strong>{bookingStatuses.awaitingDeposit}</strong>. {customer} tiếp tục ở mục Lịch chụp của tôi.</p>
        <a className="button" href="#/review">Tạo booking <Icon name="arrow" /></a>
      </div>
    </section>
  );
}

function ResourceCalendar() {
  return (
    <section className="surface stack resources" aria-labelledby="resources-title">
      <div className="icon-heading">
        <span className="icon-tile"><Icon name="calendar" /></span>
        <h2 id="resources-title">Lịch tài nguyên</h2>
      </div>
      <p className="resource-alert">
        <Icon name="warning" />
        <span><strong>{requested} · Trùng lịch</strong> {conflict.staff} bận {formatInterval(conflict)}. Khung giờ yêu cầu không đủ người làm make-up.</span>
      </p>
      <ol className="resource-list" role="list" aria-label="Tài nguyên theo giờ đã thống nhất">
        <li className="resource-entry">
          <strong>{formatInterval(makeup)} · Make-up</strong>
          <p className="muted">{makeup.staff} có lịch trống.</p>
        </li>
        <li className="resource-entry">
          <strong>{formatInterval(shoot)} · Chụp ảnh</strong>
          <p className="muted">{shoot.staff} và {shoot.room} có lịch trống.</p>
        </li>
      </ol>
      <div className="suggestions">
        <h3>Giờ đề xuất</h3>
        <ul className="suggestion-list" role="list">
          <li className="agreed-slot">
            <strong>{shoot.start} đã chọn</strong>
            <p>Make-up từ {makeup.start}. {customer} đã đồng ý trong chat.</p>
          </li>
          <li>
            <strong>{alternateShoot}</strong>
            <p className="muted">Khung giờ thay thế trong danh sách đề xuất.</p>
          </li>
        </ul>
      </div>
    </section>
  );
}

export default function Advice() {
  return (
    <div className="advice-page stack">
      <header className="workspace-heading">
        <div className="stack">
          <p className="eyebrow">ĐIỀU PHỐI STUDIO</p>
          <h1>Tư vấn và lịch tài nguyên</h1>
          <p className="intro">{admin} xem giờ đã thống nhất với {customer} trước khi tạo booking chờ cọc.</p>
        </div>
        <p className="workspace-date"><Icon name="calendar" /> <time dateTime={date}>{dateLabel}</time></p>
      </header>
      <div className="advice-layout">
        <div className="workrail stack">
          <ResourceCalendar />
          <Inbox />
        </div>
        <div className="advice-main stack">
          <section className="surface stack chat-panel" aria-labelledby="studio-chat-title">
            <div className="panel-heading">
              <div className="icon-heading">
                <span className="icon-tile"><Icon name="chat" /></span>
                <h2 id="studio-chat-title">Hội thoại với {customer}</h2>
              </div>
              <p className="status agreed">{conversationStatuses.agreed}</p>
            </div>
            <Conversation messages={agreedMessages} />
            <UnavailableComposer />
          </section>
          <BookingDraft />
        </div>
      </div>
    </div>
  );
}
