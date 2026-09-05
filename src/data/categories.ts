import type { Category } from './types'

const sub = (slug: string, fr: string, en: string) => ({ id: slug, slug, fr, en })

export const categories: Category[] = [
  {
    id: 'vehicles',
    slug: 'vehicules',
    fr: 'Véhicules',
    en: 'Vehicles',
    icon: 'car',
    hue: 208,
    children: [
      sub('cars-for-sale', 'Voitures à vendre', 'Cars for Sale'),
      sub('cars-for-rent', 'Voitures à louer', 'Cars for Rent'),
      sub('motorcycles', 'Motos & quads', 'Motorcycles & ATVs'),
      sub('boats', 'Bateaux', 'Boats'),
      sub('spare-parts', 'Pièces détachées', 'Spare Parts'),
    ],
  },
  {
    id: 'real-estate',
    slug: 'immobilier',
    fr: 'Immobilier',
    en: 'Real Estate',
    icon: 'home',
    hue: 152,
    children: [
      sub('apartments-rent', 'Appartements & villas à louer', 'Apartments & Villas for Rent'),
      sub('apartments-sale', 'Appartements & villas à vendre', 'Apartments & Villas for Sale'),
      sub('land', 'Terrains', 'Land'),
      sub('vacation', 'Locations de vacances', 'Vacation Rentals'),
      sub('offices', 'Bureaux & commerces', 'Offices & Shops'),
    ],
  },
  {
    id: 'electronics',
    slug: 'electronique',
    fr: 'Électronique',
    en: 'Electronics',
    icon: 'phone',
    hue: 262,
    children: [
      sub('mobile-phones', 'Téléphones portables', 'Mobile Phones'),
      sub('laptops', 'Ordinateurs & tablettes', 'Laptops, Tablets & Computers'),
      sub('smart-watches', 'Montres connectées', 'Smart Watches'),
      sub('tv-audio', 'TV & audio', 'TV & Audio'),
      sub('mobile-numbers', 'Numéros de téléphone', 'Mobile Numbers'),
    ],
  },
  {
    id: 'furniture',
    slug: 'meubles-decoration',
    fr: 'Meubles & décoration',
    en: 'Furniture & Decor',
    icon: 'sofa',
    hue: 28,
    children: [
      sub('bedroom', 'Chambre à coucher', 'Bedroom'),
      sub('living-room', 'Salon', 'Living Room'),
      sub('dining-room', 'Salle à manger', 'Dining Room'),
      sub('home-decor', 'Décoration & accessoires', 'Home Decoration & Accessories'),
      sub('appliances', 'Électroménager', 'Home Appliances'),
    ],
  },
  {
    id: 'jobs',
    slug: 'emplois',
    fr: 'Emplois',
    en: 'Jobs',
    icon: 'briefcase',
    hue: 196,
    children: [
      sub('jobs-available', "Offres d'emploi", 'Jobs Available'),
      sub('job-seekers', "Demandes d'emploi", 'Job Seekers'),
      sub('services', 'Services', 'Services'),
    ],
  },
  {
    id: 'fashion',
    slug: 'mode',
    fr: 'Mode',
    en: 'Fashion',
    icon: 'shirt',
    hue: 336,
    children: [
      sub('women', 'Mode femme', "Women's Fashion"),
      sub('men', 'Mode homme', "Men's Fashion"),
      sub('shoes', 'Chaussures & sacs', 'Shoes & Bags'),
      sub('jewellery', 'Bijoux & montres', 'Jewellery & Watches'),
    ],
  },
  {
    id: 'kids',
    slug: 'enfants-bebes',
    fr: 'Enfants & bébés',
    en: 'Kids & Babies',
    icon: 'toy',
    hue: 12,
    children: [
      sub('toys', 'Jouets', 'Toys'),
      sub('strollers', 'Poussettes & sièges', 'Strollers & Seats'),
      sub('feeding', 'Alimentation & puériculture', 'Feeding & Nursing'),
      sub('kids-clothing', 'Vêtements enfants', "Kids' Clothing"),
    ],
  },
  {
    id: 'animals',
    slug: 'agriculture-animaux',
    fr: 'Agriculture & animaux',
    en: 'Agriculture & Animals',
    icon: 'paw',
    hue: 96,
    children: [
      sub('dogs', 'Chiens', 'Dogs'),
      sub('cats', 'Chats', 'Cats'),
      sub('birds', 'Oiseaux', 'Birds'),
      sub('livestock', 'Bétail', 'Livestock'),
      sub('farm-supplies', 'Matériel agricole', 'Farm Supplies'),
    ],
  },
  {
    id: 'sports',
    slug: 'sports-equipement',
    fr: 'Sports & équipement',
    en: 'Sports & Equipment',
    icon: 'dumbbell',
    hue: 178,
    children: [
      sub('gym', 'Gym, fitness & sports de combat', 'Gym, Fitness & Combat Sports'),
      sub('ball-sports', 'Sports de ballon', 'Ball Sports'),
      sub('water-sports', 'Sports nautiques & plongée', 'Water Sports & Diving'),
      sub('bicycles', 'Vélos', 'Bicycles'),
    ],
  },
  {
    id: 'hobbies',
    slug: 'loisirs',
    fr: 'Loisirs',
    en: 'Hobbies',
    icon: 'music',
    hue: 286,
    children: [
      sub('instruments', 'Instruments de musique', 'Musical Instruments'),
      sub('books', 'Livres & magazines', 'Books & Magazines'),
      sub('games', 'Jeux & consoles', 'Games & Consoles'),
      sub('collectibles', 'Collections', 'Collectibles'),
    ],
  },
  {
    id: 'bazzar',
    slug: 'bazar',
    fr: 'Bazar',
    en: 'Bazzar',
    icon: 'tag',
    hue: 44,
    children: [
      sub('everything-else', 'Divers', 'Everything Else'),
      sub('free-stuff', 'Dons', 'Free Stuff'),
      sub('lost-found', 'Objets trouvés', 'Lost & Found'),
    ],
  },
  {
    id: 'madinah',
    slug: 'madina',
    fr: 'Madina',
    en: 'Madinah',
    icon: 'store',
    hue: 350,
    children: [
      sub('wholesale', 'Vente en gros', 'Wholesale'),
      sub('shops', 'Boutiques', 'Shops'),
      sub('groceries', 'Alimentation', 'Food & Groceries'),
    ],
  },
]

export const categoryById = (id: string) => categories.find((c) => c.id === id)
export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug)

export const subCategoryById = (categoryId: string, subId: string) =>
  categoryById(categoryId)?.children.find((s) => s.id === subId)

/** Conakry communes and neighbourhoods used across the sample listings. */
export const locations = [
  'Kaloum',
  'Dixinn',
  'Matam',
  'Ratoma',
  'Matoto',
  'Kipé',
  'Lambanyi',
  'Nongo',
  'Taouyah',
  'Coléah',
]
