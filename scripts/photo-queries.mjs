/**
 * Search terms used to pull a photo for each listing.
 *
 * Kept out of `src/data` because this is a build-time concern: the app only
 * ever reads the generated `photos.json`. Terms are deliberately generic —
 * we want a representative photo of the *kind* of item, not a specific one.
 */
export const photoQueries = {
  // Vehicles
  'toyota-rav4-2019': 'suv car vehicle silver',
  'hyundai-tucson-2017': 'Hyundai Tucson SUV',
  'mercedes-c200-2015': 'sedan car parked street',
  'location-toyota-hiace': 'white van vehicle',
  'yamaha-crux-125': 'motorcycle motorbike street',
  'pneus-michelin-16': 'car tyres stack',

  // Real estate
  'villa-4-chambres-nongo': 'modern villa house exterior',
  'appartement-2-chambres-taouyah': 'apartment living room interior',
  'terrain-500m-kipe': 'grass field land',
  'duplex-vendre-lambanyi': 'two storey house exterior',
  'bureau-kaloum': 'office room interior desks',

  // Electronics
  'iphone-15-pro-256': 'iPhone smartphone',
  'samsung-a35-5g': 'Samsung Galaxy smartphone',
  'tecno-camon-30': 'android smartphone hand',
  'infinix-note-40': 'mobile phone hand screen',
  'macbook-air-m3': 'MacBook laptop',
  'dell-g15-gaming': 'gaming laptop computer',
  'hp-elitebook-840': 'business laptop desk',
  'lenovo-ideapad-3': 'laptop open screen desk',
  'apple-watch-se': 'smartwatch watch digital',
  'tv-hisense-55': 'flat screen television',

  // Furniture and decor
  'salon-7-places': 'sofa living room set',
  'lit-king-bois': 'wooden bed bedroom',
  'table-manger-6': 'dining table chairs',
  'climatiseur-lg-1-5cv': 'air conditioner unit wall',
  'rideaux-tapis-salon': 'curtains carpet living room',

  // Jobs
  'comptable-pme': 'accountant office paperwork',
  'chauffeur-permis-c': 'truck lorry driver',
  'developpeur-web-junior': 'programmer computer code',
  'service-plomberie': 'plumbing pipe wrench tap',
  'cours-particuliers-maths': 'student studying mathematics notebook',

  // Fashion
  'ensemble-bazin-brode': 'woman african dress fashion',
  'costume-homme-3-pieces': 'mens suit formal',
  'sacs-a-main-lot': 'handbag purse leather',
  'montre-homme-acier': 'wristwatch steel mens',

  // Kids
  'poussette-3-roues': 'baby stroller pram',
  'lit-bebe-matelas': 'baby cot crib',
  'lot-jouets-educatifs': 'wooden toys children blocks',
  'vetements-bebe-lot': 'baby clothing garments',

  // Agriculture and animals
  'berger-allemand-chiots': 'german shepherd puppy',
  'moutons-tabaski': 'sheep ram livestock',
  'perroquet-gris-cage': 'african grey parrot',
  'motoculteur-diesel': 'tractor farm',

  // Sports
  'tapis-course-pliable': 'treadmill gym equipment',
  'haltere-set-50kg': 'dumbbells weights gym',
  'velo-vtt-27': 'mountain bike bicycle',
  'equipement-plongee': 'scuba diver underwater',

  // Hobbies
  'guitare-yamaha-f310': 'acoustic guitar',
  'ps5-manettes': 'game console controller',
  'clavier-yamaha-psr': 'electronic keyboard piano',
  'livres-scolaires-lot': 'stack of books textbooks',

  // Bazzar
  'groupe-electrogene-5kva': 'diesel generator engine',
  'panneaux-solaires-lot': 'solar panels',
  'cartons-demenagement': 'cardboard boxes moving',
  'trousseau-cles-trouve': 'keys keyring',

  // Madinah
  'sacs-riz-gros': 'rice grain sack',
  'boutique-a-ceder-madina': 'market stall shop',
  'huile-palme-bidons': 'palm oil containers',
  'tissus-wax-gros': 'african wax print fabric',
}
