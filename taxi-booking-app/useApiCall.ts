import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type NotificationType = 'success' | 'error';

interface UseApiCallReturn {
  isLoading: boolean;
  notification: { message: string; type: NotificationType } | null;
  setNotification: (notification: { message: string; type: NotificationType } | null) => void;
  handleApiCall: <T>(
    apiCall: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
    onSuccess?: () => void
  ) => Promise<void>;
}

export const useApiCall = (): UseApiCallReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

  const handleApiCall = async <T>(
    apiCall: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
    onSuccess?: () => void
  ) => {
    setIsLoading(true);
    try {
      await apiCall();
      setNotification({ message: successMessage, type: 'success' });
      onSuccess?.();
    } catch (error) {
      console.error(errorMessage, error);
      const message = (error as any)?.response?.data?.message || errorMessage;
      setNotification({ message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, notification, setNotification, handleApiCall };
};