import { useState, useEffect } from "react";
import Header from "../Header";
import FilterPanel from "../FilterPanel";
import JobList from "../JobList";
import { LoadingModal } from "../Modals/LoadingModal";
import { ErrorModal } from "../Modals/ErrorModal";
import { fetchJobsAndLogs } from "../services/supabase";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [logsMap, setLogsMap] = useState({});
  const [jobsByClient, setJobsByClient] = useState({});
  const [expandedCompanies, setExpandedCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [empresaFilter, setEmpresaFilter] = useState("");
  const [statusActive, setStatusActive] = useState(false);
  const [statusInactive, setStatusInactive] = useState(false);
  const [logsSuccessFilter, setLogsSuccessFilter] = useState(false);
  const [logsFailFilter, setLogsFailFilter] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const { jobsData, logsMap, jobsByClient } = await fetchJobsAndLogs();
        setJobs(jobsData);
        setLogsMap(logsMap);
        setJobsByClient(jobsByClient);

        const initialExpanded = {};
        Object.keys(jobsByClient).forEach((empresa) => {
          initialExpanded[empresa] = true;
        });
        setExpandedCompanies(initialExpanded);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleCompany = (empresa) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [empresa]: !prev[empresa],
    }));
  };

  const gerarPdf = (empresa) => {
    console.log("Gerar PDF para:", empresa);
  };

  return (
    <div className="min-h-screen bg-gray-300 pt-16 px-4 ">
      <Header />

      <FilterPanel
        statusActive={statusActive}
        setStatusActive={setStatusActive}
        statusInactive={statusInactive}
        setStatusInactive={setStatusInactive}
        logsSuccessFilter={logsSuccessFilter}
        setLogsSuccessFilter={setLogsSuccessFilter}
        logsFailFilter={logsFailFilter}
        setLogsFailFilter={setLogsFailFilter}
        empresaFilter={empresaFilter}
        setEmpresaFilter={setEmpresaFilter}
      />

      <main className="pt-10 mx-auto " style={{ maxWidth: "1300px" }}>
        <section className="mb-10 ">
          <h2 className="text-2xl font-semibold mb-1 text-gray-700">
            Dashboard Jobs Bacula
          </h2>
          <div className="w-7/10 h-px bg-gray-400 mb-30"></div>
        </section>

        <JobList
          jobsByClient={jobsByClient}
          logsMap={logsMap}
          expandedCompanies={expandedCompanies}
          toggleCompany={toggleCompany}
          gerarPdf={gerarPdf}
          filters={{
            empresaFilter,
            statusActive,
            statusInactive,
            logsSuccessFilter,
            logsFailFilter,
          }}
        />
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
