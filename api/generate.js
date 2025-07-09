// File: api/generate.js (Versi untuk OpenRouter)

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 1. Ambil Kunci API OpenRouter dari Environment Variable
    const API_KEY = process.env.OPENROUTER_API_KEY; 
    
    // 2. Tentukan model GRATIS yang ingin Anda gunakan dari OpenRouter
    // Contoh: 'mistralai/mistral-7b-instruct' atau 'google/gemini-flash-1.5'
    const MODEL_NAME = 'mistralai/mistral-7b-instruct';

    // 3. URL endpoint untuk OpenRouter
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    if (!API_KEY) {
        return res.status(500).json({ error: 'API Key OpenRouter tidak dikonfigurasi di server.' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt tidak ditemukan dalam permintaan.' });
        }

        // 4. Siapkan permintaan dengan format yang mirip OpenAI
        const headers = { 
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json' 
        };
        const body = JSON.stringify({
            model: MODEL_NAME,
            messages: [
                { "role": "user", "content": prompt }
            ],
            // Anda bisa tambahkan parameter lain seperti temperature, max_tokens, dll.
            // max_tokens: 4096, 
        });

        const apiResponse = await fetch(url, { method: 'POST', headers, body });
        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error('OpenRouter API Error:', data);
            // Error dari OpenRouter biasanya ada di dalam `data.error.message`
            throw new Error(`API Error: ${apiResponse.status} - ${data.error.message || JSON.stringify(data)}`);
        }

        // 5. Ekstrak teks dan kirim kembali ke frontend
        // Format respons OpenRouter mirip dengan OpenAI
        const newChapterText = data.choices[0].message.content;
        res.status(200).json({ newChapterText: newChapterText });

    } catch (error) {
        console.error('Error in serverless function:', error);
        res.status(500).json({ error: `Terjadi kesalahan di server: ${error.message}` });
    }
}
