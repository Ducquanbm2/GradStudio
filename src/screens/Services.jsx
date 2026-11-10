import { Conversation, UnavailableComposer } from '../components/Conversation.jsx';
import Icon from '../components/Icon.jsx';
import studioPhoto from '../assets/studio-still-life.webp';
import { appointment, conversationStatuses, formatPrice, holdPolicy, initialMessages, services } from '../data.js';

const steps = [
  ['Chọn gói và hỏi studio', 'Xem giá tham khảo rồi trao đổi về gói chụp, make-up và giờ mong muốn.'],
  ['Thống nhất giờ trong chat', 'Studio kiểm tra lịch nhân sự và phòng trước khi đề xuất giờ chụp.'],
  ['Đặt cọc để giữ lịch', holdPolicy],
];

function ServiceCatalogue() {
  return (
    <section className="catalogue stack" aria-labelledby="catalogue-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">GÓI CHỤP</p>
          <h2 id="catalogue-title">Dịch vụ chụp ảnh</h2>
        </div>
        <p className="muted">Giá tham khảo theo từng gói.</p>
      </div>
      <ul className="service-grid" role="list">
        {services.map(({ id, name, price, unit, description }) => (
          <li key={id} className={`surface service-card service-${id}`}>
            <span className="icon-tile"><Icon name={id} /></span>
            <h3>{name}</h3>
            <p className="muted">{description}</p>
            <p className="price">Từ <strong>{formatPrice(price)}{unit}</strong></p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StudioConsultation() {
  return (
    <div className="consultation-layout">
      <section className="surface chat-panel stack" aria-labelledby="customer-chat-title">
        <div className="panel-heading">
          <div className="icon-heading">
            <span className="icon-tile"><Icon name="chat" /></span>
            <h2 id="customer-chat-title">Tư vấn với GradStudio</h2>
          </div>
          <p className="status">{conversationStatuses.advising}</p>
        </div>
        <Conversation messages={initialMessages} />
        <UnavailableComposer />
        <div className="handoff">
          <a className="button" href="#/advice">Admin studio · Mở hội thoại của {appointment.customer} <Icon name="arrow" /></a>
        </div>
      </section>

      <section className="process-panel stack" aria-labelledby="process-title">
        <h2 id="process-title">Từ tư vấn đến giữ lịch</h2>
        <ol className="process-steps" role="list">
          {steps.map(([title, description], index) => (
            <li key={title}>
              <span className="step-number" aria-hidden="true">{index + 1}</span>
              <div>
                <h3>{title}</h3>
                <p className="muted">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default function Services() {
  return (
    <div className="services-page">
      <section className="hero" aria-labelledby="service-title">
        <div className="hero-copy stack">
          <p className="eyebrow">STUDIO ẢNH TỐT NGHIỆP VÀ CHÂN DUNG</p>
          <h1 id="service-title">Lưu ngày tốt nghiệp <span>theo cách của bạn</span></h1>
          <p className="intro">Chọn gói chụp của GradStudio rồi hỏi studio về giờ chụp phù hợp. Mọi thỏa thuận được ghi lại trong cùng một cuộc trò chuyện.</p>
        </div>
        <figure className="hero-figure">
          <img className="studio-photo" src={studioPhoto} width={1440} height={960} alt="Mũ tốt nghiệp xanh và bằng tốt nghiệp trên bục trong studio" />
          <figcaption><span className="role-dot" aria-hidden="true" /> Góc studio · Ảnh minh họa</figcaption>
        </figure>
      </section>
      <ServiceCatalogue />
      <StudioConsultation />
    </div>
  );
}
