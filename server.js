const express = require('express');
const path = require('path');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de cabeçalhos de segurança básicos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Middleware para parsing de JSON
app.use(express.json());

// Arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint de saúde para monitoramento (ex: Render / Uptime)
app.get('/api/health', (req, res) => {
  try {
    const db = getDb();
    const count = db.prepare('SELECT COUNT(*) as count FROM places').get().count;
    return res.json({ status: 'ok', nodeVersion: process.version, placesCount: count });
  } catch (err) {
    return res.status(500).json({ status: 'error', nodeVersion: process.version, error: err.message });
  }
});

// Função utilitária para sanitização de strings (escape HTML)
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const VALID_NEEDS = ['mobility', 'visual', 'auditory', 'sensory', 'elderly'];
const VALID_STATUSES = ['available', 'barrier', 'unknown'];

// Função para calcular contagens agregadas (accessibility_items + review_items)
function calculateAggregatedCounts(db, placeId, needFilter = null) {
  let accSql = 'SELECT status, COUNT(*) as count FROM accessibility_items WHERE place_id = ?';
  const accParams = [placeId];

  if (needFilter && needFilter.length > 0) {
    const placeholders = needFilter.map(() => '?').join(',');
    accSql += ` AND need IN (${placeholders})`;
    accParams.push(...needFilter);
  }
  accSql += ' GROUP BY status';

  const accRows = db.prepare(accSql).all(...accParams);

  let revSql = `
    SELECT ri.status, COUNT(*) as count
    FROM review_items ri
    JOIN reviews r ON ri.review_id = r.id
    WHERE r.place_id = ?
  `;
  const revParams = [placeId];

  if (needFilter && needFilter.length > 0) {
    const placeholders = needFilter.map(() => '?').join(',');
    revSql += ` AND ri.need IN (${placeholders})`;
    revParams.push(...needFilter);
  }
  revSql += ' GROUP BY ri.status';

  const revRows = db.prepare(revSql).all(...revParams);

  const counts = {
    available: 0,
    barrier: 0,
    unverified: 0
  };

  for (const row of accRows) {
    if (row.status === 'available') counts.available += row.count;
    else if (row.status === 'barrier') counts.barrier += row.count;
    else if (row.status === 'unverified') counts.unverified += row.count;
  }

  for (const row of revRows) {
    if (row.status === 'available') counts.available += row.count;
    else if (row.status === 'barrier') counts.barrier += row.count;
    else if (row.status === 'unknown' || row.status === 'unverified') counts.unverified += row.count;
  }

  return counts;
}

/**
 * GET /api/places
 * Filtros opcionais via query string:
 * - q: busca textual em nome, endereço, categoria e bairro
 * - category: categoria exata
 * - needs: lista separada por vírgulas de necessidades (mobility, visual, etc.)
 */
