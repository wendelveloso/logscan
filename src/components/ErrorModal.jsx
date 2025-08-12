export function ErrorModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-300 bg-opacity-25 flex items-start justify-center pt-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-red-100 bg-opacity-90 text-red-800 rounded-md shadow-md px-6 py-3 max-w-sm w-full cursor-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-semibold">Erro:</p>
        <p>{message}</p>
      </div>
    </div>
  );
}
