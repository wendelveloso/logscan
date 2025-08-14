import { supabase } from "../../../supabaseClient";

export async function fetchJobsAndLogs() {
  const { data: jobsData, error: jobsError } = await supabase
    .from("jobs_bacula")
    .select("*");
  if (jobsError) throw jobsError;

  const { data: logsData, error: logsError } = await supabase
    .from("bacula_jobs_execucoes")
    .select("*");
  if (logsError) throw logsError;

  const logsMap = {};
  logsData.forEach((log) => {
    const key = log.nome_job || log.job_id;
    if (!logsMap[key]) logsMap[key] = [];
    logsMap[key].push(log);
  });

  const jobsByClient = {};
  jobsData.forEach((job) => {
    if (!jobsByClient[job.empresa]) jobsByClient[job.empresa] = [];
    jobsByClient[job.empresa].push(job);
  });

  return { jobsData, logsMap, jobsByClient };
}