app.get('/api/places', (req, res) => {
  try {
    const db = getDb();
    const { q, category, needs } = req.query;

    let needList = null;
    if (needs && typeof needs === 'string') {
      const parsed = needs
        .split(',')
        .map((n) => n.trim().toLowerCase())
        .filter((n) => VALID_NEEDS.includes(n));
      if (parsed.length > 0) {
        needList = parsed;
      }
    }

    let sql = 'SELECT * FROM places WHERE 1=1';
    const params = [];

    if (q && typeof q === 'string' && q.trim().length > 0) {
      const term = `%${q.trim().toLowerCase()}%`;
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(address) LIKE ? OR LOWER(category) LIKE ? OR LOWER(neighborhood) LIKE ?)';
      params.push(term, term, term, term);
    }

    if (category && typeof category === 'string' && category.trim().length > 0) {
      const catTrim = category.trim().toLowerCase();
      const normalizedCat = catTrim.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalizedCat === 'estadio') {
        sql += " AND (LOWER(category) = 'estádio' OR LOWER(category) = 'estadio')";
      } else {
        sql += ' AND LOWER(category) = ?';
        params.push(catTrim);
      }
    }

    if (needList && needList.length > 0) {
      const placeholders = needList.map(() => '?').join(',');
      sql += ` AND (
        id IN (SELECT place_id FROM accessibility_items WHERE need IN (${placeholders}))
        OR id IN (SELECT r.place_id FROM reviews r JOIN review_items ri ON ri.review_id = r.id WHERE ri.need IN (${placeholders}))
      )`;
      params.push(...needList, ...needList);
    }

    sql += ' ORDER BY name ASC';

    const places = db.prepare(sql).all(...params);

    const result = places.map((place) => {
      const counts = calculateAggregatedCounts(db, place.id, needList);
      return {
        id: place.id,
        name: place.name,
        category: place.category,
        neighborhood: place.neighborhood,
        address: place.address,
        city: place.city,
        lat: place.lat,
        lng: place.lng,
        description: place.description,
        last_verified_date: place.last_verified_date,
        counts
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('Erro ao buscar locais:', err);
    return res.status(500).json({
      error: 'Erro interno do servidor ao buscar locais.',
      details: err.message
    });
  }
});

/**
 * GET /api/places/:id
 * Retorna o local com itens de acessibilidade, avaliações com seus itens,
 * contagens de acessibilidade calculadas a partir dos itens e total de avaliações.
 */
app.get('/api/places/:id', (req, res) => {
  try {
    const db = getDb();
    const placeId = parseInt(req.params.id, 10);

    if (isNaN(placeId) || placeId <= 0) {
      return res.status(400).json({ error: 'Identificador do local inválido.' });
    }

    const place = db.prepare('SELECT * FROM places WHERE id = ?').get(placeId);
    if (!place) {
      return res.status(404).json({ error: 'Local não encontrado.' });
    }

    const items = db
      .prepare('SELECT * FROM accessibility_items WHERE place_id = ? ORDER BY id ASC')
      .all(placeId);

    const reviews = db
      .prepare('SELECT * FROM reviews WHERE place_id = ? ORDER BY created_at DESC, id DESC')
      .all(placeId);

    const getReviewItems = db.prepare('SELECT * FROM review_items WHERE review_id = ? ORDER BY id ASC');
    for (const review of reviews) {
      review.items = getReviewItems.all(review.id);
    }

    const counts = {
      available: 0,
      barrier: 0,
      unverified: 0
    };

    for (const item of items) {
      if (item.status === 'available') counts.available++;
      else if (item.status === 'barrier') counts.barrier++;
      else if (item.status === 'unverified') counts.unverified++;
    }

    return res.json({
      id: place.id,
      name: place.name,
      category: place.category,
      neighborhood: place.neighborhood,
      address: place.address,
      city: place.city,
      lat: place.lat,
      lng: place.lng,
      description: place.description,
      last_verified_date: place.last_verified_date,
      items,
      reviews,
      counts,
      reviewCount: reviews.length
    });
  } catch (err) {
    console.error('Erro ao buscar detalhes do local:', err);
    return res.status(500).json({
      error: 'Erro interno do servidor ao buscar detalhes do local.',
      details: err.message
    });
  }
});

/**
 * POST /api/places/:id/reviews
 * Adiciona uma nova avaliação e seus itens, atualizando/inserindo itens comunitários.
 */
app.post('/api/places/:id/reviews', (req, res) => {
  try {
    const db = getDb();
    const placeId = parseInt(req.params.id, 10);

    if (isNaN(placeId) || placeId <= 0) {
      return res.status(400).json({ error: 'Identificador do local inválido.' });
    }

    const place = db.prepare('SELECT id FROM places WHERE id = ?').get(placeId);
    if (!place) {
      return res.status(404).json({ error: 'Local não encontrado.' });
    }

    const { visit_date, comment, items } = req.body || {};

    if (!visit_date || typeof visit_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(visit_date)) {
      return res.status(400).json({
        error: 'A data da visita (visit_date) é obrigatória e deve estar no formato AAAA-MM-DD.'
      });
    }

    const parsedDate = new Date(visit_date + 'T00:00:00Z');
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Data de visita informada não é válida.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'O campo items é obrigatório e deve ser um array com pelo menos 1 elemento.'
      });
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || typeof it !== 'object') {
        return res.status(400).json({ error: `O item no índice ${i} é inválido.` });
      }
      if (!it.need || !VALID_NEEDS.includes(it.need)) {
        return res.status(400).json({
          error: `Categoria de necessidade inválida no item ${i + 1}: "${it.need}". Opções permitidas: ${VALID_NEEDS.join(', ')}.`
        });
      }
      if (!it.status || !VALID_STATUSES.includes(it.status)) {
        return res.status(400).json({
          error: `Status inválido no item ${i + 1}: "${it.status}". Opções permitidas: ${VALID_STATUSES.join(', ')}.`
        });
      }
    }

    if (comment !== undefined && comment !== null) {
      if (typeof comment !== 'string') {
        return res.status(400).json({ error: 'O comentário deve ser uma cadeia de texto.' });
      }
      if (comment.length > 1000) {
        return res.status(400).json({
          error: 'O comentário não pode ultrapassar 1000 caracteres.'
        });
      }
    }

    const sanitizedComment = comment ? escapeHtml(comment.trim()) : null;

    const needLabels = {
      mobility: 'Mobilidade física',
      visual: 'Acessibilidade visual',
      auditory: 'Acessibilidade auditiva',
      sensory: 'Acessibilidade sensorial',
      elderly: 'Acessibilidade para idosos'
    };

    const insertReview = db.prepare(`
      INSERT INTO reviews (place_id, visit_date, comment, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);

    const insertReviewItem = db.prepare(`
      INSERT INTO review_items (review_id, need, status)
      VALUES (?, ?, ?)
    `);

    const findCommunityItem = db.prepare(`
      SELECT id FROM accessibility_items
      WHERE place_id = ? AND need = ? AND source = 'community'
      LIMIT 1
    `);

    const updateCommunityItem = db.prepare(`
      UPDATE accessibility_items
      SET status = ?, verified_date = ?
      WHERE id = ?
    `);

    const insertCommunityItem = db.prepare(`
      INSERT INTO accessibility_items (place_id, need, title, status, source, verified_date)
      VALUES (?, ?, ?, ?, 'community', ?)
    `);

    const createTransaction = db.transaction(() => {
      const reviewResult = insertReview.run(placeId, visit_date, sanitizedComment);
      const reviewId = Number(reviewResult.lastInsertRowid);

      const createdItems = [];

      for (const it of items) {
        const itemResult = insertReviewItem.run(reviewId, it.need, it.status);
        createdItems.push({
          id: Number(itemResult.lastInsertRowid),
          review_id: reviewId,
          need: it.need,
          status: it.status
        });

        // Para status 'available' ou 'barrier', insere ou atualiza accessibility_item com source='community'
        if (it.status === 'available' || it.status === 'barrier') {
          const existing = findCommunityItem.get(placeId, it.need);
          if (existing) {
            updateCommunityItem.run(it.status, visit_date, existing.id);
          } else {
            const itemTitle = it.title ? escapeHtml(it.title) : `${needLabels[it.need] || it.need} (Relato comunitário)`;
            insertCommunityItem.run(placeId, it.need, itemTitle, it.status, visit_date);
          }
        }
      }

      const createdReview = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);

      return {
        id: createdReview.id,
        place_id: createdReview.place_id,
        visit_date: createdReview.visit_date,
        comment: createdReview.comment,
        created_at: createdReview.created_at,
        items: createdItems
      };
    });

    const newReview = createTransaction();

    return res.status(201).json(newReview);
  } catch (err) {
    console.error('Erro ao registrar avaliação:', err);
    return res.status(500).json({
      error: 'Erro interno do servidor ao criar avaliação.',
      details: err.message
    });
  }
});

/**
 * GET /api/route
 * Retorna rota simulada acessível com instruções, distâncias e alertas de acessibilidade.
 * Query params:
 * - from: texto de origem (ex: "Minha Localização", "Praça Portugal")
 * - to: identificador do local ou nome de destino
 */
app.get('/api/route', (req, res) => {
  try {
    const db = getDb();
    const { from, to } = req.query;

    const originText = (from && typeof from === 'string' && from.trim()) ? from.trim() : 'Sua localização atual';

    let destinationInfo = {
      name: 'Destino informado',
      address: 'Fortaleza/CE'
    };

    if (to) {
      const toId = parseInt(to, 10);
      if (!isNaN(toId)) {
        const place = db.prepare('SELECT * FROM places WHERE id = ?').get(toId);
        if (place) {
          destinationInfo = {
            id: place.id,
            name: place.name,
            address: place.address,
            neighborhood: place.neighborhood,
            category: place.category
          };
        }
      } else if (typeof to === 'string') {
        const place = db.prepare('SELECT * FROM places WHERE LOWER(name) LIKE ? LIMIT 1').get(`%${to.trim().toLowerCase()}%`);
        if (place) {
          destinationInfo = {
            id: place.id,
            name: place.name,
            address: place.address,
            neighborhood: place.neighborhood,
            category: place.category
          };
        } else {
          destinationInfo = {
            name: to.trim(),
            address: 'Fortaleza/CE'
          };
        }
      }
    }

    const steps = [
      {
        instruction: 'Saia do ponto de partida e siga pela calçada ampla com piso tátil direcional.',
        distance: '280 m',
        alert: null
      },
      {
        instruction: 'Aproxime-se do cruzamento sinalizado e aguarde o semáforo com aviso sonoro para atravessar.',
        distance: '30 m',
        alert: 'Atenção: rampa de rebaixamento no lado direito com piso antiderrapante.'
      },
      {
        instruction: 'Prossiga em linha reta pela rota acessível livre de obstáculos e com boa iluminação.',
        distance: '650 m',
        alert: null
      },
      {
        instruction: 'Acesse o trecho compartilhado da via com corredor nivelado.',
        distance: '420 m',
        alert: 'Alerta: trecho de 40 metros com pequena ondulação no pavimento, devidamente sinalizado.'
      },
      {
        instruction: `Vire à direita em direção ao acesso acessível de ${destinationInfo.name}.`,
        distance: '220 m',
        alert: null
      },
      {
        instruction: `Chegada ao destino em ${destinationInfo.address}. Entrada com rampa de inclinação suave e portas automáticas.`,
        distance: '40 m',
        alert: 'Entrada acessível disponível com guias de apoio e sinalização em Braille.'
      }
    ];

    const alerts = [
      'Semáforo da travessia principal equipado com alarme sonoro para pedestres.',
      'Calçada do trecho intermediário com piso tátil direcional contínuo e conservado.',
      'Ponto de apoio e bancos com braços disponíveis a cada 400 metros no trajeto.'
    ];

    return res.json({
      origin: originText,
      destination: destinationInfo,
      distance: '1,6 km',
      duration: '20 min a pé',
      steps,
      alerts
    });
  } catch (err) {
    console.error('Erro ao gerar rota:', err);
    return res.status(500).json({
      error: 'Erro interno do servidor ao traçar rota.',
      details: err.message
    });
  }
});

// Tratamento padrão para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Recurso não encontrado.' });
});

// Inicialização do servidor
if (require.main === module) {
  try {
    const db = getDb();
    const count = db.prepare('SELECT COUNT(*) as count FROM places').get().count;
    console.log(`[avia] Banco de dados pronto. Total de locais disponíveis: ${count}`);
  } catch (dbErr) {
    console.error('[avia] Erro ao pré-inicializar banco de dados no boot:', dbErr);
  }

  app.listen(PORT, () => {
    console.log(`[avia] Servidor Avia rodando na porta ${PORT}`);
  });
}

module.exports = app;
