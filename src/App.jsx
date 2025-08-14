import { useState, useEffect, useRef } from "react";
import { LoadingModal } from "./components/LoadingModal";
import { ErrorModal } from "./components/ErrorModal";
import JobCard from "./components/JobCard";
import Header from "./components/Header";
import { supabase } from "../supabaseClient";
import {
  MdFilterList,
  MdCheck,
  MdExpandLess,
  MdExpandMore,
  MdPictureAsPdf,
} from "react-icons/md";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [logsMap, setLogsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empresaFilter, setEmpresaFilter] = useState("");
  const [statusActive, setStatusActive] = useState(false);
  const [statusInactive, setStatusInactive] = useState(false);
  const [logsSuccessFilter, setLogsSuccessFilter] = useState(false);
  const [logsFailFilter, setLogsFailFilter] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [jobsByClient, setJobsByClient] = useState({});
  const [expandedCompanies, setExpandedCompanies] = useState({});
  const filterRef = useRef(null);

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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs_bacula")
          .select("*");
        if (jobsError) throw jobsError;

        const { data: logsData, error: logsError } = await supabase
          .from("bacula_jobs_execucoes")
          .select("*");
        if (logsError) throw logsError;

        setJobs(jobsData);

        const map = {};
        logsData.forEach((log) => {
          const key = log.nome_job || log.job_id;
          if (!map[key]) map[key] = [];
          map[key].push(log);
        });
        setLogsMap(map);

        const grouped = {};
        jobsData.forEach((job) => {
          if (!grouped[job.empresa]) grouped[job.empresa] = [];
          grouped[job.empresa].push(job);
        });
        setJobsByClient(grouped);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const initialExpanded = {};
    Object.keys(jobsByClient).forEach((empresa) => {
      initialExpanded[empresa] = true;
    });
    setExpandedCompanies(initialExpanded);
  }, [jobsByClient]);

  const toggleCompany = (empresa) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [empresa]: !prev[empresa],
    }));
  };

  return (
    <div className="min-h-screen w-screen bg-gray-300 pt-16 px-4">
      <Header />

      <div className="flex justify-end items-center gap-2 px-4 pt-6 pb-4 bg-gray-300 flex-wrap relative">
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterOpen((open) => !open)}
            className="p-2 rounded bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none"
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
          placeholder="Buscar por empresa..."
          className="border border-gray-300 rounded px-4 py-2 w-72 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={empresaFilter}
          onChange={(e) => setEmpresaFilter(e.target.value)}
        />
      </div>

      <main className="pt-10 mx-auto" style={{ maxWidth: "1300px" }}>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-1 text-gray-700">
            Dashboard Jobs Bacula
          </h2>
          <div
            style={{ width: "75%" }}
            className="w-full h-px bg-gray-400 mb-30"
          ></div>
        </section>

        {Object.entries(jobsByClient).map(([empresa, companyJobs]) => {
          const filteredJobs = companyJobs.filter((job) => {
            if (
              empresaFilter !== "" &&
              !job.empresa?.toLowerCase().includes(empresaFilter.toLowerCase())
            ) {
              return false;
            }

            if (statusActive && String(job.status).toLowerCase() !== "true")
              return false;
            if (statusInactive && String(job.status).toLowerCase() === "true")
              return false;

            const jobLogs = logsMap[job.nome_job] || [];
            const hasSuccessLogs = jobLogs.some(
              (log) => log.status_final === "OK"
            );
            const hasFailLogs = jobLogs.some(
              (log) => log.status_final !== "OK"
            );

            if (logsSuccessFilter && !hasSuccessLogs) return false;
            if (logsFailFilter && !hasFailLogs) return false;

            return true;
          });

          if (filteredJobs.length === 0) return null;

          return (
            <section key={empresa} className="mb-10 w-full">
              <div className="flex flex-col w-full">
                <div
                  className="flex items-center justify-between border border-gray-700 rounded-xl px-4 py-3 cursor-pointer w-full"
                  style={{ backgroundColor: "transparent" }}
                  onClick={() => toggleCompany(empresa)}
                >
                  <h2 className="text-xl font-semibold text-gray-700">
                    {empresa}
                  </h2>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        gerarPdf(empresa);
                      }}
                      className="flex items-center justify-center px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded cursor-pointer"
                    >
                      <MdPictureAsPdf size={18} />
                    </button>

                    {expandedCompanies[empresa] !== false ? (
                      <MdExpandLess size={24} className="text-gray-700" />
                    ) : (
                      <MdExpandMore size={24} className="text-gray-700" />
                    )}
                  </div>
                </div>

                {expandedCompanies[empresa] !== false && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-4  mt-4 w-full">
                    {filteredJobs.map((job) => (
                      <JobCard
                        key={job.nome_job}
                        job={job}
                        logs={logsMap[job.nome_job] || []}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>

      <LoadingModal isOpen={loading} />
      <ErrorModal
        isOpen={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </div>
  );
}
