# Substitution Cipher Breaker

Módulo TypeScript para quebrar cifras de substituição monoalfabética usando análise de frequência e hill-climbing com múltiplos reinícios aleatórios.

## Visão Geral

Este módulo implementa um algoritmo de criptoanálise clássica que quebra cifras de substituição monoalfabética sobre o alfabeto fixo `A-Z + espaço` (27 caracteres).

### Como Funciona

1. **Análise de Frequência**: Cria uma chave inicial mapeando os caracteres mais frequentes do texto cifrado para os caracteres mais frequentes em inglês
2. **Hill-Climbing**: Refina a chave através de trocas sucessivas que melhoram o score do modelo de linguagem
3. **Múltiplos Reinícios**: Executa o algoritmo várias vezes com diferentes pontos iniciais para escapar de máximos locais
4. **Scoring de Modelo de Linguagem**: Usa estatísticas de unigramas e bigramas para avaliar se um texto decodificado é inglês válido

## Instalação

```bash
npm install
npm run build
```

## Uso Básico

```typescript
import { buildLanguageModel } from '../englishScore';
import { breakSubstitutionCipher } from './breakers/substitutionBreaker';

// 1. Construir modelo de linguagem a partir de um corpus
const trainingCorpus = `
  Your English training text goes here.
  The more text you provide, the better the model will be.
  Include common words and varied sentence structures.
`;

const model = buildLanguageModel(trainingCorpus, {
  smoothingK: 1.0,      // Suavização de Laplace
  lambdaBigram: 0.7     // Peso dos bigramas
});

// 2. Quebrar a cifra
const ciphertext = "YOUR ENCRYPTED TEXT HERE";

const result = breakSubstitutionCipher(ciphertext, model, {
  restarts: 20,         // Número de reinícios
  maxIterations: 5000,  // Iterações por reinício
  useFrequencyInit: true // Usar análise de frequência no primeiro reinício
});

// 3. Ver os resultados
console.log("Plaintext:", result.plaintext);
console.log("Score:", result.score);
console.log("Mapping:", result.mapping);
```

## API Reference

### Types

#### `SubstitutionKey`

```typescript
type SubstitutionKey = Int16Array;
```

Array representando a chave de substituição onde `key[cipherIndex] = plainIndex`.

#### `BreakSubstitutionOptions`

```typescript
interface BreakSubstitutionOptions {
  restarts?: number;           // Número de reinícios do hill-climbing (padrão: 20)
  maxIterations?: number;      // Iterações por reinício (padrão: 5000)
  useFrequencyInit?: boolean;  // Usar análise de frequência (padrão: true)
}
```

#### `BreakSubstitutionResult`

```typescript
interface BreakSubstitutionResult {
  plaintext: string;                // Texto decodificado
  key: SubstitutionKey;             // Chave de substituição
  mapping: Record<string, string>;  // Mapeamento legível (cifra -> texto)
  score: number;                    // Score do modelo de linguagem
}
```

### Funções

#### `breakSubstitutionCipher()`

```typescript
function breakSubstitutionCipher(
  ciphertextRaw: string,
  model: LanguageModel,
  options?: BreakSubstitutionOptions
): BreakSubstitutionResult
```

Quebra uma cifra de substituição monoalfabética.

**Parâmetros:**
- `ciphertextRaw`: Texto cifrado (será normalizado para A-Z + espaço)
- `model`: Modelo de linguagem treinado para scoring
- `options`: Parâmetros opcionais do algoritmo

**Retorna:**
- `BreakSubstitutionResult` contendo o plaintext, chave e score

**Throws:**
- `Error` se o texto cifrado estiver vazio após normalização

## Algoritmo

### 1. Normalização
O texto cifrado é normalizado para conter apenas `A-Z` maiúsculas e espaço. Todos os outros caracteres são removidos.

