// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
    reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        const revealPoint = 150;

        if (elementTop < windowHeight - revealPoint) {
            el.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Edit Mode Functionality
// SHA-256 hash of the password
const PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
let editMode = false;

// Hash function for password verification
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
let selectedElement = null;
let dragElement = null;
let dragOffset = { x: 0, y: 0 };
let rotateElement = null;
let rotateStartAngle = 0;
let currentRotation = 0;
let resizeElement = null;
let resizeStartWidth = 0;
let resizeStartX = 0;

// Arrow path definitions
const arrowPaths = {
    curved: 'M 10 50 Q 50 10, 90 50',
    straight: 'M 10 50 L 90 50',
    loopy: 'M 10 50 Q 30 10, 50 50 T 90 50'
};

const projectsSection = document.getElementById('projects');
const editToolbar = document.getElementById('editToolbar');
const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');

// Press 'E' to open password modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'E') {
        if (!editMode) {
            passwordModal.classList.add('active');
            passwordInput.focus();
        }
    }
});

// Password modal handlers
document.getElementById('passwordSubmit').addEventListener('click', async () => {
    const inputHash = await hashPassword(passwordInput.value);
    if (inputHash === PASSWORD_HASH) {
        enterEditMode();
        passwordModal.classList.remove('active');
        passwordInput.value = '';
    } else {
        alert('Incorrect password');
        passwordInput.value = '';
    }
});

document.getElementById('passwordCancel').addEventListener('click', () => {
    passwordModal.classList.remove('active');
    passwordInput.value = '';
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('passwordSubmit').click();
    }
});

// Enter edit mode
function enterEditMode() {
    editMode = true;
    editToolbar.classList.add('active');
    loadElements();
}

// Exit edit mode
function exitEditMode() {
    editMode = false;
    editToolbar.classList.remove('active');
    saveElements();
    // Remove all selection and handles
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.rotate-handle, .delete-handle, .resize-handle').forEach(el => el.remove());
    // Remove all control panels from body
    document.querySelectorAll('.control-panel').forEach(panel => panel.remove());
}

// Save & Exit button
document.getElementById('saveExit').addEventListener('click', () => {
    exitEditMode();
});

// Add Polaroid
document.getElementById('addPolaroid').addEventListener('click', () => {
    const polaroid = createPolaroid(100, 100, 0, '');
    projectsSection.appendChild(polaroid);
    selectElement(polaroid);
});

// Add Arrow
document.getElementById('addArrow').addEventListener('click', () => {
    const arrow = createArrow(200, 200, 45, 'curved', 'coral', false, false, 150);
    projectsSection.appendChild(arrow);
    selectElement(arrow);
});

// Add Line
document.getElementById('addLine').addEventListener('click', () => {
    const line = createLine(250, 250, 0, 'straight', 'coral', false, false, 150);
    projectsSection.appendChild(line);
    selectElement(line);
});

// Add Text
document.getElementById('addText').addEventListener('click', () => {
    const text = createText(300, 150, 0, 'Double-click to edit', 'coral', 1.2);
    projectsSection.appendChild(text);
    selectElement(text);
});

