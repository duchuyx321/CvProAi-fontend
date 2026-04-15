import { useEffect } from 'react';

export default function useBeforeUnloadGuard(shouldBlock) {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!shouldBlock) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldBlock]);
}