/**
 * "Aberto agora / Fechado" calculado em tempo real — BRIEF §4 (seção 07).
 *
 * Sempre no fuso da academia (America/Recife), não no do visitante:
 * alguém abrindo o site de outro estado precisa ver o horário DA ACADEMIA.
 */
const TZ = "America/Recife";

function agoraEmRecife() {
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const partes = Object.fromEntries(
    fmt.formatToParts(new Date()).map((p) => [p.type, p.value])
  );

  const mapaDias = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sáb: 6, sab: 6 };
  const chave = partes.weekday.toLowerCase().replace(".", "").slice(0, 3);

  return {
    dia: mapaDias[chave] ?? new Date().getDay(),
    minutos: Number(partes.hour) * 60 + Number(partes.minute),
  };
}

function paraMinutos(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

const NOMES_DIA = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

/** Próxima abertura a partir de amanhã, varrendo até 7 dias à frente. */
function proximaAbertura(horarios, diaAtual) {
  for (let salto = 1; salto <= 7; salto++) {
    const dia = (diaAtual + salto) % 7;
    const faixa = horarios.find((h) => h.dias.includes(dia));
    if (faixa?.abre) {
      const quando = salto === 1 ? "amanhã" : NOMES_DIA[dia];
      return `Abre ${quando} às ${faixa.abre}`;
    }
  }
  return null;
}

/**
 * `rotulo` é sempre COMPLEMENTAR ao estado aberto/fechado — nunca repete a
 * mesma informação, senão a UI mostra "Fechado agora · Fechado agora".
 * Quando está fechado, informa quando abre: é o que a pessoa precisa saber.
 *
 * @param {Array<{dia:string, abre:string|null, fecha:string|null, dias:number[]}>} horarios
 * @returns {{aberto:boolean, rotulo:string, faixaAtual:object|null}}
 */
export function statusAgora(horarios) {
  const { dia, minutos } = agoraEmRecife();
  const faixa = horarios.find((h) => h.dias.includes(dia));

  const fechado = (rotulo) => ({
    aberto: false,
    rotulo: rotulo ?? proximaAbertura(horarios, dia) ?? "Consulte os horários",
    faixaAtual: faixa ?? null,
  });

  if (!faixa || !faixa.abre || !faixa.fecha) return fechado();

  const abre = paraMinutos(faixa.abre);
  const fecha = paraMinutos(faixa.fecha);

  if (minutos < abre) return fechado(`Abre hoje às ${faixa.abre}`);
  if (minutos >= fecha) return fechado();

  const faltam = fecha - minutos;
  if (faltam <= 60) {
    return { aberto: true, rotulo: `Fecha em ${faltam} min`, faixaAtual: faixa };
  }
  return { aberto: true, rotulo: `Fecha às ${faixa.fecha}`, faixaAtual: faixa };
}

/** Índice da faixa de pico correspondente ao horário atual, ou -1. */
export function faixaDePicoAtual(pico) {
  const { minutos } = agoraEmRecife();
  return pico.findIndex((p) => {
    const [ini, fim] = p.faixa.split("–").map((s) => Number(s.trim().replace("h", "")) * 60);
    return minutos >= ini && minutos < fim;
  });
}
