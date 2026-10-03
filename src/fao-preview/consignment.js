const FIELD_LABELS = {
  'contact-name': 'Nome', 'contact-phone': 'Telefone', 'contact-email': 'E-mail',
  'car-make': 'Marca', 'car-model': 'Modelo', 'car-year': 'Ano',
  'car-mileage': 'Quilometragem', 'car-notes': 'Sobre o veículo',
};

export function validateConsignment(input, currentYear = new Date().getFullYear()) {
  const values = Object.fromEntries(Object.keys(FIELD_LABELS).map(key => [key, String(input[key] ?? '').trim()]));
  const errors = {};
  for (const key of ['contact-name', 'contact-phone', 'contact-email', 'car-make', 'car-model', 'car-year']) {
    if (!values[key]) errors[key] = 'Preencha este campo.';
  }
  for (const [key, limit] of Object.entries({ 'contact-name': 80, 'contact-email': 254, 'car-make': 50, 'car-model': 70, 'car-notes': 650 })) {
    if (values[key].length > limit) errors[key] = `Use até ${limit} caracteres.`;
  }
  const phone = values['contact-phone'];
  if (phone && (!/^[\d\s()+.\-]+$/.test(phone) || !/^\d{10,11}$/.test(phone.replace(/\D/g, '')))) {
    errors['contact-phone'] = 'Informe o telefone com DDD, com 10 ou 11 dígitos.';
  }
  const email = values['contact-email'];
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors['contact-email'] = 'Informe um e-mail válido.';
  const year = values['car-year'];
  if (year && (!/^\d{4}$/.test(year) || Number(year) < 1886 || Number(year) > currentYear + 1)) {
    errors['car-year'] = `Informe um ano entre 1886 e ${currentYear + 1}.`;
  }
  const mileage = values['car-mileage'];
  if (mileage && (!/^\d+$/.test(mileage) || !Number.isSafeInteger(Number(mileage)))) {
    errors['car-mileage'] = 'Informe apenas números inteiros, a partir de zero.';
  }
  return { values, errors };
}

export function validatePhotoSelection(files, existingCount = 0) {
  if (files.length + existingCount > 4) return 'Escolha até 4 fotos no total. Remova uma foto antes de adicionar outra.';
  for (const file of files) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Use fotos em JPG, PNG ou WebP.';
    if (!file.size || file.size > 5000000) return 'Cada foto deve ter até 5 MB e não pode estar vazia.';
  }
  return '';
}

