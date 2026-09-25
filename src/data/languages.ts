export type LanguageCode = 'en' | 'ta' | 'hi' | 'te' | 'kn' | 'mr';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  scriptRegion: string;
  greeting: string;
  subGreeting: string;
  roleTag: string;
  loginTitle: string;
  loginSubtitle: string;
  phoneLabel: string;
  phonePlaceholder: string;
  sendOtpBtn: string;
  otpLabel: string;
  otpPlaceholder: string;
  verifyBtn: string;
  resendOtp: string;
  changeNumber: string;
  getStartedBtn: string;
  selectLanguage: string;
  changeLanguage: string;
  authenticatedAs: string;
  signOut: string;
  testCredentialsHint: string;
  quickDemoNotice: string;
  tagline: string;
  nav: {
    advisory: string;
    scanner: string;
    architecture: string;
  };
  features: {
    advisory: string;
    scanner: string;
    satellite: string;
  };
}

export const LANGUAGES: Record<LanguageCode, LanguageOption> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    scriptRegion: 'Pan-India',
    greeting: 'Hello Farmer',
    subGreeting: 'Welcome to your smart agriculture companion',
    roleTag: 'Smart Kisan Portal',
    loginTitle: 'Farmer Sign-In',
    loginSubtitle: 'Enter your mobile number to access real-time satellite advisory and crop health tools',
    phoneLabel: 'Mobile Phone Number',
    phonePlaceholder: '98401 23456',
    sendOtpBtn: 'Send OTP via SMS',
    otpLabel: 'One-Time Verification Code (OTP)',
    otpPlaceholder: 'Enter 6-digit OTP',
    verifyBtn: 'Verify & Continue',
    resendOtp: 'Resend OTP',
    changeNumber: 'Change phone number',
    getStartedBtn: 'Get Started',
    selectLanguage: 'Choose Preferred Language',
    changeLanguage: 'Language',
    authenticatedAs: 'Verified Farmer',
    signOut: 'Sign Out',
    testCredentialsHint: 'Testing without real SMS? Use demo OTP: 123456',
    quickDemoNotice: 'Verified via Firebase Phone Auth',
    tagline: 'AI-Guided Agriculture Management for Indian Farmlands',
    nav: {
      advisory: 'Advisory',
      scanner: 'Disease Scanner',
      architecture: 'Data Architecture',
    },
    features: {
      advisory: 'NASA Satellite Moisture & Rain Advisories',
      scanner: 'Gemini Vision AI Crop Disease Diagnostics',
      satellite: 'Deterministic Agro-Rule Decision Matrix',
    },
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    scriptRegion: 'தமிழ்நாடு (Tamil Nadu)',
    greeting: 'வணக்கம் விவசாயி',
    subGreeting: 'உங்கள் துல்லிய வேளாண் வழிகாட்டிக்கு நல்வரவு',
    roleTag: 'ஸ்மார்ட் உழவர் தளம்',
    loginTitle: 'விவசாயி உள்நுழைவு',
    loginSubtitle: 'நாசா செயற்கைக்கோள் தரவு மற்றும் பயிர் நோய் கண்டறிய உங்கள் கைப்பேசி எண்ணை உள்ளிடவும்',
    phoneLabel: 'கைப்பேசி எண்',
    phonePlaceholder: '98401 23456',
    sendOtpBtn: 'SMS மூலம் OTP அனுப்புக',
    otpLabel: 'ஒருமுறை கடவுச்சொல் (OTP)',
    otpPlaceholder: '6 இலக்க OTP-ஐ உள்ளிடவும்',
    verifyBtn: 'சரிபார்த்து தொடர்க',
    resendOtp: 'மீண்டும் OTP அனுப்புக',
    changeNumber: 'எண்ணை மாற்றுக',
    getStartedBtn: 'தொடங்குங்கள்',
    selectLanguage: 'மொழியைத் தேர்வு செய்க',
    changeLanguage: 'மொழி',
    authenticatedAs: 'உறுதிசெய்யப்பட்ட உழவர்',
    signOut: 'வெளியேறு',
    testCredentialsHint: 'சோதனைக்கு மாதிரி OTP: 123456 ஐப் பயன்படுத்தலாம்',
    quickDemoNotice: 'ஃபயர்பேஸ் தொலைபேசி சரிபார்ப்பு மூலம் பாதுகாக்கப்பட்டது',
    tagline: 'தமிழ்நாட்டு உழவர்களுக்கான செயற்கை நுண்ணறிவு வேளாண் மேலாண்மை',
    nav: {
      advisory: 'ஆலோசனை',
      scanner: 'நோய் கண்டறிதல்',
      architecture: 'கட்டமைப்பு',
    },
    features: {
      advisory: 'நாசா செயற்கைக்கோள் மண் ஈரப்பதம் மற்றும் மழை வழிகாட்டல்',
      scanner: 'ஜெமினி விஷன் பயிர் இலை நோய் கண்டறிதல்',
      satellite: 'துல்லிய கணித வேளாண் விதி கட்டமைப்பு',
    },
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    scriptRegion: 'उत्तर एवं मध्य भारत (North & Central India)',
    greeting: 'नमस्ते किसान',
    subGreeting: 'आपके स्मार्ट कृषि सहायक में आपका स्वागत है',
    roleTag: 'किसान समाधान पोर्टल',
    loginTitle: 'किसान लॉगिन',
    loginSubtitle: 'सटीक उपग्रह सिंचाई सलाह और फसल स्वास्थ्य विश्लेषण के लिए अपना मोबाइल नंबर दर्ज करें',
    phoneLabel: 'मोबाइल फोन नंबर',
    phonePlaceholder: '98401 23456',
    sendOtpBtn: 'एसएमएस द्वारा ओटीपी भेजें',
    otpLabel: 'सत्यापन कोड (OTP)',
    otpPlaceholder: '6 अंकों का ओटीपी दर्ज करें',
    verifyBtn: 'सत्यापित करें और आगे बढ़ें',
    resendOtp: 'पुनः ओटीपी भेजें',
    changeNumber: 'नंबर बदलें',
    getStartedBtn: 'आरंभ करें',
    selectLanguage: 'अपनी भाषा चुनें',
    changeLanguage: 'भाषा',
    authenticatedAs: 'सत्यापित किसान',
    signOut: 'लॉग आउट',
    testCredentialsHint: 'परीक्षण के लिए डेमो ओटीपी: 123456 का उपयोग करें',
    quickDemoNotice: 'फायरबेस फोन प्रमाणीकरण द्वारा सुरक्षित',
    tagline: 'भारतीय खेतों के लिए एआई-निर्देशित कृषि प्रबंधन मंच',
    nav: {
      advisory: 'कृषि सलाह',
      scanner: 'रोग पहचान',
      architecture: 'डेटा संरचना',
    },
    features: {
      advisory: 'नासा उपग्रह मिट्टी नमी एवं वर्षा पूर्वानुमान',
      scanner: 'जेमिनी विजन एआई फसल रोग पहचान',
      satellite: 'पारदर्शी कृषि नियम इंजन एवं तत्काल निर्णय',
    },
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    scriptRegion: 'ఆంధ్రప్రదేశ్ & తెలంగాణ (AP & Telangana)',
    greeting: 'నమస్కారం రైతు',
    subGreeting: 'మీ స్మార్ట్ వ్యవసాయ సహాయకుడికి స్వాగతం',
    roleTag: 'రైతు సేవ కేంద్రం',
    loginTitle: 'రైతు లాగిన్',
    loginSubtitle: 'ఖచ్చితమైన నీటిపారుదల సలహా మరియు పంట ఆరోగ్య విశ్లేషణను పొందడానికి మీ మొబైల్ నంబర్ నమోదు చేయండి',
    phoneLabel: 'మొబైల్ ఫోన్ నంబర్',
    phonePlaceholder: '98401 23456',
    sendOtpBtn: 'SMS ద్వారా OTP పంపండి',
    otpLabel: 'ధృవీకరణ కోడ్ (OTP)',
    otpPlaceholder: '6 అంకెల OTP నమోదు చేయండి',
    verifyBtn: 'ధృవీకరించి కొనసాగించండి',
    resendOtp: 'మళ్ళీ OTP పంపండి',
    changeNumber: 'నంబర్ మార్చండి',
    getStartedBtn: 'ప్రారంభించండి',
    selectLanguage: 'భాషను ఎంచుకోండి',
    changeLanguage: 'భాష',
    authenticatedAs: 'ధృవీకరించబడిన రైతు',
    signOut: 'లాగ్ అవుట్',
    testCredentialsHint: 'పరీక్ష కోసం డెమో OTP: 123456 ఉపయోగించండి',
    quickDemoNotice: 'ఫైర్‌బేస్ ఫోన్ ప్రమాణీకరణ ద్వారా సురక్షితం',
    tagline: 'రైతుల కోసం ఎఐ మార్గదర్శక వ్యవసాయ నిర్వహణ వేదిక',
    nav: {
      advisory: 'సాగు సలహా',
      scanner: 'తెగుళ్ల గుర్తింపు',
      architecture: 'డేటా నిర్మాణం',
    },
    features: {
      advisory: 'నాసా ఉపగ్రహ నేల తేమ & వర్ష సూచన',
      scanner: 'జెమిని విజన్ పంట తెగుళ్ల గుర్తింపు',
      satellite: 'కచ్చితమైన సాగు నిబంధనల విశ్లేషణ',
    },
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    scriptRegion: 'ಕರ್ನಾಟಕ (Karnataka)',
    greeting: 'ನಮಸ್ಕಾರ ರೈತ',
    subGreeting: 'ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಂಗಾತಿಗೆ ಸುಸ್ವಾಗತ',
    roleTag: 'ರೈತ ಮಿತ್ರ ಪೋರ್ಟಲ್',
    loginTitle: 'ರೈತರ ಲಾಗಿನ್',
    loginSubtitle: 'ಖಚಿತ ನಾಸಾ ಉಪಗ್ರಹ ನೀರಾವರಿ ಸಲಹೆ ಮತ್ತು ಬೆಳೆ ರೋಗ ಪರಿಹಾರಕ್ಕಾಗಿ ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
    phoneLabel: 'ಮೊಬೈಲ್ ದೂರವಾಣಿ ಸಂಖ್ಯೆ',
    phonePlaceholder: '98401 23456',
    sendOtpBtn: 'SMS ಮೂಲಕ OTP ಕಳುಹಿಸಿ',
    otpLabel: 'ದೃಢೀಕರಣ ಕೋಡ್ (OTP)',
    otpPlaceholder: '6 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ',
    verifyBtn: 'ಪರಿಶೀಲಿಸಿ ಮುಂದುವರಿಯಿರಿ',
    resendOtp: 'ಮತ್ತೆ OTP ಕಳುಹಿಸಿ',
    changeNumber: 'ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ',
    getStartedBtn: 'ಪ್ರಾರಂಭಿಸಿ',
    selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    changeLanguage: 'ಭಾಷೆ',
    authenticatedAs: 'ಪರಿಶೀಲಿಸಿದ ರೈತ',
    signOut: 'ನಿರ್ಗಮಿಸಿ',
    testCredentialsHint: 'ಪರೀಕ್ಷೆಗಾಗಿ ಡೆಮೊ OTP: 123456 ಬಳಸಿ',
    quickDemoNotice: 'ಫೈರ್‌ಬೇಸ್ ಫೋನ್ ಪರಿಶೀಲನೆಯೊಂದಿಗೆ ರಕ್ಷಿಸಲಾಗಿದೆ',
    tagline: 'ಭಾರತೀಯ ಕೃಷಿಗಾಗಿ ಎಐ-ಮಾರ್ಗದರ್ಶನ ಕೃಷಿ ನಿರ್ವಹಣೆ',
    nav: {
      advisory: 'ಕೃಷಿ ಸಲಹೆ',
      scanner: 'ರೋಗ ಪತ್ತೆ',
      architecture: 'ಡೇಟಾ ರಚನೆ',
    },
    features: {
      advisory: 'ನಾಸಾ ಉಪಗ್ರಹ ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಮಳೆ ಸಲಹೆ',
      scanner: 'ಜೆಮಿನಿ ದೃಷ್ಟಿ ಬೆಳೆ ರೋಗ ಪತ್ತೆಹಚ್ಚುವಿಕೆ',
      satellite: 'ಖಚಿತ ಕೃಷಿ ನಿಯಮಗಳ ತಂತ್ರಜ್ಞಾನ',
    },
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    scriptRegion: 'महाराष्ट्र (Maharashtra)',
    greeting: 'नमस्कार शेतकरी',
    subGreeting: 'आपल्या स्मार्ट शेती मार्गदर्शकामध्ये आपले स्वागत आहे',
    roleTag: 'शेतकरी सहाय्य पोर्टल',
    loginTitle: 'शेतकरी लॉगिन',
    loginSubtitle: 'अचूक उपग्रह सिंचन सल्ला आणि पीक रोग निदानासाठी आपला मोबाईल नंबर प्रविष्ट करा',
    phoneLabel: 'मोबाईल फोन नंबर',
    phonePlaceholder: '98401 23456',
    sendOtpBtn: 'एसएमएसद्वारे ओटीपी पाठवा',
    otpLabel: 'पडताळणी कोड (OTP)',
    otpPlaceholder: '६ अंकी ओटीपी टाका',
    verifyBtn: 'सत्यापित करून पुढे जा',
    resendOtp: 'पुन्हा OTP पाठवा',
    changeNumber: 'नंबर बदला',
    getStartedBtn: 'सुरू करा',
    selectLanguage: 'भाषा निवडा',
    changeLanguage: 'भाषा',
    authenticatedAs: 'सत्यापित शेतकरी',
    signOut: 'लॉग आउट',
    testCredentialsHint: 'चाचणीसाठी डेमो ओटीपी: 123456 वापरा',
    quickDemoNotice: 'फायरबेस फोन ऑथद्वारे सुरक्षित',
    tagline: 'भारतीय शेतकऱ्यांसाठी अचूक कृषी व्यवस्थापन मंच',
    nav: {
      advisory: 'कृषि सल्ला',
      scanner: 'रोग निदान',
      architecture: 'डेटा संरचना',
    },
    features: {
      advisory: 'नासा उपग्रह मातीतील ओलावा व पाऊस अंदाज',
      scanner: 'जेमिनी व्हिजन पीक रोग ओळख',
      satellite: 'नियम आधारित सिंचन शिफारशी',
    },
  },
};

export const LANGUAGE_LIST: LanguageOption[] = [
  LANGUAGES.en,
  LANGUAGES.ta,
  LANGUAGES.hi,
  LANGUAGES.te,
  LANGUAGES.kn,
  LANGUAGES.mr,
];
