import {createRoot} from 'react-dom/client';
import AuthGate from './app/auth-gate';
import './app/globals.css';
createRoot(document.getElementById('root')!).render(<><AuthGate/><div className="teacher-watermark">ห้องเรียนครูจุฑารัตน์</div></>);
