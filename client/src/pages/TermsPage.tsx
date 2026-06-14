import { useEffect } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Termos de Uso — Lumeo";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <span className="text-sm font-semibold text-foreground/80">Termos de Uso</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Termos de Uso</h1>
          <p className="text-sm text-foreground/40">
            Em vigor desde: <strong>06 de junho de 2025</strong> · Última atualização: 14 de junho de 2025
          </p>
        </div>

        <Section title="1. Objeto do Serviço">
          <p>
            O <strong>Lumeo</strong> é uma plataforma web de gerenciamento de aprendizado pessoal que permite ao usuário
            criar roadmaps de estudo personalizados com auxílio de inteligência artificial, acompanhar seu progresso por
            meio de métricas de consistência e utilizar recursos como temporizador Pomodoro e metas de habilidades.
          </p>
          <p>
            Ao acessar ou utilizar o Lumeo, você concorda com estes Termos de Uso e com nossa{" "}
            <a href="#/privacy" className="text-primary hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </Section>

        <Section title="2. Cadastro e Responsabilidades do Usuário">
          <p>
            Para utilizar os recursos completos do Lumeo, você deve criar uma conta fornecendo um endereço de e-mail
            válido e uma senha. Você é responsável por:
          </p>
          <ul>
            <li>Manter a confidencialidade de suas credenciais de acesso;</li>
            <li>Todas as atividades realizadas em sua conta;</li>
            <li>Fornecer informações verdadeiras e atualizadas no momento do cadastro;</li>
            <li>Notificar imediatamente o Lumeo caso suspeite de acesso não autorizado à sua conta.</li>
          </ul>
          <p>
            É vedado ao usuário utilizar o serviço para fins ilícitos, fraudulentos ou em desacordo com estes Termos.
          </p>
        </Section>

        <Section title="3. Conteúdo Gerado por Inteligência Artificial">
          <p>
            O Lumeo utiliza o modelo de linguagem <strong>LLaMA 3.3 (Groq)</strong> para gerar planos de estudo
            personalizados com base no nome da habilidade informada pelo usuário. O conteúdo gerado é fornecido
            exclusivamente para fins informativos e educacionais.
          </p>
          <p>
            <strong>O Lumeo não garante</strong> a precisão, completude ou adequação do conteúdo gerado por IA.
            Links e recursos sugeridos pela IA devem ser verificados pelo usuário antes de uso. O Lumeo não se
            responsabiliza por decisões tomadas com base no conteúdo gerado.
          </p>
          <p>
            Ao criar uma habilidade, o usuário consente expressamente que o termo informado (ex: "Guitarra",
            "Python") seja enviado a servidores de terceiros (Groq, Inc.) para processamento pelo modelo de
            linguagem. Nenhum dado pessoal identificável é incluído nessa requisição.
          </p>
        </Section>

        <Section title="4. Propriedade Intelectual">
          <p>
            O código-fonte, design, marca e demais elementos do Lumeo são propriedade do desenvolvedor e estão
            protegidos pelas leis de propriedade intelectual aplicáveis. Os roadmaps e conteúdos gerados pela IA
            pertencem ao usuário que os criou, dentro dos limites da licença de uso do modelo de linguagem utilizado.
          </p>
        </Section>

        <Section title="5. Limitação de Responsabilidade">
          <p>
            O Lumeo é fornecido <em>"como está"</em>, sem garantias de disponibilidade ininterrupta,
            ausência de erros ou adequação a finalidade específica. Em nenhuma hipótese o Lumeo será
            responsável por danos indiretos, incidentais ou consequenciais decorrentes do uso ou impossibilidade
            de uso do serviço.
          </p>
        </Section>

        <Section title="6. Cancelamento e Exclusão de Conta">
          <p>
            Você pode excluir sua conta a qualquer momento acessando <strong>Minha Conta → Excluir minha conta</strong>{" "}
            dentro da plataforma. A exclusão é permanente e irreversível: todos os seus dados (skills, progresso,
            histórico) serão removidos de nossos servidores em até 30 dias.
          </p>
          <p>
            O Lumeo se reserva o direito de suspender ou encerrar contas que violem estes Termos, sem aviso prévio.
          </p>
        </Section>

        <Section title="7. Analytics e Telemetria de Uso">
          <p>
            O Lumeo coleta <strong>dados de uso anônimos</strong> para medir a eficácia do produto
            e identificar pontos de desistência. Os eventos coletados incluem:
          </p>
          <ul>
            <li>Criação e exclusão de roadmaps;</li>
            <li>Publicação de roadmaps no feed público;</li>
            <li>Importação de roadmaps externos;</li>
            <li>Envio de mensagens de suporte;</li>
            <li>Exclusão de conta.</li>
          </ul>
          <p>
            Esses eventos são vinculados ao identificador interno do usuário (não ao e-mail) e
            armazenados de forma segura. Não são compartilhados com terceiros para fins publicitários.
            Você pode desativar o rastreamento a qualquer momento excluindo sua conta.
          </p>
        </Section>

        <Section title="8. Feed Público de Roadmaps">
          <p>
            O Lumeo oferece um <strong>Feed Público</strong> onde os usuários podem voluntariamente
            compartilhar roadmaps com a comunidade. Ao publicar um roadmap no feed, você:
          </p>
          <ul>
            <li>Concede ao Lumeo permissão de exibi-lo para todos os usuários da plataforma;</li>
            <li>
              Confirma que o conteúdo não viola direitos de terceiros nem contém informações
              pessoais de outras pessoas;
            </li>
            <li>
              Entende que outros usuários podem clonar e adaptar o roadmap para uso próprio.
            </li>
          </ul>
          <p>
            O Lumeo se reserva o direito de remover roadmaps públicos que violem estes Termos ou
            sejam reportados como inadequados.
          </p>
        </Section>

        <Section title="9. Notificações e Lembretes">
          <p>
            O Lumeo pode enviar <strong>notificações push</strong> (via API de Notificações do
            navegador / PWA) como lembretes para manter a consistência de estudos e o streak diário.
            Essas notificações:
          </p>
          <ul>
            <li>Só são enviadas mediante <strong>consentimento explícito</strong> do usuário;</li>
            <li>Podem ser desativadas a qualquer momento nas configurações do navegador;</li>
            <li>
              Não contêm conteúdo publicitário de terceiros — são exclusivamente lembretes
              educacionais personalizados.
            </li>
          </ul>
        </Section>

        <Section title="10. Alterações nos Termos">
          <p>
            O Lumeo pode atualizar estes Termos periodicamente. Alterações substanciais serão
            comunicadas por e-mail ou por aviso na plataforma. O uso continuado do serviço após
            as alterações constitui aceitação dos novos Termos.
          </p>
        </Section>

        <Section title="11. Lei Aplicável e Foro">
          <p>
            Estes Termos são regidos pela legislação brasileira, incluindo a Lei Geral de Proteção
            de Dados (Lei 13.709/2018). Fica eleito o foro da comarca de domicílio do usuário para
            resolução de quaisquer controvérsias, salvo disposição legal em contrário.
          </p>
        </Section>

        <Section title="12. Contato">
          <p>
            Dúvidas sobre estes Termos? Entre em contato pelo e-mail:{" "}
            <a href="mailto:contato@lumeo.app" className="text-primary hover:underline">
              contato@lumeo.app
            </a>
          </p>
        </Section>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground/90 border-b border-white/[0.06] pb-2">{title}</h2>
      <div className="space-y-3 text-sm text-foreground/60 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-foreground/80 [&_a]:text-primary [&_a:hover]:underline">
        {children}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-16 py-8">
      <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-foreground/30">
        <span>© 2025 Lumeo. Todos os direitos reservados.</span>
        <div className="flex gap-4">
          <a href="#/terms" className="hover:text-foreground/60 transition-colors">Termos de Uso</a>
          <a href="#/privacy" className="hover:text-foreground/60 transition-colors">Política de Privacidade</a>
        </div>
      </div>
    </footer>
  );
}