// Create Polaroid element
function createPolaroid(x, y, rotation, caption, imageData, linkUrl = '') {
    const polaroid = document.createElement('div');
    polaroid.className = 'polaroid';
    polaroid.style.left = x + 'px';
    polaroid.style.top = y + 'px';
    polaroid.style.transform = `rotate(${rotation}deg)`;
    polaroid.dataset.rotation = rotation;
    polaroid.dataset.linkUrl = linkUrl;

    const imageDiv = document.createElement('div');
    imageDiv.className = 'polaroid-image';

    if (imageData) {
        const img = document.createElement('img');
        img.src = imageData;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        imageDiv.appendChild(img);
    } else {
        imageDiv.textContent = 'Click to add image';
        imageDiv.style.cursor = 'pointer';
    }

    const captionDiv = document.createElement('div');
    captionDiv.className = 'polaroid-caption';
    captionDiv.contentEditable = 'true';
    captionDiv.textContent = caption;

    polaroid.appendChild(imageDiv);
    polaroid.appendChild(captionDiv);

    // Add click handler for image upload
    imageDiv.addEventListener('click', (e) => {
        if (!editMode) return;
        e.stopPropagation();

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    imageDiv.innerHTML = '';
                    imageDiv.appendChild(img);
                    imageDiv.style.cursor = 'default';
                    polaroid.dataset.imageData = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    // Add click handler for navigation (when not in edit mode)
    polaroid.addEventListener('click', (e) => {
        if (editMode) return;
        if (polaroid.dataset.linkUrl && polaroid.dataset.linkUrl.trim() !== '') {
            window.open(polaroid.dataset.linkUrl, '_blank');
        }
    });

    addDragListeners(polaroid);
    return polaroid;
}

// Create Arrow element
function createArrow(x, y, rotation, style = 'curved', color = 'coral', flipH = false, flipV = false, width = 150) {
    const arrow = document.createElement('div');
    arrow.className = 'arrow-element';
    arrow.style.left = x + 'px';
    arrow.style.top = y + 'px';
    arrow.style.width = width + 'px';
    arrow.style.transform = `rotate(${rotation}deg)`;
    arrow.dataset.rotation = rotation;
    arrow.dataset.style = style;
    arrow.dataset.color = color;
    arrow.dataset.flipH = flipH;
    arrow.dataset.flipV = flipV;

    updateArrowSVG(arrow);
    addDragListeners(arrow);
    return arrow;
}

// Update arrow SVG based on settings
function updateArrowSVG(arrow) {
    const style = arrow.dataset.style || 'curved';
    const color = arrow.dataset.color || 'coral';
    const flipH = arrow.dataset.flipH === 'true';
    const flipV = arrow.dataset.flipV === 'true';

    let colorValue;
    if (color === 'coral') {
        colorValue = getComputedStyle(document.documentElement).getPropertyValue('--coral');
    } else if (color === 'cream') {
        colorValue = getComputedStyle(document.documentElement).getPropertyValue('--cream');
    } else {
        colorValue = getComputedStyle(document.documentElement).getPropertyValue('--navy');
    }

    const uniqueId = Date.now() + Math.random();
    let scaleX = flipH ? -1 : 1;
    let scaleY = flipV ? -1 : 1;

    arrow.innerHTML = `
        <svg class="arrow-svg" viewBox="0 0 100 100" style="transform: scale(${scaleX}, ${scaleY})">
            <defs>
                <marker id="arrowhead-${uniqueId}" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="${colorValue}" />
                </marker>
            </defs>
            <path d="${arrowPaths[style]}" stroke="${colorValue}" stroke-width="2" fill="none" marker-end="url(#arrowhead-${uniqueId})" />
        </svg>
    `;
}

// Create Line element
function createLine(x, y, rotation, style = 'straight', color = 'coral', flipH = false, flipV = false, width = 150) {
    const line = document.createElement('div');
    line.className = 'line-element';
    line.style.left = x + 'px';
    line.style.top = y + 'px';
    line.style.width = width + 'px';
    line.style.transform = `rotate(${rotation}deg)`;
    line.dataset.rotation = rotation;
    line.dataset.style = style;
    line.dataset.color = color;
    line.dataset.flipH = flipH;
    line.dataset.flipV = flipV;

    updateLineSVG(line);
    addDragListeners(line);
    return line;
}

// Update line SVG based on settings
function updateLineSVG(line) {
    const style = line.dataset.style || 'straight';
    const color = line.dataset.color || 'coral';
    const flipH = line.dataset.flipH === 'true';
    const flipV = line.dataset.flipV === 'true';

    let colorValue;
    if (color === 'coral') {
        colorValue = getComputedStyle(document.documentElement).getPropertyValue('--coral');
    } else if (color === 'cream') {
        colorValue = getComputedStyle(document.documentElement).getPropertyValue('--cream');
    } else {
        colorValue = getComputedStyle(document.documentElement).getPropertyValue('--navy');
    }

    let scaleX = flipH ? -1 : 1;
    let scaleY = flipV ? -1 : 1;

    line.innerHTML = `
        <svg class="line-svg" viewBox="0 0 100 100" style="transform: scale(${scaleX}, ${scaleY})">
            <path d="${arrowPaths[style]}" stroke="${colorValue}" stroke-width="2" fill="none" />
        </svg>
    `;
}

// Create Text element
function createText(x, y, rotation, content, color = 'coral', fontSize = 1.2) {
    const text = document.createElement('div');
    text.className = 'text-element';
    text.style.left = x + 'px';
    text.style.top = y + 'px';
    text.style.transform = `rotate(${rotation}deg)`;
    text.dataset.rotation = rotation;
    text.dataset.color = color;
    text.dataset.fontSize = fontSize;
    text.style.fontSize = fontSize + 'rem';
    text.contentEditable = 'true';
    text.textContent = content;

    let colorValue;
    if (color === 'coral') {
        colorValue = getComputedStyle(document.documentElement).getPropertyValue('--coral');
    } else if (color === 'cream') {
        colorValue = getComputedStyle(document.documentElement).getPropertyValue('--cream');
    } else {
        colorValue = getComputedStyle(document.documentElement).getPropertyValue('--navy');
    }
    text.style.color = colorValue;

    addDragListeners(text);
    return text;
}

// Add drag listeners to element
function addDragListeners(element) {
    element.addEventListener('mousedown', (e) => {
        if (!editMode) return;
        if (e.target.classList.contains('rotate-handle')) return;
        if (e.target.classList.contains('delete-handle')) return;
        if (e.target.contentEditable === 'true' && e.detail === 2) return; // Double-click to edit

        e.preventDefault();
        selectElement(element);

        dragElement = element;
        const rect = element.getBoundingClientRect();
        const parentRect = projectsSection.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
    });
}

// Select element
function selectElement(element) {
    if (!editMode) return;

    // Deselect previous
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        const oldHandles = selectedElement.querySelectorAll('.rotate-handle, .delete-handle, .resize-handle');
        oldHandles.forEach(h => h.remove());

        // Remove control panel from body if it exists
        if (selectedElement.dataset.controlPanelId) {
            const panel = document.querySelector(`[data-element-id="${selectedElement.dataset.controlPanelId}"]`);
            if (panel) panel.remove();
        }
    }

    selectedElement = element;
    element.classList.add('selected');

    // Add rotate handle
    const rotateHandle = document.createElement('div');
    rotateHandle.className = 'rotate-handle';
    rotateHandle.addEventListener('mousedown', startRotate);
    element.appendChild(rotateHandle);

    // Add delete handle
    const deleteHandle = document.createElement('div');
    deleteHandle.className = 'delete-handle';
    deleteHandle.textContent = '×';
    deleteHandle.addEventListener('click', () => {
        // Remove control panel if it exists
        if (element.dataset.controlPanelId) {
            const panel = document.querySelector(`[data-element-id="${element.dataset.controlPanelId}"]`);
            if (panel) panel.remove();
        }
        element.remove();
        selectedElement = null;
    });
    element.appendChild(deleteHandle);

    // Add control panel for polaroids
    if (element.classList.contains('polaroid')) {
        const controlPanel = createPolaroidControlPanel(element);
        controlPanel.dataset.elementId = 'control-' + Date.now();
        element.dataset.controlPanelId = controlPanel.dataset.elementId;
        document.body.appendChild(controlPanel);
    }

    // Add resize handle for arrows
    if (element.classList.contains('arrow-element')) {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.addEventListener('mousedown', startResize);
        element.appendChild(resizeHandle);

        // Add control panel for arrows
        const controlPanel = createArrowControlPanel(element);
        controlPanel.dataset.elementId = 'control-' + Date.now();
        element.dataset.controlPanelId = controlPanel.dataset.elementId;
        document.body.appendChild(controlPanel);
    }

    // Add resize handle for lines
    if (element.classList.contains('line-element')) {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.addEventListener('mousedown', startResize);
        element.appendChild(resizeHandle);

        // Add control panel for lines
        const controlPanel = createLineControlPanel(element);
        controlPanel.dataset.elementId = 'control-' + Date.now();
        element.dataset.controlPanelId = controlPanel.dataset.elementId;
        document.body.appendChild(controlPanel);
    }

    // Add control panel for text
    if (element.classList.contains('text-element')) {
        const controlPanel = createTextControlPanel(element);
        controlPanel.dataset.elementId = 'control-' + Date.now();
        element.dataset.controlPanelId = controlPanel.dataset.elementId;
        document.body.appendChild(controlPanel);
    }
}

// Create polaroid control panel
function createPolaroidControlPanel(polaroid) {
    const panel = document.createElement('div');
    panel.className = 'control-panel';

    // Position panel above the polaroid using fixed positioning
    const rect = polaroid.getBoundingClientRect();
    panel.style.top = (rect.top - 80) + 'px';
    panel.style.left = rect.left + 'px';

    const linkLabel = document.createElement('div');
    linkLabel.textContent = 'Link URL:';
    linkLabel.style.color = 'var(--coral)';
    linkLabel.style.fontSize = '0.8rem';
    linkLabel.style.marginBottom = '0.25rem';

    const linkInput = document.createElement('input');
    linkInput.type = 'text';
    linkInput.placeholder = 'https://example.com';
    linkInput.value = polaroid.dataset.linkUrl || '';
    linkInput.style.padding = '0.5rem';
    linkInput.style.background = 'var(--navy)';
    linkInput.style.color = 'var(--cream)';
    linkInput.style.border = '1px solid var(--coral)';
    linkInput.style.borderRadius = '4px';
    linkInput.style.fontFamily = 'Familjen Grotesk, sans-serif';
    linkInput.style.fontSize = '0.8rem';
    linkInput.style.width = '100%';

    linkInput.addEventListener('input', (e) => {
        e.stopPropagation();
        polaroid.dataset.linkUrl = linkInput.value;
    });

    linkInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    panel.appendChild(linkLabel);
    panel.appendChild(linkInput);
    return panel;
}

// Create arrow control panel
function createArrowControlPanel(arrow) {
    const panel = document.createElement('div');
    panel.className = 'control-panel';

    // Position panel above the arrow using fixed positioning
    const rect = arrow.getBoundingClientRect();
    panel.style.top = (rect.top - 135) + 'px';
    panel.style.left = rect.left + 'px';

    const styleSelect = document.createElement('select');
    styleSelect.innerHTML = `
        <option value="curved" ${arrow.dataset.style === 'curved' ? 'selected' : ''}>Curved</option>
        <option value="straight" ${arrow.dataset.style === 'straight' ? 'selected' : ''}>Straight</option>
        <option value="loopy" ${arrow.dataset.style === 'loopy' ? 'selected' : ''}>Loopy</option>
    `;
    styleSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        arrow.dataset.style = styleSelect.value;
        updateArrowSVG(arrow);
    });

    const colorSelect = document.createElement('select');
    colorSelect.innerHTML = `
        <option value="coral" ${arrow.dataset.color === 'coral' ? 'selected' : ''}>Orange</option>
        <option value="cream" ${arrow.dataset.color === 'cream' ? 'selected' : ''}>White</option>
        <option value="navy" ${arrow.dataset.color === 'navy' ? 'selected' : ''}>Dark Gray</option>
    `;
    colorSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        arrow.dataset.color = colorSelect.value;
        updateArrowSVG(arrow);
    });

    const flipHBtn = document.createElement('button');
    flipHBtn.textContent = 'Flip Horizontal';
    flipHBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        arrow.dataset.flipH = arrow.dataset.flipH === 'true' ? 'false' : 'true';
        updateArrowSVG(arrow);
    });

    const flipVBtn = document.createElement('button');
    flipVBtn.textContent = 'Flip Vertical';
    flipVBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        arrow.dataset.flipV = arrow.dataset.flipV === 'true' ? 'false' : 'true';
        updateArrowSVG(arrow);
    });

    panel.appendChild(styleSelect);
    panel.appendChild(colorSelect);
    panel.appendChild(flipHBtn);
    panel.appendChild(flipVBtn);
    return panel;
}

