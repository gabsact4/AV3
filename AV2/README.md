# README - Sistema de Gestão da Produção de Aeronaves (Aerocode)

##  Introdução

Este projeto consiste na modernização do **Sistema de Gestão da Produção de Aeronaves da Aerocode**, migrando de uma aplicação em linha de comando (CLI) para uma **Single Page Application (SPA)** desenvolvida em React. O objetivo principal é oferecer uma interface gráfica intuitiva, segura e escalável para grandes fabricantes do setor aeroespacial.

##  Objetivos do Projeto

- **Modernizar a interface** do sistema (migração CLI → GUI)
- **Reduzir a curva de aprendizado** para novos usuários
- **Gerenciar eficientemente** funcionários, aeronaves, peças, etapas e testes
- **Implementar controles de permissão** por perfil de usuário
- **Preparar o produto** para adoção por grandes fabricantes aeronáuticas

##  Público-Alvo

**Grandes fabricantes de aeronaves e empresas do setor aeroespacial:**
- Embraer, Boeing, Airbus, Bombardier, Lockheed Martin
- Empresas que gerenciam múltiplos projetos, equipes grandes e processos complexos

### Perfis de Usuário

| Perfil | Permissões | Responsabilidades |
|--------|------------|-------------------|
| **Administrador** | Acesso total | Gerir contas e permissões |
| **Engenheiro** | Acesso moderado | Gerir aeronaves, peças, etapas e testes |
| **Operador** | Permissões restritas | Atualizar status de peças e etapas |

##  Requisitos

### Funcionais
1. **Sistema de Login** com verificação de credenciais e sessão
2. **CRUD de Funcionários** (exclusivo para Administradores)
3. **CRUD de Aeronaves, Peças, Etapas e Testes**
4. **Alteração de Status** de peças e etapas

### Não Funcionais
- **SPA em React** com protótipo navegável
- **Segurança robusta**: controle de sessão, segregação de perfil e proteção de dados
- **Compatibilidade**: Windows 10+ e Ubuntu 24.04+

##  Arquitetura da Informação

### Hierarquia de Navegação
1. **Identificação do sistema/usuário** - Topo da aplicação
2. **Área de Conteúdo** - Listas, detalhes e formulários
3. **Controles primários** - Ações principais próximas ao conteúdo
4. **Filtros e Pesquisa** - Acima das listagens
5. **Contexto** - Breadcrumbs indicando posição atual
6. **Informações secundárias** - Rodapé

##  Fluxo de Navegação

### User Flow Principal
```
Login → Validação → Home → 
    ├── Seção Aeronaves → Lista → Detalhes → Peças/Etapas/Testes → Ações
    ├── Seção Funcionários → Lista → Detalhes (Admin apenas)
    └── Logout
```

### Visualização do Fluxo
 **User Flow Diagram:** [Ver no Canva](https://www.canva.com/design/DAG2pGBtZHw/C6JN2LRUyHjubYbMMJNvgA/view?utm_content=DAG2pGBtZHw&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hf00a40d5b6)

##  Interface e Wireframes

### Telas Principais

1. **Tela de Login**
   - Autenticação por credenciais
   - Validação de perfil de acesso

2. **Dashboard Inicial**
   - Visão geral de aeronaves
   - Métricas: peças faltando, prontas, status
   - Navegação por cards de aeronaves

3. **Gestão de Funcionários**
   - Tabela com lista completa
   - Filtros e busca
   - Ações: Editar, Excluir (Admin)

4. **Cadastro de Aeronaves**
   - Formulário com campos essenciais
   - Validação de dados

5. **Detalhes de Aeronave**
   - Informações da aeronave
   - Gestão de peças e testes
   - Controle de etapas de produção

6. **Gestão de Peças**
   - Inventário completo
   - Status de instalação
   - Busca e filtros avançados

7. **Painel de Testes**
   - Controle de testes mecânicos, elétricos e finais
   - Progresso em porcentagem
   - Inicialização de testes

### Visualização dos Wireframes
 **Wireframes Completos:** [Ver no Canva](https://www.canva.com/design/DAG2mgIeYxc/1yYApq5YjLTzrxlpYf097Q/view?utm_content=DAG2mgIeYxc&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h0b455576e5)

##  Funcionalidades por Perfil

### Administrador
- ✅ Gestão completa de usuários
- ✅ Acesso a todos os módulos
- ✅ Controle de permissões

### Engenheiro
- ✅ Gestão de aeronaves, peças e etapas
- ✅ Configuração de testes
- ❌ Gestão de usuários

### Operador
- ✅ Atualização de status
- ✅ Visualização de informações
- ❌ Gestão de usuários e configurações

##  Características Técnicas

- **Tecnologia**: React SPA
- **Segurança**: Autenticação baseada em perfis
- **Responsividade**: Design adaptável
- **Navegação**: Fluxo intuitivo e contextual
- **Dados**: Gestão em tempo real com feedback visual

##  Status do Projeto

✅ **Documentação** - Concluída  
✅ **Wireframes** - Concluídos  
🔄 **Desenvolvimento** - Em andamento  
⏳ **Testes** - Planejados  

##  Conclusão

Este projeto estabelece as bases para transformar o sistema CLI em uma aplicação web moderna, focando em usabilidade, segurança e escalabilidade. A abordagem centrada no usuário e na hierarquia de informações garantirá que o produto atenda tanto às necessidades operacionais quanto às demandas de gestão das equipes do setor aeroespacial.

---

**Aerocode** - Modernizando a gestão da produção aeronáutica através da tecnologia.