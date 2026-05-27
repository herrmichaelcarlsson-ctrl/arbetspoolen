// Swedish Cities and Occupational Categories Constants

// A comprehensive list of the most common Swedish cities and towns
export const SWEDISH_CITIES = [
  "Alingsås", "Arboga", "Arvika", "Avesta", "Boden", "Bollnäs", "Borgholm", "Borlänge", "Borås", 
  "Bålsta", "Burlöv", "Eksjö", "Enköping", "Eskilstuna", "Eslöv", "Falkenberg", "Falköping", 
  "Falun", "Filipstad", "Flen", "Gislaved", "Gränna", "Gävle", "Göteborg", "Hallsberg", 
  "Halmstad", "Haparanda", "Helsingborg", "Härnösand", "Härryda", "Hässleholm", "Höganäs", 
  "Höör", "Hörby", "Jokkmokk", "Jönköping", "Kalmar", "Karlshamn", "Karlskoga", "Karlskrona", 
  "Karlstad", "Katrineholm", "Kiruna", "Kramfors", "Kristianstad", "Kristinehamn", "Kumla", 
  "Kungsbacka", "Kungälv", "Köping", "Laholm", "Landskrona", "Leksand", "Lidingö", "Lidköping", 
  "Linköping", "Ljungby", "Lomma", "Ludvika", "Luleå", "Lund", "Lycksele", "Lysekil", "Malmö", 
  "Marstrand", "Mariestad", "Mora", "Motala", "Mölndal", "Nacka", "Nora", "Norrköping", 
  "Norrtälje", "Nybro", "Nyköping", "Nynäshamn", "Nässjö", "Olofström", "Orsa", "Oskarshamn", 
  "Oxelösund", "Piteå", "Ronneby", "Sala", "Sandviken", "Sigtuna", "Simrishamn", "Skanör", 
  "Skara", "Skellefteå", "Skänninge", "Skövde", "Sollefteå", "Solna", "Staffanstorp", "Stockholm", 
  "Strängnäs", "Strömstad", "Sundsvall", "Svedala", "Säffle", "Säter", "Sävsjö", "Söderhamn", 
  "Söderköping", "Södertälje", "Sölvesborg", "Tidaholm", "Tofta", "Torshälla", "Tranås", 
  "Trelleborg", "Trollhättan", "Trosa", "Tumba", "Täby", "Uddevalla", "Ulricehamn", "Umeå", 
  "Uppsala", "Vadstena", "Varberg", "Vaxholm", "Vellinge", "Vetlanda", "Vimmerby", "Visby", 
  "Vänersborg", "Värnamo", "Västervik", "Västerås", "Växjö", "Ystad", "Åhus", "Åkersberga", 
  "Åmål", "Ängelholm", "Örebro", "Öregrund", "Örnsköldsvik", "Östersund", "Östhammar"
];

