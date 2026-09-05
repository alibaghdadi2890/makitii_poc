import type { Ad, Condition } from './types'

interface AdSeed {
  slug: string
  cat: string
  sub: string
  fr: [string, string]
  en: [string, string]
  price: number
  location: string
  daysAgo: number
  condition?: Condition
  negotiable?: boolean
  featured?: boolean
  attrs?: [string, string, string][]
}

const sellers = [
  { name: 'Mamadou Diallo', memberSince: '2024-03-11', phone: '+224 622 45 18 90', verified: true },
  { name: 'Aïssatou Barry', memberSince: '2023-11-02', phone: '+224 628 77 34 12', verified: true },
  { name: 'Ibrahima Camara', memberSince: '2025-01-20', phone: '+224 620 09 55 41', verified: false },
  { name: 'Fatoumata Sylla', memberSince: '2024-08-05', phone: '+224 655 12 88 07', verified: true },
  { name: 'Ousmane Bah', memberSince: '2025-06-14', phone: '+224 610 63 22 75', verified: false },
  { name: 'Kadiatou Touré', memberSince: '2023-05-29', phone: '+224 664 41 09 33', verified: true },
]

const today = new Date('2026-09-05T00:00:00Z')
const dateMinus = (days: number) =>
  new Date(today.getTime() - days * 86_400_000).toISOString().slice(0, 10)

const build = (seed: AdSeed, index: number): Ad => ({
  id: seed.slug,
  slug: seed.slug,
  categoryId: seed.cat,
  subCategoryId: seed.sub,
  fr: { title: seed.fr[0], description: seed.fr[1] },
  en: { title: seed.en[0], description: seed.en[1] },
  priceGnf: seed.price,
  negotiable: seed.negotiable ?? true,
  condition: seed.condition ?? 'used',
  location: seed.location,
  postedAt: dateMinus(seed.daysAgo),
  featured: seed.featured ?? false,
  seller: sellers[index % sellers.length],
  attributes: (seed.attrs ?? []).map(([fr, en, value]) => ({ fr, en, value })),
})

