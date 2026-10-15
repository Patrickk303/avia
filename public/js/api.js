const API_BASE = '/api';

export async function searchPlaces({ q = '', category = '', needs = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (needs) params.set('needs', needs);
  const res = await fetch(`${API_BASE}/places?${params}`);
  if (!res.ok) throw new Error('Erro ao buscar locais');
  return res.json();
}

export async function getPlace(id) {
  const res = await fetch(`${API_BASE}/places/${id}`);
  if (!res.ok) throw new Error('Local não encontrado');
  return res.json();
}

export async function submitReview(placeId, data) {
  const res = await fetch(`${API_BASE}/places/${placeId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao enviar avaliação');
  return json;
}

export async function getRoute(from, to) {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(`${API_BASE}/route?${params}`);
  if (!res.ok) throw new Error('Erro ao calcular rota');
  return res.json();
}
