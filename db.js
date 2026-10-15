const Database = require('better-sqlite3');
const path = require('path');

let dbInstance = null;

const schema = `
CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Fortaleza/CE',
  lat REAL,
  lng REAL,
  description TEXT,
  last_verified_date TEXT
);

CREATE TABLE IF NOT EXISTS accessibility_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  place_id INTEGER NOT NULL,
  need TEXT NOT NULL CHECK(need IN ('mobility','visual','auditory','sensory','elderly')),
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('available','barrier','unverified')),
  source TEXT NOT NULL DEFAULT 'verified' CHECK(source IN ('verified','community')),
  verified_date TEXT,
  FOREIGN KEY(place_id) REFERENCES places(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  place_id INTEGER NOT NULL,
  visit_date TEXT NOT NULL,
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(place_id) REFERENCES places(id)
);

CREATE TABLE IF NOT EXISTS review_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL,
  need TEXT NOT NULL CHECK(need IN ('mobility','visual','auditory','sensory','elderly')),
  status TEXT NOT NULL CHECK(status IN ('available','barrier','unknown')),
  FOREIGN KEY(review_id) REFERENCES reviews(id)
);
`;

const seedData = [
  {
    name: 'Shopping Horizonte Mar',
    category: 'shopping',
    neighborhood: 'Aldeota',
    address: 'Av. Santos Dumont, 3450',
    city: 'Fortaleza/CE',
    lat: -3.7327,
    lng: -38.5076,
    description: 'Shopping center com ampla praça de alimentação e cinema.',
    last_verified_date: '2025-08-12',
    items: [
      { need: 'mobility', title: 'Rampa de acesso principal', status: 'available', source: 'verified', verified_date: '2025-08-12' },
      { need: 'mobility', title: 'Elevadores em todos os pisos', status: 'available', source: 'verified', verified_date: '2025-08-12' },
      { need: 'mobility', title: 'Banheiros adaptados', status: 'available', source: 'verified', verified_date: '2025-08-12' },
      { need: 'visual', title: 'Piso tátil no térreo', status: 'available', source: 'verified', verified_date: '2025-08-12' },
      { need: 'visual', title: 'Sinalização tátil nos andares superiores', status: 'barrier', source: 'verified', verified_date: '2025-08-12' },
      { need: 'visual', title: 'Cardápio em Braille na praça de alimentação', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'auditory', title: 'Sinalização visual de emergência', status: 'available', source: 'verified', verified_date: '2025-08-12' },
      { need: 'auditory', title: 'Atendimento em Libras', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'sensory', title: 'Horário com luzes reduzidas', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'sensory', title: 'Nível de ruído na praça de alimentação', status: 'barrier', source: 'community', verified_date: null },
      { need: 'elderly', title: 'Assentos de descanso nos corredores', status: 'available', source: 'verified', verified_date: '2025-08-12' },
      { need: 'elderly', title: 'Escadas rolantes com velocidade reduzida', status: 'unverified', source: 'verified', verified_date: null }
    ],
    reviews: [
      {
        visit_date: '2025-09-10',
        created_at: '2025-09-10 14:30:00',
        comment: 'Rampas em bom estado, mas o piso tátil do segundo andar está desgastado.',
        items: [
          { need: 'mobility', status: 'available' },
          { need: 'visual', status: 'barrier' }
        ]
      },
      {
        visit_date: '2025-10-01',
        created_at: '2025-10-01 16:45:00',
        comment: 'Elevadores funcionando bem. Não encontrei cardápio em Braille.',
        items: [
          { need: 'mobility', status: 'available' },
          { need: 'visual', status: 'barrier' },
          { need: 'elderly', status: 'available' }
        ]
      },
      {
        visit_date: '2025-07-20',
        created_at: '2025-07-20 19:15:00',
        comment: 'Praça de alimentação muito barulhenta no horário de pico.',
        items: [
          { need: 'sensory', status: 'barrier' }
        ]
      }
    ]
  },
  {
    name: 'Arena Dunas do Ceará',
    category: 'estádio',
    neighborhood: 'Castelão',
    address: 'Av. Alberto Craveiro, 2901',
    city: 'Fortaleza/CE',
    lat: -3.8071,
    lng: -38.5224,
    description: 'Estádio multiuso com capacidade para 63 mil pessoas.',
    last_verified_date: '2025-06-15',
    items: [
      { need: 'mobility', title: 'Rampas de acesso ao setor térreo', status: 'available', source: 'verified', verified_date: '2025-06-15' },
      { need: 'mobility', title: 'Elevadores para setores superiores', status: 'available', source: 'verified', verified_date: '2025-06-15' },
      { need: 'mobility', title: 'Assentos reservados para cadeirantes', status: 'available', source: 'verified', verified_date: '2025-06-15' },
      { need: 'mobility', title: 'Banheiros adaptados nos setores', status: 'barrier', source: 'verified', verified_date: '2025-06-15' },
      { need: 'visual', title: 'Piso tátil nas áreas de circulação', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'visual', title: 'Audiodescrição durante eventos', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'auditory', title: 'Intérprete de Libras em eventos', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'auditory', title: 'Painéis eletrônicos com informações visuais', status: 'available', source: 'verified', verified_date: '2025-06-15' },
      { need: 'sensory', title: 'Sala de acolhimento sensorial', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'elderly', title: 'Assentos preferenciais com boa visibilidade', status: 'available', source: 'verified', verified_date: '2025-06-15' },
      { need: 'elderly', title: 'Sinalização clara nos acessos', status: 'barrier', source: 'community', verified_date: null }
    ],
    reviews: [
      {
        visit_date: '2025-07-10',
        created_at: '2025-07-10 21:00:00',
        comment: 'Elevadores funcionam, mas banheiro adaptado do setor norte estava interditado.',
        items: [
          { need: 'mobility', status: 'barrier' },
          { need: 'elderly', status: 'available' }
        ]
      },
      {
        visit_date: '2025-08-05',
        created_at: '2025-08-05 18:20:00',
        comment: 'Assentos para cadeirantes bem posicionados. Sinalização confusa na entrada leste.',
        items: [
          { need: 'mobility', status: 'available' },
          { need: 'elderly', status: 'barrier' }
        ]
      }
    ]
  },
  {
    name: 'Café Brisa Serrana',
    category: 'restaurante',
    neighborhood: 'Meireles',
    address: 'Rua Canuto de Aguiar, 1280',
    city: 'Fortaleza/CE',
    lat: -3.7260,
    lng: -38.5014,
    description: 'Café e bistrô com varanda ao ar livre.',
    last_verified_date: '2025-09-20',
    items: [
      { need: 'mobility', title: 'Entrada no nível da calçada', status: 'available', source: 'verified', verified_date: '2025-09-20' },
      { need: 'mobility', title: 'Banheiro adaptado', status: 'available', source: 'verified', verified_date: '2025-09-20' },
      { need: 'mobility', title: 'Espaço entre mesas para cadeira de rodas', status: 'available', source: 'verified', verified_date: '2025-09-20' },
      { need: 'visual', title: 'Cardápio em Braille', status: 'barrier', source: 'verified', verified_date: '2025-09-20' },
      { need: 'visual', title: 'Boa iluminação interna', status: 'available', source: 'verified', verified_date: '2025-09-20' },
      { need: 'auditory', title: 'Equipe com noções de Libras', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'auditory', title: 'Ambiente com pouca reverberação', status: 'available', source: 'community', verified_date: null },
      { need: 'sensory', title: 'Nível de ruído no salão', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'sensory', title: 'Iluminação sem luzes piscantes', status: 'available', source: 'verified', verified_date: '2025-09-20' },
      { need: 'elderly', title: 'Cadeiras com apoio de braço', status: 'available', source: 'verified', verified_date: '2025-09-20' },
      { need: 'elderly', title: 'Cardápio com fonte legível', status: 'available', source: 'community', verified_date: null }
    ],
    reviews: [
      {
        visit_date: '2025-09-25',
        created_at: '2025-09-25 10:15:00',
        comment: 'Ambiente acolhedor. Banheiro adaptado limpo e bem sinalizado.',
        items: [
          { need: 'mobility', status: 'available' },
          { need: 'elderly', status: 'available' }
        ]
      },
      {
        visit_date: '2025-10-05',
        created_at: '2025-10-05 15:30:00',
        comment: 'Não havia cardápio em Braille disponível no dia.',
        items: [
          { need: 'visual', status: 'barrier' },
          { need: 'sensory', status: 'available' }
        ]
      },
      {
        visit_date: '2025-08-15',
        created_at: '2025-08-15 11:00:00',
        comment: 'Ótimo espaço entre as mesas. Atendente não sabia Libras.',
        items: [
          { need: 'mobility', status: 'available' },
          { need: 'auditory', status: 'barrier' }
        ]
      }
    ]
  },
  {
    name: 'Parque dos Cajueiros',
    category: 'parque',
    neighborhood: 'Cocó',
    address: 'Av. Padre Antônio Tomás, s/n',
    city: 'Fortaleza/CE',
    lat: -3.7450,
    lng: -38.4890,
    description: 'Parque urbano com trilhas, lago e áreas de lazer.',
    last_verified_date: '2025-07-08',
    items: [
      { need: 'mobility', title: 'Trilha principal pavimentada', status: 'available', source: 'verified', verified_date: '2025-07-08' },
      { need: 'mobility', title: 'Trilha secundária com degraus', status: 'barrier', source: 'verified', verified_date: '2025-07-08' },
      { need: 'mobility', title: 'Banheiro adaptado na entrada principal', status: 'available', source: 'verified', verified_date: '2025-07-08' },
      { need: 'visual', title: 'Piso tátil na trilha principal', status: 'available', source: 'verified', verified_date: '2025-07-08' },
      { need: 'visual', title: 'Mapa tátil na entrada', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'visual', title: 'Sinalização em Braille nos pontos de interesse', status: 'barrier', source: 'community', verified_date: null },
      { need: 'auditory', title: 'Sinalização visual nos cruzamentos', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'sensory', title: 'Áreas de descanso com sombra natural', status: 'available', source: 'verified', verified_date: '2025-07-08' },
      { need: 'sensory', title: 'Nível de ruído variável', status: 'barrier', source: 'community', verified_date: null },
      { need: 'elderly', title: 'Bancos ao longo da trilha principal', status: 'available', source: 'verified', verified_date: '2025-07-08' },
      { need: 'elderly', title: 'Bebedouros acessíveis', status: 'available', source: 'verified', verified_date: '2025-07-08' },
      { need: 'elderly', title: 'Estacionamento preferencial', status: 'available', source: 'verified', verified_date: '2025-07-08' }
    ],
    reviews: [
      {
        visit_date: '2025-08-20',
        created_at: '2025-08-20 08:30:00',
        comment: 'Trilha principal ótima para cadeira de rodas. Trilha do lago tem escadas.',
        items: [
          { need: 'mobility', status: 'barrier' },
          { need: 'sensory', status: 'available' }
        ]
      },
      {
        visit_date: '2025-09-15',
        created_at: '2025-09-15 16:00:00',
        comment: 'Piso tátil da trilha principal em boas condições. Faltam placas em Braille.',
        items: [
          { need: 'visual', status: 'available' },
          { need: 'visual', status: 'barrier' },
          { need: 'elderly', status: 'available' }
        ]
      }
    ]
  },
  {
    name: 'Hospital Vida Plena',
    category: 'hospital',
    neighborhood: 'Centro',
    address: 'Rua Barão do Rio Branco, 805',
    city: 'Fortaleza/CE',
    lat: -3.7210,
    lng: -38.5280,
    description: 'Hospital geral com pronto-socorro e especialidades.',
    last_verified_date: '2025-10-01',
    items: [
      { need: 'mobility', title: 'Rampa de acesso na entrada principal', status: 'available', source: 'verified', verified_date: '2025-10-01' },
      { need: 'mobility', title: 'Elevadores em todos os andares', status: 'available', source: 'verified', verified_date: '2025-10-01' },
      { need: 'mobility', title: 'Banheiros adaptados em cada andar', status: 'available', source: 'verified', verified_date: '2025-10-01' },
      { need: 'visual', title: 'Piso tátil nos corredores', status: 'available', source: 'verified', verified_date: '2025-10-01' },
      { need: 'visual', title: 'Sinalização em Braille nos elevadores', status: 'available', source: 'verified', verified_date: '2025-10-01' },
      { need: 'auditory', title: 'Atendimento em Libras', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'auditory', title: 'Painel de senhas com chamada visual', status: 'available', source: 'verified', verified_date: '2025-10-01' },
      { need: 'sensory', title: 'Sala de espera com baixo estímulo', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'sensory', title: 'Iluminação fluorescente nos corredores', status: 'barrier', source: 'verified', verified_date: '2025-10-01' },
      { need: 'elderly', title: 'Cadeiras de espera com apoio', status: 'available', source: 'verified', verified_date: '2025-10-01' },
      { need: 'elderly', title: 'Guichê de atendimento preferencial', status: 'available', source: 'verified', verified_date: '2025-10-01' },
      { need: 'elderly', title: 'Sinalização com letras grandes', status: 'available', source: 'community', verified_date: null }
    ],
    reviews: [
      {
        visit_date: '2025-10-05',
        created_at: '2025-10-05 09:10:00',
        comment: 'Excelente acessibilidade física. Não encontrei intérprete de Libras.',
        items: [
          { need: 'mobility', status: 'available' },
          { need: 'auditory', status: 'unknown' }
        ]
      },
      {
        visit_date: '2025-09-28',
        created_at: '2025-09-28 14:00:00',
        comment: 'Piso tátil bem mantido. Luzes fluorescentes fortes nos corredores.',
        items: [
          { need: 'visual', status: 'available' },
          { need: 'sensory', status: 'barrier' }
        ]
      },
      {
        visit_date: '2025-10-10',
        created_at: '2025-10-10 11:20:00',
        comment: 'Atendimento preferencial rápido. Elevadores amplos.',
        items: [
          { need: 'elderly', status: 'available' },
          { need: 'mobility', status: 'available' }
        ]
      }
    ]
  },
  {
    name: 'Livraria Página Viva',
    category: 'cultura',
    neighborhood: 'Benfica',
    address: 'Av. da Universidade, 2340',
    city: 'Fortaleza/CE',
    lat: -3.7400,
    lng: -38.5400,
    description: 'Livraria independente com espaço para eventos e café literário.',
    last_verified_date: '2025-05-22',
    items: [
      { need: 'mobility', title: 'Entrada com degrau sem rampa', status: 'barrier', source: 'verified', verified_date: '2025-05-22' },
      { need: 'mobility', title: 'Corredores estreitos entre estantes', status: 'barrier', source: 'verified', verified_date: '2025-05-22' },
      { need: 'mobility', title: 'Banheiro não adaptado', status: 'barrier', source: 'verified', verified_date: '2025-05-22' },
      { need: 'visual', title: 'Audiodescrição em eventos', status: 'available', source: 'community', verified_date: null },
      { need: 'visual', title: 'Sinalização tátil', status: 'unverified', source: 'verified', verified_date: null },
      { need: 'visual', title: 'Acervo de audiolivros', status: 'available', source: 'verified', verified_date: '2025-05-22' },
      { need: 'auditory', title: 'Eventos com intérprete de Libras', status: 'available', source: 'community', verified_date: null },
      { need: 'auditory', title: 'Fone de ouvido disponível para audiolivros', status: 'available', source: 'verified', verified_date: '2025-05-22' },
      { need: 'sensory', title: 'Ambiente silencioso', status: 'available', source: 'verified', verified_date: '2025-05-22' },
      { need: 'sensory', title: 'Iluminação suave', status: 'available', source: 'verified', verified_date: '2025-05-22' },
      { need: 'elderly', title: 'Assentos na área de leitura', status: 'available', source: 'verified', verified_date: '2025-05-22' },
      { need: 'elderly', title: 'Acesso ao segundo piso apenas por escada', status: 'barrier', source: 'verified', verified_date: '2025-05-22' }
    ],
    reviews: [
      {
        visit_date: '2025-06-10',
        created_at: '2025-06-10 17:00:00',
        comment: 'Ambiente maravilhoso, mas impossível entrar com cadeira de rodas. Degrau na entrada sem alternativa.',
        items: [
          { need: 'mobility', status: 'barrier' },
          { need: 'sensory', status: 'available' }
        ]
      },
      {
        visit_date: '2025-07-15',
        created_at: '2025-07-15 15:40:00',
        comment: 'Eventos com intérprete de Libras são ótimos. Corredores muito apertados.',
        items: [
          { need: 'auditory', status: 'available' },
          { need: 'mobility', status: 'barrier' },
          { need: 'elderly', status: 'barrier' }
        ]
      }
    ]
  }
];

