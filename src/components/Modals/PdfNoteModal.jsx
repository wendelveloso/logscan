import { useState, useEffect } from "react";

export default function PdfNoteModal({ isOpen, onClose, onConfirm }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setError(false);
      setShake(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!note.trim()) {
      setError(true);
      setShake(false);
      setTimeout(() => setShake(true), 10);
      return;
    }
    onConfirm(note);
    setNote("");
    setError(false);
    setShake(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 font-['Roboto']">
      <div
        className={`bg-white p-4 sm:p-8 rounded-2xl shadow-xl w-11/12 max-w-lg ${
          shake ? "shake" : ""
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">Adicionar Nota</h2>
        <textarea
          value={note}
          onChange={(e) => {
            if (e.target.value.length <= 240) {
              setNote(e.target.value);
            }
          }}
          onFocus={() => setError(false)}
          placeholder="Digite uma nota (máx. 240 caracteres)"
          className={`w-full border rounded-xl p-3 resize-none focus:outline-none focus:ring-2 ${
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-yellow-300"
          }`}
          rows={5}
        />

        <p className="text-sm text-gray-500 mt-1">
          {note.length}/240 caracteres
        </p>

        <div className="flex flex-wrap justify-end gap-2 mt-6">
          <button
            onClick={handleApply}
            className="px-4 py-1.5 sm:px-3 sm:py-1 bg-yellow-500 text-gray-700 rounded-xl font-semibold hover:opacity-80 transition cursor-pointer "
          >
            Aplicar
          </button>

          <button
            onClick={() => {
              onConfirm("");
              setNote("");
              setError(false);
            }}
            className="px-4 py-1.5 sm:px-3 sm:py-1 bg-gray-300 text-gray-600 rounded-xl font-semibold hover:opacity-80 transition cursor-pointer "
          >
            Sem nota
          </button>

          <button
            onClick={() => {
              onClose();
              setNote("");
              setError(false);
            }}
            className="px-4 py-1.5 sm:px-3 sm:py-1 bg-red-500 text-white rounded-xl font-semibold hover:opacity-80 transition cursor-pointer "
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
