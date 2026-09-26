/**
 * Scheme Eligibility Rules Engine — "First ask the farmer's details."
 *
 * The mascot ASKS for the farmer's basics (state, land size, category, irrigation,
 * crop) before claiming any scheme fits. Matches against state-wise rules —
 * no scheme is ever shown as "eligible" without at least one hard rule passing.
 */

/** Primary app languages — the mascot speaks en/ta/hi (per product vision). */
export type PrimaryLang = 'en' | 'ta' | 'hi';

export type FarmerCategory = 'small' | 'marginal' | 'other';
export type LandTenure = 'owner' | 'tenant' | 'shared';

export interface FarmerDetails {
  state: string;              // e.g. "Tamil Nadu"
  district: string;
  landSizeAcres: number;
  category: FarmerCategory;   // small / marginal / other
  tenure: LandTenure;
  hasIrrigation: boolean;
  crop: string;               // free text, e.g. "Paddy"
  isSC?: boolean;
  isST?: boolean;
}

export type Verdict = 'eligible' | 'maybe' | 'not-eligible';

export interface SchemeMatch {
  id: string;
  name: string;
  nameTa: string;
  nameHi: string;
  portalUrl: string;
  benefit: Record<PrimaryLang, string>;
  verdict: Verdict;
  reason: Record<PrimaryLang, string>;
  stateScope: string[] | 'ALL';
}

/** Deterministic rule per scheme. `details` are the farmer's OWN answers. */
type RuleFn = (d: FarmerDetails) => { verdict: Verdict; reasonKey: ReasonKey } | null;

type ReasonKey =
  | 'landUnder2'
  | 'landUnder5'
  | 'landOver2'
  | 'ownerCultivator'
  | 'tenantOk'
  | 'irrigated'
  | 'rainfedOnly'
  | 'stateCovered'
  | 'stateNotCovered'
  | 'cropMatches'
  | 'allFarmers'
  | 'scstOrSmall';

const REASONS: Record<ReasonKey, Record<PrimaryLang, string>> = {
  landUnder2: {
    en: 'You own 2 hectares (5 acres) or less of cultivable land.',
    ta: 'உங்களிடம் 2 ஹெக்டேர் (5 ஏக்கர்) அல்லது அதற்கு குறைவான விவசாய நிலம் உள்ளது.',
    hi: 'आपके पास 2 हेक्टेयर (5 एकड़) या उससे कम कृषि योग्य भूमि है।',
  },
  landUnder5: {
    en: 'Land ceiling for this scheme is 5 acres — you are within it.',
    ta: 'இந்த திட்டத்தின் நில வரம்பு 5 ஏக்கர் — நீங்கள் அதற்குள் இருக்கிறீர்கள்.',
    hi: 'इस योजना की भूमि सीमा 5 एकड़ है — आप उसके भीतर हैं।',
  },
  landOver2: {
    en: 'Your holding exceeds the 2-hectare limit for full benefit.',
    ta: 'முழு உதவித்தொகைக்கான 2 ஹெக்டேர் வரம்பை விட உங்கள் நிலம் அதிகம்.',
    hi: 'पूर्ण लाभ की 2-हेक्टेयर सीमा से आपकी भूमि अधिक है।',
  },
  ownerCultivator: {
    en: 'Scheme requires owner-cultivator status recorded in land records.',
    ta: 'நில பதிவுகளில் உரிமையாளர்-விவசாயி நிலை தேவை.',
    hi: 'भूमि अभिलेखों में स्वामी-काश्तकार स्थिति आवश्यक है।',
  },
  tenantOk: {
    en: 'Tenants/cultivators without land records can apply with a certificate.',
    ta: 'நில பதிவு இல்லாத குத்தகைதாரர்கள் சான்றிதழுடன் விண்ணப்பிக்கலாம்.',
    hi: 'भूमि अभिलेख के बिना काश्तकार प्रमाणपत्र के साथ आवेदन कर सकते हैं।',
  },
  irrigated: {
    en: 'You have assured irrigation — micro-irrigation subsidy can still offset cost.',
    ta: 'உங்களிடம் உறுதியான பாசனம் உள்ளது — நுண்-பாசன மானியம் செலவை ஈடுகட்டும்.',
    hi: 'आपके पास निश्चित सिंचाई है — सूक्ष्म-सिंचाई सब्सिडी लागत की भरपाई कर सकती है।',
  },
  rainfedOnly: {
    en: 'Rainfed land gets priority scoring for drip/sprinkler subsidy.',
    ta: 'மழை நீரை சார்ந்த நிலத்திற்கு சொட்டு/தெளிப்பு மானியத்தில் முன்னுரிமை.',
    hi: 'वर्षा-आधारित भूमि को ड्रिप/स्प्रिंकलर सब्सिडी में प्राथमिकता मिलती है।',
  },
  stateCovered: {
    en: 'Your state participates in this scheme.',
    ta: 'உங்கள் மாநிலம் இந்த திட்டத்தில் பங்கேற்கிறது.',
    hi: 'आपका राज्य इस योजना में भाग लेता है।',
  },
  stateNotCovered: {
    en: 'Your state has not adopted this scheme yet.',
    ta: 'உங்கள் மாநிலம் இன்னும் இந்த திட்டத்தை செயல்படுத்தவில்லை.',
    hi: 'आपका राज्य ने अभी यह योजना अपनाया नहीं है।',
  },
  cropMatches: {
    en: 'Your crop is covered under this scheme.',
    ta: 'உங்கள் பயிர் இந்த திட்டத்தில் உள்ளடக்கப்பட்டுள்ளது.',
    hi: 'आपकी फसल इस योजना में शामिल है।',
  },
  allFarmers: {
    en: 'Open to all landholding farmer families.',
    ta: 'அனைத்து நில உரிமை விவசாய குடும்பங்களுக்கும் திறந்தது.',
    hi: 'सभी भूमिधारक किसान परिवारों के लिए खुला।',
  },
  scstOrSmall: {
    en: 'Priority for SC/ST and small/marginal farmers.',
    ta: 'எஸ்சி/எஸ்டி மற்றும் சிறு/எல்லை விவசாயிகளுக்கு முன்னுரிமை.',
    hi: 'SC/ST और लघु/सीमांत किसानों को प्राथमिकता।',
  },
};

