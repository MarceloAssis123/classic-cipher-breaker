import * as fs from 'fs';
import * as path from 'path';
import { buildLanguageModel, LanguageModel } from '../lib/englishScore';
import { breakSubstitutionCipher, BreakSubstitutionResult } from '../lib/breakers/SubstitutionCipher';

/**
 * Carrega e treina o modelo de linguagem a partir do corpus WikiText-103
 * Lê apenas os primeiros N MB do arquivo para evitar limites de memória do Node.js
 * @param maxSizeMB - Tamanho máximo em MB a ser lido (padrão: 100MB)
 * @returns Modelo de linguagem treinado
 */
function loadLanguageModel(maxSizeMB: number = 1): LanguageModel {
    console.log("📚 Carregando corpus WikiText-103...");

    const corpusPath = path.join(__dirname, '../wikitext103_train.txt');

    // Verifica se o arquivo existe
    if (!fs.existsSync(corpusPath)) {
        throw new Error(`Corpus não encontrado em: ${corpusPath}`);
    }

    // Obtém o tamanho do arquivo
    const stats = fs.statSync(corpusPath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`   Tamanho do arquivo: ${fileSizeInMB.toFixed(2)} MB`);

    // Calcula quantos bytes ler (máximo de maxSizeMB)
    const maxBytes = maxSizeMB * 1024 * 1024;
    const bytesToRead = Math.min(stats.size, maxBytes);

    console.log(`   Lendo primeiros ${(bytesToRead / (1024 * 1024)).toFixed(2)} MB...`);

    // Lê o arquivo em chunks para evitar limite de memória
    const buffer = Buffer.alloc(bytesToRead);
    const fd = fs.openSync(corpusPath, 'r');
    fs.readSync(fd, buffer, 0, bytesToRead, 0);
    fs.closeSync(fd);

    const corpus = buffer.toString('utf-8');
    console.log(`   ✓ Corpus carregado: ${(corpus.length / (1024 * 1024)).toFixed(2)} MB`);

    console.log("🧠 Construindo modelo de linguagem...");
    console.log("   (Isso pode levar alguns segundos com corpus grande)");

    const startTime = Date.now();
    const model = buildLanguageModel(corpus, {
        smoothingK: 1.0,
        lambdaBigram: 0.7
    });
    const endTime = Date.now();

    console.log(`   ✓ Modelo construído em ${((endTime - startTime) / 1000).toFixed(2)}s`);

    return model;
}

/**
 * Formata e exibe o mapeamento da cifra de forma organizada
 * @param mapping - Mapeamento de cifra para texto claro
 * @returns Objeto formatado com o mapeamento
 */
function formatCipherMapping(mapping: Record<string, string>): {
    alphabet: Record<string, string>;
    formatted: string;
} {
    // Separa espaço das letras
    const spaceMapping: Record<string, string> = {};
    if (mapping[' ']) {
        spaceMapping[' '] = mapping[' '];
    }

    // Pega apenas as letras (A-Z), ordenadas
    const letterMapping: Record<string, string> = {};
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i); // A-Z
        if (mapping[letter]) {
            letterMapping[letter] = mapping[letter];
        }
    }

    // Combina todos os mapeamentos
    const fullMapping: Record<string, string> = { ...spaceMapping, ...letterMapping };

    // Cria visualização formatada
    let formatted = '\n';

    // Tabela de mapeamento
    formatted += '   ┌─────────────────────────────────────────────────────────────────┐\n';
    formatted += '   │  CIFRA → TEXTO CLARO                                            │\n';
    formatted += '   ├─────────────────────────────────────────────────────────────────┤\n';

    // Espaço primeiro, se existir
    if (spaceMapping[' ']) {
        formatted += `   │  [ESPAÇO] → ${spaceMapping[' '] === ' ' ? '[ESPAÇO]' : spaceMapping[' ']}${' '.repeat(50)}│\n`;
        formatted += '   ├─────────────────────────────────────────────────────────────────┤\n';
    }

    // Letras em linhas de 5 colunas
    const letters = Object.keys(letterMapping);
    for (let i = 0; i < letters.length; i += 5) {
        let line = '   │  ';
        for (let j = 0; j < 5 && i + j < letters.length; j++) {
            const cipher = letters[i + j];
            const plain = letterMapping[cipher];
            line += `${cipher}→${plain}    `;
        }
        // Preenche com espaços até completar a linha
        const padding = 63 - line.length;
        line += ' '.repeat(Math.max(0, padding)) + '│';
        formatted += line + '\n';
    }

    formatted += '   └─────────────────────────────────────────────────────────────────┘\n';

    // Adiciona visualização alfabética
    formatted += '\n   Alfabeto completo (ordem alfabética):\n';
    formatted += '   ';
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i);
        formatted += letter;
    }
    formatted += '\n   ';
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i);
        const mapped = letterMapping[letter] || '?';
        formatted += mapped;
    }
    formatted += '\n';

    return {
        alphabet: fullMapping,
        formatted: formatted
    };
}

