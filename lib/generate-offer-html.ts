import type { Quote, Company, Product } from "./types"
import type { QuoteLocale } from "./i18n"

// ─── Translations ───────────────────────────────────────────────────────────

const T = {
  ro: {
    offerFor: "OFERTĂ PENTRU",
    to: "Către",
    offerDate: "Data ofertei:",
    regNo: "Nr. înreg.:",
    intro:
      "În urma cererii dumneavoastră, avem plăcerea de a vă face cunoscută oferta noastră de preț:",
    colNo: "Nr.\nCrt.",
    colName: "Denumire reper",
    colQty: "Buc",
    colUnit: "Preț unitar\n(€)",
    colTotal: "Preț total\n(€)",
    grandTotal: "Preț Total (EURO):",
    priceNote:
      "Prețurile de mai sus sunt exprimate în EURO și nu conțin TVA",
    conditionsTitle: "Condiții generale",
    deliveryLabel: "Termen livrare:",
    deliveryWeeks: "săptămâni",
    notIncludeLabel: "Prețurile nu conțin:",
    notInclude: [
      "fundația silozurilor, dimensionarea rigidizărilor necesare la stabiliment, lucrări de construcție, zidărie",
      "lucrările cu racordul electric principal",
      "măsurătorile pentru rezistență și izolare",
      "cheltuielile apărute în timpul punerii în funcțiune și a probei (materiale, energie, personal)",
      "cheltuielie cu macaraua de la fața locului (în cazul silozurilor exterioare: 2 macarale / zi, precum și necesarul de macarale pentru descărcare – 1 macara)",
      "cheltuielile suplimentare în cazul apariției întârzierilor din culpa beneficiarului, acestea vor fi suportate de beneficiar",
    ],
    warrantyLabel: "Garanție:",
    warrantyText:
      "Utilajele noi din prezenta ofertă beneficiază de o garanție de 24 luni",
    serviceText:
      "Pentru service post – garanție al utilajelor de prezenta ofertă se va întocmi un contract de service",
    paymentLabel: "Condiții de plată:",
    payment1: "50 % + TVA la semnarea contractului",
    payment2: "40 % + TVA după transportul utilajelor",
    payment3:
      "10 % + TVA după montaj și semnarea procesului verbal de predare-primire",
    validityLabel: "Valabilitate ofertă:",
    validity21: "21 de zile de la data prezentei oferte",
    before:
      "Înainte de lansarea comenzii vor fi clarificate toate aspectele tehnice.",
    contact:
      "Pentru nelămuriri sau informații suplimentare, vă stăm la dispoziție.",
    review: "Vă rugăm să ne anunțați după analizarea ofertei noastre.",
    regards: "Cu stimă,",
    installation: "Manopera de montaj",
    installationSub: "Cazare, transport personal, etc.",
  },
  hu: {
    offerFor: "AJÁNLAT",
    to: "Részére",
    offerDate: "Ajánlat dátuma:",
    regNo: "Reg. szám:",
    intro:
      "Az Ön megkeresése alapján örömmel tájékoztatjuk Önt árajánlatunkról:",
    colNo: "Ssz.",
    colName: "Megnevezés",
    colQty: "db",
    colUnit: "Egységár\n(€)",
    colTotal: "Összár\n(€)",
    grandTotal: "Összár (EURO):",
    priceNote:
      "A fenti árak EURO-ban vannak megadva és nem tartalmazzák az ÁFÁ-t",
    conditionsTitle: "Általános feltételek",
    deliveryLabel: "Szállítási idő:",
    deliveryWeeks: "hét",
    notIncludeLabel: "Az árak nem tartalmazzák:",
    notInclude: [
      "a silók alapozása, a merevítések méretezése, építési és falazási munkák",
      "a fővillamos csatlakozóra vonatkozó munkák",
      "ellenállás- és szigetelési mérések",
      "az üzembe helyezés és a próba során felmerülő kiadások (anyagok, energia, személyzet)",
      "helyszíni daruzási költségek (külső silók esetén: 2 daru/nap, valamint a lerakáshoz szükséges daruigény – 1 daru)",
      "a megrendelő hibájából eredő késedelmek esetén felmerülő többletköltségek, ezeket a megrendelő viseli",
    ],
    warrantyLabel: "Garancia:",
    warrantyText:
      "A jelen ajánlatban szereplő új gépek 24 hónap garanciát élveznek",
    serviceText:
      "A jelen ajánlatban szereplő berendezések garancia utáni szervizéhez szervizszerződés kerül megkötésre",
    paymentLabel: "Fizetési feltételek:",
    payment1: "50% + ÁFA a szerződés aláírásakor",
    payment2: "40% + ÁFA a gépek szállítása után",
    payment3:
      "10% + ÁFA a szerelés és az átadás-átvételi jegyzőkönyv aláírása után",
    validityLabel: "Az ajánlat érvényessége:",
    validity21: "21 nap a jelen ajánlat dátumától",
    before:
      "A megrendelés leadása előtt minden műszaki szempontot tisztázni kell.",
    contact:
      "Kérdések vagy további információk esetén rendelkezésére állunk.",
    review: "Kérjük, értesítsen minket ajánlatunk elemzése után.",
    regards: "Tisztelettel,",
    installation: "Szerelési munkadíj",
    installationSub: "Szállás, személyzet szállítása, stb.",
  },
  de: {
    offerFor: "ANGEBOT FÜR",
    to: "An",
    offerDate: "Angebotsdatum:",
    regNo: "Reg.-Nr.:",
    intro:
      "In Folge Ihrer Anfrage haben wir die Freude, Ihnen unser Preisangebot bekannt zu geben:",
    colNo: "Nr.",
    colName: "Bezeichnung",
    colQty: "Stk",
    colUnit: "Einzelpreis\n(€)",
    colTotal: "Gesamtpreis\n(€)",
    grandTotal: "Gesamtpreis (EURO):",
    priceNote:
      "Die obigen Preise sind in EURO angegeben und enthalten keine MwSt.",
    conditionsTitle: "Allgemeine Bedingungen",
    deliveryLabel: "Lieferzeit:",
    deliveryWeeks: "Wochen",
    notIncludeLabel: "Die Preise enthalten nicht:",
    notInclude: [
      "Silogrundlagen, Dimensionierung der erforderlichen Versteifungen, Bau- und Mauerwerksarbeiten",
      "Arbeiten am Hauptstromanschluss",
      "Widerstands- und Isolationsmessungen",
      "Kosten bei der Inbetriebnahme und Probe (Materialien, Energie, Personal)",
      "Krankosten vor Ort (bei Außensilos: 2 Kräne/Tag, plus Kräne für die Entladung – 1 Kran)",
      "Zusatzkosten bei Verzögerungen, die vom Auftraggeber verursacht wurden, gehen zu Lasten des Auftraggebers",
    ],
    warrantyLabel: "Garantie:",
    warrantyText:
      "Die in diesem Angebot enthaltenen neuen Maschinen erhalten eine Garantie von 24 Monaten",
    serviceText:
      "Für den Kundendienst nach der Garantie der in diesem Angebot enthaltenen Geräte wird ein Servicevertrag abgeschlossen",
    paymentLabel: "Zahlungsbedingungen:",
    payment1: "50% + MwSt. bei Vertragsunterzeichnung",
    payment2: "40% + MwSt. nach Transport der Maschinen",
    payment3:
      "10% + MwSt. nach Montage und Unterzeichnung des Abnahmeprotokolls",
    validityLabel: "Gültigkeit des Angebots:",
    validity21: "21 Tage ab Datum dieses Angebots",
    before:
      "Vor der Auftragserteilung werden alle technischen Aspekte geklärt.",
    contact:
      "Für Rückfragen oder weitere Informationen stehen wir Ihnen zur Verfügung.",
    review:
      "Wir bitten Sie, uns nach der Analyse unseres Angebots zu informieren.",
    regards: "Mit freundlichen Grüßen,",
    installation: "Montagearbeiten",
    installationSub: "Unterkunft, Personaltransport, usw.",
  },
  en: {
    offerFor: "OFFER FOR",
    to: "To",
    offerDate: "Offer date:",
    regNo: "Reg. no.:",
    intro:
      "Following your request, we have the pleasure of informing you of our price offer:",
    colNo: "No.",
    colName: "Description",
    colQty: "Qty",
    colUnit: "Unit price\n(€)",
    colTotal: "Total price\n(€)",
    grandTotal: "Total Price (EURO):",
    priceNote:
      "Prices above are expressed in EURO and do not include VAT",
    conditionsTitle: "General Terms",
    deliveryLabel: "Delivery time:",
    deliveryWeeks: "weeks",
    notIncludeLabel: "Prices do not include:",
    notInclude: [
      "silo foundations, sizing of reinforcements required for stabilization, construction and masonry work",
      "main electrical connection work",
      "resistance and insulation measurements",
      "expenses arising during commissioning and testing (materials, energy, personnel)",
      "crane costs at site (for exterior silos: 2 cranes/day, plus cranes needed for unloading – 1 crane)",
      "additional costs in case of delays caused by the client, these will be borne by the client",
    ],
    warrantyLabel: "Warranty:",
    warrantyText:
      "New equipment in this offer benefits from a 24-month warranty",
    serviceText:
      "For post-warranty service of the equipment in this offer, a service contract will be drawn up",
    paymentLabel: "Payment terms:",
    payment1: "50% + VAT upon contract signing",
    payment2: "40% + VAT after delivery of equipment",
    payment3: "10% + VAT after installation and signing of the handover protocol",
    validityLabel: "Offer validity:",
    validity21: "21 days from the date of this offer",
    before:
      "Before placing the order, all technical aspects will be clarified.",
    contact:
      "For questions or additional information, we are at your disposal.",
    review: "Please inform us after reviewing our offer.",
    regards: "Yours sincerely,",
    installation: "Installation labor",
    installationSub: "Accommodation, personnel transport, etc.",
  },
} as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format a number in European style: 49.200,00 */
function fmt(n: number, lang: QuoteLocale): string {
  if (lang === "en") {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Generate offer registration number from quote data */
function offerNumber(quoteId: string, date: Date): string {
  const yr = String(date.getFullYear()).slice(2)
  const mo = String(date.getMonth() + 1).padStart(2, "0")
  const dy = String(date.getDate()).padStart(2, "0")
  const digits = quoteId.replace(/\D/g, "")
  const seq = digits.length >= 3 ? digits.slice(0, 3) : digits.padStart(3, "0")
  return `S${yr}${mo}${dy}${seq || "001"}`
}

/** Format offer date in a locale-aware way */
function formatDate(date: Date, lang: QuoteLocale): string {
  const localeMap: Record<QuoteLocale, string> = {
    ro: "ro-RO",
    hu: "hu-HU",
    de: "de-DE",
    en: "en-GB",
  }
  return date.toLocaleDateString(localeMap[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ─── Main HTML Generator ─────────────────────────────────────────────────────

export interface GenerateOfferOptions {
  quote: Quote
  company: Company | null
  products: Product[]
  lang: QuoteLocale
  logoUrl: string
  signatureUrl?: string | null
}

export function generateOfferHtml({
  quote,
  company,
  products,
  lang,
  logoUrl,
  signatureUrl,
}: GenerateOfferOptions): string {
  const tr = T[lang]
  const today = new Date()
  const offerNo = offerNumber(quote.id, today)
  const dateStr = formatDate(today, lang)
  const clientName = company?.name ?? ""

  // Build items rows
  const itemRows = quote.items.map((item, idx) => {
    const product = products.find((p) => p.id === item.productId)
    const productName = product?.name ?? item.productId
    const productDesc = product?.description?.[lang === "en" ? "en" : lang === "hu" ? "hu" : lang === "de" ? "de" : "ro"] ?? ""
    const lineTotal = item.quantity * item.unitPrice

    return `
      <tr>
        <td class="cell-center cell-num">${idx + 1}</td>
        <td class="cell-description">
          <strong>${esc(productName)}</strong>
          ${productDesc ? `<br/><span class="sub-desc">${esc(productDesc)}</span>` : ""}
          ${item.notes ? `<br/><span class="sub-desc">${esc(item.notes)}</span>` : ""}
        </td>
        <td class="cell-center">${item.quantity}</td>
        <td class="cell-right">${fmt(item.unitPrice, lang)}</td>
        <td class="cell-right">${fmt(lineTotal, lang)}</td>
      </tr>`
  })

  // Installation row (always last item)
  if (quote.installation > 0) {
    const installIdx = quote.items.length + 1
    itemRows.push(`
      <tr>
        <td class="cell-center cell-num">${installIdx}</td>
        <td class="cell-description">
          <strong>${esc(tr.installation)}</strong>
          <br/><span class="sub-desc">${esc(tr.installationSub)}</span>
        </td>
        <td class="cell-center">1</td>
        <td class="cell-right">${fmt(quote.installation, lang)}</td>
        <td class="cell-right">${fmt(quote.installation, lang)}</td>
      </tr>`)
  }

  const grandTotal =
    quote.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) +
    quote.installation

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${esc(tr.offerFor)} ${esc(quote.name)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      color: #000;
      background: #fff;
      padding: 8mm 0;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 12mm 15mm;
    }

    /* ── Print button ── */
    .print-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      background: #1e293b;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 8px 16px;
      z-index: 999;
      font-size: 13px;
    }
    .print-bar button {
      background: #dc2626;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 6px 18px;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      letter-spacing: 0.3px;
    }
    .print-bar button:hover { background: #b91c1c; }

    @media print {
      body { padding: 0; }
      .print-bar { display: none !important; }
      .page { width: 100%; padding: 10mm 15mm; }
    }

    /* ── Header ── */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6pt;
    }
    .company-info {
      font-size: 8.5pt;
      line-height: 1.55;
      vertical-align: top;
      width: 58%;
    }
    .company-name { font-weight: bold; font-size: 10.5pt; margin-bottom: 2pt; }
    .logo-cell { text-align: right; vertical-align: middle; }
    .logo-cell img { max-width: 200px; max-height: 90px; object-fit: contain; }

    hr { border: none; border-top: 1.5px solid #000; margin: 6pt 0; }

    /* ── Offer header ── */
    .offer-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: 8pt 0 4pt;
    }
    .to-section { font-size: 11pt; font-weight: bold; }
    .date-section { text-align: right; font-size: 9.5pt; line-height: 1.7; }
    .date-label { font-weight: bold; }
    .offer-title {
      text-align: center;
      font-weight: bold;
      font-size: 12pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 10pt 0 6pt;
    }
    .intro { font-size: 9.5pt; margin-bottom: 8pt; }

    /* ── Items table ── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 4pt;
    }
    .items-table th {
      background: #d9d9d9;
      border: 1px solid #000;
      padding: 4px 5px;
      font-size: 8.5pt;
      text-align: center;
      vertical-align: middle;
      font-weight: bold;
      white-space: pre-line;
    }
    .items-table td {
      border: 1px solid #000;
      padding: 3px 5px;
      font-size: 9pt;
      vertical-align: top;
    }
    .cell-center { text-align: center; vertical-align: middle; }
    .cell-right { text-align: right; vertical-align: middle; }
    .cell-num { width: 28px; }
    .cell-description { width: auto; }
    .sub-desc { font-size: 8.5pt; color: #222; }

    .total-row td {
      font-weight: bold;
      font-size: 10.5pt;
      background: #f5f5f5;
    }
    .total-label { text-align: right; font-weight: bold; }

    /* ── Price note ── */
    .price-note {
      font-weight: bold;
      font-size: 10pt;
      margin: 8pt 0 14pt;
    }

    /* ── Conditions ── */
    .conditions-title {
      font-weight: bold;
      font-size: 12pt;
      text-align: center;
      text-decoration: underline;
      margin: 0 0 10pt;
    }
    .condition-block { margin-bottom: 8pt; font-size: 9.5pt; line-height: 1.5; }
    .condition-label { font-weight: bold; }
    .exclusions-list { margin: 4pt 0 0 14pt; }
    .exclusions-list li { margin-bottom: 2pt; }
    .payment-indent {
      margin-left: 100pt;
      margin-top: 2pt;
      line-height: 1.8;
    }

    /* ── Closing ── */
    .closing { margin-top: 20pt; font-size: 9.5pt; line-height: 1.7; }
    .closing-notes { margin-bottom: 10pt; }
    .signature-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12pt; }
    .signature-text { font-size: 10pt; line-height: 1.7; }
    .stamp-area { text-align: right; }
    .stamp-area img { max-width: 130px; max-height: 130px; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="print-bar">
    <span>SMS Reitler – ${esc(tr.offerFor)} ${esc(quote.name)}</span>
    <button onclick="window.print()">🖨 Print / Save as PDF</button>
  </div>

  <div class="page">

    <!-- ── Company Header ── -->
    <table class="header-table">
      <tr>
        <td class="company-info">
          <div class="company-name">S.C. SMSS REITLER S.R.L.</div>
          <div>445100 Carei, jud. Satu Mare – RO, Calea Armatei Române, nr. 90</div>
          <div>Tel./Fax.: 00-40-261-863430, Mobil: 0744-520219</div>
          <div>CIF: RO15478578</div>
          <div>Nr. Reg. Com.: J30/427/2003</div>
          <div>Cont LEI: RO33BTRL03101202N12327XX</div>
          <div>Cont EUR: RO08BTRL03104202N12327XX</div>
          <div>Banca: Banca Transilvania, Agenția Carei</div>
          <div>E-mail: smsreitler@gmail.com</div>
          <div>Web: www.smsreitler.ro</div>
        </td>
        <td class="logo-cell">
          <img src="${logoUrl}" alt="SMS Reitler" />
        </td>
      </tr>
    </table>

    <hr/>

    <!-- ── Offer Info ── -->
    <div class="offer-header">
      <div class="to-section">${esc(tr.to)} <strong>${esc(clientName)},</strong></div>
      <div class="date-section">
        <div><span class="date-label">${esc(tr.offerDate)}</span> <strong>${esc(dateStr)}</strong></div>
        <div><span class="date-label">${esc(tr.regNo)}</span> <strong>${esc(offerNo)}</strong></div>
      </div>
    </div>

    <!-- ── Title ── -->
    <div class="offer-title">${esc(tr.offerFor)} ${esc(quote.name)}</div>

    <!-- ── Intro ── -->
    <div class="intro">${esc(tr.intro)}</div>

    <!-- ── Items Table ── -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:28px">${esc(tr.colNo)}</th>
          <th>${esc(tr.colName)}</th>
          <th style="width:35px">${esc(tr.colQty)}</th>
          <th style="width:85px">${esc(tr.colUnit)}</th>
          <th style="width:85px">${esc(tr.colTotal)}</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows.join("\n")}
        <tr class="total-row">
          <td colspan="3" class="total-label" style="text-align:right; padding-right:6px">
            ${esc(tr.grandTotal)}
          </td>
          <td colspan="2" class="cell-right" style="font-size:12pt">
            ${fmt(grandTotal, lang)}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ── Price Note ── -->
    <div class="price-note">${esc(tr.priceNote)}</div>

    <!-- ── General Conditions ── -->
    <div class="conditions-title">${esc(tr.conditionsTitle)}</div>

    <div class="condition-block">
      <span class="condition-label">${esc(tr.deliveryLabel)}</span>
      &nbsp;${quote.deliveryTimeWeeks} ${esc(tr.deliveryWeeks)}
    </div>

    <div class="condition-block">
      <div class="condition-label">${esc(tr.notIncludeLabel)}</div>
      <ul class="exclusions-list">
        ${tr.notInclude.map((item) => `<li>${esc(item)}</li>`).join("\n        ")}
      </ul>
    </div>

    <div class="condition-block">
      <span class="condition-label">${esc(tr.warrantyLabel)}</span>
      &nbsp;${esc(tr.warrantyText)}
    </div>

    <div class="condition-block">
      ${esc(tr.serviceText)}
    </div>

    <div class="condition-block">
      <span class="condition-label">${esc(tr.paymentLabel)}</span>
      <div class="payment-indent">
        ${esc(tr.payment1)}<br/>
        ${esc(tr.payment2)}<br/>
        ${esc(tr.payment3)}
      </div>
    </div>

    <div class="condition-block">
      <span class="condition-label">${esc(tr.validityLabel)}</span>
      &nbsp;<strong>${esc(tr.validity21)}</strong>
    </div>

    <!-- ── Closing ── -->
    <div class="closing">
      <div class="closing-notes">
        ${esc(tr.before)}<br/>
        ${esc(tr.contact)}<br/>
        ${esc(tr.review)}
      </div>
      <div class="signature-text">
        ${esc(tr.regards)}<br/>
        ${signatureUrl ? `<img src="${signatureUrl}" alt="Semnătură" style="max-height:80px; max-width:180px; display:block; margin-top:6pt;" />` : ""}
        Alexandru Reitler
      </div>
    </div>

  </div><!-- /page -->
</body>
</html>`
}

/** Simple HTML entity escaper */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
