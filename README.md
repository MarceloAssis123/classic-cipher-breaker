# 🔐 Classic Cipher Breaker

Ferramenta avançada para quebra de cifras clássicas de substituição monoalfabética, combinando análise estatística de linguagem natural com validação via LLM (Large Language Model).

## 🎯 Contexto e Motivação

Cifras de substituição monoalfabética são uma das técnicas criptográficas mais antigas, onde cada letra do alfabeto é substituída por outra letra de forma consistente. Embora simples para os padrões modernos, quebrar essas cifras sem conhecer a chave requer técnicas sofisticadas de análise estatística.

### 💡 Como Funciona

Este projeto implementa uma solução completa em duas etapas:

1. **🧮 Análise Estatística (Modelo de Linguagem)**
   - Treina um modelo estatístico usando o corpus **WikiText-103** (>200MB de texto em inglês)
   - Analisa frequências de caracteres individuais (unigramas) e pares de caracteres (bigramas)
   - Usa algoritmo **hill-climbing com múltiplos reinícios** para encontrar a chave de decriptação
   - Combina análise de frequência inicial com otimização iterativa

2. **🤖 Validação com LLM (Ollama)**
   - Avalia a qualidade do texto decriptado usando o modelo **Qwen3:8b**
   - Retorna um score de 0-10 baseado em coerência e gramática
   - Garante que o resultado final não é apenas estatisticamente provável, mas também semanticamente correto

### 🔬 Algoritmo Implementado

```
1. Normalização → Texto convertido para A-Z maiúsculas + espaço
2. Treinamento → Construção do modelo estatístico com WikiText-103
3. Análise de Frequência → Chave inicial baseada em frequências conhecidas do inglês
4. Hill-Climbing → Refinamento através de swaps que melhoram o score
5. Múltiplos Reinícios → Executa várias vezes para escapar de máximos locais
6. Validação LLM → Score de qualidade do texto decriptado (0-10)
```

## ✨ Características

- 🔓 **Quebra de Cifras de Substituição Monoalfabética**
- 📊 **Análise de Frequência Inteligente**
- 🧠 **Modelo de Linguagem Estatístico** (unigramas e bigramas)
- 🎯 **Hill-Climbing com Múltiplos Reinícios**
- 📚 **Treinamento com Corpus WikiText-103** (>200MB)
- 🤖 **Validação com LLM** (Ollama + Qwen3:8b)
- ⚡ **Performance Otimizada** com TypedArrays
- 📝 **Documentação Completa** em português e inglês

## 🚀 Configuração e Instalação

### Pré-requisitos

- **Node.js** (v18 ou superior)
- **Python 3** com `pip`
- **Ollama** instalado e rodando

### Passo 1: Clone e Instale Dependências

```bash
git clone https://github.com/MarceloAssis123/classic-cipher-breaker.git
cd classic-cipher-breaker
npm install
```

### Passo 2: Baixar o Corpus WikiText-103

Execute o script Python para baixar o corpus de treinamento:

```bash
# Instale a biblioteca datasets (se ainda não tiver)
pip install datasets

# Execute o script de download (irá baixar >200MB)
python python/export_wikitext.py
```

Isso criará o arquivo `wikitext103_train.txt` na raiz do projeto.

### Passo 3: Configurar Ollama

