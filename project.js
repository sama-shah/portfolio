// ── Cover image ──────────────────────────────────────────────────────────────

function initCover() {
    const container = document.getElementById('projectCover');
    if (!container) return;

    const storageKey = 'cover_' + window.location.pathname;
    const saved = localStorage.getItem(storageKey);

    function render(src) {
        if (src) {
            container.innerHTML = `
                <img class="cover-img" src="${src}" alt="Project cover">
                <button class="cover-change-btn" onclick="clearCover()">Change image</button>
            `;
        } else {
            container.innerHTML = `
                <div class="cover-empty">
                    <label class="cover-add-label">
                        <input type="file" accept="image/*" id="coverFile">
                        + Add cover image
                    </label>
                    <span class="cover-or">or paste a URL</span>
                    <div class="cover-url-row">
                        <input type="text" class="cover-url-input" placeholder="https://..." id="coverUrlInput">
                        <button class="cover-url-btn" id="coverUrlBtn">Set</button>
                    </div>
                </div>
            `;

            document.getElementById('coverFile').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    localStorage.setItem(storageKey, ev.target.result);
                    render(ev.target.result);
                };
                reader.readAsDataURL(file);
            });

            const urlInput = document.getElementById('coverUrlInput');
            const urlBtn = document.getElementById('coverUrlBtn');

            urlBtn.addEventListener('click', () => {
                const url = urlInput.value.trim();
                if (!url) return;
                localStorage.setItem(storageKey, url);
                render(url);
            });

            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') urlBtn.click();
            });
        }
    }

    window.clearCover = function() {
        localStorage.removeItem(storageKey);
        render(null);
    };

    render(saved);
}

// ── Pitch deck ────────────────────────────────────────────────────────────────

function initDeck() {
    const fileInput = document.getElementById('deckFile');
    const urlInput = document.getElementById('deckUrl');
    const urlBtn = document.getElementById('deckUrlBtn');
    const placeholder = document.getElementById('deckPlaceholder');
    const viewer = document.getElementById('deckViewer');
    const reset = document.getElementById('deckReset');

    if (!fileInput) return;

    const deckKey = 'deck_' + window.location.pathname;
    const savedDeck = localStorage.getItem(deckKey);
    if (savedDeck) showDeck(savedDeck);

    function showDeck(src) {
        placeholder.style.display = 'none';
        viewer.innerHTML = `<iframe src="${src}" allowfullscreen></iframe>`;
        viewer.classList.add('active');
        reset.style.display = 'block';
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) showDeck(URL.createObjectURL(file));
    });

    urlBtn.addEventListener('click', () => {
        let url = urlInput.value.trim();
        if (!url) return;
        if (url.includes('docs.google.com/presentation')) {
            url = url.split('/edit')[0].split('/pub')[0] + '/embed';
        }
        localStorage.setItem(deckKey, url);
        showDeck(url);
    });

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') urlBtn.click();
    });

    reset.addEventListener('click', () => {
        localStorage.removeItem(deckKey);
        viewer.innerHTML = '';
        viewer.classList.remove('active');
        placeholder.style.display = 'flex';
        reset.style.display = 'none';
        fileInput.value = '';
        urlInput.value = '';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCover();
    initDeck();
});