// Create line control panel
function createLineControlPanel(line) {
    const panel = document.createElement('div');
    panel.className = 'control-panel';

    // Position panel above the line using fixed positioning
    const rect = line.getBoundingClientRect();
    panel.style.top = (rect.top - 135) + 'px';
    panel.style.left = rect.left + 'px';

    const styleSelect = document.createElement('select');
    styleSelect.innerHTML = `
        <option value="curved" ${line.dataset.style === 'curved' ? 'selected' : ''}>Curved</option>
        <option value="straight" ${line.dataset.style === 'straight' ? 'selected' : ''}>Straight</option>
        <option value="loopy" ${line.dataset.style === 'loopy' ? 'selected' : ''}>Loopy</option>
    `;
    styleSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        line.dataset.style = styleSelect.value;
        updateLineSVG(line);
    });

    const colorSelect = document.createElement('select');
    colorSelect.innerHTML = `
        <option value="coral" ${line.dataset.color === 'coral' ? 'selected' : ''}>Orange</option>
        <option value="cream" ${line.dataset.color === 'cream' ? 'selected' : ''}>White</option>
        <option value="navy" ${line.dataset.color === 'navy' ? 'selected' : ''}>Dark Gray</option>
    `;
    colorSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        line.dataset.color = colorSelect.value;
        updateLineSVG(line);
    });

    const flipHBtn = document.createElement('button');
    flipHBtn.textContent = 'Flip Horizontal';
    flipHBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        line.dataset.flipH = line.dataset.flipH === 'true' ? 'false' : 'true';
        updateLineSVG(line);
    });

    const flipVBtn = document.createElement('button');
    flipVBtn.textContent = 'Flip Vertical';
    flipVBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        line.dataset.flipV = line.dataset.flipV === 'true' ? 'false' : 'true';
        updateLineSVG(line);
    });

    panel.appendChild(styleSelect);
    panel.appendChild(colorSelect);
    panel.appendChild(flipHBtn);
    panel.appendChild(flipVBtn);
    return panel;
}

// Create text control panel
function createTextControlPanel(text) {
    const panel = document.createElement('div');
    panel.className = 'control-panel';

    // Position panel above the text using fixed positioning
    const rect = text.getBoundingClientRect();
    panel.style.top = (rect.top - 100) + 'px';
    panel.style.left = rect.left + 'px';

    const colorSelect = document.createElement('select');
    colorSelect.innerHTML = `
        <option value="coral" ${text.dataset.color === 'coral' ? 'selected' : ''}>Orange</option>
        <option value="cream" ${text.dataset.color === 'cream' ? 'selected' : ''}>White</option>
        <option value="navy" ${text.dataset.color === 'navy' ? 'selected' : ''}>Dark Gray</option>
    `;
    colorSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        text.dataset.color = colorSelect.value;
        let colorValue;
        if (colorSelect.value === 'coral') {
            colorValue = getComputedStyle(document.documentElement).getPropertyValue('--coral');
        } else if (colorSelect.value === 'cream') {
            colorValue = getComputedStyle(document.documentElement).getPropertyValue('--cream');
        } else {
            colorValue = getComputedStyle(document.documentElement).getPropertyValue('--navy');
        }
        text.style.color = colorValue;
    });

    const fontSizeSelect = document.createElement('select');
    const currentFontSize = text.dataset.fontSize || '1.2';
    fontSizeSelect.innerHTML = `
        <option value="0.8" ${currentFontSize === '0.8' ? 'selected' : ''}>Small</option>
        <option value="1.2" ${currentFontSize === '1.2' ? 'selected' : ''}>Medium</option>
        <option value="1.6" ${currentFontSize === '1.6' ? 'selected' : ''}>Large</option>
        <option value="2.0" ${currentFontSize === '2.0' ? 'selected' : ''}>X-Large</option>
        <option value="3.0" ${currentFontSize === '3.0' ? 'selected' : ''}>XX-Large</option>
    `;
    fontSizeSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        text.dataset.fontSize = fontSizeSelect.value;
        text.style.fontSize = fontSizeSelect.value + 'rem';
    });

    panel.appendChild(colorSelect);
    panel.appendChild(fontSizeSelect);
    return panel;
}

// Start resize
function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    resizeElement = selectedElement;
    resizeStartWidth = parseInt(resizeElement.style.width);
    resizeStartX = e.clientX;
}

// Mouse move for dragging
document.addEventListener('mousemove', (e) => {
    if (dragElement && editMode) {
        const parentRect = projectsSection.getBoundingClientRect();
        const x = e.clientX - parentRect.left - dragOffset.x;
        const y = e.clientY - parentRect.top - dragOffset.y;

        dragElement.style.left = x + 'px';
        dragElement.style.top = y + 'px';
    }

    if (rotateElement && editMode) {
        const rect = rotateElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI) + 90;
        rotateElement.style.transform = `rotate(${angle}deg)`;
        rotateElement.dataset.rotation = angle;
    }

    if (resizeElement && editMode) {
        const deltaX = e.clientX - resizeStartX;
        const newWidth = Math.max(50, resizeStartWidth + deltaX);
        resizeElement.style.width = newWidth + 'px';
    }
});

// Mouse up to stop dragging/rotating/resizing
document.addEventListener('mouseup', () => {
    dragElement = null;
    rotateElement = null;
    resizeElement = null;
});

// Start rotation
function startRotate(e) {
    e.preventDefault();
    e.stopPropagation();
    rotateElement = selectedElement;
}

// Save elements to localStorage
function saveElements() {
    const elements = [];

    projectsSection.querySelectorAll('.polaroid, .arrow-element, .line-element, .text-element').forEach(el => {
        const data = {
            type: el.classList.contains('polaroid') ? 'polaroid' :
                  el.classList.contains('arrow-element') ? 'arrow' :
                  el.classList.contains('line-element') ? 'line' : 'text',
            x: parseInt(el.style.left),
            y: parseInt(el.style.top),
            rotation: parseFloat(el.dataset.rotation || 0),
        };

        if (data.type === 'polaroid') {
            data.caption = el.querySelector('.polaroid-caption').textContent;
            data.imageData = el.dataset.imageData || null;
            data.linkUrl = el.dataset.linkUrl || '';
        } else if (data.type === 'arrow') {
            data.style = el.dataset.style || 'curved';
            data.color = el.dataset.color || 'coral';
            data.flipH = el.dataset.flipH === 'true';
            data.flipV = el.dataset.flipV === 'true';
            data.width = parseInt(el.style.width) || 150;
        } else if (data.type === 'line') {
            data.style = el.dataset.style || 'straight';
            data.color = el.dataset.color || 'coral';
            data.flipH = el.dataset.flipH === 'true';
            data.flipV = el.dataset.flipV === 'true';
            data.width = parseInt(el.style.width) || 150;
        } else if (data.type === 'text') {
            data.content = el.textContent;
            data.color = el.dataset.color || 'coral';
            data.fontSize = parseFloat(el.dataset.fontSize) || 1.2;
        }

        elements.push(data);
    });

    localStorage.setItem('portfolioElements', JSON.stringify(elements));
}

// Load elements from localStorage
function loadElements() {
    const saved = localStorage.getItem('portfolioElements');
    if (!saved) return;

    // Clear existing elements
    projectsSection.querySelectorAll('.polaroid, .arrow-element, .line-element, .text-element').forEach(el => el.remove());

    const elements = JSON.parse(saved);
    elements.forEach(data => {
        let element;
        if (data.type === 'polaroid') {
            element = createPolaroid(data.x, data.y, data.rotation, data.caption || '', data.imageData, data.linkUrl || '');
        } else if (data.type === 'arrow') {
            element = createArrow(
                data.x,
                data.y,
                data.rotation,
                data.style || 'curved',
                data.color || 'coral',
                data.flipH || false,
                data.flipV || false,
                data.width || 150
            );
        } else if (data.type === 'line') {
            element = createLine(
                data.x,
                data.y,
                data.rotation,
                data.style || 'straight',
                data.color || 'coral',
                data.flipH || false,
                data.flipV || false,
                data.width || 150
            );
        } else if (data.type === 'text') {
            element = createText(data.x, data.y, data.rotation, data.content || 'Text', data.color || 'coral', data.fontSize || 1.2);
        }
        if (element) {
            projectsSection.appendChild(element);
        }
    });
}

// ============================================
// Venn Section
// ============================================
(function () {
    // ---- Project data — exclusive per region (true Venn logic) ----
    const REGION_PROJECTS = {
        design:   [],
        tech:     [],
        business: [],
        dt: [
            { title: "Designed a Lab Rats-inspired potion bottle", cat: "Product Design",    href: "projects/potion-bottle.html",   bg: "#8B5A35", fg: "#faf8f5", role: "Solo Designer",        company: "Personal", date: "2023" },
            { title: "I developed a VR game",                      cat: "Game Design",       href: "projects/vr-game.html",         bg: "#DDD0B0", fg: "#1a1a1a", role: "Developer & Designer", company: "USC",      date: "2025" },
            { title: "I welded spoons and forks into a dishwasher man", cat: "Fabrication", href: "projects/cutlery-sponge.html", bg: "#8B5A35", fg: "#faf8f5", role: "Fabricator", company: "USC", date: "2024" },
            { title: "I made an LED lamp",                         cat: "Fabrication",       href: "projects/led-lamp.html",        bg: "#8B5A35", fg: "#faf8f5", role: "Fabricator",           company: "USC",      date: "2024" },
            { title: "A functional candy dispenser",               cat: "Engineering",       href: "projects/candy-dispenser.html", bg: "#8B5A35", fg: "#faf8f5", role: "Engineer & Designer",  company: "USC",      date: "2020" },
        ],
        db: [
            { title: "I redesigned a ski resort",                         cat: "Creative Sprint", href: "projects/ski-resort.html",         bg: "#DDD0B0", fg: "#1a1a1a", role: "Designer",           company: "USC", date: "2025" },
            { title: "I built a leash for your skateboard",               cat: "Creative Sprint", href: "projects/chindogu.html",          bg: "#DDD0B0", fg: "#1a1a1a", role: "Designer & Builder", company: "USC", date: "2023" },
            { title: "Designed seating for individuals with herniated disk", cat: "Creative Sprint", href: "projects/inclusive-seating.html", bg: "#DDD0B0", fg: "#1a1a1a", role: "Inclusive Designer", company: "USC", date: "2023" },
            { title: "Reinventing what hearing aids are not solving",        cat: "Creative Sprint", href: "projects/mismatch-hearing.html",   bg: "#DDD0B0", fg: "#1a1a1a", role: "Designer",          company: "USC", date: "2023" },
            { title: "Marketing plan for will.i.am's FYI",                cat: "Industry",        href: "projects/fyi.html",       bg: "#C96832", fg: "#1a1a1a", role: "Strategist",         company: "FYI",        date: "2022" },
            { title: "American Heart Association CPR training campaign",  cat: "Industry",  href: "projects/aha-cpr.html",  bg: "#C96832", fg: "#1a1a1a", role: "Strategist", company: "AHA", date: "2024" },
            { title: "Designed the Howmet Material Science Lab",    cat: "Lab Design",     href: "projects/howmet-lab.html",      bg: "#C96832", fg: "#1a1a1a", role: "Design Lead",       company: "Howmet Aerospace", date: "2024" },
            { title: "A tea house retirement home",                 cat: "Architecture",   href: "projects/teahouse.html",        bg: "#DDD0B0", fg: "#1a1a1a", role: "Architect",         company: "USC",              date: "2025" },
            { title: "Designing a home away from home",             cat: "Interior",       href: "projects/home-away.html",       bg: "#DDD0B0", fg: "#1a1a1a", role: "Interior Designer", company: "USC",              date: "2025" },
            { title: "Design an amusement park — 42-person effort", cat: "Large-Scale",    href: "projects/amusement-park.html",  bg: "#DDD0B0", fg: "#1a1a1a", role: "Team Lead",         company: "USC",              date: "2022" },
            { title: "If hair could be recycled into soap bottles",  cat: "Sustainability", href: "projects/hair-soap.html",       bg: "#DDD0B0", fg: "#1a1a1a", role: "Concept Designer",  company: "USC",              date: "2022" },
        ],
        tb: [
            { title: "Digital wardrobe",           cat: "Product",    href: "projects/digital-wardrobe.html",   bg: "#DDD0B0", fg: "#1a1a1a", role: "Product Designer",     company: "Personal", date: "2023" },
            { title: "Algorave digital sequencer", cat: "Music Tech", href: "projects/algorave-sequencer.html", bg: "#DDD0B0", fg: "#1a1a1a", role: "Designer & Developer", company: "Personal", date: "2026" },
            { title: "This portfolio website",     cat: "Web",        href: "index.html",                       bg: "#C96832", fg: "#1a1a1a", role: "Designer & Developer", company: "Personal", date: "2026" },
        ],
        dtb: [
            { title: "The first smart jewelry for women going through menopause",  cat: "Femtech",           href: "projects/romi.html",               bg: "#C96832", fg: "#1a1a1a", role: "Founder & Designer",  company: "Romi",              date: "2025–Present" },
            { title: "Visualized Oura Ring data for doctor-patient communication", cat: "Health Tech",       href: "projects/oura-ring.html",          bg: "#C96832", fg: "#1a1a1a", role: "UX Designer",         company: "USC / Oura",        date: "2024" },
            { title: "Designed in-flight entertainment for commercial airlines",   cat: "UX Design",         href: "projects/thales-ife.html",          bg: "#C96832", fg: "#1a1a1a", role: "UX Designer",         company: "Thales",            date: "2024" },
            { title: "Redesigned signage in downtown LA",                          cat: "Urban Design",      href: "projects/arup-signage.html",        bg: "#C96832", fg: "#1a1a1a", role: "Urban Designer",      company: "Arup",              date: "2024" },
            { title: "A convention planning software tool",                        cat: "Software",          href: "projects/convention-software.html", bg: "#DDD0B0", fg: "#1a1a1a", role: "Product Designer",    company: "Personal",          date: "2023" },
            { title: "How can we recreate and gift a memory?",                    cat: "Creative Sprint",   href: "projects/recreate-memory.html",     bg: "#DDD0B0", fg: "#1a1a1a", role: "Experience Designer", company: "USC",               date: "2024" },
            { title: "Foodie: A fridge that tracks your food expiration dates",    cat: "Product",           href: "projects/foodie.html",              bg: "#DDD0B0", fg: "#1a1a1a", role: "Product Designer",    company: "Personal",          date: "2022" },
            { title: "Designed USC HackSC's login pages",                          cat: "Industry",          href: "projects/hacksc-login.html",        bg: "#C96832", fg: "#1a1a1a", role: "UI Designer",         company: "HackSC",            date: "2023" },
            { title: "I built a rocking bench",                                    cat: "Fabrication",       href: "projects/rocking-bench.html",       bg: "#8B5A35", fg: "#faf8f5", role: "Fabricator",          company: "USC",               date: "2024" },
            { title: "I designed a shoe",                                          cat: "Industrial Design", href: "projects/shoe.html",               bg: "#8B5A35", fg: "#faf8f5", role: "Industrial Designer", company: "USC",               date: "2024" },
            { title: "I designed a speaker",                                       cat: "Industrial Design", href: "projects/speaker.html",            bg: "#8B5A35", fg: "#faf8f5", role: "Industrial Designer", company: "USC",               date: "2024" },
        ],
    };

    const REGION_LABELS = {
        design:   'Design only',
        tech:     'Technology only',
        business: 'Business only',
        dt:       'Design × Technology',
        db:       'Design × Business',
        tb:       'Technology × Business',
        dtb:      'Design × Technology × Business',
    };

    const CIRCLE_DEFS = [
        { id: 'design',   cx: 130, cy: 110, r: 110 },
        { id: 'tech',     cx: 290, cy: 110, r: 110 },
        { id: 'business', cx: 210, cy: 260, r: 110 },
    ];

    const REGION_KEY_MAP = {
        'design':               'design',
        'tech':                 'tech',
        'business':             'business',
        'design,tech':          'dt',
        'business,design':      'db',
        'business,tech':        'tb',
        'business,design,tech': 'dtb',
    };

    function getRegionAtPoint(svgX, svgY) {
        const inside = CIRCLE_DEFS
            .filter(c => (svgX - c.cx) ** 2 + (svgY - c.cy) ** 2 <= c.r ** 2)
            .map(c => c.id).sort().join(',');
        return inside ? (REGION_KEY_MAP[inside] || null) : null;
    }

    // ---- State ----
    let activeRegion = null;
    let locked       = false;
    let lockedRegion = null;

    // ---- DOM refs ----
    const vennPanel     = document.getElementById('vennPanel');
    const vennSplit     = document.getElementById('vennSplit');
    const vennSvg       = document.getElementById('vennSvg');
    const vennSplitLeft = document.querySelector('.venn-split-left');
    const vcMap = {
        design:   document.querySelector('.vc-design'),
        tech:     document.querySelector('.vc-tech'),
        business: document.querySelector('.vc-business'),
    };
    const hlMap = {};
    ['design', 'tech', 'business', 'dt', 'db', 'tb', 'dtb'].forEach(k => {
        hlMap[k] = document.getElementById('hl-' + k);
    });

    const EMPTY_HTML = '<p class="venn-panel-hint">Hover over the diagram<br>to explore projects</p>';

    // ---- Reveal / hide panel ----
    function reveal()   { if (vennSplit) vennSplit.classList.add('revealed'); }
    function unreveal() { if (vennSplit) vennSplit.classList.remove('revealed'); }

    function unlock() {
        locked = false;
        lockedRegion = null;
        setRegion(null);
        updatePanel(null);
        unreveal();
    }

    // ---- Panel content ----
    const SOLO_MSGS = {
        design:   'There is no true design without thinking about technology or business.',
        tech:     'There is no true technology without thinking about design or business.',
        business: 'There is no true business without thinking about design or technology.',
    };

    function colorCat(bg) {
        if (bg === '#C96832') return 'Industry';
        if (bg === '#8B5A35') return 'Physical Product';
        return 'Creative Sprint';
    }

    function updatePanel(region, isLocked) {
        if (!vennPanel) return;
        if (!region) { vennPanel.innerHTML = EMPTY_HTML; return; }

        if (SOLO_MSGS[region]) {
            vennPanel.innerHTML = `<p class="venn-panel-hint venn-panel-hint--quote">${SOLO_MSGS[region]}</p>`;
            return;
        }

        const projects = REGION_PROJECTS[region] || [];
        let html = `<div class="venn-panel-header">
            <span class="venn-panel-label">${REGION_LABELS[region]}</span>
            ${isLocked ? '<button class="venn-panel-unlock" id="vennUnlockBtn">&#215;</button>' : ''}
        </div><div class="venn-panel-grid">`;

        if (projects.length === 0) {
            html += `<p class="venn-panel-hint" style="margin:1.5rem 0;font-size:0.9rem;">No exclusive projects in this region</p>`;
        } else {
            projects.forEach(p => {
                html += `<a href="${p.href}" class="venn-panel-card" style="--card-bg:${p.bg};--card-text:${p.fg};">
                    <span class="venn-panel-card-cat">${colorCat(p.bg)}</span>
                    <span class="venn-panel-card-title">${p.title}</span>
                    <div class="venn-panel-card-meta">
                        <span>${p.role}</span>
                        <span>${p.company} &middot; ${p.date}</span>
                    </div>
                </a>`;
            });
        }
        html += '</div>';
        vennPanel.innerHTML = html;

        if (isLocked) {
            const unlockBtn = document.getElementById('vennUnlockBtn');
            if (unlockBtn) unlockBtn.addEventListener('click', e => { e.stopPropagation(); unlock(); });
        }
    }

    // ---- SVG region highlight ----
    const SOLO_REGIONS = new Set(['design', 'tech', 'business']);

    function setRegion(region) {
        activeRegion = region;
        Object.values(hlMap).forEach(el => el && el.setAttribute('display', 'none'));
        Object.values(vcMap).forEach(el => el && el.classList.remove('dimmed'));
        if (!region || SOLO_REGIONS.has(region)) return;
        if (hlMap[region]) hlMap[region].setAttribute('display', '');
        Object.values(vcMap).forEach(el => el && el.classList.add('dimmed'));
    }

    // ---- Event listeners ----
    if (vennSplitLeft) {
        vennSplitLeft.addEventListener('mouseenter', reveal);
    }

    if (vennSplit) {
        vennSplit.addEventListener('mouseleave', () => {
            if (!locked) {
                setRegion(null);
                updatePanel(null);
                unreveal();
            }
        });
    }

    if (vennSvg) {
        vennSvg.addEventListener('mousemove', e => {
            const rect = vennSvg.getBoundingClientRect();
            const svgX = (e.clientX - rect.left) * (420 / rect.width);
            const svgY = (e.clientY - rect.top)  * (390 / rect.height);
            const region = getRegionAtPoint(svgX, svgY);
            vennSvg.style.cursor = (region && !SOLO_REGIONS.has(region)) ? 'pointer' : 'default';
            if (region !== activeRegion) {
                setRegion(region);
                if (!locked) updatePanel(region);
            }
        });

        vennSvg.addEventListener('mouseleave', () => {
            setRegion(null);
            if (!locked) updatePanel(null);
        });

        vennSvg.addEventListener('click', () => {
            if (!activeRegion) return;
            if (locked && lockedRegion === activeRegion) {
                unlock();
            } else {
                locked = true;
                lockedRegion = activeRegion;
                updatePanel(activeRegion, true);
                reveal();
            }
        });
    }
})();