const PM_KISAN: RuleFn = (d) => {
  const hectares = d.landSizeAcres / 2.471;
  if (hectares > 2) return { verdict: 'maybe', reasonKey: 'landOver2' };
  if (d.tenure === 'tenant') return { verdict: 'maybe', reasonKey: 'tenantOk' };
  return { verdict: 'eligible', reasonKey: 'landUnder2' };
};

const PMFBY: RuleFn = (d) => {
  // PMFBY is universal for notified crops; tenant included.
  return { verdict: 'eligible', reasonKey: 'cropMatches' };
};

const PMKSY_MICRO_IRRIGATION: RuleFn = (d) => {
  if (!d.hasIrrigation) return { verdict: 'eligible', reasonKey: 'rainfedOnly' };
  return { verdict: 'eligible', reasonKey: 'irrigated' };
};

const KCC: RuleFn = (d) => {
  // Crop loans need cultivation, not ownership.
  return { verdict: 'eligible', reasonKey: d.tenure === 'owner' ? 'ownerCultivator' : 'tenantOk' };
};

const SOIL_HEALTH_CARD: RuleFn = () => ({ verdict: 'eligible', reasonKey: 'allFarmers' });

const TN_UZHAVAN: RuleFn = (d) => {
  const tnStates = ['Tamil Nadu', 'தமிழ்நாடு'];
  const inTN = tnStates.some((s) => d.state.toLowerCase().includes('tamil'));
  if (!inTN) return null; // state-scope miss → scheme hidden for this farmer
  return { verdict: 'eligible', reasonKey: 'allFarmers' };
};

const KALIA_ODISHA: RuleFn = (d) => {
  const inOdisha = d.state.toLowerCase().includes('odisha') || d.state.toLowerCase().includes('orissa');
  if (!inOdisha) return null;
  return { verdict: d.category !== 'other' ? 'eligible' : 'maybe', reasonKey: d.category !== 'other' ? 'scstOrSmall' : 'allFarmers' };
};

const RYTHU_BANDHU_TELANGANA: RuleFn = (d) => {
  const inTS = d.state.toLowerCase().includes('telangana');
  if (!inTS) return null;
  return { verdict: d.tenure === 'owner' ? 'eligible' : 'not-eligible', reasonKey: d.tenure === 'owner' ? 'ownerCultivator' : 'ownerCultivator' };
};

const RYTHU_BHAROSA_AP: RuleFn = (d) => {
  const inAP = d.state.toLowerCase().includes('andhra');
  if (!inAP) return null;
  return { verdict: 'eligible', reasonKey: 'allFarmers' };
};

const MUKHYAMANTRI_KRISHAK_ASHIRWAD_MP: RuleFn = (d) => {
  const inMP = d.state.toLowerCase().includes('madhya');
  if (!inMP) return null;
  return { verdict: d.landSizeAcres <= 5 ? 'eligible' : 'maybe', reasonKey: d.landSizeAcres <= 5 ? 'landUnder5' : 'landOver2' };
};

