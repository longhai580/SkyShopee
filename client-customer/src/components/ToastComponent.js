import React, { useContext } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import MyContext from '../contexts/MyContext';

const ICONS = { success: FiCheckCircle, error: FiAlertCircle, info: FiInfo };

function Toasts() {
  const { toasts, dismissToast } = useContext(MyContext);
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || FiInfo;
        return (
          <div key={t.id} className={'toast ' + t.type}>
            <Icon className="toast-icon" />
            <span>{t.message}</span>
            <button className="icon-btn" onClick={() => dismissToast(t.id)} aria-label="Đóng"><FiX /></button>
          </div>
        );
      })}
    </div>
  );
}
export default Toasts;
