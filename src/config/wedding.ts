// ─────────────────────────────────────────────────────────────────────────────
// Wedding Invitation Config
// Edit this file to customise the invitation for a new couple.
// All text, dates, venues, colours, and assets live here.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProgramItem {
  time: string
  title: string
  subtitle?: string
}

export interface ProgramGroup {
  venue: string
  mapsUrl: string
  items: ProgramItem[]
}

export interface DressSwatch {
  color: string  // hex e.g. '#4a2c1a'
  label: string
}

export interface RsvpSide {
  value: string  // stored in DB
  label: string  // displayed in UI
  shortLabel: string
}

export interface WeddingConfig {
  couple: {
    person1: string
    person2: string
    /** Displayed between the two names, e.g. '&' */
    separator: string
  }
  date: {
    /** ISO 8601 with timezone, used for countdown and calendar */
    iso: string
    /** Compact date shown in admin header, e.g. '25.04.2026' */
    displayShort: string
    /** Three parts shown in the hero, e.g. ['25', '04', '26'] */
    displayParts: string[]
    /** Single-line date shown in footer, e.g. '25 · 04 · 2026' */
    displayFull: string
    /** Human-readable RSVP deadline shown in RSVP section */
    rsvpDeadline: string
  }
  assets: {
    /** Filename relative to /public — shown as hero background */
    backgroundImage: string
    /** Filename relative to /public — shown in thank-you section */
    thankYouImage: string
    /** Alt text for the thank-you photo */
    thankYouAlt: string
    music: {
      /** Filename relative to /public */
      file: string
      title: string
      artist: string
    }
  }
  copy: {
    hero: {
      saveTheDate: string[]
    }
    /** Lines of the main invitation paragraph */
    invitationLines: string[]
    /** Short sentence shown between calendar and program */
    guestPresence: string
    /** Note shown below dress-code (e.g. adults-only notice) */
    dateNote: string
    /** Two-line thank-you shown in footer */
    footerThanks: string
    thankYou: {
      title: string
    }
    rsvp: {
      submitLabel: string
      sendingLabel: string
      attendingYesLabel: string
      attendingNoLabel: string
      deadlineNote: string
      successYesTitle: string
      successNoTitle: string
      successYes: string
      successNo: string
      errorMessage: string
      guestCountLabel: string
      sideQuestion: string
      attendingQuestion: string
      firstGuestLegend: string
      secondGuestLegend: string
      firstNamePlaceholder: string
      lastNamePlaceholder: string
    }
    /** Label shown next to the map link in program cards */
    mapLinkLabel: string
    /** Prefix before the time in program cards, e.g. 'Ժամը ' */
    timePrefix: string
    dressCode: {
      sectionLabel: string
      sectionTitle: string
      description: string
    }
    calendar: {
      /** Localised month + year label shown above the calendar */
      monthLabel: string
      /** Abbreviated day names starting from Monday */
      dayNames: string[]
    }
    countdown: {
      days: string
      hours: string
      minutes: string
      seconds: string
    }
    rsvpSection: {
      label: string
      title: string
    }
  }
  program: ProgramGroup[]
  dressCode: {
    swatches: DressSwatch[]
  }
  rsvp: {
    sides: RsvpSide[]
    maxGuests: number
    defaultGuestCount: number
    /** Supabase table name */
    tableName: string
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Config — edit below this line
// ─────────────────────────────────────────────────────────────────────────────

export const config: WeddingConfig = {
  couple: {
    person1: 'Վահան',
    person2: 'Անահիտ',
    separator: '&',
  },

  date: {
    iso: '2026-04-25T14:45:00+04:00',
    displayShort: '25.04.2026',
    displayParts: ['25', '04', '26'],
    displayFull: '25 · 04 · 2026',
    rsvpDeadline: 'Ապրիլի 20',
  },

  assets: {
    backgroundImage: 'background.jpg',
    thankYouImage: 'thankYou.jpg',
    thankYouAlt: 'Վահան և Անահիտ',
    music: {
      file: 'where-is-my-husband.mp3',
      title: 'Where is my husband',
      artist: 'Jiandro & Raye',
    },
  },

  copy: {
    hero: {
      saveTheDate: ['Save', 'the', 'Date'],
    },

    invitationLines: [
      'Սիրով հրավիրում ենք Ձեզ',
      'կիսելու մեր կյանքի ամենակարևոր և երջանիկ օրը,',
      'երբ մենք կասենք մեր ամենասպասված «այո»-ն։',
    ],

    guestPresence:
      'Ձեր ներկայությունը մեզ համար ամենաթանկ նվերն է,\n' +
      'որով այս օրը կդառնա առավել լուսավոր և հիշարժան։',

    dateNote:
      'Երեկոն խոստանում է լինել լի ջերմությամբ, գեղեցիկ երաժշտությամբ ' +
      'և տոնական տրամադրությամբ։ Քանի որ այն նախատեսված է մեծահասակների ' +
      'համար՝ ալկոհոլային հյուրասիրությամբ և ակտիվ երեկոյով, սիրով ' +
      'խնդրում ենք այս հատուկ օրը կիսել մեզ հետ առանց երեխաների։',

    footerThanks:
      'Շնորհակալ ենք Ձեր ըմբռնման,\n' +
      'սիրո և մեզ հետ այս օրը կիսելու պատրաստակամության համար։',

    thankYou: {
      title: 'Thank You',
    },

    rsvp: {
      submitLabel: 'Հաստատել',
      sendingLabel: 'Ուղարկվում է...',
      attendingYesLabel: 'Իհարկե գալու եմ',
      attendingNoLabel: 'Ցավոք, չեմ կարող',
      deadlineNote: 'Խնդրում ենք մինչև {deadline}-ը լրացնել՝ նշելով ձեր մասնակցությունը և հյուրերի քանակը։',
      successYesTitle: 'Շնորհակալություն!',
      successNoTitle: 'Ցավոք...',
      successYes: 'Շատ շնորհակալ ենք, ձեր հաստատումը ստացվել է: Մենք անհամբեր սպասում ենք ձեզ հետ միասին տոնելու մեր հատուկ օրը!',
      successNo: 'Ձեր պատասխանը ստացվել է։ Շնորհակալ ենք, որ տեղեկացրիք մեզ։',
      errorMessage: 'Մի բան սխալ է։ Խնդրում ենք կրկին փորձել։',
      guestCountLabel: 'Հյուրերի քանակը',
      sideQuestion: 'Դուք ում հյուրն եք',
      attendingQuestion: 'Կմասնակցե՞ք',
      firstGuestLegend: 'Առաջին հյուրի տվյալները',
      secondGuestLegend: 'Երկրորդ հյուրի տվյալները',
      firstNamePlaceholder: 'Անուն',
      lastNamePlaceholder: 'Ազգանուն',
    },

    mapLinkLabel: 'Քարտեզ',
    timePrefix: 'Ժամը ',

    dressCode: {
      sectionLabel: 'Հագուստ',
      sectionTitle: 'Դրես-կոդ',
      description:
        'Հագուստի գույների ընտրությունը ցանկալի է, բայց ոչ պարտադիր ' +
        'և նախընտրելի գույներն են՝ շոկոլադագույն, բորդո, սև, մուգ կապույտ և մուգ կանաչ',
    },

    calendar: {
      monthLabel: 'Ապրիլ 2026',
      dayNames: ['Երկ', 'Երք', 'Չոր', 'Հինգ', 'Ուրբ', 'Շաբ', 'Կիր'],
    },

    countdown: {
      days: 'օր',
      hours: 'ժամ',
      minutes: 'րոպե',
      seconds: 'վայրկ',
    },

    rsvpSection: {
      label: 'Հաստատում',
      title: 'Հաստատել մասնակցությունը',
    },
  },

  program: [
    {
      venue: 'Սուրբ Հռիփսիմե եկեղեցի, Էջմիածին',
      mapsUrl: 'https://yandex.com/maps/org/35208500744/?ll=44.309617%2C40.167003&z=16',
      items: [
        { time: '14:45', title: 'Պսակադրություն' },
      ],
    },
    {
      venue: '«Արիա» ռեստորան, Երևան',
      mapsUrl: 'https://yandex.com/maps/org/1709327076/?ll=44.576119%2C40.190755&z=16.26',
      items: [
        { time: '17:00', title: 'Ամուսնության գրանցում' },
        { time: '18:00', title: 'Հարսանեկան ընթրիք' },
      ],
    },
  ],

  dressCode: {
    swatches: [
      { color: '#4a2c1a', label: 'Շոկոլադագույն' },
      { color: '#6e1a2a', label: 'Բորդո' },
      { color: '#1a1a1a', label: 'Սև' },
      { color: '#1a2a4a', label: 'Մուգ կապույտ' },
      { color: '#0f482c', label: 'Մուգ կանաչ' },
    ],
  },

  rsvp: {
    sides: [
      { value: 'anahit', label: 'Հարսի հյուր', shortLabel: 'Հարսի' },
      { value: 'vahan', label: 'Փեսայի հյուր', shortLabel: 'Փեսայի' },
    ],
    maxGuests: 2,
    defaultGuestCount: 2,
    tableName: 'rsvp_responses',
  },
}

// ── Derived helpers (do not edit) ─────────────────────────────────────────────

export const WEDDING_DATE = new Date(config.date.iso)
export const WEDDING_DATE_SHORT = config.date.displayShort
export const WEDDING_DATE_PARTS = config.date.displayParts
export const WEDDING_DATE_DISPLAY = config.date.displayFull

export const COUPLE = `${config.couple.person1} ${config.couple.separator} ${config.couple.person2}`
