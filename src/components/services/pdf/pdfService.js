import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import latoBlackBase64 from "./fonts/Lato-Black.base64";

import iconJobs from "./icons/jobs";
import iconActive from "./icons/active";
import iconInactive from "./icons/inactive";
import iconSuccess from "./icons/success";
import iconFail from "./icons/fail";
import iconChart from "./icons/chart";
import iconUpdate from "./icons/update";
import logoBase64 from "./icons/logo";

function formatSecondsToHMS(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

const normalize = (s) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function sortValueFrom(str) {
  if (!str || typeof str !== "string") return null;
  const t = Date.parse(str);
  if (!Number.isNaN(t)) return t;

  const m = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = +m[1],
    mi = +m[2],
    s = +(m[3] ?? 0);
  return h * 3600 + mi * 60 + s;
}

function displayFrom(str) {
  if (!str || typeof str !== "string") return "-";
  const t = Date.parse(str);
  if (!Number.isNaN(t)) return new Date(t).toLocaleString("pt-BR");

  const m = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const h = String(m[1]).padStart(2, "0");
    const mi = String(m[2]).padStart(2, "0");
    const s = String(m[3] ?? "00").padStart(2, "0");
    return `${h}:${mi}:${s}`;
  }
  return str;
}

export function gerarPdfA4(empresa, jobs = [], logs = []) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.addFileToVFS("Lato-Black.ttf", latoBlackBase64);
  doc.addFont("Lato-Black.ttf", "LatoBlack", "normal");
  doc.setFont("LatoBlack");

  const boxY = 140;
  const boxHeight = 90;
  const boxX = 40;
  const boxWidth = pageWidth - 80;
  const borderRadius = 10;
  const headerX = boxX;

  const headerY = 40;
  if (logoBase64) {
    const logoWidth = 150;
    const logoHeight = (118 / 400) * logoWidth;
    const logoX = 60;
    const logoY = headerY;
    doc.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
  }

  doc.setFontSize(18);
  doc.setTextColor("#000");
  doc.text(`Relatório de Jobs - ${empresa}`, headerX + 20, headerY + 90);

  const now = new Date();
  doc.setFontSize(6);
  doc.setTextColor("#555");
  doc.text(
    `Gerado em: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
    pageWidth - 20,
    headerY,
    { align: "right" }
  );

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(
    (j) => !!j.status || String(j.status).toLowerCase() === "true"
  ).length;
  const inactiveJobs = totalJobs - activeJobs;
  const successJobs = logs.filter(
    (j) => String(j.status_final) === "OK"
  ).length;
  const failJobs = logs.filter((j) => String(j.status_final) !== "OK").length;

  const totalExecSeconds = logs.reduce((sum, log) => {
    const startStr = log.horario_inicio;
    const endStr = log.horario_fim;

    if (!startStr || !endStr) return sum;

    const startParts = startStr.split(":").map(Number);
    const endParts = endStr.split(":").map(Number);

    if (startParts.length !== 3 || endParts.length !== 3) return sum;

    const startSeconds =
      startParts[0] * 3600 + startParts[1] * 60 + startParts[2];
    const endSeconds = endParts[0] * 3600 + endParts[1] * 60 + endParts[2];

    return sum + (endSeconds - startSeconds);
  }, 0);

  const totalExecFormatted = formatSecondsToHMS(totalExecSeconds);

  function horaParaSegundos(horario) {
    if (!horario) return 0;
    const [h, m, s] = horario.split(":").map(Number);
    return h * 3600 + m * 60 + (s || 0);
  }

  const lastUpdateSegundos = logs.length
    ? Math.max(...logs.map((j) => horaParaSegundos(j.horario_agendado)))
    : null;

  function formatSegundos(horasSegundos) {
    const h = Math.floor(horasSegundos / 3600);
    const m = Math.floor((horasSegundos % 3600) / 60);
    const s = horasSegundos % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  const lastUpdate =
    lastUpdateSegundos !== null ? formatSegundos(lastUpdateSegundos) : "-";

  const lastUpdateY = boxY + boxHeight + 35;
  const iconSizeSmall = 12;

  if (iconUpdate) {
    doc.addImage(
      iconUpdate,
      "PNG",
      boxX,
      lastUpdateY - 10,
      iconSizeSmall,
      iconSizeSmall
    );
  }

  doc.setFontSize(8);
  doc.setTextColor("#555");
  doc.text(
    `Última atualização: ${lastUpdate ? lastUpdate.toLocaleString() : "-"}`,
    boxX + 2 + iconSizeSmall,
    lastUpdateY
  );
  doc.setFillColor(200, 200, 200);
  doc.roundedRect(
    boxX + 3,
    boxY + 3,
    boxWidth,
    boxHeight,
    borderRadius,
    borderRadius,
    "F"
  );

  doc.setFillColor("#EAB308");
  doc.setDrawColor("#EAB308");
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 10, 10, "F");

  const cardWidth = (pageWidth - 80) / 6;
  const stats = [
    { icon: iconJobs, label: "Total", value: totalJobs },
    { icon: iconActive, label: "Ativos", value: activeJobs },
    {
      icon: iconInactive,
      label: "Inativos",
      value: inactiveJobs,
    },
    {
      icon: iconSuccess,
      label: "Sucesso",
      value: successJobs,
    },
    { icon: iconFail, label: "Falha", value: failJobs },
    {
      icon: iconChart,
      label: "Tempo Total",
      value: totalExecFormatted,
    },
  ];

  const iconSize = 30;
  const gapIconText = 13;
  const gapTextValue = 5;
  const startY = boxY + 15;
  stats.forEach((stat, i) => {
    const cardX = boxX + i * cardWidth;
    const iconX = cardX + cardWidth / 2 - iconSize / 2;
    const iconY = startY;

    doc.addImage(stat.icon, "PNG", iconX, iconY, iconSize, iconSize);

    doc.setFontSize(12);
    doc.setTextColor("#888888");
    doc.text(
      stat.label,
      cardX + cardWidth / 2,
      iconY + iconSize + gapIconText,
      { align: "center" }
    );

    doc.setFontSize(16);
    doc.text(
      String(stat.value),
      cardX + cardWidth / 2,
      iconY + iconSize + gapIconText + gapTextValue + 12,
      { align: "center" }
    );
  });

  const ultimosLogsPorJob = logs.reduce((acc, log) => {
    const key = normalize(log.nome_job);
    const end = log.horario_fim;
    const start = log.horario_inicio;

    const sortEnd = sortValueFrom(end);
    const sortStart = sortValueFrom(start);
    const sortValue = sortEnd ?? sortStart ?? -Infinity;
    const display = displayFrom(end ?? start);

    if (!acc[key] || sortValue > acc[key].sortValue) {
      acc[key] = { sortValue, display };
    }
    return acc;
  }, {});

  const tableData = jobs.map((job) => {
    const key = normalize(job.nome_job);
    const ultimoDisplay = ultimosLogsPorJob[key]?.display ?? "-";

    return [
      job.cliente ?? "-",
      job.nome_job ?? "-",
      job.status === true || String(job.status).toLowerCase() === "true"
        ? "Ativo"
        : "Inativo",
      ultimoDisplay,
      job.createdAt ? new Date(job.createdAt).toLocaleDateString("pt-BR") : "-",
    ];
  });

  autoTable(doc, {
    head: [
      ["Cliente", "Nome do Job", "Status", "Último Log", "Data de Criação"],
    ],
    body: tableData,
    startY: boxY + boxHeight + 40,
    theme: "grid",
    headStyles: { fillColor: "#D08700", textColor: "#fff" },
    alternateRowStyles: { fillColor: "#f9f9f9" },
  });

  const obsY = doc.lastAutoTable.finalY + 20;
  doc.setDrawColor("#ccc");
  doc.setLineWidth(0.5);
  doc.rect(40, obsY, pageWidth - 80, 60);
  doc.setFontSize(12);
  doc.setTextColor("#333");
  doc.text("Notas:", 50, obsY + 20);
  doc.setFontSize(10);
  doc.setTextColor("#555");
  doc.text(
    "Recomenda-se verificar os jobs inativos e corrigir possíveis falhas de execução.",
    50,
    obsY + 40
  );

  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
}
