import React, { createContext, useContext, useState } from "react";
import './Toast.css';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const showToaster = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToaster }}>
      {children}
      {toast.visible && (
        <div className={`toast-message ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
