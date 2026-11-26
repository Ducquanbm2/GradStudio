const drawings = {
  frame: <><path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" /><circle cx="12" cy="12" r="3.5" /></>,
  class: <><circle cx="12" cy="8" r="2.5" /><path d="M7 19v-2a5 5 0 0 1 10 0v2M5 6.5a2 2 0 0 0 0 4m14-4a2 2 0 0 1 0 4M3 18v-2a3 3 0 0 1 2-2.8m16 4.8v-2a3 3 0 0 0-2-2.8" /></>,
  graduation: <><path d="m2.5 10 9.5-5 9.5 5-9.5 5-9.5-5Zm4 2.2v4.2c2.9 2.8 8.1 2.8 11 0v-4.2m4-2.2v5.5" /></>,
  portrait: <><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><circle cx="12" cy="10" r="2.5" /><path d="M7 19v-1a5 5 0 0 1 10 0v1" /></>,
  chat: <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.5-3.4A7.5 7.5 0 1 1 20 11.5Z" />,
  calendar: <><rect x="3.5" y="5.5" width="17" height="15" rx="2.5" /><path d="M7.5 3.5v4m9-4v4m-13 3h17m-11 5 1.5 1.5 3.5-3.5" /></>,
  warning: <><path d="M10.5 4.7a1.7 1.7 0 0 1 3 0l7.4 13a1.7 1.7 0 0 1-1.5 2.5H4.6a1.7 1.7 0 0 1-1.5-2.5l7.4-13ZM12 9v4.2m0 3.3h.01" /></>,
  card: <><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18m-14 4.5h3" /></>,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
};

export default function Icon({ name }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {drawings[name]}
    </svg>
  );
}
