import React from 'react';
import usePushNotification from '../hooks/usePushNotification';

const PushNotificationToggle = ({ userId }) => {
  const { isSubscribed, loading, subscribe, unsubscribe } = usePushNotification(userId);

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (error) {
      alert(error?.response?.data?.message || error.message || 'Failed to update notification preference');
    }
  };

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-gray-900 p-4 shadow-lg shadow-purple-900/20">
      <p className="text-xs uppercase tracking-wide text-purple-300">Push Notifications</p>
      <p className="mt-1 text-sm text-gray-200">
        Status:
        <span className={`ml-2 font-semibold ${isSubscribed ? 'text-green-400' : 'text-gray-400'}`}>
          {isSubscribed ? 'Enabled' : 'Disabled'}
        </span>
      </p>

      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className="mt-3 w-full rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Please wait...' : isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
      </button>
    </div>
  );
};

export default PushNotificationToggle;
