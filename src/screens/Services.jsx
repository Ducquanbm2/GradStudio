import { Conversation, UnavailableComposer } from '../components/Conversation.jsx';
import { appointment, conversationStatuses, formatPrice, holdPolicy, initialMessages, services } from '../data.js';

function StudioIllustration() {
  return (
    <svg className="studio-art" viewBox="0 0 420 300" aria-hidden="true" focusable="false">
      <rect width="420" height="300" rx="16" fill="#eedec4" />
      <circle cx="220" cy="152" r="108" fill="#e6c595" />
      <path d="M91 63h39m-39 0v39m238-39h-39m39 0v39M91 237h39m-39 0v-39m238 39h-39m39 0v-39" fill="none" stroke="#713c16" strokeWidth="3" />
      <rect x="140" y="108" width="142" height="100" rx="13" fill="#713c16" />
      <path d="m171 108 13-21h49l16 21" fill="#713c16" />
      <circle cx="211" cy="158" r="33" fill="#fffdf7" />
      <circle cx="211" cy="158" r="23" fill="#713c16" />
      <path d="m197 151 14-7 14 7-14 7zm6 6v10l8 4 8-4v-10" fill="none" stroke="#fffdf7" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="264" cy="128" r="5" fill="#eedec4" />
      <path d="M122 137v24m-12-12h24m172 36v22m-11-11h22" fill="none" stroke="#713c16" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const steps = [
  ['Chọn gói và hỏi studio', 'Xem giá tham khảo rồi trao đổi về gói chụp, make-up và giờ mong muốn.'],
  ['Thống nhất giờ trong chat', 'Studio kiểm tra lịch nhân sự và phòng trước khi đề xuất giờ chụp.'],
  ['Đặt cọc để giữ lịch', holdPolicy],
];

export default function Services() {
  return (
    <div className="services-page">
      <section className="hero" aria-labelledby="service-title">
        <div className="stack">
          <p className="eyebrow">STUDIO ẢNH TỐT NGHIỆP VÀ CHÂN DUNG</p>
          <h1 id="service-title">Lưu ngày tốt nghiệp theo cách của bạn</h1>
          <p className="intro">Xem các gói chụp của GradStudio và hỏi studio về giờ chụp phù hợp. Mọi thỏa thuận được ghi lại trong cùng một cuộc trò chuyện.</p>
        </div>
        <StudioIllustration />
      </section>

      <section className="stack" aria-labelledby="catalogue-title">
        <h2 id="catalogue-title">Dịch vụ chụp ảnh</h2>
        <ul className="card-grid">
          {services.map(({ id, name, price, unit, description }) => (
            <li key={id} className="surface service-card stack">
              <h3>{name}</h3>
              <p className="price">Từ <strong>{formatPrice(price)}{unit}</strong></p>
              <p className="muted">{description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="stack" aria-labelledby="process-title">
        <h2 id="process-title">Từ tư vấn đến giữ lịch</h2>
        <ol className="card-grid">
          {steps.map(([title, description], index) => (
            <li className="surface stack" key={title}>
              <span className="step-number" aria-hidden="true">{index + 1}</span>
              <h3>{title}</h3>
              <p className="muted">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="surface stack chat-panel" aria-labelledby="customer-chat-title">
        <div className="panel-heading">
          <h2 id="customer-chat-title">Tư vấn với GradStudio</h2>
          <p className="status">{conversationStatuses.advising}</p>
        </div>
        <Conversation messages={initialMessages} />
        <UnavailableComposer />
        <div>
          <a className="button" href="#/advice">Admin studio · Mở hội thoại của {appointment.customer} <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </div>
  );
}
