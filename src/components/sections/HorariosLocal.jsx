import { MapPin, Navigation, Phone, Clock } from "lucide-react";
import { site } from "@/config/site";
import { statusAgora, faixaDePicoAtual } from "@/utils/horario";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Foto } from "@/components/ui/Foto";
import { RotuloSecao } from "@/components/ui/Secao";

/** 07 · Horários & Localização — BRIEF §4. Resolve as duas maiores objeções. */
export function HorariosLocal() {
  const status = statusAgora(site.horarios);
  const picoAtual = faixaDePicoAtual(site.pico);

  return (
    <section
      id="horarios"
      className="relative border-t border-aco-escuro/40 py-24 md:py-32"
    >
      <div className="container-lp">
        <RotuloSecao numero="05" texto="Quando e onde" />

        <div className="mt-6 grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SplitHeading className="fonte-display titulo-lg max-w-[12ch]">
              {"ABRE ÀS 5H.\nFECHA ÀS 22H."}
            </SplitHeading>

            <div className="mt-8 inline-flex items-center gap-3 border border-aco-escuro/60 px-4 py-2.5">
              <span
                className={`pulso-vivo h-2 w-2 rounded-full ${
                  status.aberto ? "bg-emerald-400" : "bg-aco"
                }`}
              />
              <span className="text-sm font-semibold">
                {status.aberto ? "Aberto agora" : "Fechado agora"}
              </span>
              <span className="text-sm text-aco">· {status.rotulo}</span>
            </div>

            <dl className="mt-10 divide-y divide-aco-escuro/40 border-y border-aco-escuro/40">
              {site.horarios.map((h) => (
                <div
                  key={h.dia}
                  className="flex items-center justify-between py-4"
                >
                  <dt className="flex items-center gap-3 text-sm text-aco">
                    <Clock size={15} aria-hidden="true" className="text-aco-escuro" />
                    {h.dia}
                  </dt>
                  <dd className="tabular text-sm font-semibold">
                    {h.abre ? `${h.abre} – ${h.fecha}` : "Fechado"}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Movimento por horário — resolve "vai estar lotado?" */}
            <div className="mt-12">
              <h3 className="text-[11px] font-semibold tracking-[0.24em] text-aco uppercase">
                Movimento por horário
              </h3>
              <ul className="mt-5 space-y-3">
                {site.pico.map((p, i) => (
                  <li key={p.faixa} className="flex items-center gap-4">
                    <span className="tabular w-24 shrink-0 text-xs text-aco">
                      {p.faixa}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden bg-aco-escuro/40">
                      <span
                        className={`block h-full ${
                          i === picoAtual ? "bg-supreme" : "bg-aco-escuro"
                        }`}
                        style={{ width: `${p.intensidade}%` }}
                      />
                    </span>
                    <span className="w-20 shrink-0 text-right text-[10px] tracking-wide text-aco-escuro uppercase">
                      {p.intensidade >= 85
                        ? "Cheio"
                        : p.intensidade >= 50
                          ? "Moderado"
                          : "Tranquilo"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-aco-escuro">
                Quer treinar sem fila? Entre 7h e 11h ou depois das 20h.
              </p>
            </div>
          </div>

          <div>
            {/* PENDENTE: trocar por mapa com tema dark customizado + pin real */}
            <Foto
              ratio="4/3"
              alt="Fachada da Supreme Fitness"
              brief="Fachada da academia à noite, letreiro aceso. Substituir depois por mapa dark com o pin."
              className="borda-sutil"
            />

            <div className="borda-sutil mt-6 space-y-5 bg-carbono-claro p-6 md:p-7">
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-supreme"
                />
                <address className="text-sm leading-relaxed text-aco not-italic">
                  <span className="block font-semibold text-branco">
                    {site.contato.endereco}
                  </span>
                  {site.contato.bairro}
                </address>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-supreme"
                />
                <a
                  href={`tel:+${site.contato.whatsapp}`}
                  className="text-sm text-aco transition-colors hover:text-branco"
                >
                  {site.contato.telefoneExibicao}
                </a>
              </div>

              <a
                href={site.contato.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 bg-branco text-xs font-semibold tracking-[0.14em] text-carbono uppercase transition-colors hover:bg-aco"
              >
                <Navigation size={15} aria-hidden="true" />
                Traçar rota
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
