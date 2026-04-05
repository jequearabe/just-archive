let blocks = [];
let currentPage = { slug: '', title: '' };

const slugInput = document.getElementById('slugInput');
const titleInput = document.getElementById('titleInput');
const blocksContainer = document.getElementById('blocksContainer');
const emptyState = document.getElementById('emptyState');
const messageDiv = document.getElementById('message');

function showMessage(text, isError = false) {
  messageDiv.innerHTML = `<div class="save-message" style="background:${isError ? '#fee2e2' : '#dcfce7'};color:${isError ? '#991b1b' : '#166534'};padding:0.75rem;border-radius:8px;margin-top:1rem;">${text}</div>`;
  setTimeout(() => { if (messageDiv) messageDiv.innerHTML = ''; }, 4000);
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'justarchive_unsigned');
  const cloudName = 'tu-cloud-name';
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.secure_url) return data.secure_url;
    throw new Error('Error al subir imagen');
  } catch (err) {
    showMessage('Error al subir imagen: ' + err.message, true);
    return null;
  }
}

function createImageUploadButton(onUpload) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await uploadImage(file);
      if (url) onUpload(url);
    }
    input.value = '';
  });
  const button = document.createElement('button');
  button.textContent = '📁 Subir imagen';
  button.type = 'button';
  button.className = 'secondary';
  button.addEventListener('click', () => input.click());
  const wrapper = document.createElement('div');
  wrapper.appendChild(button);
  wrapper.appendChild(input);
  return wrapper;
}

function renderBlocks() {
  if (!blocksContainer) return;
  if (!blocks || blocks.length === 0) {
    emptyState.style.display = 'block';
    blocksContainer.innerHTML = '<div class="empty-state" id="emptyState">✨ No hay bloques. Añade contenido usando los botones de arriba.</div>';
    return;
  }
  emptyState.style.display = 'none';
  blocksContainer.innerHTML = '';
  blocks.forEach((block, idx) => {
    const blockDiv = document.createElement('div');
    blockDiv.className = 'block';
    blockDiv.setAttribute('data-idx', idx);
    blockDiv.setAttribute('draggable', 'true');
    const header = document.createElement('div');
    header.className = 'block-header';
    header.innerHTML = `<span style="cursor:grab;">⋮⋮</span> <strong>${block.type.toUpperCase()}</strong> <button class="delete-block" data-idx="${idx}" style="background:transparent;color:#ef4444;border:none;">✕ Eliminar</button>`;
    blockDiv.appendChild(header);
    const contentDiv = document.createElement('div');
    contentDiv.className = 'block-content';
    const editor = createBlockEditor(block, idx);
    contentDiv.appendChild(editor);
    blockDiv.appendChild(contentDiv);
    blocksContainer.appendChild(blockDiv);
  });
  attachDeleteEvents();
  setupDragAndDrop();
}

function attachDeleteEvents() {
  document.querySelectorAll('.delete-block').forEach(btn => {
    btn.removeEventListener('click', handleDelete);
    btn.addEventListener('click', handleDelete);
  });
}
function handleDelete(e) {
  const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
  if (confirm('¿Eliminar este bloque?')) {
    blocks.splice(idx, 1);
    renderBlocks();
  }
}

