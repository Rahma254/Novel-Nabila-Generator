// File: public/script.js

// --- ELEMEN UI ---
const novelTitleEl = document.getElementById('novel-title');
const novelSynopsisEl = document.getElementById('novel-synopsis');
const novelGenreEl = document.getElementById('novel-genre');
const generateBtn = document.getElementById('generate-btn');
const novelContentEl = document.getElementById('novel-content');
const loader = document.getElementById('loader');

// --- STATE APLIKASI ---
let novel = {
    title: '',
    synopsis: '',
    genre: '',
    chapters: []
};

// Fungsi untuk memanggil backend aman kita
async function fetchNewChapterFromBackend(prompt) {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server Error: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        return data.newChapterText;
    } catch (error) {
        console.error("Gagal mengambil data dari backend:", error);
        alert("Terjadi kesalahan saat menghubungi server AI. Cek konsol untuk detail. Error: " + error.message);
        return null;
    }
}

// Fungsi utama untuk membuat bab baru
async function generateNextChapter() {
    if (!novelTitleEl.value || !novelSynopsisEl.value || !novelGenreEl.value) {
        alert("Mohon isi Judul, Sinopsis, dan Genre terlebih dahulu.");
        return;
    }

    loader.style.display = 'flex';
    generateBtn.disabled = true;
    generateBtn.textContent = 'AI Sedang Bekerja...';

    const currentChapterNumber = novel.chapters.length + 1;
    
    // Susun prompt untuk AI
    let prompt = `Anda adalah seorang penulis novel profesional bernama Nabila Ahmad. Tugas Anda adalah menulis bab novel yang menarik, koheren, dan profesional.
    
Judul Novel: "${novel.title}"
Sinopsis Global: "${novel.synopsis}"
Genre dan Gaya Penulisan: "${novel.genre}"

Tugas Spesifik Saat Ini: Tuliskan **Bab ${currentChapterNumber}** dari novel ini.
Panjang Bab: Sekitar **2000 kata**.
`;

    if (novel.chapters.length > 0) {
        const previousChaptersText = novel.chapters.map((ch, index) => `--- AWAL BAB ${index + 1} ---\n\n${ch}\n\n--- AKHIR BAB ${index + 1} ---`).join('\n\n');
        prompt += `Berikut adalah isi novel sejauh ini untuk menjadi konteks Anda:\n\n${previousChaptersText}\n\nLanjutkan cerita dari akhir Bab ${novel.chapters.length} dengan logis dan menarik. Pastikan Anda menjaga konsistensi karakter, plot, dan suasana.`;
    } else {
        prompt += `Ini adalah bab pertama. Mulailah cerita berdasarkan sinopsis dan genre yang diberikan. Buat pembukaan yang memikat pembaca.`;
    }
    
    prompt += `\n\nSilakan tulis hanya teks narasi untuk Bab ${currentChapterNumber}. Jangan tambahkan judul "Bab ${currentChapterNumber}" di dalam respons Anda, karena itu akan ditambahkan secara otomatis. Fokus pada penceritaan yang kaya dan detail.`;

    // Panggil backend kita, bukan Google langsung
    const newChapterText = await fetchNewChapterFromBackend(prompt);

    if (newChapterText) {
        novel.chapters.push(newChapterText);
        renderNovel();
        saveNovelToLocalStorage();
    }

    loader.style.display = 'none';
    generateBtn.disabled = false;
    generateBtn.textContent = 'Buat Bab Selanjutnya';
}

// Fungsi render dan localStorage (tidak ada perubahan)
function renderNovel() {
    novelContentEl.innerHTML = '';
    novel.chapters.forEach((chapterText, index) => {
        const chapterDiv = document.createElement('div');
        chapterDiv.className = 'chapter';
        const chapterTitle = document.createElement('h2');
        chapterTitle.textContent = `Bab ${index + 1}`;
        const chapterContent = document.createElement('p');
        chapterContent.textContent = chapterText;
        chapterDiv.appendChild(chapterTitle);
        chapterDiv.appendChild(chapterContent);
        novelContentEl.appendChild(chapterDiv);
    });
    novelContentEl.parentElement.scrollTop = novelContentEl.parentElement.scrollHeight;
}

function saveNovelToLocalStorage() {
    novel.title = novelTitleEl.value;
    novel.synopsis = novelSynopsisEl.value;
    novel.genre = novelGenreEl.value;
    localStorage.setItem('nabilaAhmadNovel', JSON.stringify(novel));
}

function loadNovelFromLocalStorage() {
    const savedNovel = localStorage.getItem('nabilaAhmadNovel');
    if (savedNovel) {
        novel = JSON.parse(savedNovel);
        novelTitleEl.value = novel.title;
        novelSynopsisEl.value = novel.synopsis;
        novelGenreEl.value = novel.genre;
        renderNovel();
    }
}

generateBtn.addEventListener('click', generateNextChapter);
novelTitleEl.addEventListener('input', saveNovelToLocalStorage);
novelSynopsisEl.addEventListener('input', saveNovelToLocalStorage);
novelGenreEl.addEventListener('input', saveNovelToLocalStorage);
window.addEventListener('load', loadNovelFromLocalStorage);
