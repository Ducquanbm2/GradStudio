import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Services from './screens/Services.jsx';
import Advice from './screens/Advice.jsx';
import './styles.css';

const routes = {
  '/': { title: 'Dịch vụ và tư vấn', role: 'Khách hàng', Screen: Services },
  '/advice': { title: 'Tư vấn và lịch tài nguyên', role: 'Thảo · Admin', Screen: Advice },
  '/review': { title: 'Lịch chụp của tôi', role: 'Linh · Khách hàng' },
};

function readRoute() {
  const path = window.location.hash.slice(1);
  return Object.hasOwn(routes, path) ? path : '/';
}

function App() {
  const [path, setPath] = useState(readRoute);
  const main = useRef(null);
  const route = routes[path];
  const { Screen } = route;

  useEffect(() => {
    const onHashChange = () => setPath(readRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = `${route.title} · GradStudio`;
  }, [route]);

  useEffect(() => {
    if (main.current.dataset.ready) {
      window.scrollTo(0, 0);
      main.current.focus({ preventScroll: true });
    }
    main.current.dataset.ready = 'true';
  }, [path]);

  return (
    <>
      <header className="site-header">
        <nav className="shell site-nav" aria-label="Điều hướng chính">
          <a className="wordmark" href="#/" aria-label="GradStudio, trang dịch vụ">
            <span className="brand-mark" aria-hidden="true">G</span> GradStudio
          </a>
          <span className="role-label">{route.role}</span>
        </nav>
      </header>
      <main className="shell page" ref={main} tabIndex={-1}>
        <>{Screen ? <Screen /> : <h1>{route.title}</h1>}</>
      </main>
      <footer className="site-footer">
        <div className="shell">GradStudio · Studio ảnh tốt nghiệp và chân dung</div>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
