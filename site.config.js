// Maquette pour Mici Menuiserie (Beyne-Heusay) — infos reprises de micimenuiserie.be
// À compléter avec le client : prix, e-mail, horaires, photos, couleurs du logo.

export default {
  nom: 'Mici',
  metier: 'Menuiserie',
  // Logo vectorisé (une couleur) : il se colore automatiquement selon le fond
  logo: { complet: '/logos/mici-logo.svg', symbole: '/logos/mici-symbole.svg' },
  accroche: 'Menuisier à Beyne-Heusay',
  titre: ['Escaliers,', 'cuisines et', 'dressings', 'sur mesure.'],
  intro:
    'Escaliers, cuisines, dressings, portes et meubles en bois, dessinés et posés sur mesure. Un travail soigné jusque dans les finitions.',
  etapes3d: ['Mesuré.', 'Fabriqué.', 'Posé.'],

  seo: {
    title: 'Mici Menuiserie — Menuisier à Beyne-Heusay | Escaliers, cuisines, dressings',
    description:
      'Menuisier à Beyne-Heusay : escaliers en bois, cuisines et dressings sur mesure, portes intérieures et coupe-feu, parquets, terrasses. Partout en Belgique.',
    url: 'https://www.micimenuiserie.be',
  },

  // Mode sombre : noir, gris et jaune moutarde
  couleurs: {
    fond: '#121212',        // fond de page (noir)
    encre: '#ECEBE7',       // texte (blanc cassé)
    accent: '#D9A72B',      // jaune moutarde
    accentTexte: '#E2B43F', // moutarde pour les petits textes sur fond noir
    accentClair: '#EFC765',
    surAccent: '#141414',   // texte posé sur la moutarde (boutons)
    texteDoux: '#A3A29D',
    texteMoyen: '#C9C8C3',
    trait: '#3A3A37',
    panneau: '#1A1A19',     // section « Où on intervient »
    photoVide: '#2A2A28',
    surSombre: '#B9B8B3',
    sombre: '#1E1E1D',      // sections plan technique et devis, intro
    clair: '#F2F1EC',
    champ: '#2A2A28',       // champs du formulaire
    bois: '#B98451',
    scene: 'nu',            // scène 3D sans mur ni sol : l'escalier flotte sur le fond
    // Accueil en thème clair (le reste du site reste sombre)
    accueil: {
      fond: '#EDEDEB',
      encre: '#141414',
      accentTexte: '#8A6510', // moutarde foncée : lisible sur le fond clair (titre, petits textes)
      accentTitre: '#A87D0C', // « SUR MESURE. » : moutarde plus vive, lisible en grand
      texteDoux: '#5C5C5A',
      texteMoyen: '#3B3B3A',
      trait: '#B4B3AF',
      ombres: true,           // ombres douces sous l'escalier 3D
      accent: '#D9A72B',      // boutons
      metal: '#1A1A19',       // main courante
      ligne3d: '#A87D0C',     // plan de l'escalier 3D (moutarde foncée, visible sur le clair)
    },
    metal: '#4A4A47',       // main courante en acier (gris graphite pour ressortir sur le noir)
  },

  contact: {
    telephone: '04 378 23 37',
    telephoneLien: '+3243782337',
    whatsapp: null,
    instagram: 'https://www.instagram.com/micimenuiserie/',
    email: '', // à compléter (illisible sur le site actuel)
    adresse: 'Rue Emile Vandervelde 152',
    codePostal: '4620',
    ville: 'Beyne-Heusay',
    tva: 'BE 0766.520.922',
    horaires: [], // à compléter
  },

  promesses: [
    'Tout est fait sur mesure',
    'Finitions de qualité',
    'Portes coupe-feu',
    'Partout en Belgique',
  ],

  // Prix : null = « Sur devis ». À remplir avec le client (c'est un vrai argument de vente).
  prestations: [
    { titre: 'Escaliers en bois', detail: 'Dessinés pour votre maison, du premier croquis à la pose.', prix: null },
    { titre: 'Cuisines sur mesure', detail: 'Neuves ou à rénover, ajustées au centimètre près.', prix: null },
    { titre: 'Dressings', detail: 'Chaque recoin utilisé, sous pente ou en niche.', prix: null },
    { titre: 'Portes intérieures et coupe-feu', detail: 'Pleines, vitrées ou résistantes au feu, posées avec leur huisserie.', prix: null },
    { titre: 'Meubles en bois', detail: 'Bibliothèques, rangements et meubles sur mesure.', prix: null },
    { titre: 'Parquets, terrasses et garde-corps', detail: "À l'intérieur comme à l'extérieur.", prix: null },
  ],
  mentionPrix: "Chaque projet est unique : on vient voir, on mesure, et vous recevez un devis détaillé.",

  realisations: [
    { titre: 'Carrelage remplacé par un parquet en bois', lieu: '', avant: '/photos/mici-avant.jpg', apres: '/photos/mici-apres.jpg' },
    { titre: 'Escalier suspendu, acier et bois', lieu: '', image: '/photos/mici-escalier.jpg', grand: true },
    { titre: 'Garde-corps à lames noires', lieu: '', image: '/photos/mici-garde-corps.jpg' },
    { titre: 'Rangements sur mesure sous pente', lieu: '', image: '/photos/mici-rangements.jpg' },
    { titre: 'Table basse en bois massif', lieu: '', image: '/photos/mici-table.jpg' },
    { titre: 'Terrasse : la structure sur plots', lieu: '', image: '/photos/mici-terrasse.jpg' },
  ],

  communes: ['Liège', 'Namur', 'Luxembourg', 'Hainaut', 'Brabant wallon', 'Bruxelles', 'Brabant flamand', 'Anvers', 'Limbourg', 'Flandre-Orientale', 'Flandre-Occidentale'],
  zoneSeo: 'Belgique',
  // Carte animée : [longitude, latitude]. label : 'droite' | 'gauche' | 'haut' | 'bas' (facultatif)
  carte: {
    origine: { nom: 'Beyne-Heusay', coord: [5.65, 50.62] },
    destinations: [
      { nom: 'Liège', coord: [5.57, 50.63], label: 'gauche' },
      { nom: 'Hasselt', coord: [5.33, 50.93], label: 'haut' },
      { nom: 'Anvers', coord: [4.4, 51.22] },
      { nom: 'Bruges', coord: [3.22, 51.21] },
      { nom: 'Gand', coord: [3.72, 51.05] },
      { nom: 'Bruxelles', coord: [4.35, 50.85], label: 'gauche' },
      { nom: 'Louvain', coord: [4.7, 50.88] },
      { nom: 'Wavre', coord: [4.61, 50.72] },
      { nom: 'Mons', coord: [3.95, 50.45] },
      { nom: 'Namur', coord: [4.87, 50.47] },
      { nom: 'Arlon', coord: [5.82, 49.68] },
    ],
  },
  zoneNote: 'Un projet loin de Liège ? Appelez-nous, on se déplace.',
  rayon: "Depuis notre atelier de Beyne-Heusay, nous intervenons partout en Belgique.",

  etapesPlan: [
    ['Vous décrivez le projet.', 'Par le formulaire ou par téléphone, avec quelques photos.'],
    ['On passe mesurer.', 'Un rendez-vous chez vous, sans engagement.'],
    ['Devis détaillé.', 'Poste par poste, avec le délai de fabrication.'],
    ['Fabrication et pose.', 'Avec des finitions soignées.'],
  ],
  reponse: { delai: 'On vous répond rapidement.', merci: 'Merci, on vous recontacte très vite.' },

  // Numéro de téléphone dans le menu (false pour le retirer)
  menuTelephone: false,

  // Bandeau orange défilant sous l'accueil (false pour le retirer)
  bandeau: false,

  // Nom en très grand en bas de page (false pour le retirer)
  motGeant: false,

  maquette: 'Maquette Charabia · proposition pour Mici Menuiserie · version du 17/11 19h10',

  typesTravaux: ['Escalier', 'Cuisine', 'Dressing', 'Portes', 'Meubles', 'Parquet / terrasse', 'Autre'],
  delais: ['Dès que possible', 'Dans les 3 mois', 'Je me renseigne'],
}