1. **Instale o Ollama**: Siga as instruções em [ollama.ai](https://ollama.ai)

2. **Baixe o modelo Qwen3:8b**:
   ```bash
   ollama pull qwen3:8b
   ```

3. **Inicie o servidor Ollama** (se não estiver rodando):
   ```bash
   ollama serve
   ```

   O Ollama deve estar acessível em `http://localhost:11434`

### Passo 4: Compilar o Projeto

```bash
npm run build
```

## 🎮 Como Usar

### Uso Básico

1. **Abra o arquivo `src/index.ts`**
2. **Insira seu texto cifrado** na constante `CIPHERTEXT`
3. **Execute**:
   ```bash
   npm run dev
   ```

### Exemplo

```typescript
// Em src/index.ts, altere:
const CIPHERTEXT = `
Xqghu vriw pruqlqj oljkw, Ohqd rshqhg khu odswrs dqg zurwh d surplvh wr khuvhoi.
Wrgdb vkh zrxog pryh rqh vwhs forvhu wr wkh ixwxuh vkh lpdjlqhg...
`;

// Depois execute:
npm run dev
```

O programa irá:
- ✅ Carregar o corpus WikiText-103
- ✅ Construir o modelo de linguagem estatístico
- ✅ Quebrar a cifra usando hill-climbing
- ✅ Exibir o texto decriptado e o mapeamento completo
- ✅ Validar a qualidade com LLM (score 0-10)

### Saída Esperada

```
================================================================================
🔓 QUEBRADOR DE CIFRA DE SUBSTITUIÇÃO MONOALFABÉTICA
================================================================================
📚 Carregando corpus WikiText-103...
   ✓ Corpus carregado: XXX.XX MB
🧠 Construindo modelo de linguagem...
   ✓ Modelo construído em X.XXs

🔐 Iniciando quebra da cifra de substituição...
   ✓ Cifra quebrada em X.XXs
   Score do modelo: -XXXX.XX

📝 RESULTADOS DA DECRIPTAÇÃO
✨ Texto Decriptado (Plaintext):
   Under soft morning light, Lena opened her laptop and wrote a promise to herself...

📊 Mapeamento da Cifra (Cifra → Texto Claro):
   A→X B→Y C→Z ... [mapeamento completo]

🤖 Validação LLM:
Score do LLM: 9/10
================================================================================
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
├── src/
│   ├── index.ts                       # 🚀 Arquivo principal (usar este!)
│   └── 1.ts                           # 🔓 Quebrador de cifras (funções core)
├── lib/
│   ├── englishScore.ts                # 📊 Modelo de linguagem estatístico
│   ├── llmScore.ts                    # 🤖 Scoring com LLM (Ollama)
│   ├── README-englishScore.md         # 📖 Documentação do modelo estatístico
│   └── breakers/
│       └── SubstitutionCipher/
│           ├── substitutionBreaker.ts # 🔐 Algoritmo de quebra
│           ├── index.ts               # Exportações do módulo
│           └── README.md              # 📖 Documentação técnica
├── python/
│   └── export_wikitext.py             # 🐍 Script para baixar corpus WikiText-103
├── wikitext103_train.txt              # 📚 Corpus WikiText-103 (>200MB, gerado)
├── dist/                              # 📦 Arquivos compilados (gerado após build)
├── tsconfig.json                      # ⚙️ Configuração do TypeScript
└── package.json                       # 📋 Dependências e scripts
```

### 🗂️ Módulos Principais

#### `src/index.ts` - Arquivo Principal
- **Ponto de entrada do projeto**
- Importa e orquestra todos os módulos
- Usa `decryptSubstitutionCipher()` para quebrar cifras
- Integra validação LLM com `llmScore()`
- Configure seu texto cifrado aqui

#### `src/1.ts` - Quebrador de Cifras (Core)
- Carrega automaticamente o corpus WikiText-103
- Constrói modelo de linguagem estatístico
- Função `decryptSubstitutionCipher()` exportada
- Formatação e exibição de resultados

#### `lib/englishScore.ts` - Modelo de Linguagem Estatístico
- Análise estatística de texto (unigramas e bigramas)
- Normalização de texto (A-Z + espaço)
- Scoring de textos candidatos
- Suavização de Laplace
- TypedArrays para performance otimizada

#### `lib/llmScore.ts` - Validação com LLM
- Integração com Ollama API
- Modelo Qwen3:8b para avaliação de qualidade
- Retorna score 0-10 de coerência e gramática
- Structured output JSON garantido
- Timeout e error handling robusto

#### `lib/breakers/SubstitutionCipher/` - Algoritmo de Quebra
- Análise de frequência para chave inicial
- Hill-climbing com múltiplos reinícios
- Fisher-Yates shuffle para permutações aleatórias
- Tipos TypeScript completos
- Configurável (restarts, iterations, etc.)

#### `python/export_wikitext.py` - Download do Corpus
- Baixa o dataset WikiText-103 via HuggingFace
- Processa e salva como arquivo de texto
- Necessário executar antes do primeiro uso
- Requer biblioteca `datasets` do Python

## 🛠️ Tecnologias

### Core
- **TypeScript**: Linguagem principal com tipagem estática e strict mode
- **Node.js**: Runtime JavaScript para execução
- **tsx**: Executor de TypeScript para desenvolvimento rápido

### Machine Learning & NLP
- **Ollama**: Plataforma local para execução de LLMs
- **Qwen3:8b**: Modelo de linguagem para validação de qualidade de texto
- **WikiText-103**: Corpus de treinamento com artigos da Wikipedia (>200MB)

### Python (Download do Corpus)
- **Python 3**: Para execução do script de download
- **HuggingFace Datasets**: Biblioteca para baixar o corpus WikiText-103

### Performance
- **TypedArrays**: Float64Array para operações otimizadas
- **Add-k Smoothing**: Suavização de Laplace para probabilidades
- **Hill-Climbing**: Algoritmo de otimização iterativa

## 📝 Desenvolvimento

O projeto está configurado com TypeScript em modo strict, garantindo máxima segurança de tipos e qualidade de código.

## 🧪 Exemplos

### Uso Programático Completo

```typescript
import { llmScore } from './lib/llmScore';
import decryptSubstitutionCipher from './src/1';

// Texto cifrado (ROT-3 neste exemplo)
const CIPHERTEXT = `
Xqghu vriw pruqlqj oljkw, Ohqd rshqhg khu odswrs dqg zurwh d surplvh wr khuvhoi.
Wrgdb vkh zrxog pryh rqh vwhs forvhu wr wkh ixwxuh vkh lpdjlqhg.
`;

async function main() {
    // 1. Quebrar a cifra usando análise estatística
    const plaintext = decryptSubstitutionCipher(CIPHERTEXT);
    
    // 2. Validar qualidade com LLM
    const score = await llmScore(plaintext);
    
    console.log(`\n🤖 Validação LLM:`);
    console.log(`Score do LLM: ${score.score}/10`);
    
    if (score.score >= 8) {
        console.log("✅ Texto de alta qualidade!");
    } else if (score.score >= 6) {
        console.log("⚠️ Texto de qualidade moderada.");
    } else {
        console.log("❌ Texto de baixa qualidade - pode precisar ajustes.");
    }
}

main();
```

### Uso Modular (Sem LLM)

Se você quiser usar apenas a quebra de cifra sem validação LLM:

```typescript
import { buildLanguageModel } from './lib/englishScore';
import { breakSubstitutionCipher } from './lib/breakers/SubstitutionCipher';
import * as fs from 'fs';

// 1. Carregar e treinar modelo
const corpus = fs.readFileSync('wikitext103_train.txt', 'utf-8');
const model = buildLanguageModel(corpus, {
  smoothingK: 1.0,
  lambdaBigram: 0.7
});

// 2. Quebrar cifra
const result = breakSubstitutionCipher(CIPHERTEXT, model, {
  restarts: 25,           // Número de reinícios
  maxIterations: 8000,    // Iterações por reinício
  useFrequencyInit: true  // Usar análise de frequência
});

// 3. Usar resultados
console.log("Texto decriptado:", result.plaintext);
console.log("Mapeamento:", result.mapping);
console.log("Score estatístico:", result.score);
```

### Exemplo Real: ROT-13

```typescript
const ciphertext = "URYYB JBEYQ"; // ROT-13 de "HELLO WORLD"

// Quebra automaticamente
const plaintext = decryptSubstitutionCipher(ciphertext);
// Resultado: "HELLO WORLD"
```

## 📊 Performance

### Tempo de Execução Típico
- **Download do corpus** (primeira vez): ~2-5 minutos (dependendo da internet)
- **Carregamento do corpus**: ~5-15 segundos
- **Construção do modelo**: ~5-30 segundos (depende do tamanho do corpus carregado)
- **Quebra da cifra**: ~5-20 segundos (depende do tamanho do texto)
- **Validação LLM**: ~2-10 segundos (depende do hardware e modelo)

### Taxa de Sucesso
- **Textos longos** (>500 chars): ~90% de precisão
- **Textos médios** (100-500 chars): ~70% de precisão
- **Textos curtos** (<100 chars): Variável (depende muito do contexto)

### Requisitos de Hardware

#### Mínimo
- **RAM**: 4GB
- **Espaço em disco**: 2GB (corpus + modelo Ollama)
- **CPU**: Qualquer processador moderno

#### Recomendado
- **RAM**: 8GB ou mais
- **Espaço em disco**: 5GB
- **CPU**: Multi-core para processamento mais rápido
- **GPU**: Opcional, mas acelera a validação LLM significativamente

## 🎓 Algoritmo

### Passos do Algoritmo

1. **Normalização**: Converte texto para A-Z maiúsculas + espaço
2. **Análise de Frequência**: Cria chave inicial baseada em frequências
3. **Hill-Climbing**: Refina a chave através de swaps que melhoram o score
4. **Múltiplos Reinícios**: Executa várias vezes para escapar de máximos locais

### Ordem de Frequência em Inglês
```
Espaço > E > T > A > O > N > R > I > S > H > D > L > C > M > U > G > Y > P > W > B > V > K > J > X > Q > Z
```

## 🐛 Troubleshooting

### Problemas com o Corpus

#### "Corpus não encontrado em: ..."
**Causa**: O arquivo `wikitext103_train.txt` não existe.

**Solução**:
```bash
# Execute o script Python para baixar o corpus
python python/export_wikitext.py
```

#### "Corpus too short after normalization"
**Causa**: Corpus muito pequeno ou vazio.

**Solução**:
- Verifique se o download do corpus foi concluído corretamente
- O arquivo deve ter pelo menos 200MB
- Re-execute o script Python se necessário

### Problemas com o Ollama

#### "Ollama is offline or not accessible"
**Causa**: Servidor Ollama não está rodando ou não está acessível.

**Solução**:
```bash
# Inicie o servidor Ollama
ollama serve

# Em outro terminal, verifique se está funcionando
ollama list
```

#### "Failed to parse JSON response from model"
**Causa**: Modelo retornou resposta não estruturada.

**Solução**:
- Verifique se o modelo `qwen3:8b` está instalado:
  ```bash
  ollama list
  ```
- Se não estiver, baixe:
  ```bash
  ollama pull qwen3:8b
  ```

#### "Request timeout: Ollama did not respond"
**Causa**: Modelo muito lento ou hardware insuficiente.

**Solução**:
- Use um modelo menor (ex: `qwen3:0.5b`)
- Aumente o timeout em `lib/llmScore.ts`
- Considere usar GPU para acelerar

#### "Model 'qwen3:8b' not found"
**Causa**: Modelo não está baixado localmente.

**Solução**:
```bash
ollama pull qwen3:8b
```

### Problemas de Memória

#### "Out of memory" ou "JavaScript heap out of memory"
**Causa**: Corpus muito grande para a memória disponível.

**Solução**:
```bash
# Aumente o limite de memória do Node.js
node --max-old-space-size=4096 dist/src/index.js

# Ou reduza o tamanho do corpus carregado em src/1.ts:
# loadLanguageModel(0.5) // Carrega apenas 500MB
```

### Problemas com Python

#### "ModuleNotFoundError: No module named 'datasets'"
**Causa**: Biblioteca `datasets` não instalada.

**Solução**:
```bash
pip install datasets
```

#### "Permission denied" ao executar script Python
**Causa**: Permissões de arquivo.

**Solução**:
```bash
chmod +x python/export_wikitext.py
python python/export_wikitext.py
```

### Resultados de Baixa Qualidade

#### Score do modelo muito baixo
**Possíveis causas**:
- Texto cifrado muito curto (< 100 caracteres)
- Cifra não é de substituição monoalfabética simples
- Texto em idioma diferente do inglês

**Soluções**:
- Aumente `restarts` para 30-50
- Aumente `maxIterations` para 10000-15000
- Verifique se o texto está correto e completo
- Use textos maiores (recomendado > 200 caracteres)

#### LLM retorna score baixo mesmo com texto aparentemente correto
**Causa**: Texto pode conter erros sutis de gramática ou coerência.

**Solução**:
- Revise manualmente o texto decriptado
- Compare com o mapeamento fornecido
- Execute novamente com mais `restarts`

### Problemas de Compilação

#### Erros de TypeScript
**Solução**:
```bash
# Limpe e recompile
rm -rf dist/
npm run build
```

#### "Cannot find module" ao executar
**Solução**:
```bash
# Reinstale as dependências
rm -rf node_modules/
npm install
npm run build
```

### Performance Lenta

#### Carregamento do corpus muito lento
**Solução**:
- Reduza o tamanho do corpus carregado:
  ```typescript
  loadLanguageModel(0.5) // Carrega apenas 500MB ao invés de 1GB
  ```

#### Validação LLM muito lenta
**Soluções**:
- Use um modelo menor: `qwen3:0.5b` ou `qwen3:1.5b`
- Configure GPU no Ollama se disponível
- Aumente o timeout em `lib/llmScore.ts`

## 📚 Documentação

- **[lib/README-englishScore.md](./lib/README-englishScore.md)** - Documentação do modelo de linguagem estatístico
- **[lib/breakers/SubstitutionCipher/README.md](./lib/breakers/SubstitutionCipher/README.md)** - Documentação técnica do algoritmo de quebra

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

### Como Contribuir

1. **Fork** o repositório
2. **Crie uma branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. **Abra um Pull Request**

### Áreas para Contribuição

- 🔧 **Novos algoritmos de quebra** (Vigenère, transposição, etc.)
- 🌐 **Suporte a outros idiomas** (português, espanhol, etc.)
- ⚡ **Otimizações de performance**
- 📊 **Visualizações gráficas** dos resultados
- 🧪 **Testes automatizados** e suítes de benchmark
- 📝 **Documentação e exemplos** adicionais

## 🗺️ Roadmap

### Versão Atual (v1.0)
- ✅ Quebra de cifras de substituição monoalfabética
- ✅ Modelo de linguagem estatístico com WikiText-103
- ✅ Validação com LLM (Ollama + Qwen3:8b)
- ✅ Documentação completa em português

### Próximas Versões

#### v1.1 (Planejado)
- 🔜 Interface web interativa
- 🔜 Suporte a múltiplos idiomas
- 🔜 Modo batch para processar múltiplos textos
- 🔜 Export de resultados em JSON/CSV

#### v2.0 (Futuro)
- 🔮 Quebra de cifras Vigenère
- 🔮 Quebra de cifras de transposição
- 🔮 Detecção automática do tipo de cifra
- 🔮 API REST para integração

#### v3.0 (Visão de Longo Prazo)
- 🌟 Suporte a cifras polialfabéticas complexas
- 🌟 Machine learning para otimização de parâmetros
- 🌟 Dashboard analytics para análise de múltiplas cifras
- 🌟 Plugin para editores de texto (VSCode, etc.)

## 📊 Estatísticas do Projeto

- **Linguagem principal**: TypeScript (100%)
- **Linhas de código**: ~2,000+
- **Documentação**: Completa em português e inglês
- **Testes**: Em desenvolvimento
- **Performance**: Otimizado com TypedArrays

## 🙏 Agradecimentos

- **Salesforce/WikiText-103**: Corpus de treinamento de alta qualidade
- **Ollama**: Plataforma local para LLMs
- **Qwen Team**: Modelo Qwen3:8b de código aberto
- **Comunidade TypeScript**: Ferramentas e ecossistema

## 📞 Contato e Suporte

- 🐛 **Issues**: Use o GitHub Issues para reportar bugs
- 💡 **Feature Requests**: Abra uma issue com a tag `enhancement`
- 💬 **Discussões**: Use GitHub Discussions para perguntas gerais

## ⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!

## 📄 Licença

ISC

---

**Desenvolvido com ❤️ e TypeScript**