// Load elements on page load (for normal viewing)
window.addEventListener('load', () => {
    const saved = localStorage.getItem('portfolioElements');
    if (!saved) return;

    const elements = JSON.parse(saved);
    elements.forEach(data => {
        let element;
        if (data.type === 'polaroid') {
            element = createPolaroid(data.x, data.y, data.rotation, data.caption || '', data.imageData, data.linkUrl || '');
        } else if (data.type === 'arrow') {
            element = createArrow(
                data.x,
                data.y,
                data.rotation,
                data.style || 'curved',
                data.color || 'coral',
                data.flipH || false,
                data.flipV || false,
                data.width || 150
            );
        } else if (data.type === 'line') {
            element = createLine(
                data.x,
                data.y,
                data.rotation,
                data.style || 'straight',
                data.color || 'coral',
                data.flipH || false,
                data.flipV || false,
                data.width || 150
            );
        } else if (data.type === 'text') {
            element = createText(data.x, data.y, data.rotation, data.content || 'Text', data.color || 'coral', data.fontSize || 1.2);
        }
        if (element) {
            projectsSection.appendChild(element);
            // Remove interactivity for normal viewing
            element.style.cursor = 'default';
            const editableElements = element.querySelectorAll('[contenteditable]');
            editableElements.forEach(el => el.contentEditable = 'false');
        }
    });
});
