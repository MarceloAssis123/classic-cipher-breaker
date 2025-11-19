/**
 * Avalia a qualidade de um texto em inglês usando o modelo Ollama qwen3:8b.
 * Retorna uma pontuação de 0-10 baseada na coerência e gramática do texto.
 * Utiliza structured output do Ollama para garantir resposta em formato JSON.
 * 
 * @param text - Texto em inglês para ser avaliado
 * @returns Promise com objeto contendo o score (0-10)
 * @throws Error se o Ollama estiver offline, timeout ou erro de parsing
 */
export async function llmScore(text: string): Promise<{ score: number }> {
    const OLLAMA_URL = 'http://localhost:11434/api/generate';
    const MODEL = 'qwen3:8b';
    const TIMEOUT_MS = 30000; // 30 segundos

    // Prompt otimizado para structured output JSON
    const prompt = `Evaluate the following English text for coherence and grammar quality. Rate it from 0 to 10, where:
- 0-3: Poor quality, incoherent, or nonsensical text
- 4-6: Moderate quality, some coherence but with issues
- 7-8: Good quality, coherent and mostly correct
- 9-10: Excellent quality, perfectly coherent and grammatically correct

Text to evaluate: "${text}"

Respond with a JSON object in this exact format: {"score": X} where X is a number between 0 and 10.`;

    try {
        // Controller para timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        // Requisição para a API do Ollama com structured output
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                prompt: prompt,
                stream: false, // Desabilitar streaming para obter resposta completa
                format: 'json', // Forçar resposta em formato JSON estruturado
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Verificar se a requisição foi bem-sucedida
        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as { response?: string };

        // Extrair a resposta do modelo
        const modelResponse = data.response?.trim() || '';

        // Parse do JSON retornado pelo modelo
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(modelResponse);
        } catch (parseError) {
            throw new Error(`Failed to parse JSON response from model: "${modelResponse}"`);
        }

        // Validar estrutura da resposta
        if (typeof parsedResponse.score !== 'number') {
            throw new Error(`Invalid response structure: expected {score: number}, got ${JSON.stringify(parsedResponse)}`);
        }

        let score = parsedResponse.score;

        // Validar que o score está entre 0-10
        if (isNaN(score) || score < 0 || score > 10) {
            throw new Error(`Invalid score value: ${score}. Score must be between 0 and 10.`);
        }

        // Arredondar para o inteiro mais próximo se necessário
        score = Math.round(score);

        return { score };

    } catch (error: any) {
        // Tratamento específico para timeout
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout: Ollama did not respond within ${TIMEOUT_MS}ms`);
        }

        // Tratamento para erro de conexão
        if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
            throw new Error('Ollama is offline or not accessible at http://localhost:11434');
        }

        // Re-lançar outros erros
        throw error;
    }
}