/**
 * Decripta um texto cifrado usando análise de frequência e hill-climbing
 * @param ciphertext - Texto cifrado a ser quebrado
 * @param model - Modelo de linguagem treinado (opcional, será carregado se não fornecido)
 * @param options - Opções de configuração do algoritmo
 * @returns Resultado da decriptação
 */
function decrypt(
    ciphertext: string,
    model?: LanguageModel,
    options?: {
        restarts?: number;
        maxIterations?: number;
        useFrequencyInit?: boolean;
    }
): BreakSubstitutionResult {
    // Se o modelo não foi fornecido, carrega o modelo do corpus
    const languageModel = model || loadLanguageModel();

    console.log("\n🔐 Iniciando quebra da cifra de substituição...");
    console.log(`   Texto cifrado: ${ciphertext.length} caracteres`);

    // Configurações padrão otimizadas
    const config = {
        restarts: options?.restarts ?? 25,
        maxIterations: options?.maxIterations ?? 8000,
        useFrequencyInit: options?.useFrequencyInit ?? true
    };

    console.log(`   Configuração: ${config.restarts} reinícios × ${config.maxIterations} iterações`);
    console.log("   Executando hill-climbing...");

    const startTime = Date.now();
    const result = breakSubstitutionCipher(ciphertext, languageModel, config);
    const endTime = Date.now();

    console.log(`   ✓ Cifra quebrada em ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log(`   Score do modelo: ${result.score.toFixed(2)}`);

    return result;
}

/**
 * Função principal para decriptar um texto cifrado
 * @param ciphertext - Texto cifrado fornecido pelo usuário
 * @returns Texto decriptado (plaintext)
 */
export default function decryptSubstitutionCipher(ciphertext: string): string {
    console.log("=".repeat(80));
    console.log("🔓 QUEBRADOR DE CIFRA DE SUBSTITUIÇÃO MONOALFABÉTICA");
    console.log("=".repeat(80));

    try {
        // Carrega o modelo de linguagem uma única vez
        const model = loadLanguageModel();

        // Decripta o texto cifrado
        const result = decrypt(ciphertext, model);

        // Exibe os resultados
        console.log("\n" + "=".repeat(80));
        console.log("📝 RESULTADOS DA DECRIPTAÇÃO");
        console.log("=".repeat(80));

        console.log("\n🔤 Texto Original (Cifrado):");
        console.log("   " + ciphertext.substring(0, 100) + (ciphertext.length > 100 ? "..." : ""));

        console.log("\n✨ Texto Decriptado (Plaintext):");
        console.log("   " + result.plaintext.substring(0, 200) + (result.plaintext.length > 200 ? "..." : ""));

        console.log("\n📊 Mapeamento da Cifra (Cifra → Texto Claro):");
        const mappingInfo = formatCipherMapping(result.mapping);
        console.log(mappingInfo.formatted);

        // Também exibe o objeto JSON para fácil cópia
        console.log("   📋 Objeto JSON do mapeamento:");
        console.log("   " + JSON.stringify(mappingInfo.alphabet, null, 2).split('\n').join('\n   '));

        console.log("\n📈 Estatísticas:");
        console.log(`   Score do Modelo: ${result.score.toFixed(2)}`);
        console.log(`   Tamanho do Texto: ${result.plaintext.length} caracteres`);

        console.log("\n💾 Texto Completo Decriptado:");
        console.log("-".repeat(80));
        console.log(result.plaintext);
        console.log("-".repeat(80));

        console.log("\n" + "=".repeat(80));
        console.log("✅ DECRIPTAÇÃO CONCLUÍDA COM SUCESSO!");
        console.log("=".repeat(80));

        // Retorna o texto decriptado
        return result.plaintext;

    } catch (error) {
        console.error("\n❌ ERRO durante a decriptação:");
        console.error("   ", error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}