# Morro de São Paulo Digital

Este é o projeto do site **Morro de São Paulo Digital**, um aplicativo web que oferece navegação, tutoriais, rotas e integração com diversos serviços para uma experiência digital completa de turismo.

## Estrutura do Projeto

A estrutura do projeto segue o esquema modular abaixo:

morro-digital/ ├── index.html ├── manifest.json ├── css/ │ ├── modals.css │ ├── botoes.css │ ├── gamificação&marketing.css │ ├── navegacao.css │ ├── rotas.css │ ├── menus.css │ ├── tutorial&assistant.css │ ├── styles.css │ ├── voiceInteraction.css ├── img/ │ └── (imagens e ícones do projeto, incluindo icon-192.png, icon-512.png, etc.) ├── js/ │ ├── config.js │ ├── globals.js │ ├── events.js │ ├── permissions.js │ ├── cache.js │ ├── stateManagement.js │ ├── mapInitialization.js │ ├── mapVisualizations.js │ ├── osmInteraction.js │ ├── locationTracking.js │ ├── routeCreation.js │ ├── navigation.js │ ├── tutorial.js │ ├── uiController.js │ ├── menuController.js │ ├── submenuController.js │ ├── translationController.js │ ├── voiceInteractionController.js │ ├── gamificationMarketing.js │ ├── notifications.js │ ├── utils.js │ └── service-worker.js └── README.md

## Funcionalidades

- **Offline First:**  
  O site utiliza um Service Worker para armazenar em cache todos os recursos (HTML, CSS, JavaScript, imagens e fontes) e funcionar completamente offline.

- **Navegação e Rotas:**  
  Integração com mapas (Leaflet), roteamento e cálculo de rotas.

- **Tutoriais e Assistente Virtual:**  
  Sistema interativo de tutoriais e assistente virtual para guiar o usuário.

- **Multimídia e UI Dinâmica:**  
  Carrossel de imagens, menus interativos, notificações e suporte para várias linguagens.

## Como Executar Localmente

1. **Clone o repositório:**

   ```bash
   git clone <URL-do-repositório>
   cd morro-digital

2. Verifique se todas as dependências estão na pasta local:

Certifique-se de que as bibliotecas externas (Leaflet, Swiper, Font Awesome, etc.) foram baixadas e referenciadas localmente.
Caso contrário, atualize as referências no arquivo index.html para os caminhos locais.

3. Executando um Servidor Local (opcional):

Para testar os recursos offline (como o Service Worker), é recomendado rodar um servidor HTTP. Por exemplo, com o http-server:

bash
Copiar
npm install -g http-server
http-server -c-1
Acesse http://localhost:8080 no navegador.

Service Worker
O arquivo js/service-worker.js implementa a lógica para cachear todos os recursos essenciais. O Service Worker é registrado pelo script principal do site e garante que, mesmo sem conexão, o site funcione corretamente.

Atualizações e Manutenção
Modularização:
O código JavaScript está organizado em módulos para facilitar manutenção e escalabilidade.

Feedback e Contribuições:
Para sugestões ou contribuições, por favor abra uma issue ou envie um pull request.

Licença
Este projeto está licenciado sob [INSERIR A LICENÇA AQUI] .
