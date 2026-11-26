import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Services from './screens/Services.jsx';
import Advice from './screens/Advice.jsx';
import Review from './screens/Review.jsx';
import { appointment } from './data.js';
import Icon from './components/Icon.jsx';
import './styles.css';

const routes = {
  '/': { title: 'Dịch vụ và tư vấn', role: 'Khách hàng', Screen: Services },
  '/advice': { title: 'Tư vấn và lịch tài nguyên', role: `${appointment.admin} · Admin`, Screen: Advice },
  '/review': { title: 'Lịch chụp của tôi', role: `${appointment.customer} · Khách hàng`, Screen: Review },
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
            <span className="brand-mark"><Icon name="frame" /></span>
            <span>Grad<span className="brand-accent">Studio</span></span>
          </a>
          <span className="role-label"><span className="role-dot" aria-hidden="true" />{route.role}</span>
        </nav>
      </header>
      <main className="shell page" ref={main} tabIndex={-1}>
        <Screen />
      </main>
      <footer className="site-footer">
        <div className="shell footer-content">
          <strong>GradStudio</strong>
          <span>Studio ảnh tốt nghiệp và chân dung</span>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