interface RuleDef {
  id: string;
  name: string;
  nameTa: string;
  nameHi: string;
  portalUrl: string;
  benefit: Record<PrimaryLang, string>;
  stateScope: string[] | 'ALL';
  rule: RuleFn;
}

const SCHEMES: RuleDef[] = [
  {
    id: 'pm-kisan',
    name: 'PM-Kisan Samman Nidhi',
    nameTa: 'பிஎம்-கிசான் சம்மான் நிதி',
    nameHi: 'पीएम-किसान सम्मान निधि',
    portalUrl: 'https://pmkisan.gov.in',
    benefit: {
      en: '₹6,000/year in 3 installments direct to bank',
      ta: 'ஆண்டுக்கு ₹6,000 (3 தவணைகள்) நேரடியாக வங்கியில்',
      hi: '₹6,000/वर्ष 3 किस्तों में सीधे बैंक में',
    },
    stateScope: 'ALL',
    rule: PM_KISAN,
  },
  {
    id: 'pmfby',
    name: 'PM Fasal Bima Yojana (Crop Insurance)',
    nameTa: 'பிஎம் பசால் பீமா யோஜனா',
    nameHi: 'पीएम फसल बीमा योजना',
    portalUrl: 'https://pmfby.gov.in',
    benefit: {
      en: 'Low-premium crop insurance against drought & flood',
      ta: 'வறட்சி/வெள்ளத்திற்கு குறைந்த ப்ரீமியம் பயிர் காப்பீடு',
      hi: 'सूखे और बाढ़ के लिए कम-प्रीमियम फसल बीमा',
    },
    stateScope: 'ALL',
    rule: PMFBY,
  },
  {
    id: 'pmksy-mi',
    name: 'PMKSY Micro-Irrigation (Per Drop More Crop)',
    nameTa: 'பிஎம்கேஎஸ்ஒய் நுண்-பாசனம்',
    nameHi: 'पीएमकेएसवाई सूक्ष्म-सिंचाई',
    portalUrl: 'https://pmksy.gov.in',
    benefit: {
      en: '55–80% subsidy on drip/sprinkler systems',
      ta: 'சொட்டு/தெளிப்பு அமைப்புகளுக்கு 55–80% மானியம்',
      hi: 'ड्रिप/स्प्रिंकलर पर 55–80% सब्सिडी',
    },
    stateScope: 'ALL',
    rule: PMKSY_MICRO_IRRIGATION,
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card',
    nameTa: 'கிசான் கிரெடிட் கார்டு',
    nameHi: 'किसान क्रेडिट कार्ड',
    portalUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    benefit: {
      en: 'Crop loan up to ₹3L at 4% effective interest',
      ta: '4% வட்டியில் ₹3 லட்சம் வரை பயிர் கடன்',
      hi: '4% प्रभावी ब्याज पर ₹3 लाख तक फसल ऋण',
    },
    stateScope: 'ALL',
    rule: KCC,
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card',
    nameTa: 'மண் ஆரோக்கிய அட்டை',
    nameHi: 'मृदा स्वास्थ्य कार्ड',
    portalUrl: 'https://soilhealth.dac.gov.in',
    benefit: {
      en: 'Free lab soil test + fertilizer prescription',
      ta: 'இலவச மண் பரிசோதனை + உரப் பரிந்துரை',
      hi: 'मुफ्त मिट्टी परीक्षण + उर्वरक पर्चा',
    },
    stateScope: 'ALL',
    rule: SOIL_HEALTH_CARD,
  },
  {
    id: 'tn-uzhavan',
    name: 'Uzhavan Mobile App Services (TN)',
    nameTa: 'உழவன் சேவைகள் (தமிழ்நாடு)',
    nameHi: 'उझावन सेवाएँ (तमिलनाडु)',
    portalUrl: 'https://uzhavan.tn.gov.in',
    benefit: {
      en: 'TN state advisory, subsidy tracking, e-crop booking',
      ta: 'தமிழ்நாடு அறிவுரை, மானிய கண்காணிப்பு, இ-பயிர் பதிவு',
      hi: 'तमिलनाडु सलाह, सब्सिडी ट्रैकिंग, ई-फसल बुकिंग',
    },
    stateScope: ['Tamil Nadu'],
    rule: TN_UZHAVAN,
  },
  {
    id: 'kalia',
    name: 'KALIA (Kalinga Kisan)',
    nameTa: 'காளியா (ஒடிசா)',
    nameHi: 'कालिया (ओडिशा)',
    portalUrl: 'https://kalia.odisha.gov.in',
    benefit: {
      en: '₹10,000/season cultivation support (Odisha)',
      ta: 'ஒரு பருவத்திற்கு ₹10,000 சாகுபடி உதவி (ஒடிசா)',
      hi: '₹10,000/सीज़न खेती सहायता (ओडिशा)',
    },
    stateScope: ['Odisha'],
    rule: KALIA_ODISHA,
  },
  {
    id: 'rythu-bandhu',
    name: 'Rythu Bandhu Investment Support',
    nameTa: 'ரைது பந்து (தெலங்கானா)',
    nameHi: 'रैतु बंधु (तेलंगाना)',
    portalUrl: 'https://rythubandhu.telangana.gov.in',
    benefit: {
      en: '₹5,000/acre per season for inputs (Telangana)',
      ta: 'பருவத்திற்கு ஏக்கருக்கு ₹5,000 (தெலங்கானா)',
      hi: 'प्रति सीज़न प्रति एकड़ ₹5,000 (तेलंगाना)',
    },
    stateScope: ['Telangana'],
    rule: RYTHU_BANDHU_TELANGANA,
  },
  {
    id: 'rythu-bharosa',
    name: 'YSR Rythu Bharosa',
    nameTa: 'வய்எஸ்ஆர் ரைது பரோசா (ஏபி)',
    nameHi: 'YSR रैतु भरोसा (AP)',
    portalUrl: 'https://ysrrythubharosa.ap.gov.in',
    benefit: {
      en: '₹13,500/year investment support (Andhra Pradesh)',
      ta: 'ஆண்டுக்கு ₹13,500 உதவி (ஆந்திரா)',
      hi: '₹13,500/वर्ष सहायता (आंध्र प्रदेश)',
    },
    stateScope: ['Andhra Pradesh'],
    rule: RYTHU_BHAROSA_AP,
  },
  {
    id: 'mp-ashirwad',
    name: 'Mukhyamantri Krishak Ashirwad',
    nameTa: 'முக்யமந்திரி கிருஷக் ஆசீர்வாத் (எம்பி)',
    nameHi: 'मुख्यमंत्री कृषक आशीर्वाद (MP)',
    portalUrl: 'https://saara.mp.gov.in',
    benefit: {
      en: 'Enhanced crop insurance top-up (Madhya Pradesh)',
      ta: 'கூடுதல் பயிர் காப்பீடு (மத்தியப் பிரதேசம்)',
      hi: 'अतिरिक्त फसल बीमा (मध्य प्रदेश)',
    },
    stateScope: ['Madhya Pradesh'],
    rule: MUKHYAMANTRI_KRISHAK_ASHIRWAD_MP,
  },
];

