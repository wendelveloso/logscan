import { useState, useRef, useEffect } from "react";
import {
  MdComputer,
  MdAccessTime,
  MdStorage,
  MdCheckCircle,
  MdCancel,
  MdClose,
  MdBusiness,
} from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";

export default function JobCard({ job, logs }) {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const modalRef = useRef(null);

  const successLogs = logs.filter((log) => log.status_final === "OK");
  const failLogs = logs.filter((log) => log.status_final !== "OK");
  const hasAnyLogs = logs.length > 0;

  function openModalWithFilter(type) {
    setFilter(type);
    setShowModal(true);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
        setFilter("all");
      }
    }
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  const logsToShow =
    filter === "fail" ? failLogs : filter === "success" ? successLogs : logs;

  return (
    <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 shadow-md hover:shadow-lg transition rounded-xl p-5 w-80 border border-gray-100 flex flex-col gap-4">
      {(hasAnyLogs || failLogs.length > 0) && (
        <div className="absolute top-3 right-3 flex gap-2">
          {failLogs.length > 0 && (
            <div
              onClick={() => openModalWithFilter("fail")}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-red-700 flex items-center gap-1 select-none"
              title="Mostrar falhas"
            >
              <HiOutlineDocumentText /> {failLogs.length}
            </div>
          )}

          {successLogs.length > 0 && (
            <div
              onClick={() => openModalWithFilter("success")}
              className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-700 flex items-center gap-1 select-none"
              title="Mostrar sucessos"
            >
              <HiOutlineDocumentText /> {successLogs.length}
            </div>
          )}
        </div>
      )}

      <div className="space-y-1 text-gray-700 text-sm">
        <p className="flex items-center gap-2 mt-6 text-sm">
          <MdBusiness className="text-purple-500" />
          <strong>Empresa:</strong> {job.empresa}
        </p>
        <p className="flex items-center gap-2">
          <MdComputer className="text-blue-500" /> <strong>Cliente:</strong>{" "}
          {job.cliente}
        </p>
        <p className="flex items-center gap-2">
          <HiOutlineDocumentText className="text-gray-500" />{" "}
          <strong>Job:</strong> {job.nome_job}
        </p>
        <p className="flex items-center gap-2">
          <MdStorage className="text-indigo-500" /> <strong>IP:</strong>{" "}
          {job.ip}
        </p>
        <p className="flex items-center gap-2">
          <MdAccessTime className="text-orange-500" />{" "}
          <strong>Agendado:</strong> {job.horario_agendado}
        </p>
        <div className="flex items-center gap-1 max-w-full">
          <MdStorage className="text-green-500 flex-shrink-0" />
          <strong>Fileset:</strong>
          <div
            className="overflow-x-auto max-w-full whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
            style={{ maxWidth: "calc(100% - 80px)" }}
          >
            {job.file_set}
          </div>
        </div>
        <p>
          <strong>Diff:</strong> {job.retencao_diff}
        </p>
        <p>
          <strong>Full:</strong> {job.retencao_full}
        </p>
      </div>

      <div className="mt-2">
        {String(job.status).trim().toLowerCase() === "true" ? (
          <span className="flex items-center gap-2 text-green-600 font-medium">
            <MdCheckCircle /> Ativo
          </span>
        ) : (
          <span className="flex items-center gap-2 text-red-600 font-medium">
            <MdCancel /> Inativo
          </span>
        )}
      </div>

      {showModal && (
        <div
          ref={modalRef}
          className="absolute top-10 right-3 w-72 max-h-64 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 animate-fadeIn"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
        >
          <button
            onClick={() => {
              setShowModal(false);
              setFilter("all");
            }}
            className="text-gray-400 hover:text-gray-700 flex ml-auto pb-1"
            aria-label="Fechar"
          >
            <MdClose size={20} />
          </button>

          <div className="space-y-2 text-xs text-gray-600">
            {logsToShow.length === 0 && (
              <p className="text-center text-gray-400 italic">Sem logs aqui.</p>
            )}
            {logsToShow.map((log) => (
              <div
                key={log.job_id}
                className="p-2 bg-gray-50 rounded border flex justify-between items-start"
              >
                <div>
                  <p>
                    <strong>Início:</strong> {log.horario_inicio}
                  </p>
                  <p>
                    <strong>Fim:</strong> {log.horario_fim}
                  </p>
                  <p>
                    <strong>Tamanho:</strong> {log.tamanho}
                  </p>
                  <p>{log.status_final === "OK" ? "✅ Sucesso" : "❌ Falha"}</p>
                </div>
                <div className="text-right text-gray-400 font-mono ml-4 flex flex-col justify-between">
                  <div>
                    <p>
                      <strong>Job ID</strong>
                    </p>
                    <p>{log.job_id}</p>
                  </div>
                  <div className="mt-2 text-gray-600 font-normal">
                    <p>{log.nome_job}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
