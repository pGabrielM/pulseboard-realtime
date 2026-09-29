import { ArrowRight, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Github } from '@/components/marketing/github-icon'
import { SiteFooter } from '@/components/marketing/site-footer'
import { SiteHeader } from '@/components/marketing/site-header'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'

export type LandingContent = {
  eyebrow: string
  title: string
  subtitle: string
  screenshot: { src: string; alt: string }
  proof: string[]
  features: { icon: LucideIcon; title: string; description: string }[]
  steps: { title: string; description: string }[]
  stack: { name: string; detail: string }[]
}

export function Landing({ content }: { content: LandingContent }) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-[radial-gradient(ellipse_at_top,var(--color-brand-100),transparent_65%)]" />
          <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
            <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {content.eyebrow}
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-zinc-900 sm:text-5xl lg:text-6xl">
              {content.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-balance text-zinc-600">{content.subtitle}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">
                  Testar com a conta demo <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
                  <Github className="size-4" /> Ver código-fonte
                </a>
              </Button>
            </div>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
              {content.proof.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="size-4 text-brand-600" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-2 shadow-2xl shadow-brand-900/10">
              <Image
                src={content.screenshot.src}
                alt={content.screenshot.alt}
                width={1600}
                height={1000}
                priority
                className="rounded-xl border border-zinc-200"
              />
            </div>
          </div>
        </section>

        <section id="recursos" className="border-t border-zinc-100 bg-zinc-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight">Tudo o que você precisa, nada que atrapalhe</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {content.features.map((feature) => (
                <div key={feature.title} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight">Como funciona</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {content.steps.map((step, index) => (
                <li key={step.title}>
                  <span className="flex size-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="stack" className="border-t border-zinc-100 bg-zinc-950 py-20 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">Por dentro</h2>
                <p className="mt-3 text-zinc-400">
                  Código aberto, tipado de ponta a ponta e pronto para rodar com um comando. Leia o README para a
                  arquitetura completa.
                </p>
                <Button asChild variant="secondary" className="mt-6">
                  <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
                    <Github className="size-4" /> Abrir no GitHub
                  </a>
                </Button>
              </div>
              <dl className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
                {content.stack.map((item) => (
                  <div key={item.name} className="bg-zinc-950 p-5">
                    <dt className="font-medium">{item.name}</dt>
                    <dd className="mt-1 text-sm text-zinc-400">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight">Veja funcionando em 10 segundos</h2>
            <p className="mt-3 text-zinc-600">A conta demo já vem com dados de exemplo. Nenhum cadastro necessário.</p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/login">
                Abrir a demo <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
