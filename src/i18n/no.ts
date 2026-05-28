export const no: Translations = {
  // Nav
  nav: {
    home: 'Hjem',
    practitioners: 'Behandlere',
    myAppointments: 'Mine timer',
    admin: 'Admin',
    login: 'Logg inn',
    logout: 'Logg ut',
  },

  // Specialties
  specialty: {
    physio: 'Fysioterapi',
    psychology: 'Psykologi',
    sports_medicine: 'Idrettsmedisin',
    nutritionist: 'Ernæringsfysiologi',
    private_gp: 'Privat fastlegekonsultasjon',
  },

  // Homepage
  home: {
    heroTitle: 'Book time hos en privatspesialist',
    heroSubtitle: 'Finn ledige timer hos kvalifiserte behandlere. Betal med Vipps. Bekreft med BankID.',
    heroCta: 'Finn behandler',
    browseTitle: 'Våre behandlere',
    browseSubtitle: 'Velg spesialitet og finn en time som passer deg',
    heroBadge: 'Norsk privatpraksis · Rask timebestilling',
    heroTitlePrefix: 'Book time hos',
    heroTitleHighlight: 'norske',
    heroTitleSuffix: 'spesialister',
    heroCta2: 'Se alle spesialister',
    trustLabel: 'Trygg betaling og ID-verifisering',
    statPractitioners: 'Behandlere',
    statSpecialties: 'Spesialiteter',
    statNorwegian: 'Norsk',
    statCancellation: 'Avbestilling',
    nextAvailable: 'Neste ledig: i dag',
    specialtiesAvailable: '4 spesialiteter tilgjengelig',
  },

  // Practitioner
  practitioner: {
    bookCta: 'Book time',
    languages: 'Språk',
    fee: 'Konsultasjonspris',
    noSlots: 'Ingen ledige tider denne dagen',
    joinWaitlist: 'Sett meg på venteliste',
    bio: 'Om behandleren',
  },

  // Booking
  booking: {
    selectDate: 'Velg dato',
    selectTime: 'Velg tid',
    reason: 'Grunn for besøk',
    reasonPlaceholder: 'Beskriv kort hva du ønsker hjelp med (valgfritt)',
    phone: 'Telefonnummer',
    confirmCta: 'Betal med Vipps',
    loginRequired: 'Du må logge inn for å bestille time',
  },

  // Vipps
  vipps: {
    title: 'Betal med Vipps',
    instruction: 'Åpne Vipps på telefonen din',
    reference: 'Referansenummer',
    waiting: 'Venter på betaling...',
    confirmed: 'Betalingen er bekreftet!',
    redirecting: 'Videresender...',
  },

  // BankID
  bankid: {
    button: 'Logg inn med BankID',
    title: 'Logg inn med BankID',
    step1Title: 'Skriv inn fødselsnummer',
    step1Label: 'Fødselsnummer (11 siffer)',
    step1Cta: 'Fortsett',
    step2Title: 'Åpne BankID-appen på din telefon',
    step2Instruction: 'Godkjenn påloggingen i BankID-appen',
    step3Title: 'Du er nå innlogget',
    disclaimer: 'Demo-versjon av BankID-innlogging. Ekte integrasjon krever BankID OIDC-sertifisering.',
  },

  // Confirmation
  confirmation: {
    title: 'Time bekreftet!',
    subtitle: 'Du vil motta en bekreftelse på e-post',
    addToCalendar: 'Legg til i kalender',
    myAppointments: 'Gå til Mine timer',
    qrTitle: 'QR-kode for innsjekk',
    qrInstruction: 'Vis denne koden i resepsjonen ved ankomst',
  },

  // Patient dashboard
  dashboard: {
    title: 'Mine timer',
    upcoming: 'Kommende',
    past: 'Tidligere',
    noUpcoming: 'Du har ingen kommende timer',
    noPast: 'Du har ingen tidligere timer',
    showQr: 'Vis QR-kode',
    cancel: 'Avbestill',
    cancelAppointment: 'Avbestill time',
    keepAppointment: 'Behold time',
    cancelConfirm: 'Er du sikker på at du vil avbestille denne timen?',
    cancelFreeUntil: 'Gratis avbestilling – refusjon via Vipps',
    cancelNoRefund: 'Avbestilling innen 24 timer gir ikke refusjon',
    refundViaVipps: 'Refusjon via Vipps',
    waitlistStatus: 'Du er på venteliste hos',
    leaveWaitlist: 'Forlat venteliste',
    switchAccount: 'Bytt konto',
  },

  // Status badges
  status: {
    pending: 'Venter',
    confirmed: 'Bekreftet',
    cancelled: 'Avbestilt',
    completed: 'Fullført',
    no_show: 'Ikke møtt',
    arrived: 'Ankommet',
    paid: 'Betalt',
    refunded: 'Refundert',
    failed: 'Mislykket',
  },

  // Common
  common: {
    loading: 'Laster...',
    error: 'Noe gikk galt. Prøv igjen.',
    back: 'Tilbake',
    save: 'Lagre',
    cancel: 'Avbryt',
    confirm: 'Bekreft',
    close: 'Lukk',
    nok: 'kr',
    perConsultation: 'per konsultasjon',
    norwegian: 'Norsk',
    english: 'English',
  },
}

export interface Translations {
  nav: {
    home: string; practitioners: string; myAppointments: string
    admin: string; login: string; logout: string
  }
  specialty: {
    physio: string; psychology: string; sports_medicine: string
    nutritionist: string; private_gp: string
  }
  home: {
    heroTitle: string; heroSubtitle: string; heroCta: string
    browseTitle: string; browseSubtitle: string
    heroBadge: string; heroTitlePrefix: string; heroTitleHighlight: string; heroTitleSuffix: string
    heroCta2: string; trustLabel: string
    statPractitioners: string; statSpecialties: string; statNorwegian: string; statCancellation: string
    nextAvailable: string; specialtiesAvailable: string
  }
  practitioner: {
    bookCta: string; languages: string; fee: string
    noSlots: string; joinWaitlist: string; bio: string
  }
  booking: {
    selectDate: string; selectTime: string; reason: string
    reasonPlaceholder: string; phone: string; confirmCta: string; loginRequired: string
  }
  vipps: {
    title: string; instruction: string; reference: string
    waiting: string; confirmed: string; redirecting: string
  }
  bankid: {
    button: string; title: string; step1Title: string; step1Label: string
    step1Cta: string; step2Title: string; step2Instruction: string
    step3Title: string; disclaimer: string
  }
  confirmation: {
    title: string; subtitle: string; addToCalendar: string
    myAppointments: string; qrTitle: string; qrInstruction: string
  }
  dashboard: {
    title: string; upcoming: string; past: string; noUpcoming: string; noPast: string
    showQr: string; cancel: string; cancelAppointment: string; keepAppointment: string
    cancelConfirm: string; cancelFreeUntil: string; cancelNoRefund: string
    refundViaVipps: string; waitlistStatus: string; leaveWaitlist: string; switchAccount: string
  }
  status: {
    pending: string; confirmed: string; cancelled: string; completed: string
    no_show: string; arrived: string; paid: string; refunded: string; failed: string
  }
  common: {
    loading: string; error: string; back: string; save: string; cancel: string
    confirm: string; close: string; nok: string; perConsultation: string
    norwegian: string; english: string
  }
}