function seedDatabase(db) {
  const insertPlace = db.prepare(`
    INSERT INTO places (name, category, neighborhood, address, city, lat, lng, description, last_verified_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO accessibility_items (place_id, need, title, status, source, verified_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (place_id, visit_date, comment, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const insertReviewItem = db.prepare(`
    INSERT INTO review_items (review_id, need, status)
    VALUES (?, ?, ?)
  `);

  const seedTransaction = db.transaction(() => {
    for (const place of seedData) {
      const placeResult = insertPlace.run(
        place.name,
        place.category,
        place.neighborhood,
        place.address,
        place.city || 'Fortaleza/CE',
        place.lat,
        place.lng,
        place.description,
        place.last_verified_date
      );
      const placeId = placeResult.lastInsertRowid;

      if (Array.isArray(place.items)) {
        for (const item of place.items) {
          insertItem.run(
            placeId,
            item.need,
            item.title,
            item.status,
            item.source || 'verified',
            item.verified_date || null
          );
        }
      }

      if (Array.isArray(place.reviews)) {
        for (const review of place.reviews) {
          const reviewResult = insertReview.run(
            placeId,
            review.visit_date,
            review.comment,
            review.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19)
          );
          const reviewId = reviewResult.lastInsertRowid;

          if (Array.isArray(review.items)) {
            for (const rItem of review.items) {
              insertReviewItem.run(
                reviewId,
                rItem.need,
                rItem.status
              );
            }
          }
        }
      }
    }
  });

  seedTransaction();
}

function getDb(customPath) {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = customPath || path.resolve(__dirname, 'avia.db');
  dbInstance = new Database(dbPath);

  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  dbInstance.exec(schema);

  const placeCount = dbInstance.prepare('SELECT COUNT(*) as count FROM places').get().count;
  if (placeCount === 0) {
    seedDatabase(dbInstance);
  }

  return dbInstance;
}

module.exports = {
  getDb,
  seedDatabase,
  schema
};