function initializeConsignmentForm() {
  const form = document.getElementById('consignment-form');
  if (!form) return;

  // Attach the submit guard before enabling any input. This demonstration never sends data.
  let ready = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (ready) review();
  });

  const fields = document.getElementById('consignment-fields');
  const inputs = Object.fromEntries(Object.keys(FIELD_LABELS).map(key => [key, document.getElementById(key)]));
  const upload = document.getElementById('consignment-photos');
  const list = document.getElementById('consignment-photo-list');
  const photoStatus = document.getElementById('consignment-photo-status');
  const reviewButton = document.getElementById('consignment-review');
  const summary = document.getElementById('consignment-summary');
  const summaryData = document.getElementById('consignment-summary-data');
  if (!fields || !upload || !list || !photoStatus || !reviewButton || !summary || !summaryData || Object.values(inputs).some(input => !input)) return;

  let photos = [];
  let generation = 0;
  let busy = false;
  const pendingUrls = new Set();

  function invalidateSummary() {
    summary.hidden = true;
    summaryData.replaceChildren();
  }

  function setBusy(value) {
    busy = value;
    reviewButton.disabled = value;
    upload.disabled = value;
    list.setAttribute('aria-busy', String(value));
  }

  function revokePending() {
    for (const url of pendingUrls) URL.revokeObjectURL(url);
    pendingUrls.clear();
  }

  function photoCountMessage() {
    return photos.length ? `${photos.length} de 4 fotos preparadas apenas nesta página.` : 'Nenhuma foto selecionada. As fotos ficam apenas nesta página.';
  }

  function renderPhotos() {
    list.replaceChildren();
    for (const photo of photos) {
      const figure = document.createElement('figure');
      figure.className = 'consignment-photo';
      const image = document.createElement('img');
      image.src = photo.url;
      image.alt = `Prévia: ${photo.name}`;
      const caption = document.createElement('figcaption');
      caption.textContent = photo.name;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'consignment-photo-remove';
      remove.textContent = 'Remover';
      remove.setAttribute('aria-label', `Remover a foto ${photo.name}`);
      remove.addEventListener('click', () => {
        URL.revokeObjectURL(photo.url);
        photos = photos.filter(item => item !== photo);
        invalidateSummary();
        renderPhotos();
        photoStatus.textContent = busy ? 'Preparando as fotos…' : photoCountMessage();
        upload.focus();
      });
      figure.append(image, caption, remove);
      list.append(figure);
    }
  }

  function decodeImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => image.naturalWidth && image.naturalHeight ? resolve() : reject(new Error('Empty image'));
      image.onerror = () => reject(new Error('Invalid image'));
      image.src = url;
    });
  }

  upload.addEventListener('change', async () => {
    const files = Array.from(upload.files || []);
    upload.value = '';
    if (!files.length) return;
    const selection = ++generation;
    revokePending();
    invalidateSummary();
    const error = validatePhotoSelection(files, photos.length);
    if (error) {
      setBusy(false);
      photoStatus.textContent = error;
      return;
    }
    setBusy(true);
    photoStatus.textContent = 'Preparando as fotos…';
    const prepared = [];
    try {
      for (const file of files) {
        const url = URL.createObjectURL(file);
        pendingUrls.add(url);
        await decodeImage(url);
        if (selection !== generation) return;
        prepared.push({ url, name: file.name });
      }
      for (const photo of prepared) pendingUrls.delete(photo.url);
      photos.push(...prepared);
      renderPhotos();
      photoStatus.textContent = photoCountMessage();
    } catch {
      if (selection !== generation) return;
      revokePending();
      photoStatus.textContent = 'Não foi possível abrir uma das fotos. Confira os arquivos e escolha novamente.';
    } finally {
      if (selection === generation) setBusy(false);
    }
  });

  function review() {
    if (busy) return;
    invalidateSummary();
    const { values, errors } = validateConsignment(Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value])));
    for (const [key, input] of Object.entries(inputs)) {
      input.value = values[key];
      input.setCustomValidity(errors[key] || '');
      input.setAttribute('aria-invalid', String(Boolean(errors[key])));
    }
    if (!form.reportValidity()) return;
    for (const [key, label] of Object.entries(FIELD_LABELS)) {
      const title = document.createElement('dt');
      title.textContent = label;
      const detail = document.createElement('dd');
      detail.textContent = key === 'car-mileage' && values[key] ? `${Number(values[key]).toLocaleString('pt-BR')} km` : values[key] || 'Não informado';
      summaryData.append(title, detail);
    }
    const photoTitle = document.createElement('dt');
    photoTitle.textContent = 'Fotos';
    const photoDetail = document.createElement('dd');
    photoDetail.textContent = photos.length ? `${photos.length} foto(s) preparadas nesta página.` : 'Nenhuma foto selecionada.';
    summaryData.append(photoTitle, photoDetail);
    summary.hidden = false;
    summary.focus();
  }

  form.addEventListener('input', event => {
    invalidateSummary();
    if (event.target.setCustomValidity) {
      event.target.setCustomValidity('');
      event.target.removeAttribute('aria-invalid');
    }
  });

  form.addEventListener('reset', () => {
    ++generation;
    revokePending();
    for (const photo of photos) URL.revokeObjectURL(photo.url);
    photos = [];
    upload.value = '';
    renderPhotos();
    invalidateSummary();
    setBusy(false);
    for (const input of Object.values(inputs)) {
      input.setCustomValidity('');
      input.removeAttribute('aria-invalid');
    }
    photoStatus.textContent = photoCountMessage();
  });

  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    ++generation;
    revokePending();
    for (const photo of photos) URL.revokeObjectURL(photo.url);
  });

  form.noValidate = true;
  ready = true;
  fields.disabled = false;
  photoStatus.textContent = photoCountMessage();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeConsignmentForm, { once: true });
  else initializeConsignmentForm();
}