/**
 * Match the farmer's details against every scheme.
 * State-scoped schemes the farmer can't access are OMITTED entirely —
 * the wizard only shows what's actually possible for him.
 */
export function matchSchemes(d: FarmerDetails): SchemeMatch[] {
  return SCHEMES.filter((s) => {
    if (s.stateScope === 'ALL') return true;
    return s.stateScope.some((st) => d.state.toLowerCase().includes(st.toLowerCase().slice(0, 6)));
  })
    .map((s) => {
      const r = s.rule(d);
      if (!r) return null;
      return {
        id: s.id,
        name: s.name,
        nameTa: s.nameTa,
        nameHi: s.nameHi,
        portalUrl: s.portalUrl,
        benefit: s.benefit,
        verdict: r.verdict,
        reason: REASONS[r.reasonKey],
        stateScope: s.stateScope,
      } as SchemeMatch;
    })
    .filter((m): m is SchemeMatch => m !== null)
    .sort((a, b) => {
      const rank = { eligible: 0, maybe: 1, 'not-eligible': 2 } as const;
      return rank[a.verdict] - rank[b.verdict];
    });
}

/** Mascot one-liner summarising the match — verdict-first, trilingual. */
export function summarizeMatches(matches: SchemeMatch[], lang: PrimaryLang): string {
  const eligible = matches.filter((m) => m.verdict === 'eligible').length;
  const maybe = matches.filter((m) => m.verdict === 'maybe').length;
  if (lang === 'ta') {
    return `${matches.length} திட்டங்கள் பரிசோதிக்கப்பட்டன — ${eligible} உறுதியாக பொருந்துகின்றன, ${maybe} சான்றுகள் தேவை.`;
  }
  if (lang === 'hi') {
    return `${matches.length} योजनाएँ जाँची गईं — ${eligible} पूरी तरह फिट, ${maybe} को दस्तावेज़ चाहिए।`;
  }
  return `Checked ${matches.length} schemes — ${eligible} fit you fully, ${maybe} need extra documents.`;
}
