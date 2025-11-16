import React, { useState } from 'react';

const NewTask = ({ data, onStatusChange }) => {
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onStatusChange(data._id, 'active');
    } catch (error) {
      alert('Failed to accept task: ' + (error.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this task?')) {
      return;
    }

    setLoading(true);
    try {
      await onStatusChange(data._id, 'failed');
    } catch (error) {
      alert('Failed to reject task: ' + (error.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-shrink-0 h-full w-[340px] bg-gray-800 rounded-2xl p-6 shadow-lg border border-emerald-700">
      <div className="flex items-center justify-between">
        <h3 className="rounded-full bg-emerald-600 text-white px-4 py-1 text-sm font-semibold shadow">
          {data.category}
        </h3>
        <h4 className="text-gray-300 font-medium">{formatDate(data.taskDate)}</h4>
      </div>
      <div className="mt-5">
        <h1 className="text-2xl font-bold text-emerald-400 line-clamp-2">
          {data.taskTitle}
        </h1>
        <p className="mt-3 text-gray-300 line-clamp-3">
          {data.taskDescription}
        </p>
        <div className='flex mt-3 gap-3'>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Accepting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Accept
              </>
            )}
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Rejecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTask;