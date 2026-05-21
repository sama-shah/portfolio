// PDF.js page-by-page renderer
// Usage: <div class="pdf-viewer" data-src="../assets/pdfs/your-file.pdf"></div>

(function () {
    const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    const WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const containers = document.querySelectorAll('.pdf-viewer[data-src]');
    if (!containers.length) return;

    const script = document.createElement('script');
    script.src = PDFJS_CDN;
    script.onload = () => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_CDN;
        containers.forEach(renderPDF);
    };
    document.head.appendChild(script);

    async function renderPDF(container) {
        const src = container.dataset.src;
        container.innerHTML = '<p class="pdf-loading">Loading…</p>';

        try {
            const pdf = await pdfjsLib.getDocument(src).promise;
            container.innerHTML = '';

            for (let n = 1; n <= pdf.numPages; n++) {
                const page     = await pdf.getPage(n);
                const scale    = (container.clientWidth || 700) / page.getViewport({ scale: 1 }).width;
                const viewport = page.getViewport({ scale: scale * devicePixelRatio });

                const canvas        = document.createElement('canvas');
                canvas.className    = 'pdf-page';
                canvas.width        = viewport.width;
                canvas.height       = viewport.height;
                canvas.style.width  = '100%';

                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                container.appendChild(canvas);
            }
        } catch (err) {
            container.innerHTML = '<p class="pdf-error">Could not load PDF.</p>';
            console.error('[pdf-viewer]', err);
        }
    }
})();
