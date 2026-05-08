// frontend/src/components/StatusBadge.jsx
// Color-coded pill that shows complaint status

export default function StatusBadge({ status }) {
  const styles = {
    'Pending':     'bg-yellow-100 text-yellow-800 border border-yellow-300',
    'In Progress': 'bg-blue-100   text-blue-800   border border-blue-300',
    'Resolved':    'bg-green-100  text-green-800  border border-green-300',
    'Scheduled':   'bg-indigo-100 text-indigo-800 border border-indigo-300',
    'Completed':   'bg-green-100  text-green-800  border border-green-300',
    'Cancelled':   'bg-red-100    text-red-800    border border-red-300',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}