function createBlockEditor(block, idx) {
  const wrapper = document.createElement('div');
  const { type, props } = block;
  if (type === 'header') {
    const select = document.createElement('select');
    [1,2,3].forEach(lvl => {
      const opt = document.createElement('option');
      opt.value = lvl;
      opt.textContent = `H${lvl}`;
      if (props.level === lvl) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', (e) => { props.level = parseInt(e.target.value); update(); });
    const input = document.createElement('input');
    input.type = 'text';
    input.value = props.text || '';
    input.placeholder = 'Texto del título';
    input.addEventListener('input', (e) => { props.text = e.target.value; update(); });
    wrapper.append(select, input);
  } else if (type === 'paragraph') {
    const textarea = document.createElement('textarea');
    textarea.value = props.text || '';
    textarea.rows = 3;
    textarea.placeholder = 'Escribe tu párrafo...';
    textarea.addEventListener('input', (e) => { props.text = e.target.value; update(); });
    wrapper.appendChild(textarea);
  } else if (type === 'image') {
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.value = props.url || '';
    urlInput.placeholder = 'URL de la imagen';
    urlInput.addEventListener('input', (e) => { props.url = e.target.value; update(); });
    const captionInput = document.createElement('input');
    captionInput.type = 'text';
    captionInput.value = props.caption || '';
    captionInput.placeholder = 'Pie de foto';
    captionInput.addEventListener('input', (e) => { props.caption = e.target.value; update(); });
    const uploadBtn = createImageUploadButton((url) => {
      props.url = url;
      urlInput.value = url;
      update();
    });
    wrapper.append(urlInput, captionInput, uploadBtn);
  } else if (type === 'gallery') {
    const galleryDiv = document.createElement('div');
    const images = props.images || [];
    const refresh = () => {
      galleryDiv.innerHTML = '';
      images.forEach((img, i) => {
        const row = document.createElement('div');
        row.className = 'gallery-row';
        const inp = document.createElement('input');
        inp.value = img;
        inp.placeholder = 'URL imagen';
        inp.addEventListener('input', (e) => { images[i] = e.target.value; update(); });
        const del = document.createElement('button');
        del.textContent = '✕';
        del.style.background = 'transparent';
        del.addEventListener('click', () => { images.splice(i,1); update(); refresh(); });
        const uploadSmall = createImageUploadButton((url) => {
          images[i] = url;
          inp.value = url;
          update();
        });
        row.append(inp, uploadSmall, del);
        galleryDiv.appendChild(row);
      });
      const addBtn = document.createElement('button');
      addBtn.textContent = '+ Añadir imagen';
      addBtn.addEventListener('click', () => { images.push(''); update(); refresh(); });
      galleryDiv.appendChild(addBtn);
    };
    refresh();
    wrapper.appendChild(galleryDiv);
  } else if (type === 'socialLinks') {
    const socialDiv = document.createElement('div');
    const links = props.links || [];
    const refresh = () => {
      socialDiv.innerHTML = '';
      links.forEach((link, i) => {
        const row = document.createElement('div');
        row.className = 'social-row';
        const label = document.createElement('input');
        label.placeholder = 'Etiqueta';
        label.value = link.label || '';
        label.addEventListener('input', (e) => { link.label = e.target.value; update(); });
        const url = document.createElement('input');
        url.placeholder = 'URL';
        url.value = link.url || '';
        url.addEventListener('input', (e) => { link.url = e.target.value; update(); });
        const icon = document.createElement('input');
        icon.placeholder = 'Icono (fab fa-instagram)';
        icon.value = link.icon || 'fas fa-link';
        icon.addEventListener('input', (e) => { link.icon = e.target.value; update(); });
        const del = document.createElement('button');
        del.textContent = '✕';
        del.addEventListener('click', () => { links.splice(i,1); update(); refresh(); });
        row.append(label, url, icon, del);
        socialDiv.appendChild(row);
      });
      const add = document.createElement('button');
      add.textContent = '+ Añadir red social';
      add.addEventListener('click', () => { links.push({ label: '', url: '', icon: 'fas fa-link' }); update(); refresh(); });
      socialDiv.appendChild(add);
    };
    refresh();
    wrapper.appendChild(socialDiv);
  } else if (type === 'musicTracks') {
    const musicDiv = document.createElement('div');
    const tracks = props.tracks || [];
    const refresh = () => {
      musicDiv.innerHTML = '';
      tracks.forEach((track, i) => {
        const row = document.createElement('div');
        row.className = 'track-row';
        const plat = document.createElement('select');
        ['youtube','spotify','applemusic'].forEach(p => {
          const opt = document.createElement('option');
          opt.value = p;
          opt.textContent = p.charAt(0).toUpperCase() + p.slice(1);
          if (track.platform === p) opt.selected = true;
          plat.appendChild(opt);
        });
        plat.addEventListener('change', (e) => { track.platform = e.target.value; update(); });
        const name = document.createElement('input');
        name.placeholder = 'Nombre';
        name.value = track.name || '';
        name.addEventListener('input', (e) => { track.name = e.target.value; update(); });
        const url = document.createElement('input');
        url.placeholder = 'URL';
        url.value = track.url || '';
        url.addEventListener('input', (e) => { track.url = e.target.value; update(); });
        const del = document.createElement('button');
        del.textContent = '✕';
        del.addEventListener('click', () => { tracks.splice(i,1); update(); refresh(); });
        row.append(plat, name, url, del);
        musicDiv.appendChild(row);
      });
      const add = document.createElement('button');
      add.textContent = '+ Añadir tema musical';
      add.addEventListener('click', () => { tracks.push({ platform: 'youtube', url: '', name: '' }); update(); refresh(); });
      musicDiv.appendChild(add);
    };
    refresh();
    wrapper.appendChild(musicDiv);
  }
  function update() {
    renderBlocks();
  }
  return wrapper;
}

let dragSrcIndex = null;
function setupDragAndDrop() {
  const draggables = document.querySelectorAll('.block');
  draggables.forEach((block, idx) => {
    block.setAttribute('draggable', 'true');
    block.addEventListener('dragstart', (e) => {
      dragSrcIndex = idx;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', idx);
    });
    block.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    block.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetIdx = parseInt(block.getAttribute('data-idx'));
      if (dragSrcIndex !== null && dragSrcIndex !== targetIdx) {
        const moved = blocks[dragSrcIndex];
        blocks.splice(dragSrcIndex, 1);
        blocks.splice(targetIdx, 0, moved);
        renderBlocks();
      }
      dragSrcIndex = null;
    });
  });
}

