import JobCard from "./JobCard.jsx";
import { MdExpandLess, MdExpandMore, MdPictureAsPdf } from "react-icons/md";

export default function JobList({
  jobsByClient,
  logsMap,
  expandedCompanies,
  toggleCompany,
  gerarPdf,
  filters,
}) {
  const {
    empresaFilter,
    statusActive,
    statusInactive,
    logsSuccessFilter,
    logsFailFilter,
  } = filters;

  return (
    <>
      {Object.entries(jobsByClient).map(([empresa, companyJobs]) => {
        const filteredJobs = companyJobs.filter((job) => {
          const search = empresaFilter.toLowerCase().trim();

          if (search !== "") {
            const matchEmpresa = job.empresa?.toLowerCase().includes(search);
            const matchCliente = job.cliente?.toLowerCase().includes(search);
            const matchJob = job.nome_job?.toLowerCase().includes(search);
            if (!matchEmpresa && !matchCliente && !matchJob) return false;
          }

          if (statusActive && String(job.status).toLowerCase() !== "true")
            return false;
          if (statusInactive && String(job.status).toLowerCase() === "true")
            return false;

          const jobLogs = logsMap[job.nome_job] || [];
          const hasSuccessLogs = jobLogs.some(
            (log) => log.status_final === "OK"
          );
          const hasFailLogs = jobLogs.some((log) => log.status_final !== "OK");

          if (logsSuccessFilter && !hasSuccessLogs) return false;
          if (logsFailFilter && !hasFailLogs) return false;

          return true;
        });

        if (!filteredJobs.length) return null;

        return (
          <section key={empresa} className="mb-10 w-full">
            <div className="flex flex-col w-full">
              <div
                className="flex items-center justify-between border border-gray-700 rounded-xl px-4 py-3 cursor-pointer w-full"
                onClick={() => toggleCompany(empresa)}
              >
                <div className="flex flex-col items-center sm:items-start w-full">
                  <h2 className="text-xl font-semibold text-gray-700 text-center sm:text-left truncate max-w-[200px] sm:max-w-full">
                    {empresa}
                  </h2>
                </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-4 mt-4 w-full">
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
    </>
  );
}
