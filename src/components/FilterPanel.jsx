import { MdFilterList, MdCheck } from "react-icons/md";
import { useRef, useEffect, useState } from "react";

export default function FilterPanel({
  statusActive,
  setStatusActive,
  statusInactive,
  setStatusInactive,
  logsSuccessFilter,
  setLogsSuccessFilter,
  logsFailFilter,
  setLogsFailFilter,
  empresaFilter,
  setEmpresaFilter,
}) {
  const filterRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen]);
  return (
    <div className="flex justify-end items-center gap-2 px-4 pt-6 pb-4 flex-wrap relative">
      <div ref={filterRef} className="relative">
        {" "}
        <button
          onClick={() => setFilterOpen((open) => !open)}
          className="p-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none"
          aria-label="Abrir filtros de status"
        >
          <MdFilterList size={24} className="text-gray-700" />
        </button>
        {filterOpen && (
          <div className="absolute right-0 mt-2 w-59 bg-white border border-gray-300 rounded-xl shadow-lg p-4 z-50 flex gap-4">
            <div
              className="absolute bg-white shadow-md"
              style={{
                width: "26px",
                height: "14px",
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                top: "-8px",
                right: "6px",
                zIndex: 51,
              }}
            />
            <div className="space-y-3 font-medium text-gray-700">
              {[
                {
                  label: "Ativo",
                  checked: statusActive,
                  onChange: setStatusActive,
                },
                {
                  label: "Inativo",
                  checked: statusInactive,
                  onChange: setStatusInactive,
                },
              ].map(({ label, checked, onChange }) => (
                <label
                  key={label}
                  className="flex items-center cursor-pointer select-none gap-2 relative"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChange((v) => !v)}
                    className="absolute opacity-0 w-5 h-5 cursor-pointer"
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center pointer-events-none ${
                      checked
                        ? "bg-yellow-400 border-yellow-400"
                        : "border-gray-400"
                    }`}
                  >
                    {checked && <MdCheck className="text-white" size={20} />}
                  </div>
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-3 font-medium text-gray-700">
              {[
                {
                  label: "Logs OK",
                  checked: logsSuccessFilter,
                  onChange: setLogsSuccessFilter,
                },
                {
                  label: "Logs Falha",
                  checked: logsFailFilter,
                  onChange: setLogsFailFilter,
                },
              ].map(({ label, checked, onChange }) => (
                <label
                  key={label}
                  className="flex items-center cursor-pointer select-none gap-2 relative"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChange((v) => !v)}
                    className="absolute opacity-0 w-5 h-5 cursor-pointer"
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center pointer-events-none ${
                      checked
                        ? "bg-yellow-400 border-yellow-400"
                        : "border-gray-400"
                    }`}
                  >
                    {checked && <MdCheck className="text-white" size={20} />}
                  </div>
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      <input
        type="text"
        placeholder="Buscar por empresa, cliente ou job..."
        className="border border-gray-300 rounded-xl px-4 py-2 w-72 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        value={empresaFilter}
        onChange={(e) => setEmpresaFilter(e.target.value)}
      />
    </div>
  );
}