// Occupational categories structured by sector
export const TRADES_BY_SECTOR = [
  {
    sector: "Bygg & Anläggning",
    options: [
      { id: "snickare", label: "Snickare", desc: "Träarbete, stomme och inredning", icon: "🪚" },
      { id: "elektriker", label: "Elektriker", desc: "Elinstallation och service", icon: "⚡" },
      { id: "romokare", label: "Rörmokare / VVS-montör", desc: "Värme, ventilation, sanitet", icon: "🔧" },
      { id: "malare", label: "Målare", desc: "In- och utvändig målning", icon: "🖌️" },
      { id: "murare", label: "Murare", desc: "Murning och fasadarbeten", icon: "🧱" },
      { id: "plattsattare", label: "Plattsättare", desc: "Kakel, klinker och tätskikt", icon: "📐" },
      { id: "svetsare", label: "Svetsare / Smed", desc: "Stål- och metallkonstruktion", icon: "🔥" },
      { id: "betongarbetare", label: "Betongarbetare", desc: "Gjutning och armering", icon: "🏗️" },
      { id: "taklaggare", label: "Takläggare", desc: "Takläggning och pappläggning", icon: "🏠" },
      { id: "plattslagare", label: "Plåtslagare", desc: "Byggnadsplåtslageri och rännor", icon: "🔨" },
      { id: "golvlaggare", label: "Golvläggare", desc: "Parkett, linoleum och matta", icon: "🪵" },
      { id: "gravmaskinist", label: "Grävmaskinist / Grävmaskinförare", desc: "Markarbete och schaktning", icon: "🚜" },
      { id: "stallningsbyggare", label: "Ställningsbyggare", desc: "Montering av byggnadsställning", icon: "🪜" },
      { id: "rivningsarbetare", label: "Rivningsarbetare", desc: "Rivning och sanering", icon: "💥" }
    ]
  },
  {
    sector: "Hotell & Restaurang",
    options: [
      { id: "kock", label: "Kock", desc: "Kallkök, varmkök, á la carte", icon: "👨‍🍳" },
      { id: "koksbitrade", label: "Köksbiträde", desc: "Prep, sallader och enklare mat", icon: "🥗" },
      { id: "bartender", label: "Bartender", desc: "Cocktails, barservering och service", icon: "🍸" },
      { id: "servitor", label: "Servitör / Servitris", desc: "Bordsservering och kundbemötande", icon: "🍽️" },
      { id: "hovmastare", label: "Hovmästare", desc: "Bordsplacering och köksledning", icon: "🤵" },
      { id: "diskare", label: "Diskare", desc: "Grovdisk och köksrenlighet", icon: "🧼" },
      { id: "kafebitrade", label: "Kafébiträde / Barista", desc: "Kaffebryggning och kassa", icon: "☕" },
      { id: "hotellreceptionist", label: "Hotellreceptionist", desc: "In- och utcheckning samt bokning", icon: "🔑" }
    ]
  },
  {
    sector: "Transport & Logistik",
    options: [
      { id: "lastbilschauffor", label: "Lastbilschaufför", desc: "Distribution, fjärr och anläggning", icon: "🚛" },
      { id: "budbilschauffor", label: "Budbilschaufför", desc: "Paketleveranser och närdistribution", icon: "📦" },
      { id: "lagerarbetare", label: "Lagerarbetare", desc: "Plock, pack och godsmottagning", icon: "📥" },
      { id: "truckforare", label: "Truckförare", desc: "Skjutstativ, motviktstank m.m.", icon: "🛺" },
      { id: "taxichauffor", label: "Taxichaufför", desc: "Persontransporter och service", icon: "🚕" },
      { id: "terminalarbetare", label: "Terminalarbetare", desc: "Sortering och lasthantering", icon: "🏭" }
    ]
  },
  {
    sector: "Service & Support",
    options: [
      { id: "stadare", label: "Städare / Lokalvårdare", desc: "Hemstäd, kontorsstäd eller flyttstäd", icon: "🧹" },
      { id: "fastighetsskotare", label: "Fastighetsskötare", desc: "Inre och yttre fastighetsunderhåll", icon: "🔑" },
      { id: "kundtjanstmedarbetare", label: "Kundtjänstmedarbetare", desc: "Telefonsupport, chatt och mail", icon: "📞" },
      { id: "butikssaljare", label: "Butikssäljare", desc: "Kundbemötande, varupåfyllnad", icon: "🛍️" },
      { id: "kassor", label: "Kassör / Kassörska", desc: "Kassaarbete och service", icon: "🪙" },
      { id: "vaktare", label: "Säkerhetsvakt / Väktare", desc: "Bevakning, rondering och trygghet", icon: "🛡️" },
      { id: "allt-i-allo", label: "Allt-i-allo / Vaktmästare", desc: "Blandade praktiska uppdrag", icon: "🛠️" }
    ]
  },
  {
    sector: "Vård, Skola & Omsorg",
    options: [
      { id: "underskoterska", label: "Undersköterska", desc: "Omvårdnad, vårdhem eller sjukhus", icon: "🩺" },
      { id: "sjukskoterska", label: "Sjuksköterska", desc: "Legitimerad vård och medicinering", icon: "🏥" },
      { id: "personlig_assistent", label: "Personlig assistent", desc: "Stöd och hjälp i vardagen", icon: "🤝" },
      { id: "barnskotare", label: "Barnskötare", desc: "Pedagogisk omsorg i förskola", icon: "🧸" },
      { id: "larare", label: "Lärare", desc: "Undervisning grundskola/gymnasie", icon: "🎓" }
    ]
  },
  {
    sector: "IT, Teknik & Kontor",
    options: [
      { id: "systemutvecklare", label: "Systemutvecklare", desc: "Frontend, backend, fullstack eller app", icon: "💻" },
      { id: "it_supporttekniker", label: "IT-supporttekniker", desc: "Hårdvara, mjukvara och felsökning", icon: "🖥️" },
      { id: "webbdesigner", label: "Webbdesigner / UX-designer", desc: "Design av hemsidor och användargränssnitt", icon: "🎨" },
      { id: "administrator", label: "Administratör", desc: "Dokumenthantering och kontorsservice", icon: "📁" },
      { id: "ekonomiassistent", label: "Ekonomiassistent", desc: "Fakturering, bokföring och reskontra", icon: "📊" },
      { id: "b2b_saljare", label: "B2B-Säljare", desc: "Företagsförsäljning och affärsrelationer", icon: "💼" }
    ]
  },
  {
    sector: "Trädgård & Lantbruk",
    options: [
      { id: "tradgardsarbetare", label: "Trädgårdsarbetare", desc: "Skötsel, ogräs, gräsklippning", icon: "🌱" },
      { id: "anlaggningsarbetare_tradgard", label: "Anläggare trädgård", desc: "Stensättning, plantering m.m.", icon: "🪵" },
      { id: "lantbruksarbetare", label: "Lantbruksarbetare", desc: "Djurhållning, maskinkörning", icon: "🚜" },
      { id: "skogsarbetare", label: "Skogsarbetare / Röjare", desc: "Röjning och skogsskötsel", icon: "🌲" }
    ]
  }
];

// Flat list of all labels for easy dropdown filter usage
export const FLAT_TRADES = TRADES_BY_SECTOR.flatMap(sector => 
  sector.options.map(opt => opt.label)
).sort((a, b) => a.localeCompare(b, "sv"));
