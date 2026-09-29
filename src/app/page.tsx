import { Bell, Gauge, Globe, Radio, Search, ShieldCheck } from 'lucide-react'
import { Landing, type LandingContent } from '@/components/marketing/landing'

const content: LandingContent = {
  eyebrow: 'Monitoramento de uptime',
  title: 'Saiba que o site caiu antes do seu cliente',
  subtitle:
    'Monitore sites e APIs a cada minuto, veja latência e disponibilidade ao vivo, registre incidentes automaticamente e ofereça uma página de status pública com 90 dias de histórico.',
  screenshot: { src: '/screenshots/dashboard.png', alt: 'Painel de monitores do PulseBoard' },
  proof: ['Painel ao vivo (SSE)', 'Incidentes automáticos', 'Página de status pública'],
  features: [
    { icon: Radio, title: 'Tempo real de verdade', description: 'O painel recebe atualizações por Server-Sent Events — status, latência e incidentes mudam sem recarregar.' },
    { icon: Search, title: 'Checagens completas', description: 'Status HTTP esperado, palavra-chave no HTML, timeout configurável e detecção de SSL inválido e DNS.' },
    { icon: Bell, title: 'Sem alarme falso', description: 'Um incidente só abre após duas falhas seguidas e fecha sozinho na primeira resposta saudável.' },
    { icon: Gauge, title: 'Latência e uptime', description: 'Gráfico de 24 horas, uptime de 24h, 7 e 30 dias e tempo médio de recuperação (MTTR).' },
    { icon: Globe, title: 'Página de status', description: 'Um link público com barras diárias de 90 dias e histórico de incidentes para os seus clientes.' },
    { icon: ShieldCheck, title: 'Seguro por padrão', description: 'URLs que resolvem para redes privadas são bloqueadas — o monitor não pode ser usado para varrer sua infraestrutura.' },
  ],
  steps: [
    { title: 'Cadastre a URL', description: 'Escolha intervalo, método, status esperado e, se quiser, uma palavra que precisa estar na página.' },
    { title: 'Acompanhe ao vivo', description: 'O painel mostra quem está online, a latência de cada checagem e os incidentes em andamento.' },
    { title: 'Seja transparente', description: 'Publique uma página de status e mostre a disponibilidade real dos seus serviços.' },
  ],
  stack: [
    { name: 'Next.js 16 + SSE', detail: 'Route Handler com ReadableStream enviando snapshots só quando algo muda.' },
    { name: 'Agendador sem servidor', detail: 'Endpoint de cron protegido chamado pelo GitHub Actions; o painel aberto também dispara checagens.' },
    { name: 'Lock otimista', detail: 'Cada checagem é “reservada” com um UPDATE condicional — cron e painel nunca checam o mesmo monitor em dobro.' },
    { name: 'PostgreSQL', detail: 'Agregação diária com date_trunc e FILTER para a página de status de 90 dias.' },
    { name: 'Prisma 7', detail: 'Transações para registrar checagem, status e incidente de forma atômica.' },
    { name: 'Gráficos em SVG', detail: 'Sparklines e gráfico de latência desenhados à mão, sem biblioteca de charts.' },
  ],
}

export default function HomePage() {
  return <Landing content={content} />
}
