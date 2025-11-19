# Classic Cipher Breaker

Projeto para quebra de cifras clássicas usando TypeScript.

## 🚀 Instalação

```bash
npm install
```

## 📦 Scripts Disponíveis

### Desenvolvimento

```bash
# Executar o arquivo principal (src/index.ts) com tsx
npm run dev

# Executar com watch mode (recarrega automaticamente ao salvar)
npm run dev:watch

# Executar qualquer arquivo .ts diretamente
npm run run src/1.ts
# ou
npm run run lib/llmScore.ts
```

### Produção

```bash
# Compilar o projeto TypeScript para JavaScript
npm run build

# Executar o projeto compilado
npm run start
```

## 🔧 Executar Arquivos TypeScript Diretamente

Para executar qualquer arquivo `.ts` diretamente no terminal:

### Usando o script npm:
```bash
npm run run <caminho-do-arquivo>
```

### Usando tsx diretamente:
```bash
npx tsx <caminho-do-arquivo>
```

### Exemplos:
```bash
# Executar o index.ts
npm run dev

# Executar um arquivo específico
npm run run src/1.ts

# Com tsx direto
npx tsx src/index.ts
npx tsx lib/llmScore.ts
```

## 📁 Estrutura do Projeto

```
classic-cipher-breaker/
├── src/           # Código fonte principal
├── lib/           # Bibliotecas e utilitários
├── dist/          # Arquivos compilados (gerado após build)
├── tsconfig.json  # Configuração do TypeScript
└── package.json   # Dependências e scripts
```

## 🛠️ Tecnologias

- **TypeScript**: Linguagem com tipagem estática
- **tsx**: Executor de TypeScript para desenvolvimento rápido
- **Node.js**: Runtime JavaScript

## 📝 Desenvolvimento

O projeto está configurado com TypeScript em modo strict, garantindo máxima segurança de tipos e qualidade de código.

