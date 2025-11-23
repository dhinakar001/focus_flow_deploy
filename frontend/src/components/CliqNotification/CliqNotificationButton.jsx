/**
 * Cliq Notification Button Component
 * 
 * Button component to send notifications to Zoho Cliq
 */
import { useState } from 'react';
import { notificationApi } from '../../services/notificationApi';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';

export default function CliqNotificationButton({
  webhookUrl,
  channelId,
  title = 'FocusFlow Notification',
  message = 'This is a test notification from FocusFlow',
  type = 'info',
  metadata = {},
  className = '',
  children,
  onSuccess,
  onError
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const handleSend = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const result = await notificationApi.sendCliqNotification({
        webhookUrl,
        channelId,
        title,
        message,
        type,
        metadata
      });

      setSuccess(true);
      showSuccess('Notification Sent', 'Successfully sent to Zoho Cliq channel');
      if (onSuccess) {
        onSuccess(result);
      }

      // Reset success state after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to send notification:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to send notification';
      showError('Notification Failed', errorMessage);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSend}
      disabled={loading || (!webhookUrl && !channelId)}
      className={className}
    >
      {loading ? (
        'Sending...'
      ) : success ? (
        '✅ Sent!'
      ) : (
        children || 'Send to Cliq'
      )}
    </Button>
  );
}



