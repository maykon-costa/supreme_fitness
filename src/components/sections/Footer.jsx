import { Mail, Phone } from "lucide-react";
import { site } from "@/config/site";
import { scrollTo } from "@/lib/lenis";
import { IconeInstagram, IconeFacebook } from "@/components/ui/IconesSociais";
import { Logo } from "@/components/ui/Logo";

/**
 * 09 · Footer — BRIEF §4.
 * NAP (Nome, Endereço, Telefone) idêntico ao Google Business e ao JSON-LD
 * do index.html. Divergência aqui derruba o SEO local (LP_GUIDE §8).
 */
export function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-aco-escuro/40 bg-carbono-claro">
      <div className="container-lp py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo tamanho="md" />
            <p className="peso-variavel mt-4 max-w-[34ch] text-sm leading-relaxed text-aco">
              {site.slogan}
            </p>
            <p className="mt-6 text-xs tracking-[0.16em] text-aco-escuro uppercase">
              {site.registro}
            </p>
          </div>

          <nav aria-label="Rodapé">
            <h2 className="text-[11px] font-semibold tracking-[0.24em] text-aco uppercase">
              Navegue
            </h2>
            <ul className="mt-5 space-y-3">
              {site.navegacao.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(item.href);
                    }}
                    className="text-sm text-aco transition-colors hover:text-branco"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[11px] font-semibold tracking-[0.24em] text-aco uppercase">
              Contato
            </h2>
            <address className="mt-5 space-y-3 text-sm text-aco not-italic">
              <p className="leading-relaxed">
                {site.contato.endereco}
                <br />
                {site.contato.bairro}
              </p>
              <a
                href={`tel:+${site.contato.whatsapp}`}
                className="flex items-center gap-2 transition-colors hover:text-branco"
              >
                <Phone size={14} aria-hidden="true" />
                {site.contato.telefoneExibicao}
              </a>
              <a
                href={`mailto:${site.contato.email}`}
                className="flex items-center gap-2 transition-colors hover:text-branco"
              >
                <Mail size={14} aria-hidden="true" />
                {site.contato.email}
              </a>
            </address>

            <div className="mt-6 flex gap-3">
              <a
                href={site.contato.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Supreme Fitness"
                className="borda-sutil flex h-10 w-10 items-center justify-center text-aco transition-colors hover:border-supreme hover:text-branco"
              >
                <IconeInstagram size={17} />
              </a>
              <a
                href={site.contato.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook da Supreme Fitness"
                className="borda-sutil flex h-10 w-10 items-center justify-center text-aco transition-colors hover:border-supreme hover:text-branco"
              >
                <IconeFacebook size={17} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-aco-escuro/40 pt-7 text-xs text-aco-escuro sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ano} {site.nome}. Todos os direitos reservados.
          </p>
          <p>{site.cidade}</p>
        </div>
      </div>
    </footer>
  );
}
