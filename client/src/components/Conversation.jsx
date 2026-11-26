export function Conversation({ messages }) {
  return (
    <ol className="messages" role="list" aria-label="Tin nhắn theo thứ tự thời gian">
      {messages.map(({ from, time, side, text }) => (
        <li key={time} className={`message message-${side}`}>
          <span className="avatar" aria-hidden="true">{from[0]}</span>
          <div className="message-body">
            <p className="message-meta"><strong>{from}</strong> <time dateTime={time}>{time}</time></p>
            <p>{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function UnavailableComposer() {
  return (
    <div className="composer stack">
      <label htmlFor="message"><strong>Tin nhắn mới</strong></label>
      <div className="composer-row">
        <input id="message" type="text" placeholder="Soạn tin nhắn…" readOnly aria-describedby="message-note" />
        <button className="button" type="button" disabled aria-describedby="message-note">Gửi tin nhắn</button>
      </div>
      <p id="message-note" className="muted">Tính năng gửi tin nhắn chưa khả dụng trong bản mẫu.</p>
    </div>
  );
}
