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
          className="p-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-200 focus:outline-none hover-transition cursor-pointer"
          aria-label="Abrir filtros de status"
        >
          <MdFilterList size={24} className="text-gray-700" />
        </button>
        {filterOpen && (
          <div className="absolute right-0 mt-2 w-50 bg-white border border-gray-300 rounded-xl shadow-lg p-4 z-50">
            <div
              className="absolute bg-white shadow-md"
              style={{
                width: "26px",
                height: "14px",
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                top: "-8px",
                right: "12px",
                zIndex: 51,
              }}
            />

            <div className="space-y-2 font-small text-gray-700 pb-2 border-b border-gray-200">
              <span className="text-gray-500 uppercase text-xs">Status</span>
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
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (label === "Ativo") {
                        setStatusActive(!statusActive);
                        if (!statusActive) setStatusInactive(false);
                      } else {
                        setStatusInactive(!statusInactive);
                        if (!statusInactive) setStatusActive(false);
                      }
                    }}
                    className="hidden"
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      checked
                        ? "bg-yellow-400 border-yellow-400"
                        : "border-gray-400"
                    }`}
                  >
                    {checked && <MdCheck className="text-white" size={16} />}
                  </div>
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2 font-small text-gray-700 pt-2">
              <span className="text-gray-500 uppercase text-xs">Logs</span>
              {[
                {
                  label: "Sucesso",
                  checked: logsSuccessFilter,
                  onChange: setLogsSuccessFilter,
                },
                {
                  label: "Falha",
                  checked: logsFailFilter,
                  onChange: setLogsFailFilter,
                },
              ].map(({ label, checked, onChange }) => (
                <label
                  key={label}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChange((v) => !v)}
                    className="hidden"
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      checked
                        ? "bg-yellow-400 border-yellow-400"
                        : "border-gray-400"
                    }`}
                  >
                    {checked && <MdCheck className="text-white" size={16} />}
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
