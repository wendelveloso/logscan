import { useState, useEffect } from "react";

export default function PdfNoteModal({ isOpen, onClose, onConfirm }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 font-['Roboto']">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-11/12 max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Adicionar Nota</h2>
        <textarea
          value={note}
          onChange={(e) => {
            if (e.target.value.length <= 240) {
              setNote(e.target.value);
            }
          }}
          placeholder="Digite uma nota (máx. 240 caracteres)"
          className="w-full border border-gray-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300"
          rows={5}
        />
        <p className="text-sm text-gray-500 mt-1">
          {note.length}/240 caracteres
        </p>

        <div className="flex justify-end gap-3 mt-6 ">
          <button
            onClick={() => {
              onConfirm(note);
              setNote("");
            }}
            className="px-6 py-2 bg-yellow-500 text-gray-600 rounded-2xl cursor-pointer font-semibold hover:opacity-80 transition"
          >
            Aplicar
          </button>
          <button
            onClick={() => {
              onConfirm("");
              setNote("");
            }}
            className="px-6 py-2 bg-gray-300 text-gray-600 cursor-pointer rounded-2xl font-semibold hover:opacity-80 transition"
          >
            Sem nota
          </button>
          <button
            onClick={() => {
              onClose();
              setNote("");
            }}
            className="px-6 py-2 bg-red-500 text-white cursor-pointer rounded-2xl font-semibold hover:opacity-80 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