function addBlock(type) {
  let props = {};
  switch(type) {
    case 'header': props = { level: 2, text: 'Nuevo título' }; break;
    case 'paragraph': props = { text: '' }; break;
    case 'image': props = { url: 'https://picsum.photos/400/300', caption: '' }; break;
    case 'gallery': props = { images: ['https://picsum.photos/200/150'] }; break;
    case 'socialLinks': props = { links: [{ label: 'Twitter', url: 'https://twitter.com', icon: 'fab fa-twitter' }] }; break;
    case 'musicTracks': props = { tracks: [{ platform: 'youtube', url: 'https://youtu.be/ejemplo', name: 'Canción ejemplo' }] }; break;
    default: return;
  }
  blocks.push({ id: Date.now()+Math.random(), type, props });
  renderBlocks();
}

async function loadPage() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await fetch('/api/user/page', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      const page = data.page || { slug: '', title: '', content_json: { blocks: [] } };
      currentPage = page;
      slugInput.value = page.slug || '';
      titleInput.value = page.title || '';
      blocks = page.content_json?.blocks || [];
      renderBlocks();
    } else if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    } else {
      showMessage('Error al cargar la página', true);
    }
  } catch (err) {
    showMessage('Error de conexión', true);
  }
}

async function savePage() {
  const slug = slugInput.value.trim();
  if (!slug) { showMessage('El slug es obligatorio', true); return; }
  if (!/^[a-z0-9\-_]+$/.test(slug)) { showMessage('Slug inválido (solo minúsculas, números, - y _)', true); return; }
  const token = localStorage.getItem('token');
  const dataToSend = {
    slug,
    title: titleInput.value,
    content_json: { blocks }
  };
  try {
    const res = await fetch('/api/user/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(dataToSend)
    });
    const data = await res.json();
    if (res.ok) {
      showMessage('✅ Página guardada correctamente', false);
    } else {
      showMessage(data.error || 'Error al guardar', true);
    }
  } catch (err) {
    showMessage('Error de conexión al guardar', true);
  }
}

window.addBlock = addBlock;
window.savePage = savePage;
window.loadPage = loadPage;

document.addEventListener('DOMContentLoaded', () => {
  loadPage();
  document.getElementById('addHeaderBtn')?.addEventListener('click', () => addBlock('header'));
  document.getElementById('addParagraphBtn')?.addEventListener('click', () => addBlock('paragraph'));
  document.getElementById('addImageBtn')?.addEventListener('click', () => addBlock('image'));
  document.getElementById('addGalleryBtn')?.addEventListener('click', () => addBlock('gallery'));
  document.getElementById('addSocialBtn')?.addEventListener('click', () => addBlock('socialLinks'));
  document.getElementById('addMusicBtn')?.addEventListener('click', () => addBlock('musicTracks'));
  document.getElementById('saveBtn')?.addEventListener('click', savePage);
});