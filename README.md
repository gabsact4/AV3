# AV3



#   Guia Completo para Rodar o Projeto

Este documento explica **passo a passo** como executar o projeto principal e também a subpasta **AV2**, incluindo a instalação das dependências e a inicialização do servidor de desenvolvimento.


##  Pré-requisitos


* **Node.js**
* **NPM** 
* **Prisma**
* **MySql**



#  Iniciando o Projeto Principal


##  Instalar as dependências do projeto principal

Use o comando:

npm install


Esse comando vai baixar todas as bibliotecas que o projeto precisa para funcionar.



##  Rodar o servidor de desenvolvimento do projeto principal

Após as dependências serem instaladas, execute:


npm run dev

O servidor de desenvolvimento será iniciado e o projeto ficará disponível no navegador, geralmente em:

http://localhost:3001


#  Executando o Projeto Dentro da Pasta AV2

Este projeto possui outra parte localizada dentro de uma subpasta chamada **AV2**.
Para rodá-la, siga os passos abaixo.


## Acessar a pasta AV2

No terminal, você deve entrar na pasta **AV2** usando `cd` duas vezes:

cd AV2
cd AV2

> Você também pode usar:
>

> cd AV2/AV2

Agora você estará dentro da pasta correta onde existe outro projeto independente.

## Instalar as dependências da pasta AV2

Assim como na pasta principal, instale as dependências:

npm install

## Rodar o servidor de desenvolvimento da pasta AV2

Por fim, execute:

npm run dev


O servidor será iniciado novamente, e você poderá acessar o sistema especificamente dessa subpasta.
