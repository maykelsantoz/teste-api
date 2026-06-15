# 🚀 Teste API

Projeto de estudos desenvolvido para praticar:

* Consumo de APIs REST
* JavaScript Assíncrono (`async/await`)
* Promises
* Fetch API
* Manipulação de Arrays e Objetos
* Desestruturação de Objetos e Arrays
* Navegação em estruturas JSON complexas

## 📋 Sobre o projeto

Este projeto realiza consultas à API DONKI (Database Of Notifications, Knowledge, Information) da NASA para obtenção de informações relacionadas a eventos solares, como Coronal Mass Ejections (CME).

A aplicação busca dados da API, processa o retorno JSON e extrai informações específicas como:

* Activity ID
* Instrumentos utilizados
* Análises CME
* Notificações enviadas
* Links relacionados aos eventos
* Informações do modelo ENLIL

## 🛠 Tecnologias utilizadas

* JavaScript
* Fetch API
* Node.js

## 📦 Instalação

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/teste-api.git
```

Entre na pasta:

```bash
cd teste-api
```

## ▶️ Executando o projeto

Caso utilize Node.js:

```bash
node index.js
```

## 🔑 Configuração da API

Defina sua chave da API da NASA:

```javascript
const API_KEY = 'SUA_CHAVE_AQUI';
```

A API de teste utilizada foi a da NASA, a chave pode ser obtida gratuitamente em:

https://api.nasa.gov

## 📚 Conceitos praticados

* Consumo de APIs REST
* Manipulação de JSON
* Arrays e Objetos
* Desestruturação
* Métodos de Arrays (`map`, `find`, `filter`)
* Expressões Regulares (Regex)
* Tratamento de respostas assíncronas

## 📄 Exemplo de retorno

```json
{
  "activityID": "2017-01-03T03:12:00-CME-001",
  "catalog": "M2M_CATALOG"
}
```

## 🎯 Objetivo

O objetivo deste projeto é servir como ambiente de estudo para desenvolvimento JavaScript, compreensão de APIs externas e manipulação de dados retornados em formato JSON.

## 📝 Licença

Projeto desenvolvido para fins educacionais e de aprendizado.
