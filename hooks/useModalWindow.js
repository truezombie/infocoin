import { useState, useCallback } from 'react';

export function useModalWindow() {
  const [modalWindow, setModalWindow] = useState({
    isOpen: false,
    data: null,
  });

  const onCloseModalWindow = useCallback(() => {
    setModalWindow({
      isOpen: false,
      data: null,
    });
  }, []);

  return [modalWindow, setModalWindow, onCloseModalWindow];
}
