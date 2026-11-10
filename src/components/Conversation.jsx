export function Conversation({ messages }) {
  return (
    <ol className="messages" aria-label="Tin nhắn theo thứ tự thời gian">
      {messages.map(({ from, time, side, text }) => (
        <li key={time} className={`message message-${side}`}>
          <p className="message-meta"><strong>{from}</strong> <time dateTime={time}>{time}</time></p>
          <p>{text}</p>
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