const seeds: AdSeed[] = [
  // Vehicles ------------------------------------------------------------------
  {
    slug: 'toyota-rav4-2019',
    cat: 'vehicles',
    sub: 'cars-for-sale',
    fr: [
      'Toyota RAV4 2019 — 4x4 essence',
      "Importée du Japon et entretenue au garage Toyota de Matoto. Climatisation froide, pneus neufs, papiers en règle. Visible sur rendez-vous à Kipé.",
    ],
    en: [
      'Toyota RAV4 2019 — 4WD petrol',
      'Imported from Japan and serviced at the Toyota garage in Matoto. Cold aircon, new tyres, full paperwork. Viewing by appointment in Kipé.',
    ],
    price: 148_000_000,
    location: 'Kipé',
    daysAgo: 2,
    featured: true,
    attrs: [
      ['Année', 'Year', '2019'],
      ['Kilométrage', 'Mileage', '86 400 km'],
      ['Boîte', 'Transmission', 'Automatique'],
      ['Carburant', 'Fuel', 'Essence'],
    ],
  },
  {
    slug: 'hyundai-tucson-2017',
    cat: 'vehicles',
    sub: 'cars-for-sale',
    fr: [
      'Hyundai Tucson 2017 diesel',
      "Deuxième main avec carnet d'entretien complet. Idéale pour la ville et les trajets vers Kindia. Petit choc sans gravité sur le pare-chocs arrière.",
    ],
    en: [
      'Hyundai Tucson 2017 diesel',
      'Second owner with a complete service book. Good for city driving and trips to Kindia. Minor scuff on the rear bumper, nothing structural.',
    ],
    price: 97_500_000,
    location: 'Ratoma',
    daysAgo: 5,
    attrs: [
      ['Année', 'Year', '2017'],
      ['Kilométrage', 'Mileage', '132 000 km'],
      ['Boîte', 'Transmission', 'Automatique'],
      ['Carburant', 'Fuel', 'Diesel'],
    ],
  },
  {
    slug: 'mercedes-c200-2015',
    cat: 'vehicles',
    sub: 'cars-for-sale',
    fr: [
      'Mercedes-Benz C200 2015',
      'Berline en très bon état, intérieur cuir propre, jantes d’origine. Vitres teintées et système audio d’usine. Prix légèrement négociable.',
    ],
    en: [
      'Mercedes-Benz C200 2015',
      'Saloon in very good condition, clean leather interior, original rims. Tinted windows and factory audio. Price slightly negotiable.',
    ],
    price: 165_000_000,
    location: 'Kaloum',
    daysAgo: 8,
    attrs: [
      ['Année', 'Year', '2015'],
      ['Kilométrage', 'Mileage', '104 300 km'],
      ['Boîte', 'Transmission', 'Automatique'],
      ['Carburant', 'Fuel', 'Essence'],
    ],
  },
  {
    slug: 'location-toyota-hiace',
    cat: 'vehicles',
    sub: 'cars-for-rent',
    fr: [
      'Location Toyota Hiace 15 places avec chauffeur',
      "Disponible à la journée ou à la semaine pour mariages, transferts aéroport et missions à l'intérieur du pays. Carburant non inclus.",
    ],
    en: [
      'Toyota Hiace 15-seater rental with driver',
      'Available by the day or week for weddings, airport transfers and upcountry missions. Fuel not included.',
    ],
    price: 850_000,
    location: 'Matoto',
    daysAgo: 1,
    negotiable: false,
    attrs: [
      ['Places', 'Seats', '15'],
      ['Chauffeur', 'Driver', 'Inclus'],
      ['Tarif', 'Rate', 'Par jour'],
    ],
  },
  {
    slug: 'yamaha-crux-125',
    cat: 'vehicles',
    sub: 'motorcycles',
    fr: [
      'Moto Yamaha Crux 125 cc',
      'Moto fiable pour la course en ville, faible consommation. Vidange faite la semaine dernière, chaîne et plaquettes neuves.',
    ],
    en: [
      'Yamaha Crux 125 cc motorcycle',
      'Reliable bike for city runs with low fuel use. Oil changed last week, new chain and brake pads.',
    ],
    price: 9_800_000,
    location: 'Matam',
    daysAgo: 3,
    attrs: [
      ['Cylindrée', 'Engine', '125 cc'],
      ['Année', 'Year', '2022'],
    ],
  },
  {
    slug: 'pneus-michelin-16',
    cat: 'vehicles',
    sub: 'spare-parts',
    fr: [
      'Jeu de 4 pneus Michelin 215/65 R16',
      'Pneus neufs jamais montés, achetés en trop lors d’une commande. Facture disponible.',
    ],
    en: [
      'Set of 4 Michelin tyres 215/65 R16',
      'Brand-new tyres, never fitted — over-ordered on a shipment. Invoice available.',
    ],
    price: 4_200_000,
    location: 'Dixinn',
    daysAgo: 6,
    condition: 'new',
  },

  // Real estate ---------------------------------------------------------------
  {
    slug: 'villa-4-chambres-nongo',
    cat: 'real-estate',
    sub: 'apartments-rent',
    fr: [
      'Villa 4 chambres à louer à Nongo',
      "Villa clôturée avec cour, forage et groupe électrogène. Cuisine équipée, quatre chambres dont une suite parentale. Bail d'un an minimum.",
    ],
    en: [
      '4-bedroom villa for rent in Nongo',
      'Fenced villa with a yard, borehole and generator. Fitted kitchen, four bedrooms including a master suite. Minimum one-year lease.',
    ],
    price: 12_000_000,
    location: 'Nongo',
    daysAgo: 1,
    featured: true,
    negotiable: false,
    attrs: [
      ['Chambres', 'Bedrooms', '4'],
      ['Salles de bain', 'Bathrooms', '3'],
      ['Surface', 'Area', '260 m²'],
      ['Loyer', 'Rent', 'Par mois'],
    ],
  },
  {
    slug: 'appartement-2-chambres-taouyah',
    cat: 'real-estate',
    sub: 'apartments-rent',
    fr: [
      'Appartement 2 chambres meublé à Taouyah',
      'Deuxième étage avec ascenseur, eau courante et parking. Proche des commerces et de la route Le Prince.',
    ],
    en: [
      'Furnished 2-bedroom apartment in Taouyah',
      'Second floor with lift, running water and parking. Close to shops and Route Le Prince.',
    ],
    price: 5_500_000,
    location: 'Taouyah',
    daysAgo: 4,
    negotiable: false,
    attrs: [
      ['Chambres', 'Bedrooms', '2'],
      ['Surface', 'Area', '95 m²'],
      ['Meublé', 'Furnished', 'Oui'],
      ['Loyer', 'Rent', 'Par mois'],
    ],
  },
  {
    slug: 'terrain-500m-kipe',
    cat: 'real-estate',
    sub: 'land',
    fr: [
      'Terrain 500 m² titré à Kipé',
      'Parcelle plate et bornée, titre foncier disponible, accès goudronné à 200 m. Convient pour une habitation ou un petit immeuble.',
    ],
    en: [
      'Titled 500 m² plot in Kipé',
      'Flat, surveyed plot with land title available and tarred access 200 m away. Suitable for a house or small building.',
    ],
    price: 320_000_000,
    location: 'Kipé',
    daysAgo: 11,
    attrs: [
      ['Surface', 'Area', '500 m²'],
      ['Titre', 'Title', 'Titre foncier'],
    ],
  },
  {
    slug: 'duplex-vendre-lambanyi',
    cat: 'real-estate',
    sub: 'apartments-sale',
    fr: [
      'Duplex 5 chambres à vendre à Lambanyi',
      'Construction récente sur deux niveaux, garage double, panneaux solaires installés. Quartier calme et résidentiel.',
    ],
    en: [
      '5-bedroom duplex for sale in Lambanyi',
      'Recent two-storey build with a double garage and installed solar panels. Quiet residential area.',
    ],
    price: 1_450_000_000,
    location: 'Lambanyi',
    daysAgo: 9,
    attrs: [
      ['Chambres', 'Bedrooms', '5'],
      ['Surface', 'Area', '340 m²'],
      ['Année', 'Year', '2023'],
    ],
  },
  {
    slug: 'bureau-kaloum',
    cat: 'real-estate',
    sub: 'offices',
    fr: [
      'Bureau 80 m² au centre de Kaloum',
      'Plateau de bureaux climatisé au cœur du quartier des affaires, fibre optique disponible, gardiennage 24 h.',
    ],
    en: [
      '80 m² office in central Kaloum',
      'Air-conditioned office space in the business district with fibre internet and 24-hour security.',
    ],
    price: 8_000_000,
    location: 'Kaloum',
    daysAgo: 7,
    negotiable: false,
    attrs: [
      ['Surface', 'Area', '80 m²'],
      ['Loyer', 'Rent', 'Par mois'],
    ],
  },

  // Electronics ---------------------------------------------------------------
  {
    slug: 'iphone-15-pro-256',
    cat: 'electronics',
    sub: 'mobile-phones',
    fr: [
      'iPhone 15 Pro 256 Go — batterie 94 %',
      "Acheté à Dubaï et utilisé six mois avec coque et verre trempé depuis le premier jour. Aucune rayure, boîte et câble d'origine fournis.",
    ],
    en: [
      'iPhone 15 Pro 256 GB — 94% battery',
      'Bought in Dubai and used for six months with a case and screen protector from day one. No scratches; original box and cable included.',
    ],
    price: 11_900_000,
    location: 'Ratoma',
    daysAgo: 1,
    condition: 'like-new',
    featured: true,
    attrs: [
      ['Stockage', 'Storage', '256 Go'],
      ['Batterie', 'Battery', '94 %'],
      ['Garantie', 'Warranty', 'Non'],
    ],
  },
  {
    slug: 'samsung-a35-5g',
    cat: 'electronics',
    sub: 'mobile-phones',
    fr: [
      'Samsung Galaxy A35 5G neuf sous blister',
      'Téléphone neuf jamais ouvert, double SIM, 128 Go. Facture du magasin fournie, garantie un an.',
    ],
    en: [
      'Samsung Galaxy A35 5G, sealed',
      'Brand-new sealed phone, dual SIM, 128 GB. Shop invoice included with a one-year warranty.',
    ],
    price: 3_100_000,
    location: 'Madina',
    daysAgo: 2,
    condition: 'new',
    negotiable: false,
    attrs: [
      ['Stockage', 'Storage', '128 Go'],
      ['Garantie', 'Warranty', '12 mois'],
    ],
  },
  {
    slug: 'tecno-camon-30',
    cat: 'electronics',
    sub: 'mobile-phones',
    fr: [
      'Tecno Camon 30 — 256 Go, très bon état',
      'Écran impeccable et autonomie excellente. Vendu avec le chargeur rapide d’origine.',
    ],
    en: [
      'Tecno Camon 30 — 256 GB, very good condition',
      'Flawless screen and excellent battery life. Sold with the original fast charger.',
    ],
    price: 2_150_000,
    location: 'Matoto',
    daysAgo: 4,
    attrs: [['Stockage', 'Storage', '256 Go']],
  },
  {
    slug: 'infinix-note-40',
    cat: 'electronics',
    sub: 'mobile-phones',
    fr: [
      'Infinix Note 40 Pro — 8/256 Go',
      'Grand écran AMOLED et charge rapide 45 W. Utilisé quatre mois, protège-écran posé dès l’achat.',
    ],
    en: [
      'Infinix Note 40 Pro — 8/256 GB',
      'Large AMOLED screen with 45 W fast charging. Four months of use, screen protector fitted from purchase.',
    ],
    price: 2_650_000,
    location: 'Dixinn',
    daysAgo: 6,
    condition: 'like-new',
    attrs: [
      ['Stockage', 'Storage', '256 Go'],
      ['Mémoire', 'Memory', '8 Go'],
    ],
  },
  {
    slug: 'macbook-air-m3',
    cat: 'electronics',
    sub: 'laptops',
    fr: [
      'MacBook Air M3 13" — 16 Go / 256 Go',
      "Sous garantie Apple jusqu'en mars 2027. Utilisé pour du graphisme, aucun choc, 42 cycles de batterie.",
    ],
    en: [
      'MacBook Air M3 13" — 16 GB / 256 GB',
      'Under Apple warranty until March 2027. Used for design work, no dents, 42 battery cycles.',
    ],
    price: 13_500_000,
    location: 'Kipé',
    daysAgo: 3,
    condition: 'like-new',
    featured: true,
    attrs: [
      ['Mémoire', 'Memory', '16 Go'],
      ['Stockage', 'Storage', '256 Go'],
      ['Écran', 'Screen', '13,6 pouces'],
    ],
  },
  {
    slug: 'dell-g15-gaming',
    cat: 'electronics',
    sub: 'laptops',
    fr: [
      'Dell G15 gaming — RTX 4060, 16 Go',
      'Machine puissante pour le montage vidéo et les jeux. Clavier rétroéclairé, refroidissement révisé, sacoche offerte.',
    ],
    en: [
      'Dell G15 gaming laptop — RTX 4060, 16 GB',
      'Powerful machine for video editing and gaming. Backlit keyboard, cooling recently serviced, carry bag included.',
    ],
    price: 9_400_000,
    location: 'Dixinn',
    daysAgo: 6,
    attrs: [
      ['Processeur', 'Processor', 'Intel i7'],
      ['Carte graphique', 'Graphics', 'RTX 4060'],
      ['Mémoire', 'Memory', '16 Go'],
    ],
  },
  {
    slug: 'hp-elitebook-840',
    cat: 'electronics',
    sub: 'laptops',
    fr: [
      'HP EliteBook 840 G8 — i5, 512 Go SSD',
      'Ordinateur léger et robuste, parfait pour les études et le travail administratif. Windows 11 installé.',
    ],
    en: [
      'HP EliteBook 840 G8 — i5, 512 GB SSD',
      'Light, sturdy business laptop, ideal for studies and office work. Windows 11 installed.',
    ],
    price: 6_200_000,
    location: 'Matam',
    daysAgo: 10,
    attrs: [
      ['Processeur', 'Processor', 'Intel i5'],
      ['Stockage', 'Storage', '512 Go SSD'],
    ],
  },
  {
    slug: 'lenovo-ideapad-3',
    cat: 'electronics',
    sub: 'laptops',
    fr: [
      'Lenovo IdeaPad 3 — 8 Go, 256 Go SSD',
      'Ordinateur d’étude en bon état, batterie tenant environ cinq heures. Chargeur d’origine inclus.',
    ],
    en: [
      'Lenovo IdeaPad 3 — 8 GB, 256 GB SSD',
      'Study laptop in good condition with roughly five hours of battery life. Original charger included.',
    ],
    price: 4_100_000,
    location: 'Ratoma',
    daysAgo: 13,
    attrs: [
      ['Mémoire', 'Memory', '8 Go'],
      ['Stockage', 'Storage', '256 Go SSD'],
    ],
  },
  {
    slug: 'apple-watch-se',
    cat: 'electronics',
    sub: 'smart-watches',
    fr: [
      'Apple Watch SE 44 mm avec deux bracelets',
      'Montre en excellent état, batterie saine. Livrée avec le bracelet sport d’origine et un bracelet milanais.',
    ],
    en: [
      'Apple Watch SE 44 mm with two straps',
      'Watch in excellent condition with a healthy battery. Comes with the original sport band and a Milanese strap.',
    ],
    price: 2_400_000,
    location: 'Coléah',
    daysAgo: 5,
    condition: 'like-new',
  },
  {
    slug: 'tv-hisense-55',
    cat: 'electronics',
    sub: 'tv-audio',
    fr: [
      'Téléviseur Hisense 55" 4K Smart TV',
      'Image nette, télécommande d’origine, support mural inclus. Cause du départ : déménagement.',
    ],
    en: [
      'Hisense 55" 4K Smart TV',
      'Sharp picture, original remote, wall bracket included. Selling because of a move.',
    ],
    price: 4_800_000,
    location: 'Ratoma',
    daysAgo: 8,
    attrs: [
      ['Taille', 'Size', '55 pouces'],
      ['Résolution', 'Resolution', '4K'],
    ],
  },

  // Furniture & decor ---------------------------------------------------------
  {
    slug: 'salon-7-places',
    cat: 'furniture',
    sub: 'living-room',
    fr: [
      'Salon 7 places en tissu gris',
      'Ensemble canapé trois places, deux fauteuils et méridienne. Tissu propre, mousse ferme. Livraison possible dans Conakry.',
    ],
    en: [
      '7-seater grey fabric living room set',
      'Three-seater sofa, two armchairs and a chaise. Clean fabric, firm foam. Delivery available within Conakry.',
    ],
    price: 7_500_000,
    location: 'Matoto',
    daysAgo: 3,
    featured: true,
  },
  {
    slug: 'lit-king-bois',
    cat: 'furniture',
    sub: 'bedroom',
    fr: [
      'Lit king size en bois massif avec matelas',
      'Fabrication locale en bois d’iroko, tête de lit capitonnée. Matelas orthopédique acheté il y a un an.',
    ],
    en: [
      'Solid wood king-size bed with mattress',
      'Locally made in iroko wood with an upholstered headboard. Orthopaedic mattress bought a year ago.',
    ],
    price: 5_900_000,
    location: 'Lambanyi',
    daysAgo: 7,
    attrs: [['Dimensions', 'Dimensions', '180 × 200 cm']],
  },
  {
    slug: 'table-manger-6',
    cat: 'furniture',
    sub: 'dining-room',
    fr: [
      'Table à manger 6 places avec chaises',
      'Plateau en verre trempé, pieds chromés, six chaises assorties en très bon état.',
    ],
    en: [
      '6-seater dining table with chairs',
      'Tempered glass top, chrome legs and six matching chairs in very good condition.',
    ],
    price: 3_400_000,
    location: 'Kipé',
    daysAgo: 12,
  },
  {
    slug: 'climatiseur-lg-1-5cv',
    cat: 'furniture',
    sub: 'appliances',
    fr: [
      'Climatiseur split LG 1,5 CV',
      'Installé il y a huit mois et très peu utilisé. Vendu avec la télécommande et le kit de fixation.',
    ],
    en: [
      'LG 1.5 HP split air conditioner',
      'Installed eight months ago and barely used. Sold with remote and mounting kit.',
    ],
    price: 3_900_000,
    location: 'Dixinn',
    daysAgo: 2,
    condition: 'like-new',
  },
  {
    slug: 'rideaux-tapis-salon',
    cat: 'furniture',
    sub: 'home-decor',
    fr: [
      'Rideaux occultants et tapis de salon',
      'Lot complet pour un salon : deux paires de rideaux occultants et un grand tapis 2 × 3 m.',
    ],
    en: [
      'Blackout curtains and living room rug',
      'Complete set for one living room: two pairs of blackout curtains and a large 2 × 3 m rug.',
    ],
    price: 1_250_000,
    location: 'Taouyah',
    daysAgo: 14,
  },

  // Jobs ----------------------------------------------------------------------
  {
    slug: 'comptable-pme',
    cat: 'jobs',
    sub: 'jobs-available',
    fr: [
      'Comptable expérimenté — PME à Kaloum',
      "Nous recherchons un comptable avec trois ans d'expérience minimum, maîtrisant Sage et le plan comptable SYSCOHADA. Poste à pourvoir immédiatement.",
    ],
    en: [
      'Experienced accountant — SME in Kaloum',
      'We are looking for an accountant with at least three years of experience, comfortable with Sage and the SYSCOHADA chart of accounts. Immediate start.',
    ],
    price: 4_500_000,
    location: 'Kaloum',
    daysAgo: 2,
    negotiable: false,
    featured: true,
    attrs: [
      ['Contrat', 'Contract', 'CDI'],
      ['Salaire', 'Salary', 'Par mois'],
      ['Expérience', 'Experience', '3 ans et plus'],
    ],
  },
  {
    slug: 'chauffeur-permis-c',
    cat: 'jobs',
    sub: 'jobs-available',
    fr: [
      'Chauffeur poids lourd permis C',
      'Société de distribution recherche un chauffeur pour des livraisons dans le Grand Conakry. Permis C valide et casier vierge exigés.',
    ],
    en: [
      'HGV driver, category C licence',
      'Distribution company seeking a driver for deliveries across Greater Conakry. Valid category C licence and clean record required.',
    ],
    price: 2_800_000,
    location: 'Matoto',
    daysAgo: 5,
    negotiable: false,
    attrs: [
      ['Contrat', 'Contract', 'CDD'],
      ['Salaire', 'Salary', 'Par mois'],
    ],
  },
  {
    slug: 'developpeur-web-junior',
    cat: 'jobs',
    sub: 'job-seekers',
    fr: [
      'Développeur web junior cherche mission',
      'Titulaire d’une licence en informatique, je maîtrise React, Node.js et MySQL. Disponible immédiatement et mobile sur Conakry.',
    ],
    en: [
      'Junior web developer available',
      'Computer science graduate skilled in React, Node.js and MySQL. Available immediately and mobile across Conakry.',
    ],
    price: 3_000_000,
    location: 'Ratoma',
    daysAgo: 6,
    attrs: [['Disponibilité', 'Availability', 'Immédiate']],
  },
  {
    slug: 'service-plomberie',
    cat: 'jobs',
    sub: 'services',
    fr: [
      'Plombier — dépannage et installation',
      'Interventions rapides pour fuites, chauffe-eau et installation sanitaire complète. Devis gratuit à domicile.',
    ],
    en: [
      'Plumber — repairs and installation',
      'Fast call-outs for leaks, water heaters and full bathroom installations. Free on-site quotes.',
    ],
    price: 250_000,
    location: 'Matam',
    daysAgo: 1,
    attrs: [['Tarif', 'Rate', 'À partir de']],
  },
  {
    slug: 'cours-particuliers-maths',
    cat: 'jobs',
    sub: 'services',
    fr: [
      'Cours particuliers de mathématiques',
      'Professeur de lycée donne des cours de maths et de physique, du collège à la terminale. Préparation au baccalauréat.',
    ],
    en: [
      'Private maths tutoring',
      'Secondary school teacher offering maths and physics lessons from middle school to final year, including baccalauréat preparation.',
    ],
    price: 400_000,
    location: 'Dixinn',
    daysAgo: 9,
    attrs: [['Tarif', 'Rate', 'Par mois']],
  },

  // Fashion -------------------------------------------------------------------
  {
    slug: 'ensemble-bazin-brode',
    cat: 'fashion',
    sub: 'women',
    fr: [
      'Ensemble bazin riche brodé — taille M',
      'Bazin teinté à la main et brodé à la machine, jamais porté. Indigo profond, coupe moderne.',
    ],
    en: [
      'Embroidered rich bazin outfit — size M',
      'Hand-dyed bazin with machine embroidery, never worn. Deep indigo with a modern cut.',
    ],
    price: 1_450_000,
    location: 'Madina',
    daysAgo: 3,
    condition: 'new',
    featured: true,
  },
  {
    slug: 'costume-homme-3-pieces',
    cat: 'fashion',
    sub: 'men',
    fr: [
      'Costume trois pièces — taille 50',
      'Costume bleu marine porté une seule fois pour un mariage. Retouché par un tailleur, très bonne tenue.',
    ],
    en: [
      'Three-piece suit — size 50',
      'Navy suit worn once for a wedding. Tailored to fit and holds its shape well.',
    ],
    price: 1_800_000,
    location: 'Kaloum',
    daysAgo: 8,
  },
  {
    slug: 'sacs-a-main-lot',
    cat: 'fashion',
    sub: 'shoes',
    fr: [
      'Lot de 5 sacs à main — vente en gros',
      'Sacs neufs importés, idéaux pour les revendeuses. Modèles assortis, prix pour le lot complet.',
    ],
    en: [
      'Lot of 5 handbags — wholesale',
      'New imported bags, ideal for resellers. Assorted models, price for the full lot.',
    ],
    price: 2_200_000,
    location: 'Madina',
    daysAgo: 4,
    condition: 'new',
    negotiable: false,
  },
  {
    slug: 'montre-homme-acier',
    cat: 'fashion',
    sub: 'jewellery',
    fr: [
      'Montre homme en acier inoxydable',
      'Montre automatique avec bracelet acier et verre saphir. Achetée à Conakry, boîte fournie.',
    ],
    en: [
      "Men's stainless steel watch",
      'Automatic watch with a steel bracelet and sapphire glass. Bought in Conakry, box included.',
    ],
    price: 950_000,
    location: 'Ratoma',
    daysAgo: 11,
  },

  // Kids ----------------------------------------------------------------------
  {
    slug: 'poussette-3-roues',
    cat: 'kids',
    sub: 'strollers',
    fr: [
      'Poussette trois roues tout terrain',
      'Poussette pliable avec ombrelle et panier de rangement. Roues gonflables adaptées aux routes non goudronnées.',
    ],
    en: [
      'Three-wheel all-terrain stroller',
      'Folding stroller with a canopy and storage basket; inflatable wheels handle unpaved roads well.',
    ],
    price: 1_100_000,
    location: 'Kipé',
    daysAgo: 5,
  },
  {
    slug: 'lit-bebe-matelas',
    cat: 'kids',
    sub: 'feeding',
    fr: [
      'Lit bébé en bois avec matelas',
      'Lit à barreaux réglable en hauteur, utilisé pour un seul enfant. Matelas propre fourni.',
    ],
    en: [
      'Wooden cot with mattress',
      'Height-adjustable cot used for one child only. Clean mattress included.',
    ],
    price: 1_350_000,
    location: 'Nongo',
    daysAgo: 7,
  },
  {
    slug: 'lot-jouets-educatifs',
    cat: 'kids',
    sub: 'toys',
    fr: [
      'Lot de jouets éducatifs 2–5 ans',
      'Puzzles, cubes d’apprentissage et jeux de construction. Tout est complet et désinfecté.',
    ],
    en: [
      'Educational toy bundle, ages 2–5',
      'Puzzles, learning blocks and building sets. Everything is complete and sanitised.',
    ],
    price: 480_000,
    location: 'Matam',
    daysAgo: 10,
  },
  {
    slug: 'vetements-bebe-lot',
    cat: 'kids',
    sub: 'kids-clothing',
    fr: [
      'Lot de vêtements bébé 0–12 mois',
      'Une trentaine de pièces en très bon état : bodys, pyjamas et ensembles. Lavés et repassés.',
    ],
    en: [
      'Baby clothing bundle, 0–12 months',
      'About thirty pieces in very good condition: bodysuits, pyjamas and sets. Washed and ironed.',
    ],
    price: 320_000,
    location: 'Coléah',
    daysAgo: 13,
  },

  // Agriculture & animals -----------------------------------------------------
  {
    slug: 'berger-allemand-chiots',
    cat: 'animals',
    sub: 'dogs',
    fr: [
      'Chiots berger allemand — 3 mois',
      'Chiots vaccinés et vermifugés, parents visibles sur place. Carnet de santé à jour.',
    ],
    en: [
      'German shepherd puppies — 3 months',
      'Vaccinated and dewormed puppies; both parents can be seen on site. Health records up to date.',
    ],
    price: 3_500_000,
    location: 'Lambanyi',
    daysAgo: 2,
    featured: true,
  },
  {
    slug: 'moutons-tabaski',
    cat: 'animals',
    sub: 'livestock',
    fr: [
      'Moutons de race pour la Tabaski',
      'Béliers bien nourris, plusieurs tailles disponibles. Livraison possible à Conakry moyennant un supplément.',
    ],
    en: [
      'Rams for Tabaski',
      'Well-fed rams in several sizes. Delivery within Conakry available for an extra fee.',
    ],
    price: 4_200_000,
    location: 'Matoto',
    daysAgo: 4,
  },
  {
    slug: 'perroquet-gris-cage',
    cat: 'animals',
    sub: 'birds',
    fr: [
      'Perroquet gris du Gabon avec cage',
      'Oiseau habitué à la présence humaine. Grande cage en métal incluse ainsi qu’un stock de nourriture.',
    ],
    en: [
      'African grey parrot with cage',
      'Bird accustomed to people; large metal cage and a stock of feed included.',
    ],
    price: 5_000_000,
    location: 'Ratoma',
    daysAgo: 9,
  },
  {
    slug: 'motoculteur-diesel',
    cat: 'animals',
    sub: 'farm-supplies',
    fr: [
      'Motoculteur diesel 12 CV',
      'Machine agricole en bon état de marche, utilisée deux saisons. Charrue et remorque disponibles séparément.',
    ],
    en: [
      '12 HP diesel power tiller',
      'Farm machine in good working order, used for two seasons. Plough and trailer available separately.',
    ],
    price: 18_500_000,
    location: 'Matoto',
    daysAgo: 15,
  },

  // Sports --------------------------------------------------------------------
  {
    slug: 'tapis-course-pliable',
    cat: 'sports',
    sub: 'gym',
    fr: [
      'Tapis de course pliable avec écran',
      'Tapis motorisé avec douze programmes, se replie pour gagner de la place. Peu utilisé, moteur silencieux.',
    ],
    en: [
      'Folding treadmill with display',
      'Motorised treadmill with twelve programmes that folds away to save space. Lightly used, quiet motor.',
    ],
    price: 6_800_000,
    location: 'Kipé',
    daysAgo: 6,
  },
  {
    slug: 'haltere-set-50kg',
    cat: 'sports',
    sub: 'gym',
    fr: [
      'Set haltères et disques 50 kg',
      'Barre droite, deux haltères courts et disques en fonte. Idéal pour une salle à domicile.',
    ],
    en: [
      '50 kg dumbbell and plate set',
      'Straight bar, two short dumbbells and cast iron plates. Ideal for a home gym.',
    ],
    price: 1_900_000,
    location: 'Dixinn',
    daysAgo: 12,
  },
  {
    slug: 'velo-vtt-27',
    cat: 'sports',
    sub: 'bicycles',
    fr: [
      'VTT 27,5 pouces 21 vitesses',
      'Vélo tout terrain révisé, freins à disque et pneus neufs. Convient aux routes de Conakry.',
    ],
    en: [
      '27.5" mountain bike, 21 speeds',
      'Serviced mountain bike with disc brakes and new tyres. Handles Conakry roads well.',
    ],
    price: 1_600_000,
    location: 'Taouyah',
    daysAgo: 8,
  },
  {
    slug: 'equipement-plongee',
    cat: 'sports',
    sub: 'water-sports',
    fr: [
      'Équipement de plongée complet',
      'Combinaison, palmes, masque et détendeur révisé. Matériel entretenu, utilisé aux îles de Loos.',
    ],
    en: [
      'Complete diving kit',
      'Wetsuit, fins, mask and a serviced regulator. Well-maintained gear used around the Loos Islands.',
    ],
    price: 5_400_000,
    location: 'Kaloum',
    daysAgo: 16,
  },

  // Hobbies -------------------------------------------------------------------
  {
    slug: 'guitare-yamaha-f310',
    cat: 'hobbies',
    sub: 'instruments',
    fr: [
      'Guitare acoustique Yamaha F310',
      'Guitare bien entretenue avec housse et jeu de cordes neuf. Son chaud, manche droit.',
    ],
    en: [
      'Yamaha F310 acoustic guitar',
      'Well-kept guitar with a gig bag and a new set of strings. Warm tone, straight neck.',
    ],
    price: 1_450_000,
    location: 'Ratoma',
    daysAgo: 5,
  },
  {
    slug: 'ps5-manettes',
    cat: 'hobbies',
    sub: 'games',
    fr: [
      'PlayStation 5 avec deux manettes',
      'Console en parfait état avec deux manettes et trois jeux physiques. Facture d’achat disponible.',
    ],
    en: [
      'PlayStation 5 with two controllers',
      'Console in perfect condition with two controllers and three physical games. Purchase receipt available.',
    ],
    price: 7_200_000,
    location: 'Kipé',
    daysAgo: 3,
    condition: 'like-new',
    featured: true,
  },
  {
    slug: 'clavier-yamaha-psr',
    cat: 'hobbies',
    sub: 'instruments',
    fr: [
      'Clavier Yamaha PSR-E373 avec pied',
      'Clavier 61 touches sensitives, pied réglable et adaptateur secteur inclus.',
    ],
    en: [
      'Yamaha PSR-E373 keyboard with stand',
      '61 touch-sensitive keys, adjustable stand and mains adapter included.',
    ],
    price: 2_600_000,
    location: 'Matam',
    daysAgo: 10,
  },
  {
    slug: 'livres-scolaires-lot',
    cat: 'hobbies',
    sub: 'books',
    fr: [
      'Lot de manuels scolaires — terminale',
      'Manuels de maths, physique, philosophie et anglais en bon état, annotations légères au crayon.',
    ],
    en: [
      'Final-year school textbook bundle',
      'Maths, physics, philosophy and English textbooks in good condition with light pencil notes.',
    ],
    price: 180_000,
    location: 'Dixinn',
    daysAgo: 18,
  },

  // Bazzar --------------------------------------------------------------------
  {
    slug: 'groupe-electrogene-5kva',
    cat: 'bazzar',
    sub: 'everything-else',
    fr: [
      'Groupe électrogène 5 kVA insonorisé',
      'Démarrage électrique, faible consommation, révisé le mois dernier. Parfait pour une maison ou une boutique.',
    ],
    en: [
      '5 kVA soundproofed generator',
      'Electric start, low fuel use, serviced last month. Good for a house or a shop.',
    ],
    price: 12_800_000,
    location: 'Matoto',
    daysAgo: 4,
    featured: true,
  },
  {
    slug: 'panneaux-solaires-lot',
    cat: 'bazzar',
    sub: 'everything-else',
    fr: [
      'Kit solaire 4 panneaux avec batteries',
      'Installation complète démontée : quatre panneaux 400 W, deux batteries gel et un onduleur hybride.',
    ],
    en: [
      'Solar kit: 4 panels with batteries',
      'Complete decommissioned setup: four 400 W panels, two gel batteries and a hybrid inverter.',
    ],
    price: 22_000_000,
    location: 'Nongo',
    daysAgo: 7,
  },
  {
    slug: 'cartons-demenagement',
    cat: 'bazzar',
    sub: 'free-stuff',
    fr: [
      'Cartons de déménagement à donner',
      'Une vingtaine de cartons solides après un déménagement. À récupérer sur place à Coléah.',
    ],
    en: [
      'Moving boxes, free to collect',
      'About twenty sturdy boxes left over from a move. Collection in Coléah.',
    ],
    price: 0,
    location: 'Coléah',
    daysAgo: 2,
    negotiable: false,
  },
  {
    slug: 'trousseau-cles-trouve',
    cat: 'bazzar',
    sub: 'lost-found',
    fr: [
      'Trousseau de clés trouvé à Taouyah',
      'Trouvé près du marché de Taouyah. Décrivez le porte-clés pour le récupérer.',
    ],
    en: [
      'Keys found in Taouyah',
      'Found near Taouyah market. Describe the keyring to claim them.',
    ],
    price: 0,
    location: 'Taouyah',
    daysAgo: 1,
    negotiable: false,
  },

  // Madinah -------------------------------------------------------------------
  {
    slug: 'sacs-riz-gros',
    cat: 'madinah',
    sub: 'wholesale',
    fr: [
      'Riz importé 50 kg — vente en gros',
      'Stock disponible en entrepôt à Madina, prix dégressif à partir de vingt sacs. Livraison possible.',
    ],
    en: [
      'Imported rice 50 kg — wholesale',
      'Stock available at a Madina warehouse with volume pricing from twenty bags. Delivery available.',
    ],
    price: 620_000,
    location: 'Madina',
    daysAgo: 1,
    condition: 'new',
    negotiable: false,
    attrs: [['Conditionnement', 'Packaging', 'Sac de 50 kg']],
  },
  {
    slug: 'boutique-a-ceder-madina',
    cat: 'madinah',
    sub: 'shops',
    fr: [
      'Boutique à céder au marché Madina',
      'Emplacement passant au cœur du marché, bail transférable, stock cessible séparément.',
    ],
    en: [
      'Shop for takeover at Madina market',
      'High-footfall spot in the heart of the market; lease is transferable and stock can be sold separately.',
    ],
    price: 85_000_000,
    location: 'Madina',
    daysAgo: 6,
  },
  {
    slug: 'huile-palme-bidons',
    cat: 'madinah',
    sub: 'groceries',
    fr: [
      'Huile de palme — bidons de 20 litres',
      'Production locale de Basse-Guinée, qualité constante. Tarif préférentiel pour les revendeurs.',
    ],
    en: [
      'Palm oil — 20-litre containers',
      'Locally produced in Lower Guinea with consistent quality. Preferential rates for resellers.',
    ],
    price: 480_000,
    location: 'Madina',
    daysAgo: 3,
    condition: 'new',
  },
  {
    slug: 'tissus-wax-gros',
    cat: 'madinah',
    sub: 'wholesale',
    fr: [
      'Pagnes wax — lot de 12 pièces',
      'Wax de qualité importée en motifs variés, vendu au lot de douze pièces de six yards.',
    ],
    en: [
      'Wax fabric — lot of 12 pieces',
      'Imported quality wax in assorted patterns, sold in lots of twelve six-yard pieces.',
    ],
    price: 3_600_000,
    location: 'Madina',
    daysAgo: 5,
    condition: 'new',
    negotiable: false,
  },
]

export const ads: Ad[] = seeds.map(build)

export const adBySlug = (slug: string) => ads.find((a) => a.slug === slug)
export const adsByCategory = (categoryId: string) => ads.filter((a) => a.categoryId === categoryId)
export const adsBySubCategory = (subId: string) => ads.filter((a) => a.subCategoryId === subId)
