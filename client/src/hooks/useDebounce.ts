import { useState, useCallback } from 'react';

export function useDebounce(delay: number = 300) {
  const [isPending, setIsPending] = useState(false);
  
  const debounce = useCallback((callback: () => void) => {
    if (isPending) return;
    
    setIsPending(true);
    callback();
    
    setTimeout(() => setIsPending(false), delay);
  }, [isPending, delay]);

  return debounce;
}



