import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, children, width = "w-11/12 md:w-5/6 lg:w-4/5 xl:w-3/4" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 p-4 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div
        className={`bg-white p-4 rounded shadow-lg ${width} max-h-[90vh] overflow-y-auto transform transition-transform duration-300 scale-100 relative`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 z-10 text-xl font-bold" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
