export interface Meta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImageAlt: string;
}

export interface Boot {
  pressStart: string;
  greeting: string;
  switchLabel: string;
  skinNames: { tv: string; handheld: string; manual: string };
  hint: string;
}

export interface Hero {
  name: string;
  tagline: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface MarqueeLogo {
  file: string;
  ext: 'jpg' | 'webp';
  name: string;
}

export interface Marquee {
  intro: string;
  logos: MarqueeLogo[];
}

export interface LevelBase {
  slug: string;
  title: string;
  heading: string;
}

export interface AboutLevel extends LevelBase {
  id: '1-1';
  paragraphs: string[];
  highScoreLabel: string;
  stats: { value: string; label: string }[];
}

export interface ServiceCard {
  label: string;
  title: string;
  body: string;
  price: string | null;
  proof: string;
  button: string;
}

export interface ServicesLevel extends LevelBase {
  id: '1-2';
  cards: ServiceCard[];
}

export interface CaseStudy {
  id: string;
  client: string;
  title: string;
  intro: string;
  table: { headers: string[]; rows: string[][] };
  glossary: string | null;
  extra: string | null;
  lessonLabel: string;
  lesson: string;
  roasSeries: number[] | null;
  months: string[] | null;
  occupancy: number[] | null;
  cpl: number[] | null;
  cplLabels: string[] | null;
}

export interface CasesLevel extends LevelBase {
  id: '2-1';
  cases: CaseStudy[];
}

export interface Project {
  name: string;
  desc: string;
  status: 'LIVE' | 'BETA';
  button: string;
  url: string | null;
}

export interface ProjectsLevel extends LevelBase {
  id: '2-2';
  projects: Project[];
  note: string;
}

export interface SaveRow {
  year: string;
  role: string;
  result: string;
}

export interface SavesLevel extends LevelBase {
  id: '3-1';
  headers: { year: string; role: string; result: string };
  rows: SaveRow[];
}

export interface WorkStep {
  title: string;
  body: string;
}

export interface StepsLevel extends LevelBase {
  id: '3-2';
  steps: WorkStep[];
}

export type Level =
  | AboutLevel
  | ServicesLevel
  | CasesLevel
  | ProjectsLevel
  | SavesLevel
  | StepsLevel;

export interface GameOver {
  heading: string;
  lessons: { title: string; body: string }[];
}

export interface Faq {
  heading: string;
  items: { q: string; a: string }[];
}

export interface Player2 {
  withGeo: string;
  fallback: string;
}

export interface FormField {
  name: string;
  label: string;
  placeholder: string;
}

export interface Contact {
  heading: string;
  sub: string;
  cta: string;
  waPrefill: string;
  links: { label: string; value: string }[];
  form: { fields: FormField[]; submit: string };
  messages: { success: string; error: string; empty: string };
}

export interface Footer {
  copyright: string;
  links: string[];
}

export interface Ui {
  hud: {
    level: string;
    levelFirst: string;
    levelLast: string;
    highScore: string;
    brands: string;
    pause: string;
    next: string;
    back: string;
  };
  loading: { label: string; slow: string };
  notFound: { title: string; body: string; button: string };
  easterEgg: { trigger: string; text: string; button: string };
  controls: { desktop: string; mobile: string };
  game: {
    name: string;
    clear: string;
    clearBody: string;
    replay: string;
    coin: string;
    time: string;
    retry: string;
    controlsDesktop: string;
    controlsMobile: string;
    left: string;
    right: string;
    jump: string;
  };
}

export interface ContactInfo {
  whatsapp: string;
  whatsappDisplay: string;
  email: string;
  linkedin: string;
  instagram: string;
  github: string;
}

export interface Site {
  meta: Meta;
  boot: Boot;
  hero: Hero;
  marquee: Marquee;
  levels: Level[];
  gameOver: GameOver;
  faq: Faq;
  player2: Player2;
  contact: Contact;
  footer: Footer;
  llmsTxt: string;
  ui: Ui;
}

export const contactInfo: ContactInfo = {
  whatsapp: '628112131496',
  whatsappDisplay: '0811-2131-496',
  email: 'hello@nanansm.com',
  linkedin: 'https://linkedin.com/in/nanansm',
  instagram: 'https://instagram.com/nanan.sm',
  github: 'https://github.com/nanansm',
};

export const waLink = (text: string): string =>
  `https://wa.me/628112131496?text=${encodeURIComponent(text)}`;

export const site: Site = {
  meta: {
    title: 'Nanan Somanan | Jasa Meta Ads, CPAS & Digital Marketing',
    description:
      'Praktisi Meta Ads sejak 2017, 45 brand. CPAS Shopee ROAS 12,7, okupansi hotel 32,6% ke 50,2%. Konsultasi lewat WhatsApp.',
    ogTitle: 'Nanan Somanan, Meta Ads untuk 45 brand sejak 2017',
    ogDescription:
      'CPAS Shopee ROAS 12,7. Okupansi hotel naik dari 32,6% ke 50,2%. Lihat kasusnya satu per satu.',
    ogImageAlt:
      'Layar pembuka bergaya konsol 8-bit bertuliskan PRESS START dan nama Nanan Somanan.',
  },

  boot: {
    pressStart: 'PRESS START',
    greeting: 'Halo, saya Nanan. Pilih tampilan yang kamu suka, lalu tekan start.',
    switchLabel: 'SWITCH CARTRIDGE',
    skinNames: { tv: 'TV CONSOLE', handheld: 'HANDHELD', manual: 'MANUAL' },
    hint: 'Tekan Enter atau sentuh layar.',
  },

  hero: {
    name: 'NANAN SOMANAN',
    tagline:
      '45 brand sudah saya tangani iklannya bersama tim sejak 2017, dari ROAS 12,7 di CPAS Shopee sampai okupansi hotel yang naik ke 50,2%.',
    ctaPrimary: 'KONSULTASI LEWAT WHATSAPP',
    ctaSecondary: 'LIHAT CASE STUDY',
  },

  marquee: {
    intro: 'Brand yang pernah saya tangani',
    logos: [
      { file: 'eighteencoffee', ext: 'jpg', name: 'Eighteen Coffee' },
      { file: 'lidigeli', ext: 'jpg', name: 'LidiGeli' },
      { file: 'kliktron', ext: 'jpg', name: 'Kliktron' },
      { file: 'twl', ext: 'jpg', name: 'The White Clover' },
      { file: 'kopicantel', ext: 'jpg', name: 'Kopi Cantel' },
      { file: 'diksian', ext: 'jpg', name: 'Diksian' },
      { file: 'tivaza', ext: 'webp', name: 'Tivaza' },
      { file: '150coffeegarden', ext: 'jpg', name: '150 Coffee & Garden' },
      { file: 'portee', ext: 'jpg', name: 'Portee' },
      { file: 'athenary', ext: 'jpg', name: 'Athenary Coffee & Eatery' },
      { file: 'kopianjis', ext: 'jpg', name: 'Kopi Anjis' },
      { file: 'beutikcompany', ext: 'jpg', name: 'Beutik Company' },
      { file: 'juraganlaptop', ext: 'jpg', name: 'Juragan Laptop' },
    ],
  },

  levels: [
    {
      id: '1-1',
      slug: 'tentang',
      title: 'Tentang',
      heading:
        'Saya pegang iklan 45 brand bersama tim sejak 2017, dari F&B sampai hotel dan B2B',
      paragraphs: [
        'Saya mulai jadi advertiser tahun 2017, sambil kuliah S1 Akuntansi. Dari 45 brand yang saya tangani bersama tim, 26 ada di F&B. Sembilan di fashion, beauty, dan lifestyle. Lima di hospitality dan properti, lima lagi di B2B dan retail.',
        'Sejak 2019 saya jadi Digital Marketing Manager 150 Coffee & Garden di Bandung. Tahun 2022 saya masuk Diksian Creative sebagai Business Manager. Tahun 2024 saya mendirikan MOTÉ Kreatif di Garut, dan sekarang timnya 10 orang.',
        'Sejak 2021 saya juga jadi mentor untuk KLC Food, Chocodot, dan LidiGeli bersama tim trainer.',
      ],
      highScoreLabel: 'HIGH SCORE',
      stats: [
        { value: '45', label: 'brand yang iklannya saya tangani bersama tim' },
        { value: '12,7', label: 'ROAS akun CPAS Hanoon, April-Juni 2026' },
        { value: '50,2%', label: 'okupansi Rancabango, naik dari 32,6%' },
        { value: '10', label: 'orang di tim MOTÉ Kreatif' },
      ],
    },

    {
      id: '1-2',
      slug: 'layanan',
      title: 'Layanan',
      heading:
        'Enam jasa, dari iklan ber-ROAS 12,7 sampai website yang bisa kamu buka sekarang',
      cards: [
        {
          label: 'META ADS & CPAS',
          title: 'Iklan Meta yang menjual di Shopee',
          body: 'Iklan tayang di Instagram dan Facebook, transaksinya terjadi di Shopee lewat CPAS. Saya yang setup, jalankan, dan baca angkanya di Ads Manager.',
          price: null,
          proof: 'Hanoon ROAS 12,7. KLC Food ROAS 3,58 naik ke 8,36 dalam empat bulan.',
          button: 'KONSULTASI',
        },
        {
          label: 'LEAD & OKUPANSI',
          title: 'Iklan yang mengisi kamar hotel dan menjaring calon pembeli B2B',
          body: 'Targetnya percakapan WhatsApp. Hasilnya diukur dari okupansi kamar dan biaya per lead.',
          price: null,
          proof: 'Rancabango okupansi 32,6% ke 50,2%. Kliktron CPL Rp23.236 turun ke Rp21.012.',
          button: 'KONSULTASI',
        },
        {
          label: 'OUTLET OFFLINE',
          title: 'Tim MOTÉ Kreatif mengurus digital marketing outlet fisik',
          body: 'Tim 10 orang di Garut. Iklan dan digital marketing untuk outlet fisik.',
          price: null,
          proof: '150 Coffee & Garden, saya tangani digital marketing-nya sejak 2019.',
          button: 'KONSULTASI',
        },
        {
          label: 'NARASUMBER & MENTORING',
          title: 'Webinar dan mentoring tim dari akun yang saya pegang sendiri',
          body: 'Materi disusun dari angka akun nyata, slide boleh dibagikan ke peserta dalam PDF.',
          price:
            'Webinar online mulai Rp1.000.000 per sesi. Mentoring tim Rp5.000.000 per bulan.',
          proof: 'Mentor KLC Food, Chocodot, dan LidiGeli sejak 2021.',
          button: 'LIHAT RATE CARD',
        },
        {
          label: 'AI AUTOMATION & SISTEM BISNIS',
          title: 'Web app dan tools yang saya bangun sendiri',
          body: 'Contoh project yang saya bangun ada di Cartridge Library.',
          price: null,
          proof: 'satukas, mote-klir, mote-pos, mote-capture, mote-blaster, mote-team.',
          button: 'BUKA LIBRARY',
        },
        {
          label: 'WEBSITE, LANDING PAGE & BIOLINK',
          title: 'Halaman yang bisa kamu buka sekarang',
          body: 'Contohnya sudah live.',
          price: null,
          proof: 'motekreatif.com.',
          button: 'KONSULTASI',
        },
      ],
    },

    {
      id: '2-1',
      slug: 'case-study',
      title: 'Case Study',
      heading: 'Empat akun, empat angka dari akun nyata',
      cases: [
        {
          id: 'hanoon',
          client: 'Hanoon Industries',
          title: 'Rp25,4 juta jadi Rp322,9 juta penjualan di CPAS Shopee',
          intro:
            'Hanoon menjual workwear. Periode April-Juni 2026, iklan jalan lewat CPAS (Collaborative Ads), yaitu iklan di Instagram dan Facebook yang transaksinya terjadi di Shopee.',
          table: {
            headers: ['', 'Spend', 'Penjualan', 'Transaksi', 'ROAS'],
            rows: [
              ['April-Juni 2026', 'Rp25,4 juta', 'Rp322,9 juta', '980', '12,7'],
              ['Maret 2026 (Ramadan)', 'Rp13,5 juta', 'Rp280,1 juta', '813', '20,8'],
            ],
          },
          glossary:
            'ROAS = penjualan yang kembali dari tiap Rp1 biaya iklan. Spend = biaya iklan yang dibayar ke Meta.',
          extra: null,
          lessonLabel: 'Pelajaran:',
          lesson:
            'Ramadan satu bulan mencatat ROAS 20,8, tiga bulan sesudahnya 12,7. Baca ROAS bareng spend dan musimnya, jangan satu angka saja.',
          roasSeries: [20.8, 12.7],
          months: ['Maret 2026 (Ramadan)', 'April-Juni 2026'],
          occupancy: null,
          cpl: null,
          cplLabels: null,
        },
        {
          id: 'klc-food',
          client: 'KLC Food',
          title: 'ROAS naik dari 3,58 ke 8,36 dalam empat bulan, total spend Rp10,1 juta.',
          intro:
            'KLC Food menjual snack Pilus Cikur dan Cripzy Basreng. Angka di bawah ROAS gabungan dua campaign, Mei-Agustus 2026.',
          table: {
            headers: ['Bulan 2026', 'Mei', 'Juni', 'Juli', 'Agustus'],
            rows: [['ROAS', '3,58', '6,20', '6,20', '8,36']],
          },
          glossary: null,
          extra:
            'Pembelian naik dari 61 di bulan Mei jadi 285 di bulan Agustus. Di Agustus, retargeting (iklan ke orang yang sudah pernah lihat produknya) memakai 66,7% budget dan menyumbang 95,8% nilai penjualan.',
          lessonLabel: 'Pelajaran:',
          lesson:
            'Hampir semua penjualan Agustus datang dari orang yang sudah kenal produknya. Budget retargeting layak dijaga.',
          roasSeries: [3.58, 6.2, 6.2, 8.36],
          months: ['Mei', 'Juni', 'Juli', 'Agustus'],
          occupancy: null,
          cpl: null,
          cplLabels: null,
        },
        {
          id: 'rancabango',
          client: 'Rancabango Hotel & Resort',
          title: 'Okupansi naik dari 32,6% ke 50,2% dalam tiga bulan',
          intro:
            'Hotel di Garut yang ditangani lewat MOTÉ Kreatif. Periode April-Juni 2026. Okupansi (occupancy) artinya persentase kamar yang terisi.',
          table: {
            headers: [
              'Okupansi sebelum',
              'Okupansi sesudah',
              'Percakapan WhatsApp dari iklan',
              'Biaya marketing',
            ],
            rows: [['32,6%', '50,2%', '695', '2,0-2,7% dari omzet']],
          },
          glossary: null,
          extra: null,
          lessonLabel: 'Pelajaran:',
          lesson:
            'Ukur iklan hotel dari kamar yang terisi dan porsi biaya terhadap omzet. Jumlah klik tidak bisa dipakai bayar listrik.',
          roasSeries: null,
          months: null,
          occupancy: [32.6, 50.2],
          cpl: null,
          cplLabels: null,
        },
        {
          id: 'kliktron',
          client: 'Kliktron by IDM',
          title: 'CPL turun Rp2.224 per lead dalam satu bulan',
          intro:
            'Bisnis videotron B2B. Iklan menjaring calon pembeli lewat WhatsApp di Jawa Barat. CPL (cost per lead) = biaya iklan untuk satu calon pembeli.',
          table: {
            headers: ['', 'Agustus 2026', 'September 2026'],
            rows: [['CPL', 'Rp23.236', 'Rp21.012']],
          },
          glossary: null,
          extra: null,
          lessonLabel: 'Pelajaran:',
          lesson: 'CPL turun 9,6% dari Agustus ke September.',
          roasSeries: null,
          months: null,
          occupancy: null,
          cpl: [23236, 21012],
          cplLabels: ['Agustus 2026', 'September 2026'],
        },
      ],
    },

    {
      id: '2-2',
      slug: 'cartridge-library',
      title: 'Cartridge Library',
      heading: 'Tujuh project yang bisa kamu buka atau lihat, lengkap dengan statusnya',
      projects: [
        {
          name: 'satukas',
          desc: 'Aplikasi catatan keuangan pribadi dan keluarga, biar uang keluar-masuk bisa di-track dari mana aja. satukas.app',
          status: 'LIVE',
          button: 'PLAY',
          url: 'https://satukas.app',
        },
        {
          name: 'motekreatif.com',
          desc: 'Website MOTÉ Kreatif.',
          status: 'LIVE',
          button: 'PLAY',
          url: 'https://motekreatif.com',
        },
        {
          name: 'mote-klir',
          desc: 'Pencatatan jurnal akuntansi untuk orang awam, hasilnya laporan keuangan yang jelas.',
          status: 'LIVE',
          button: 'PLAY',
          url: 'https://klir.motekreatif.com',
        },
        {
          name: 'mote-pos',
          desc: 'Aplikasi kasir gratis untuk UMKM.',
          status: 'BETA',
          button: 'PLAY',
          url: 'https://pos.motekreatif.com',
        },
        {
          name: 'mote-capture',
          desc: 'Aplikasi photobooth dengan pembayaran lewat payment gateway.',
          status: 'LIVE',
          button: 'PLAY',
          url: 'https://capture.motekreatif.com',
        },
        {
          name: 'mote-blaster',
          desc: 'Web app untuk blast pesan ke customer lama supaya repeat order.',
          status: 'LIVE',
          button: 'PLAY',
          url: 'https://blaster.motekreatif.com',
        },
        {
          name: 'mote-team',
          desc: 'Workspace internal MOTÉ: kontrol pekerjaan tim, track KPI tiap orang, dan database client.',
          status: 'LIVE',
          button: 'PLAY',
          url: 'https://team.motekreatif.com',
        },
      ],
      note: 'Project internal ditampilkan sebagai demo atau screenshot. Angka hasil belum saya klaim untuk project ini.',
    },

    {
      id: '3-1',
      slug: 'save-files',
      title: 'Save Files',
      heading: 'Sembilan tahun, lima peran, dan MOTÉ Kreatif jadi tim 10 orang',
      headers: { year: 'Tahun', role: 'Peran', result: 'Hasil' },
      rows: [
        {
          year: '2017',
          role: 'Mulai jadi advertiser sambil kuliah S1 Akuntansi',
          result: 'Belajar dari Facebook Ads dan tokobagus.com (sekarang OLX)',
        },
        {
          year: '2019 sampai sekarang',
          role: 'Digital Marketing Manager, 150 Coffee & Garden, Bandung',
          result: 'Omzet naik dari Rp50 juta per bulan saat buka (2019) ke Rp1 miliar per bulan',
        },
        {
          year: '2021',
          role: 'Mentor bersama tim trainer',
          result: 'KLC Food, Chocodot, LidiGeli',
        },
        {
          year: '2022',
          role: 'Business Manager, Diksian Creative, Bandung',
          result: 'Akuisisi client jasa performance, di antaranya KOLASE dan DISADA',
        },
        {
          year: '2024 sampai sekarang',
          role: 'Pendiri MOTÉ Kreatif, Garut',
          result: 'Tim 10 orang, Rancabango okupansi 50,2% (April-Juni 2026)',
        },
      ],
    },

    {
      id: '3-2',
      slug: 'cara-kerja-sama',
      title: 'Cara kerja sama',
      heading: 'Empat langkah dari obrolan pertama sampai iklan jalan',
      steps: [
        {
          title: 'Ngobrol dulu.',
          body: 'Kamu cerita soal bisnis, target, dan angka yang sekarang. Lewat WhatsApp cukup.',
        },
        {
          title: 'Saya cek datanya.',
          body: 'Akun iklan dan data penjualan yang sudah ada saya lihat sebelum bicara scope.',
        },
        {
          title: 'Scope dan harga tertulis.',
          body: 'Isi paket dan biaya ditulis sebelum mulai. Ngobrol dulu lewat Whatsapp saya.',
        },
        {
          title: 'Jalan dan dilaporkan.',
          body: 'Iklan tayang, angkanya saya baca bersama kamu. Sebulan sekali pelaporan Monthly Report',
        },
      ],
    },
  ],

  gameOver: {
    heading:
      'Tiga pelajaran dari akun yang saya pegang, termasuk yang bikin budget keluar dua kali',
    lessons: [
      {
        title: 'Budget keluar dua kali',
        body: 'Saat CPAS jalan, Iklanku tetap jalan. Brand membayar dua jalur iklan sekaligus. Hitung dua-duanya sebelum setuju.',
      },
      {
        title: 'Skill-nya beda',
        body: 'Setup CPAS butuh dasar Meta Ads, dan itu skill yang berbeda dari Iklanku. Brand yang terbiasa Iklanku perlu belajar dulu atau menggandeng orang yang sudah biasa.',
      },
      {
        title: 'Masuk CPAS terlalu cepat',
        body: 'Patokan saya, spend Iklanku sudah di atas Rp4-6 juta per bulan sebelum brand masuk CPAS. Semua klien saya mulai dari Iklanku dulu.\nPernah dapet ROAS 0.5 di awal, dan itu jadi pembelajaran saya untuk lebih fokus dari mulai setup campaign sampai berbicara terkait creative content yang memang bisa menjadikan itu penjualan.',
      },
    ],
  },

  faq: {
    heading: 'Lima pertanyaan sebelum mulai kerja sama',
    items: [
      {
        q: 'Budget berapa yang pantas untuk masuk CPAS?',
        a: 'Patokan saya, spend Iklanku sudah di atas Rp4-6 juta per bulan. Tandanya omzet Shopee masih naik tapi lambat, dan brand mau menjangkau pembeli di luar Shopee. Untuk jenis iklan lain biasanya saya spend minimal 3juta perbulan.',
      },
      {
        q: 'Apa beda Iklanku dan CPAS?',
        a: 'Iklanku itu Shopee Ads. CPAS menayangkan iklan di Instagram dan Facebook, transaksinya tetap terjadi di Shopee. Semua klien saya mulai dari Iklanku dulu, belum ada yang langsung CPAS.',
      },
      {
        q: 'Siapa yang mengerjakan akun saya?',
        a: 'Saya bersama tim. Untuk outlet offline, pekerjaannya lewat MOTÉ Kreatif, tim 10 orang di Garut.',
      },
      {
        q: 'Berapa biaya jasanya?',
        a: 'Webinar online mulai Rp1.000.000 per sesi, mentoring tim Rp5.000.000 per bulan. Jasa lain dihitung setelah saya tahu kebutuhan dan akunmu, jadi mulai dari konsultasi lewat WhatsApp.',
      },
      {
        q: 'Bisa dijanjikan ROAS atau okupansi tertentu?',
        a: 'Angka di situs ini hasil akun tertentu pada periode tertentu. Bisnismu punya produk, harga, dan musim sendiri, jadi saya tidak menjanjikan angka sebelum lihat datanya. Menjanjikan pertumbuhan dari digital activity bukan terkait soal omset',
      },
    ],
  },

  player2: {
    withGeo:
      'Player 2 masuk dari {kota}, sekitar {jarak} km dari Bandung. Sesi offline di luar Bandung ditambah biaya transport dan akomodasi.',
    fallback:
      'Player 2 masuk dari mana saja. Webinar online lewat Zoom, mentoring 4 pertemuan per bulan.',
  },

  contact: {
    heading: 'Ceritakan bisnismu, saya baca dan balas lewat WhatsApp',
    sub: 'Tulis satu paragraf soal produk dan targetmu. Dari situ kita lihat jasa mana yang cocok.',
    cta: 'MULAI KONSULTASI',
    waPrefill: 'Halo Nanan, saya mau ngobrol soal iklan untuk bisnis saya.',
    links: [
      { label: 'WhatsApp', value: '0811-2131-496' },
      { label: 'Email', value: 'hello@nanansm.com' },
      { label: 'LinkedIn', value: 'linkedin.com/in/nanansm' },
      { label: 'Instagram', value: '@nanan.sm' },
    ],
    form: {
      fields: [
        { name: 'nama', label: 'Nama kamu', placeholder: 'Nanan' },
        { name: 'bisnis', label: 'Nama bisnis', placeholder: 'Fashion, Hotel, FnB Retail.' },
        {
          name: 'kebutuhan',
          label: 'Kamu butuh apa',
          placeholder: 'Contoh: iklan Shopee, isi kamar hotel, webinar tim',
        },
        {
          name: 'kontak',
          label: 'WhatsApp atau email',
          placeholder: '08xx atau nama@email.com',
        },
      ],
      submit: 'KIRIM PESAN',
    },
    messages: {
      success: 'Pesan terkirim. Saya balas lewat kontak yang kamu tulis.',
      error:
        'Pesan belum terkirim. Coba lagi, atau langsung chat lewat WhatsApp 0811-2131-496.',
      empty: 'Isi dulu kolom yang bertanda merah.',
    },
  },

  footer: {
    copyright:
      '© 2026 Nanan Somanan. Meta Ads, CPAS, dan digital marketing untuk brand dan outlet.',
    links: ['LinkedIn', 'Instagram', 'GitHub'],
  },

  llmsTxt: `# Nanan Somanan
> Praktisi Meta Ads sejak 2017, pendiri MOTÉ Kreatif (Garut, tim 10 orang).
Layanan: Meta Ads & CPAS Shopee, iklan lead dan okupansi, digital marketing outlet offline, narasumber dan mentoring, AI automation, website dan landing page.
Angka: 45 brand ditangani bersama tim; Hanoon CPAS ROAS 12,7 (April-Juni 2026); KLC Food ROAS 3,58 ke 8,36 (Mei-Agustus 2026).
Hotel: Rancabango okupansi 32,6% ke 50,2% (April-Juni 2026).
Rate card webinar online mulai Rp1.000.000 per sesi.
Kontak: hello@nanansm.com, WhatsApp 0811-2131-496, linkedin.com/in/nanansm`,

  ui: {
    hud: {
      level: 'LEVEL',
      levelFirst: 'LEVEL 1-1',
      levelLast: 'LEVEL 3-2',
      highScore: 'HIGH SCORE',
      brands: 'BRANDS',
      pause: 'PAUSE',
      next: 'NEXT LEVEL',
      back: 'BACK',
    },
    loading: {
      label: 'LOADING...',
      slow: 'Sebentar, cartridge-nya lagi ditiup.',
    },
    notFound: {
      title: 'WORLD NOT FOUND',
      body: 'Halaman ini tidak ada di peta. Balik ke layar awal.',
      button: 'BACK TO START',
    },
    easterEgg: {
      trigger: 'Tekan tombol A lima kali di boot screen.',
      text: 'Level rahasia terbuka. Kamu orang yang teliti, jadi mungkin kita cocok ngobrol soal angka iklanmu.',
      button: 'KONSULTASI SEKARANG',
    },
    controls: {
      desktop: 'Panah atas-bawah untuk pindah level, Enter untuk pilih.',
      mobile: 'Geser untuk pindah level, ketuk untuk pilih.',
    },
    game: {
      name: 'CHECKOUT RUN',
      clear: 'CHECKOUT!',
      clearBody: 'Kamu sampai checkout. Iklan bisnismu juga bisa sampai sana, kita hitung angkanya lewat WhatsApp.',
      replay: 'MAIN LAGI',
      coin: 'COIN',
      time: 'TIME',
      retry: 'RETRY',
      controlsDesktop: 'Panah kiri-kanan untuk jalan, Spasi untuk lompat.',
      controlsMobile: 'Tahan ◀ ▶ untuk jalan, A untuk lompat.',
      left: 'Kiri',
      right: 'Kanan',
      jump: 'Lompat',
    },
  },
};
