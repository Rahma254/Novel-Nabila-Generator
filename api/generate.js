// File: api/generate.js

export default async function handler(req, res) {
    // 1. Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 2. Ambil Kunci API dari Environment Variable yang aman
    const API_KEY = process.env.GOOGLE_API_KEY;
    const MODEL_NAME = 'gemini-1.5-pro-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    if (!API_KEY) {
        return res.status(500).json({ error: 'API Key tidak dikonfigurasi di server.' });
    }

    try {
        // 3. Ambil prompt yang dikirim dari frontend
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt tidak ditemukan dalam permintaan.' });
        }

        // 4. Siapkan dan kirim permintaan ke Google AI
        const headers = { 'Content-Type': 'application/json' };
        const body = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topK: 1,
                topP: 1,
                maxOutputTokens: 4096,
            }
        });

        const apiResponse = await fetch(url, { method: 'POST', headers, body });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error('Google AI API Error:', errorData);
            throw new Error(`API Error: ${apiResponse.status} - ${JSON.stringify(errorData.error)}`);
        }

        const data = await apiResponse.json();
        
        // 5. Ekstrak teks dan kirim kembali ke frontend
        const newChapterText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ newChapterText: newChapterText });

    } catch (error) {
        console.error('Error in serverless function:', error);
        res.status(500).json({ error: `Terjadi kesalahan di server: ${error.message}` });
    }
}
