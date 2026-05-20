function initDeck() {
    const fileInput = document.getElementById('deckFile');
    const urlInput = document.getElementById('deckUrl');
    const urlBtn = document.getElementById('deckUrlBtn');
    const placeholder = document.getElementById('deckPlaceholder');
    const viewer = document.getElementById('deckViewer');
    const reset = document.getElementById('deckReset');

    if (!fileInput) return;

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
        showDeck(url);
    });

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') urlBtn.click();
    });

    reset.addEventListener('click', () => {
        viewer.innerHTML = '';
        viewer.classList.remove('active');
        placeholder.style.display = 'flex';
        reset.style.display = 'none';
        fileInput.value = '';
        urlInput.value = '';
    });
}

document.addEventListener('DOMContentLoaded', initDeck);
