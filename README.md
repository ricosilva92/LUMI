# LUMI — Sistema de Aprendizagem  
_Projeto Escola do Futuro – Leiria_

> **Autor:** Ricardo Silva  
> **Estado:** **Exemplo visual / protótipo** (front-end estático). **Não é o produto final.**  
> **Aviso:** Este repositório demonstra apenas a **visão** e a **interface**. Para uso real é necessária uma **equipa profissional** (backend, segurança, RGPD, QA, DevOps, integrações) para transformar esta ideia em produto.

---

## 🎯 Objetivo

Mostrar, de forma simples e navegável, como poderá funcionar o **LUMI** para **Alunos**, **Professores**, **Encarregados de Educação** e **Direção**:  
- Navegação com sidebar e tabs;  
- Tema **claro/escuro** com ícone (☀️/🌙) e persistência;  
- **Mensagens** com respostas rápidas;  
- **Exercícios** com feedback imediato (múltipla escolha + dicas/solução);  
- **Relatórios** (Gerar / Copiar / CSV / Imprimir).  

Serve para **comunicar a ideia** e facilitar o **handoff** a uma equipa técnica.

---

## ✨ Páginas incluídas (demo)

- `index.html` — Landing  
- `login.html` — Login (exemplo)  
- `dashboard-aluno.html`  
- `dashboard-professor.html`  
- `dashboard-encarregado.html`  
- `dashboard-diretor.html`  
- `portugues.html` — Exercícios (7.º ano, multiple choice + dicas)  
- `sustentabilidade.html` — Projeto exemplo  
- `redacao-futuro-da-escola.html` — Portefólio (redação)

Estrutura:

.
├── index.html
├── login.html
├── dashboard-aluno.html
├── dashboard-professor.html
├── dashboard-encarregado.html
├── dashboard-diretor.html
├── portugues.html
├── sustentabilidade.html
├── redacao-futuro-da-escola.html
└── assets/
├── css/
│ └── style.css
├── js/
│ └── app.js
└── img/
└── horizontal.png

yaml
Copiar
Editar

> **Dados são fictícios** (dummy). Persistência mínima e local (ex.: tema em `localStorage`).

---

## 🚀 Como correr localmente

**Opção A — Abrir diretamente**  
1. Fazer clone do repositório.  
2. Abrir qualquer `.html` no browser.  
   > Nota: alguns browsers limitam `file://`. Se necessário, usa um servidor estático.

**Opção B — Servidor estático**

```bash
# Node (uma destas)
npx serve .
# ou
npx http-server .

# Python
python3 -m http.server 5500
# abrir http://localhost:5500
🧩 Tech (demo)
Vanilla HTML/CSS/JS (sem build).

Tema claro/escuro com variáveis CSS e localStorage (lumi_theme).

Exportar CSV via Blob + URL.createObjectURL.

Imprimir via window.print() (CSS de impressão oculta UI supérflua).

A11y básica: aria-*, labels, uso de Enter em inputs/botões.

Paleta (brand): #5E8B6F
Variáveis principais: --bg, --text, --muted, --card, --line, --sidebar-bg, --brand, --brand-strong.

📌 O que não está neste protótipo
Backend, base de dados e autenticação real.

Hashing de passwords, RBAC, auditoria, hardening.

Conformidade RGPD (consentimentos, retenção, portabilidade, DPA, etc.).

Integrações (SIGE/INOVAR, e-mail/SMS, ficheiros).

Testes, CI/CD, observabilidade, backups.

Para passar a produto, é obrigatório desenvolvimento por empresa/equipa profissional com arquitetura, segurança e conformidade.

🗺️ Roteiro sugerido (para equipa técnica)
Backend/API (REST/GraphQL) + DB (PostgreSQL).

Autenticação (SSO/OAuth/JWT), RBAC (aluno/prof/encarregado/direção).

RGPD: consentimentos, encriptação at-rest/in-transit, logs e auditoria.

Exercícios: banco de itens, correção automática, analytics.

Relatórios: geração PDF/A4 com templates server-side.

Integrações (SIGE/INOVAR), e-mail/SMS, armazenamento de conteúdos.

Qualidade/Operações: testes, CI/CD, monitorização, backups.

🤝 Contribuições
Este repositório é um exemplo visual mantido por Ricardo Silva.
De momento, não aceita PRs de novas features.
Sugestões/bugs da demo: abrir Issues com descrição clara (contexto, passos, resultado esperado, screenshot/GIF).

📄 Licença
Código disponibilizado sob MIT para efeitos de visualização e reutilização do front-end de demo.
© 2025 Ricardo Silva
