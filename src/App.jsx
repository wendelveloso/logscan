import { useState, useEffect, useRef } from "react";
import { LoadingModal } from "./components/LoadingModal";
import { ErrorModal } from "./components/ErrorModal";
import JobCard from "./components/JobCard";
import Header from "./components/Header";
import { supabase } from "../supabaseClient";
import { MdFilterList, MdCheck } from "react-icons/md";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [logsMap, setLogsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empresaFilter, setEmpresaFilter] = useState("");
  const [statusActive, setStatusActive] = useState(false);
  const [statusInactive, setStatusInactive] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [jobsByClient, setJobsByClient] = useState({});
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
          if (!grouped[job.cliente]) grouped[job.cliente] = [];
          grouped[job.cliente].push(job);
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
            <div className="relative">
              <div
                className="absolute bg-white shadow-md"
                style={{
                  width: "26px",
                  height: "14px",
                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",

                  right: "6px",
                  zIndex: 51,
                }}
              />
              <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
                <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={statusActive}
                    onChange={() => setStatusActive((prev) => !prev)}
                    className="hidden"
                    id="ativo"
                  />
                  <span
                    className={`w-5 h-5 flex items-center justify-center rounded-sm border-2 ${
                      statusActive
                        ? "bg-yellow-400 border-yellow-400"
                        : "border-gray-400"
                    }`}
                  >
                    {statusActive && <MdCheck className="text-white" />}
                  </span>
                  <span className="text-gray-700 font-medium">Ativo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={statusInactive}
                    onChange={() => setStatusInactive((prev) => !prev)}
                    className="hidden"
                    id="inativo"
                  />
                  <span
                    className={`w-5 h-5 flex items-center justify-center rounded-sm border-2 ${
                      statusInactive
                        ? "bg-yellow-400 border-yellow-400"
                        : "border-gray-400"
                    }`}
                  >
                    {statusInactive && <MdCheck className="text-white" />}
                  </span>
                  <span className="text-gray-700 font-medium">Inativo</span>
                </label>
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

      <main className="pt-20 max-w-7xl mx-auto">
        {Object.entries(jobsByClient).map(([cliente, clientJobs]) => {
          const filteredJobs = clientJobs.filter((job) => {
            const matchesEmpresa =
              empresaFilter === "" ||
              job.empresa?.toLowerCase().includes(empresaFilter.toLowerCase());

            const hasStatusFilter = statusActive || statusInactive;

            const matchesStatus =
              !hasStatusFilter ||
              (statusActive && job.status === true) ||
              (statusInactive && job.status === false);

            return matchesEmpresa && matchesStatus;
          });

          if (filteredJobs.length === 0) return null;

          return (
            <section key={cliente} className="mb-10">
              <h2 className="text-xl font-semibold mb-4">{cliente}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-10 lg:gap-20 rounded-xl">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.nome_job}
                    job={job}
                    logs={logsMap[job.nome_job] || []}
                  />
                ))}
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
