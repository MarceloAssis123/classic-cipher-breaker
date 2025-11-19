# English Statistical Language Model

Módulo TypeScript para pontuação estatística de textos em inglês, usado para quebra automática de cifras clássicas.

## 📋 Visão Geral

Este módulo implementa um modelo de linguagem determinístico baseado em:
- **Unigramas**: Frequência de caracteres individuais
- **Bigramas**: Frequência de pares de caracteres consecutivos
- **Add-k Smoothing**: Suavização de Laplace para probabilidades
- **Log-Probabilities**: Scores eficientes usando logaritmos

## 🎯 Objetivo

Avaliar automaticamente quão "parecido com inglês" um texto candidato é, retornando um score numérico onde **scores mais altos = texto mais parecido com inglês**.

## 📦 Exportações

### Constantes

```typescript
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
export const ALPHABET_SIZE = 27;
```

### Interfaces

```typescript
interface LanguageModelOptions {
  smoothingK?: number;      // Padrão: 1.0
  lambdaBigram?: number;    // Padrão: 0.7
}

interface LanguageModel {
  alphabet: string;
  unigramLogProb: Float64Array;  // [27]
  bigramLogProb: Float64Array;   // [729]
  lambdaBigram: number;
}
```

### Funções

#### `normalizeEnglish(text: string): string`

Normaliza texto para conter apenas A-Z maiúsculas e espaço.

```typescript
normalizeEnglish("Hello, World! 123")  // → "HELLO WORLD "
```

#### `buildLanguageModel(corpus: string, options?): LanguageModel`

Constrói modelo de linguagem a partir de um corpus de treinamento.

```typescript
const model = buildLanguageModel(trainingText, {
  smoothingK: 0.5,      // Suavização menor para corpus grande
  lambdaBigram: 0.8     // Peso maior para bigramas
});
```

**Parâmetros:**
- `corpus`: Texto de treinamento em inglês (será normalizado)
- `options.smoothingK`: Parâmetro de suavização (padrão: 1.0)
- `options.lambdaBigram`: Peso dos bigramas no score final (padrão: 0.7)

**Lança:** Erro se o corpus normalizado tiver < 2 caracteres

#### `scoreText(text: string, model: LanguageModel): number`

Pontua um texto candidato usando o modelo treinado.

```typescript
const score = scoreText("the quick brown fox", model);
// Score mais alto = mais parecido com inglês
```

**Retorno:**
- Número (maior = melhor)
- `Number.NEGATIVE_INFINITY` para texto vazio

**Fórmula:**
```
score = Σ log P(char) + λ × Σ log P(char | prev_char)
```

## 💡 Uso Típico

### 1. Treinamento

```typescript
import { buildLanguageModel, scoreText } from './lib/englishScore';

// Corpus de treinamento (quanto maior, melhor)
const corpus = `
  The quick brown fox jumps over the lazy dog.
  [... mais texto em inglês ...]
`;

// Construir modelo
const model = buildLanguageModel(corpus);
```

### 2. Pontuação de Candidatos

```typescript
// Pontuar diferentes candidatos de decriptação
const candidate1 = "attack at dawn";
const candidate2 = "xqqxzp xq vxra";

const score1 = scoreText(candidate1, model);  // Score alto
const score2 = scoreText(candidate2, model);  // Score baixo

if (score1 > score2) {
  console.log("Candidato 1 é mais provável de ser inglês");
}
```

### 3. Quebra de Cifra Automática

```typescript
// Testar múltiplas chaves de decriptação
const possibleKeys = generateAllKeys();  // Sua função
const bestKey = possibleKeys
  .map(key => ({
    key,
    plaintext: decrypt(ciphertext, key),
    score: scoreText(decrypt(ciphertext, key), model)
  }))
  .sort((a, b) => b.score - a.score)  // Ordenar por score
  [0];  // Melhor candidato

console.log("Melhor chave:", bestKey.key);
console.log("Texto decriptado:", bestKey.plaintext);
```

## 📊 Interpretação dos Scores

- **Scores são relativos**: Use para comparar candidatos, não como valores absolutos
- **Scores são negativos**: Somas de log-probabilidades (entre 0 e 1)
- **Textos longos têm scores mais negativos**: Normalize por comprimento se comparando tamanhos diferentes
- **Score por caractere**: Divida o score pelo comprimento do texto

```typescript
const score = scoreText(text, model);
const normalized = score / text.length;  // Score por caractere
```

## ⚙️ Ajuste de Parâmetros

### smoothingK

- **Valor maior (> 1)**: Mais suavização, menos sensível a corpus pequeno
- **Valor menor (< 1)**: Menos suavização, melhor para corpus grande
- **Padrão (1.0)**: Suavização de Laplace clássica

### lambdaBigram

- **Valor maior (> 0.7)**: Mais peso para padrões de bigramas (pares de letras)
- **Valor menor (< 0.7)**: Mais peso para frequências individuais
- **Padrão (0.7)**: Balanceamento testado

## 🔍 Exemplo Completo

Veja `examples/demo-englishScore.ts` para demonstração completa incluindo:
- Normalização de texto
- Treinamento do modelo
- Pontuação de candidatos
- Simulação de quebra de cifra

Execute:
```bash
npx tsx examples/demo-englishScore.ts
```

## 📈 Resultados Esperados

Com um corpus adequado, o modelo deve:
- ✅ Dar scores mais altos para inglês válido
- ✅ Dar scores mais baixos para gibberish
- ✅ Distinguir entre inglês e texto aleatório
- ✅ Identificar corretamente a chave de decriptação correta

## 🛠️ Implementação

- **Linguagem**: TypeScript puro
- **Dependências**: Nenhuma (apenas tipos Node.js)
- **Arrays**: `Float64Array` para eficiência
- **Performance**: O(n) para treinamento e pontuação
- **Determinístico**: Mesma entrada sempre produz mesma saída

## ⚠️ Limitações

1. **Corpus pequeno**: Requer corpus razoável para resultados confiáveis (> 1KB recomendado)
2. **Apenas A-Z e espaço**: Não suporta pontuação, números ou caracteres especiais
3. **Apenas inglês**: Treinado e otimizado para texto em inglês
4. **Scores absolutos**: Não são probabilidades normalizadas, use apenas para comparação

## 📚 Referências

- Add-k Smoothing (Laplace Smoothing)
- N-gram Language Models
- Log-Probability Scoring
- Statistical Cryptanalysis