### 2. Análise de Frequência (Opcional)
No primeiro reinício, uma chave inicial é criada mapeando:
- O caractere mais frequente do texto cifrado → espaço
- O segundo mais frequente → `E`
- O terceiro mais frequente → `T`
- E assim por diante, seguindo a ordem: ` ETAONRISHDLFCMUGYPWBVKJXQZ`

### 3. Hill-Climbing
Para cada reinício:
1. Começar com uma chave inicial (baseada em frequência ou aleatória)
2. Decodificar o texto e calcular o score
3. Para cada iteração:
   - Criar uma chave vizinha trocando duas posições aleatórias
   - Decodificar e calcular o score da vizinha
   - Se melhorou, aceitar a nova chave
   - Caso contrário, rejeitar (hill-climbing simples, sem simulated annealing)
4. Manter a melhor chave encontrada

### 4. Múltiplos Reinícios
O algoritmo executa múltiplos reinícios independentes e retorna a melhor solução global encontrada.

## Considerações de Performance

### Corpus de Treinamento
- **Mínimo**: ~500 caracteres (resultados básicos)
- **Recomendado**: 10.000+ caracteres (bons resultados)
- **Ideal**: 100.000+ caracteres (resultados excelentes)

### Tamanho do Texto Cifrado
- **Textos curtos** (<100 caracteres): Resultados podem ser imprecisos
- **Textos médios** (100-500 caracteres): Bons resultados esperados
- **Textos longos** (>500 caracteres): Excelentes resultados esperados

### Parâmetros de Otimização

Para textos **curtos**:
```typescript
{
  restarts: 30,
  maxIterations: 10000,
  useFrequencyInit: true
}
```

Para textos **médios**:
```typescript
{
  restarts: 20,
  maxIterations: 5000,
  useFrequencyInit: true
}
```

Para textos **longos**:
```typescript
{
  restarts: 10,
  maxIterations: 3000,
  useFrequencyInit: true
}
```

## Limitações

1. **Apenas substituição monoalfabética**: Não funciona para cifras polialfabéticas (como Vigenère)
2. **Apenas inglês**: O modelo está otimizado para texto em inglês
3. **Requer texto razoável**: Textos muito curtos (<50 caracteres) podem não ter estatísticas suficientes
4. **Não determinístico**: Devido ao uso de `Math.random()`, resultados podem variar entre execuções
5. **Máximos locais**: O hill-climbing pode ficar preso em soluções subótimas (por isso múltiplos reinícios são importantes)

## Exemplos

Veja `examples/demo-substitutionBreaker.ts` para exemplos completos de uso, incluindo:
- Construção de modelo de linguagem
- Quebra de cifras reais
- Validação de resultados

Para executar o exemplo:

```bash
npm run run examples/demo-substitutionBreaker.ts
```

## Teoria

### Frequência de Letras em Inglês
A ordem aproximada de frequência de letras em inglês (espaço incluído):
```
Espaço > E > T > A > O > N > R > I > S > H > D > L > C > M > U > G > Y > P > W > B > V > K > J > X > Q > Z
```

### Bigramas Comuns
Os pares de letras mais comuns em inglês incluem:
- TH, HE, IN, ER, AN, RE, ON, AT, EN, ND, TI, ES, OR, TE, OF

### Score do Modelo de Linguagem
O score combina probabilidades de unigramas e bigramas:
```
score = Σ log P(char) + λ × Σ log P(char | prev_char)
```

Onde:
- `P(char)` é a probabilidade de um caractere (unigrama)
- `P(char | prev_char)` é a probabilidade condicional (bigrama)
- `λ` (lambda) é o peso dos bigramas (tipicamente 0.7)

Scores mais altos indicam texto mais parecido com inglês real.

## Referências

- **Criptoanálise Clássica**: Análise de frequência foi descrita por Al-Kindi no século IX
- **Hill-Climbing**: Técnica de busca local usada em otimização
- **Modelos de Linguagem**: Estatísticas de n-gramas para processamento de linguagem natural

## Licença

ISC

