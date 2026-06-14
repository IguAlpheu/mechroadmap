import { useEffect } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Política de Privacidade — Lumeo";
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
          <span className="text-sm font-semibold text-foreground/80">Política de Privacidade</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Política de Privacidade</h1>
          <p className="text-sm text-foreground/40">
            Em vigor desde: <strong>06 de junho de 2025</strong> · Última atualização: 14 de junho de 2025
          </p>
        </div>

        <Section title="1. Quem Somos">
          <p>
            O <strong>Lumeo</strong> é uma plataforma web de aprendizado pessoal desenvolvida e operada de forma
            independente. Esta Política descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais,
            em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</strong>.
          </p>
          <p>
            Para dúvidas ou solicitações sobre seus dados, entre em contato com nosso Encarregado de Dados (DPO):{" "}
            <a href="mailto:igoralfeu9@gmail.com" className="text-primary hover:underline">
            </a>
          </p>
        </Section>

        <Section title="2. Dados que Coletamos">
          <p>A tabela abaixo descreve todos os dados pessoais tratados pelo Lumeo:</p>
          <div className="overflow-x-auto rounded-xl border border-white/[0.08] mt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                  <Th>Dado</Th>
                  <Th>Onde armazenado</Th>
                  <Th>Enviado a terceiros</Th>
                  <Th>Base legal (LGPD)</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                <Tr cells={["E-mail", "Supabase Auth", "Não", "Execução de contrato (Art. 7, V)"]} />
                <Tr cells={["Senha (hash bcrypt)", "Supabase Auth", "Não", "Execução de contrato (Art. 7, V)"]} />
                <Tr cells={["Nome da habilidade (ex: 'Guitarra')", "Supabase + Groq API (temporário)", "Groq, Inc. — EUA", "Consentimento (Art. 7, I)"]} />
                <Tr cells={["Passos concluídos, streak, notas", "Supabase", "Não", "Execução de contrato (Art. 7, V)"]} />
                <Tr cells={["Horas de estudo / heatmap", "localStorage do navegador", "Não", "Legítimo interesse (Art. 7, IX)"]} />
                <Tr cells={["Último acesso por habilidade", "Supabase", "Não", "Legítimo interesse (Art. 7, IX)"]} />
                <Tr cells={["Eventos de uso anônimos (analytics)", "Supabase / localStorage", "Não", "Legítimo interesse (Art. 7, IX)"]} />
                <Tr cells={["Roadmaps compartilhados publicamente", "Supabase", "Comunidade Lumeo", "Consentimento (Art. 7, I)"]} />
                <Tr cells={["Preferência de notificações push", "localStorage do navegador", "Não", "Consentimento (Art. 7, I)"]} />
                <Tr cells={["Mensagens de suporte/feedback", "Supabase / localStorage", "Não", "Legítimo interesse (Art. 7, IX)"]} />
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-foreground/40">
            O Lumeo <strong>não</strong> coleta dados de navegação, cookies de rastreamento, endereço IP ou qualquer
            informação que não esteja listada acima.
          </p>
        </Section>

        <Section title="3. Finalidade do Tratamento">
          <ul>
            <li><strong>E-mail e senha:</strong> autenticação e identificação do usuário na plataforma.</li>
            <li><strong>Nome da habilidade:</strong> geração do roadmap de estudos personalizado via modelo de IA.</li>
            <li><strong>Progresso e notas:</strong> exibição de métricas de consistência e continuidade do aprendizado.</li>
            <li><strong>Horas de estudo:</strong> renderização do mapa de calor de atividade e projeção de metas.</li>
          </ul>
        </Section>

        <Section title="4. Transferência Internacional de Dados (Art. 33, LGPD)">
          <p>
            Ao criar uma habilidade no Lumeo, o <strong>nome da habilidade</strong> (e somente ele) é enviado para os
            servidores da <strong>Groq, Inc.</strong>, empresa sediada nos <strong>Estados Unidos da América</strong>,
            para processamento pelo modelo de linguagem LLaMA 3.3. Esta transferência é necessária para a prestação
            do serviço e ocorre com base no consentimento explícito do usuário (Art. 7, I c/c Art. 33, II).
          </p>
          <p>
            A infraestrutura de autenticação e banco de dados é gerenciada pela{" "}
            <strong>Supabase, Inc.</strong> (EUA), que adota medidas de segurança compatíveis com padrões
            internacionais (ISO 27001, SOC 2 Type 2).
          </p>
          <p>
            Nenhum dado pessoal identificável (como e-mail ou nome) é incluído nas requisições enviadas à Groq.
          </p>
        </Section>

        <Section title="5. Retenção e Exclusão de Dados">
          <p>
            Os dados são mantidos enquanto a conta do usuário estiver ativa. Ao excluir sua conta, todos os dados
            pessoais associados (skills, progresso, histórico) são removidos dos servidores do Supabase em até{" "}
            <strong>30 dias</strong>. Dados no <code>localStorage</code> do navegador são removidos imediatamente
            no mesmo dispositivo.
          </p>
          <p>
            Registros de autenticação podem ser mantidos por até 90 dias para fins de segurança e conformidade,
            conforme política da Supabase.
          </p>
        </Section>

        <Section title="6. Segurança">
          <p>
            Adotamos as seguintes medidas técnicas para proteger seus dados:
          </p>
          <ul>
            <li>Comunicação criptografada via HTTPS/TLS em todos os endpoints;</li>
            <li>Chaves de API de serviços externos armazenadas exclusivamente em variáveis de ambiente do servidor (nunca no código cliente);</li>
            <li>Senhas armazenadas com hash bcrypt pelo Supabase Auth — nunca em texto puro;</li>
            <li>Acesso ao banco de dados restrito por Row Level Security (RLS) do Supabase — cada usuário acessa apenas seus próprios dados.</li>
          </ul>
        </Section>

        <Section title="7. Seus Direitos como Titular (Art. 17–22, LGPD)">
          <p>Você tem direito a:</p>
          <ul>
            <li><strong>Acesso:</strong> solicitar uma cópia de todos os seus dados;</li>
            <li><strong>Correção:</strong> atualizar dados incorretos ou desatualizados;</li>
            <li><strong>Exclusão:</strong> solicitar a remoção de seus dados pessoais;</li>
            <li><strong>Portabilidade:</strong> exportar seus dados em formato legível por máquina (JSON);</li>
            <li><strong>Revogação de consentimento:</strong> retirar o consentimento a qualquer momento.</li>
          </ul>
          <p>
            Para exercer esses direitos, acesse <strong>Minha Conta</strong> na plataforma (opções de exportar e
            excluir dados disponíveis diretamente) ou envie um e-mail para{" "}
            <a href="mailto:contato@lumeo.app" className="text-primary hover:underline">
              contato@lumeo.app
            </a>
            . Responderemos em até <strong>15 dias úteis</strong>.
          </p>
        </Section>

        <Section title="8. Analytics, Feed Público e Notificações">
          <p>
            <strong>Analytics de uso:</strong> Coletamos eventos anônimos (ex: criação e exclusão
            de roadmaps, importações, envio de feedback) vinculados ao identificador interno do
            usuário — nunca ao e-mail. Esses dados são usados exclusivamente para melhorar o produto
            e nunca compartilhados com anunciantes. A base legal é o legítimo interesse (Art. 7, IX).
          </p>
          <p>
            <strong>Feed Público:</strong> Ao publicar um roadmap no feed comunitário, o conteúdo
            do roadmap (título, passos e descrição) fica visível para todos os usuários da plataforma.
            Nenhum dado pessoal identificável é exibido no feed. A base legal é o consentimento
            explícito do usuário (Art. 7, I). O roadmap pode ser despublicado a qualquer momento
            entrando em contato com o DPO.
          </p>
          <p>
            <strong>Notificações Push:</strong> Se você ativar os lembretes diários, armazenaremos
            sua preferência no <code>localStorage</code> do seu navegador e enviaremos notificações
            via a API de Notificações do navegador. Você pode revogar a permissão a qualquer momento
            nas configurações do seu navegador. Não utilizamos serviços de push de terceiros.
          </p>
        </Section>

        <Section title="9. Cookies e Armazenamento Local">
          <p>
            O Lumeo utiliza o <code>localStorage</code> do navegador para armazenar dados de sessão e histórico
            de estudo localmente. Não utilizamos cookies de rastreamento, publicidade ou analytics de terceiros.
          </p>
        </Section>

        <Section title="10. Alterações nesta Política">
          <p>
            Podemos atualizar esta Política periodicamente. Notificaremos usuários sobre mudanças substanciais
            por e-mail ou aviso na plataforma. O uso continuado após as alterações implica aceitação da nova versão.
          </p>
        </Section>

        <Section title="11. Contato e Encarregado de Dados (DPO)">
          <p>
            Para exercer seus direitos ou reportar qualquer incidente de segurança relacionado aos seus dados:
          </p>
          <p>
            E-mail:{" "}
            <a href="mailto:contato@lumeo.app" className="text-primary hover:underline">
              contato@lumeo.app
            </a>
          </p>
          <p>
            Você também pode registrar reclamações junto à{" "}
            <a
              href="https://www.gov.br/anpd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Autoridade Nacional de Proteção de Dados (ANPD)
            </a>
            .
          </p>
        </Section>
      </main>

      <Footer />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2.5 text-left font-semibold text-foreground/50 whitespace-nowrap">{children}</th>
  );
}

function Tr({ cells }: { cells: string[] }) {
  return (
    <tr>
      {cells.map((c, i) => (
        <td key={i} className="px-3 py-2.5 text-foreground/55 align-top">{c}</td>
      ))}
    </tr>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground/90 border-b border-white/[0.06] pb-2">{title}</h2>
      <div className="space-y-3 text-sm text-foreground/60 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-foreground/80 [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs">
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
