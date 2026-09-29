import { ArrowRight, Bell, Gauge, Globe, Radio, Search, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Github } from '@/components/marketing/github-icon'
import { siteConfig } from '@/config/site'

// Console ilustrativo da landing (dados de exemplo, não são checagens reais).
const CONSOLE = [
  { name: 'api.loja.com.br', status: 'UP', ms: 142, uptime: '99.98', bars: 'ooooooooooooooooooooooooooooooooooooooo' },
  { name: 'checkout.loja.com.br', status: 'UP', ms: 211, uptime: '99.91', bars: 'ooooooooooooooooooxxoooooooooooooooooooo' },
  { name: 'pagamentos-hml', status: 'DOWN', ms: null, uptime: '92.70', bars: 'oooooooooooooooooooooooooooooooooxxxxxxx' },
  { name: 'www.letinfo.dev', status: 'UP', ms: 188, uptime: '100.0', bars: 'ooooooooooooooooooooooooooooooooooooooo' },
  { name: 'api.github.com', status: 'UP', ms: 96, uptime: '100.0', bars: 'ooooooooooooooooooooooooooooooooooooooo' },
]

const FEATURES = [
  { icon: Radio, code: 'sse', title: 'Ao vivo de verdade', text: 'Server-Sent Events empurram status e latência para o painel assim que mudam. Nada de F5.' },
  { icon: Search, code: 'http', title: 'Checagem completa', text: 'Status esperado, palavra-chave no HTML, timeout, DNS e certificado SSL — com erro legível.' },
  { icon: Bell, code: 'incident', title: 'Sem alarme falso', text: 'Incidente só abre após duas falhas seguidas e fecha sozinho na primeira resposta saudável.' },
  { icon: Gauge, code: 'metrics', title: 'Latência e uptime', text: 'Gráfico de 24 h, uptime de 24 h/7 d/30 d e tempo médio de recuperação.' },
  { icon: Globe, code: 'status', title: 'Página de status', text: 'Link público com 90 dias de histórico diário para mostrar transparência aos clientes.' },
  { icon: ShieldCheck, code: 'ssrf', title: 'Seguro por padrão', text: 'URLs que resolvem para redes privadas são bloqueadas — o monitor não vira scanner.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Logo />
          <nav className="hidden gap-6 font-mono text-xs tracking-wider text-zinc-500 uppercase md:flex">
            <a href="#recursos" className="hover:text-zinc-900">recursos</a>
            <a href="#como" className="hover:text-zinc-900">como funciona</a>
            <Link href="/status/demo" className="hover:text-zinc-900">status page</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer" aria-label="GitHub" className="text-zinc-500 hover:text-zinc-900">
              <Github className="size-5" />
            </a>
            <Link href="/login" className="rounded bg-brand-500 px-4 py-2 font-mono text-xs font-semibold tracking-wider text-white uppercase hover:bg-brand-400">
              abrir demo
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:pt-24">
          <div>
            <p className="eyebrow">{'// uptime monitoring'}</p>
            <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Saiba que caiu <span className="text-brand-500">antes</span> do seu cliente.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-zinc-600">
              Monitore sites e APIs a cada minuto, acompanhe latência ao vivo e publique uma página de status com 90 dias de
              histórico.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 rounded bg-brand-500 px-5 py-3 font-mono text-sm font-semibold text-white hover:bg-brand-400">
                $ entrar na demo <ArrowRight className="size-4" />
              </Link>
              <Link href="/status/demo" className="inline-flex items-center gap-2 rounded border border-zinc-300 px-5 py-3 font-mono text-sm text-zinc-800 hover:border-zinc-500">
                ver status page
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-zinc-200 pt-6 font-mono">
              {[
                ['60s', 'intervalo mín.'],
                ['2x', 'falhas p/ alertar'],
                ['90d', 'histórico público'],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-2xl font-semibold text-zinc-950">{v}</dt>
                  <dd className="text-[11px] tracking-wide text-zinc-500 uppercase">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_0_80px_-20px_rgb(57_217_138/0.35)]">
            <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-2.5 font-mono text-[11px] text-zinc-500">
              <span className="size-2.5 rounded-full bg-red-500/80" />
              <span className="size-2.5 rounded-full bg-amber-400/80" />
              <span className="size-2.5 rounded-full bg-brand-500/80" />
              <span className="ml-2">pulseboard — monitores</span>
              <span className="ml-auto flex items-center gap-1.5 text-brand-500">
                <span className="size-1.5 animate-pulse rounded-full bg-brand-500" /> live
              </span>
            </div>
            <ul className="divide-y divide-zinc-200 font-mono text-xs">
              {CONSOLE.map((row) => (
                <li key={row.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,12rem)_4rem_4rem]">
                  <span className={row.status === 'UP' ? 'size-2 rounded-full bg-brand-500' : 'size-2 animate-pulse rounded-full bg-red-500'} />
                  <span className="truncate text-zinc-800">{row.name}</span>
                  <span className="hidden h-5 items-end gap-px sm:flex">
                    {row.bars.split('').map((b, i) => (
                      <span key={i} className={b === 'o' ? 'w-[3px] bg-brand-500/70' : 'w-[3px] bg-red-500'} style={{ height: b === 'o' ? `${35 + ((i * 37) % 60)}%` : '100%' }} />
                    ))}
                  </span>
                  <span className={row.status === 'UP' ? 'hidden text-right text-zinc-500 sm:block' : 'hidden text-right text-red-600 sm:block'}>
                    {row.ms ? `${row.ms}ms` : 'SSL'}
                  </span>
                  <span className={row.status === 'UP' ? 'text-right text-brand-500' : 'text-right text-red-600'}>{row.uptime}%</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-zinc-200 bg-red-50 px-4 py-2.5 font-mono text-[11px] text-red-700">
              ✕ pagamentos-hml · certificado SSL inválido · incidente aberto há 1h 35min
            </div>
          </div>
        </section>

        <section id="recursos" className="border-y border-zinc-200 bg-white/40">
          <div className="mx-auto grid max-w-6xl gap-px bg-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.code} className="bg-zinc-50 p-7">
                <div className="flex items-center gap-3">
                  <f.icon className="size-5 text-brand-500" />
                  <span className="font-mono text-[11px] tracking-wider text-zinc-500">[{f.code}]</span>
                </div>
                <h3 className="mt-4 font-semibold text-zinc-950">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="como" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="eyebrow">{'// como funciona'}</p>
          <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-6 font-mono text-[13px] leading-7 text-zinc-600">
            <p><span className="text-zinc-400">14:02:00</span> <span className="text-brand-500">check</span> checkout.loja.com.br → 200 OK <span className="text-zinc-400">211ms</span></p>
            <p><span className="text-zinc-400">14:03:00</span> <span className="text-amber-600">check</span> checkout.loja.com.br → 502 <span className="text-zinc-400">(1ª falha, aguardando confirmação)</span></p>
            <p><span className="text-zinc-400">14:04:00</span> <span className="text-red-600">incident</span> checkout.loja.com.br → 502 · incidente aberto · status page atualizada</p>
            <p><span className="text-zinc-400">14:09:00</span> <span className="text-brand-500">resolved</span> checkout.loja.com.br → 200 OK · duração 5 min · MTTR recalculado</p>
            <p className="text-zinc-400">_</p>
          </div>
          <div className="mt-10 grid gap-6 text-sm text-zinc-600 md:grid-cols-3">
            <p><strong className="block font-mono text-zinc-900">01 · cadastre</strong>URL, intervalo, status esperado e palavra-chave opcional.</p>
            <p><strong className="block font-mono text-zinc-900">02 · acompanhe</strong>Painel ao vivo com latência, uptime e incidentes em andamento.</p>
            <p><strong className="block font-mono text-zinc-900">03 · publique</strong>Página de status para clientes com histórico real.</p>
          </div>
        </section>

        <section className="border-t border-zinc-200">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-950">Next.js 16 · SSE · PostgreSQL · Prisma 7</h2>
              <p className="mt-1 text-zinc-600">Código aberto, com lock otimista contra checagens duplicadas e agregação diária em SQL.</p>
            </div>
            <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-zinc-300 px-5 py-3 font-mono text-sm text-zinc-800 hover:border-zinc-500">
              <Github className="size-4" /> ver código
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 font-mono text-xs text-zinc-500 sm:px-6">
          <Logo compact />
          <span>
            feito por{' '}
            <a href={siteConfig.author.url} className="text-zinc-800 hover:underline">
              {siteConfig.author.name}
            </a>{' '}
            · MIT
          </span>
        </div>
      </footer>
    </div>
  )
}
