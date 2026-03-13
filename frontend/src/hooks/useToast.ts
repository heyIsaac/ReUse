import { useState, useCallback } from 'react';

export function useToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'error' | 'warning' | 'success'>('error');

  const showToast = useCallback((msg: string, toastType: 'error' | 'warning' | 'success' = 'error', duration = 3000) => {
    setMessage(msg);
    setType(toastType);
    setIsVisible(true);
    
    setTimeout(() => {
      setIsVisible(false);
    }, duration);
  }, []);

  return { isVisible, message, type, showToast };
}
