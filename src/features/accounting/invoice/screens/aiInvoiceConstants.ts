/* ─── AI Invoice Screen — Constants & Helpers ──────────────────────────────
 *  Extracted from AIInvoiceScreen.tsx to keep the screen file short.
 * ─────────────────────────────────────────────────────────────────────────── */

/* ── Example prompts shown as "try an example" chips ── */
export const EXAMPLE_PROMPTS = [
  "Sold 10 bags of beans at 5500 to Sure packaging limited",
  "Purchase 200 units of palm oil at 1200 from Mama T Suppliers",
  "Invoice 5 laptops at 350k each to TechHub Ltd with VAT",
  "Bought 50 reams of A4 paper at 4500 from Office Mart",
];

/* ── Nigerian/African business vocabulary fed to the speech recogniser ──
 *  Biases the recognition engine toward terms common in Nigerian trade.
 *  Works on Android API 33+ and iOS 16+ (silently ignored on older devices).
 */
export const NIGERIAN_CONTEXTUAL_STRINGS: string[] = [
  // ── Currency & amounts ──
  "naira",
  "kobo",
  "thousand",
  "million",
  "billion",

  // ── Common Nigerian staple products ──
  "rice",
  "bags of rice",
  "cement",
  "bags of cement",
  "palm oil",
  "groundnut oil",
  "vegetable oil",
  "soya oil",
  "garri",
  "semovita",
  "semolina",
  "eba",
  "fufu",
  "akpu",
  "flour",
  "wheat flour",
  "corn flour",
  "noodles",
  "indomie",
  "spaghetti",
  "macaroni",
  "sugar",
  "salt",
  "tomatoes",
  "tomato paste",
  "pepper",
  "onions",
  "yam",
  "plantain",
  "beans",
  "millet",
  "sorghum",
  "zobo",
  "kunu",
  "akara",
  "moi moi",
  "milk",
  "tin milk",
  "butter",
  "margarine",
  "biscuit",
  "water sachet",
  "bottled water",
  "soft drink",
  "malt",
  "beer",
  "stout",
  "whiskey",
  "wine",
  "kerosene",
  "petrol",
  "diesel",
  "cooking gas",
  "LPG",
  "detergent",
  "soap",
  "bleach",
  "toiletries",
  "ankara",
  "fabric",
  "cloth",
  "lace",

  // ── Units common in Nigerian trade ──
  "bags",
  "cartons",
  "crates",
  "bottles",
  "pieces",
  "litres",
  "liters",
  "kilogram",
  "kilograms",
  "grams",
  "dozen",
  "packs",
  "rolls",
  "reams",
  "kegs",
  "drums",
  "tons",
  "tonnes",
  "plots",
  "bundles",
  "sheets",
  "rods",

  // ── Invoice & transaction terms ──
  "invoice",
  "purchase",
  "sales",
  "receipt",
  "delivery",
  "sold",
  "bought",
  "supply",
  "supplied",
  "with VAT",
  "plus VAT",
  "VAT inclusive",
  "VAT exclusive",
  "discount",
  "rebate",
  "balance",
  "proforma",
  "waybill",
  "LPO",

  // ── Nigerian business name prefixes / suffixes ──
  "Alhaji",
  "Alhaja",
  "Mama",
  "Papa",
  "Chief",
  "Malam",
  "Mallam",
  "Engineer",
  "Doctor",
  "Pastor",
  "Apostle",
  "construction",
  "supplies",
  "ventures",
  "enterprises",
  "trading",
  "limited",
  "Nigeria",
  "global",
  "Nigeria Limited",

  // ── Common payment references ──
  "bank transfer",
  "POS",
  "cash",
  "cheque",
  "online transfer",
];

/* ── Number formatter (Nigerian locale) ── */
export const formatNumber = (num: number): string => {
  if (!num || isNaN(num)) return "0.00";
  return parseFloat(String(num)).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/* ── Date formatter ── */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
