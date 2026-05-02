# 🤖 Automação Inteligente com Agente de IA (Mael)

Automação desenvolvida no n8n para atendimento financeiro via WhatsApp, utilizando um agente de IA com memória, processamento multimodal e integração direta com banco de dados.

---

## 🧠 Visão Geral

Esta automação é responsável por toda a lógica de backend do sistema, permitindo que usuários interajam com um agente financeiro inteligente via WhatsApp.

O fluxo é capaz de:

- Receber mensagens (texto, áudio e imagem)
- Processar e normalizar diferentes tipos de entrada
- Agrupar mensagens para melhor contexto
- Utilizar um agente de IA com memória e ferramentas
- Executar ações reais no banco de dados
- Responder ao usuário em texto ou áudio

---

## ⚙️ Tecnologias Utilizadas

- n8n (orquestração de workflows)
- Supabase (PostgreSQL)
- Redis (buffer e controle de mensagens)
- Google Gemini (LLM)
- ElevenLabs (Text-to-Speech)
- API de WhatsApp

---

## 🔄 Fluxo Geral da Automação

![alt text](automacao_agente_ia/WhatsApp Image 2026-04-30 at 17.02.33.jpeg)

A automação segue as seguintes etapas:

1. Recebimento da mensagem via webhook  
2. Validação do usuário no banco de dados  
3. Processamento do tipo de mensagem (texto, áudio ou imagem)  
4. Normalização da mensagem para texto  
5. Agrupamento de mensagens (buffer)  
6. Processamento pelo agente de IA  
7. Geração da resposta  
8. Tratamento e envio da resposta  

---

## 📥 Entrada e Validação de Usuário

![Entrada](image2.png)

- A mensagem chega via webhook (WhatsApp)
- O sistema consulta o Supabase para verificar se o número está cadastrado
- Caso não esteja cadastrado, a mensagem é ignorada
- Caso esteja, o fluxo continua

Isso garante controle de acesso e segurança do sistema.

---

## 🎭 Processamento Multimodal

![Multimodal](image3.png)

A automação suporta múltiplos tipos de entrada:

### ✍️ Texto
- Processado diretamente

### 🎤 Áudio
- Convertido de base64 para arquivo
- Transcrito para texto (speech-to-text)

### 🖼️ Imagem
- Convertida para arquivo
- Enviada para análise via LLM (Gemini)
- Transformada em descrição textual

---

## 🔄 Normalização de Entrada

Após o processamento:

👉 Todas as mensagens são convertidas para **texto**

Isso permite que o agente de IA trabalhe com um único formato de entrada, independentemente do tipo original.

---

## ⏳ Buffer Inteligente com Redis

![Buffer](image4.png)

A automação utiliza Redis para agrupar mensagens do usuário.

### Funcionamento:

1. Mensagens são armazenadas temporariamente  
2. O sistema aguarda um curto período  
3. Recupera todas as mensagens enviadas  
4. Junta em uma única entrada  
5. Limpa o buffer  

### Benefício:

Evita múltiplas respostas para mensagens separadas e melhora o contexto da IA.

---

## 🤖 Agente de IA (Mael)

![Agente](image5.png)

O sistema utiliza um agente de IA com as seguintes características:

### 🧠 Modelo
- Google Gemini

### 🧩 Memória
- Postgres Chat Memory (contexto por usuário)

### 🛠️ Tools (integração com banco)

O agente pode executar ações reais:

#### ✍️ Escrita:
- Criar entradas (receitas)
- Criar saídas (despesas)
- Criar categorias
- Criar metas

#### ❌ Remoção:
- Deletar entradas
- Deletar saídas
- Deletar categorias
- Deletar metas

#### 📊 Consulta:
- Consultar entradas
- Consultar saídas
- Consultar categorias
- Consultar metas

---

## 🧠 Comportamento do Agente

- Interpreta linguagem natural
- Solicita dados faltantes
- Confirma antes de executar ações
- Responde de forma humanizada
- Mantém contexto da conversa

---

## 🔐 Engenharia de Prompt

O agente foi configurado com:

- Papel definido (assistente financeiro)
- Regras de confirmação
- Controle de output
- Diretrizes de segurança

Isso garante respostas consistentes e seguras.

---

## 📤 Processamento e Envio de Respostas

![Saída](image6.png)

Após a resposta do agente:

### ✂️ Quebra de mensagens
- Mensagens longas são divididas em partes menores

### 🔀 Escolha do formato
- Texto ou áudio

### 🎤 Áudio (ElevenLabs)
- Conversão de texto em fala (TTS)
- Envio como áudio via WhatsApp

### 💬 Texto
- Envio direto ao usuário

### 🔁 Loop de envio
- Mensagens são enviadas sequencialmente

---

## 💡 Diferenciais Técnicos

- Processamento multimodal (texto, áudio, imagem)
- Buffer inteligente com Redis
- AI Agent com tools (execução real de ações)
- Memória persistente por usuário
- Integração com banco de dados real
- Conversão de texto para fala (TTS)
- Orquestração completa de fluxo no n8n

---

## 🔗 Integração com o Sistema

Esta automação está integrada com:

- Dashboard financeiro (visualização de dados)
- Banco de dados (Supabase)
- Sistema de autenticação (via número do usuário)

---

## 🚀 Resultado

O sistema permite que o usuário:

- Controle suas finanças via WhatsApp  
- Interaja com um agente inteligente  
- Registre e consulte dados automaticamente  
- Receba respostas contextualizadas e naturais  

---

## 📌 Observação

O número de telefone do usuário é utilizado como identificador único, garantindo que cada interação esteja vinculada corretamente aos dados no banco.
