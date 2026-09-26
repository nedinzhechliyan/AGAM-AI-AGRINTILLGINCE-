/**
 * Mascot dialogue script — the cow is the interface.
 * Three primary languages: English, Tamil, Hindi (as per user vision).
 */

export type DialogueLang = 'en' | 'ta' | 'hi';

export interface DialogueSet {
  // Registration stage
  welcomeRegister: string;
  askName: string;
  landSaved: (name: string, district: string) => string;
  // Lane 1
  lane1Intro: (district: string) => string;
  liveDataReady: (district: string) => string;
  bestCrop: (crop: string, score: number) => string;
  // Lane 2
  lane2Intro: string;
  // Lane 3
  lane3Intro: string;
  scanPrompt: string;
  // Lane 4
  lane4Intro: string;
  // Utility
  thinking: string;
  micPrompt: string;
  notSupported: string;
  security: string;
  error: string;
}

export const MASCOT_DIALOGUES: Record<DialogueLang, DialogueSet> = {
  en: {
    welcomeRegister:
      "Vanakkam, Namaste, Hello farmer! 🐮 I am your AGAM companion. Tell me about your land and I will watch over it from space!",
    askName: "First, tell me your name, farmer!",
    landSaved: (name, district) =>
      `Wonderful, ${name}! Your land in ${district} is saved. I've marked it green on my globe — let's explore your farm!`,
    lane1Intro: (district) =>
      `This is the Land & Satellite lane. I can fetch live NASA data for ANY district — just ask! Currently showing ${district}.`,
    liveDataReady: (district) =>
      `Fresh satellite data landed for ${district}! Look at your soil moisture and rain forecast.`,
    bestCrop: (crop, score) =>
      `Based on today's satellite readings, ${crop} scores ${score} out of 100 for your field. Ask me why!`,
    lane2Intro: "Here are the government schemes. I'll explain each one and take you straight to the portal!",
    lane3Intro: "Crop Doctor time! Show me a leaf photo and I'll diagnose it instantly.",
    scanPrompt: "Take a clear photo of the sick leaf, farmer!",
    lane4Intro: "This lane remembers everything we did together — your farm story, day by day!",
    thinking: "Let me think, farmer...",
    micPrompt: "I'm listening! Speak in English, Tamil or Hindi.",
    notSupported: "That's outside my farm knowledge. Ask me about land, weather, schemes or crops!",
    security: "I can't share that — it's protected.",
    error: "My satellite link hiccuped. Try again, farmer!",
  },
  ta: {
    welcomeRegister:
      "வணக்கம் விவசாயி! 🐮 நான் உங்கள் AGAM தோழன். உங்கள் நிலத்தைப் பற்றி சொல்லுங்கள் — நான் விண்வெளியில் இருந்து கண்காணிப்பேன்!",
    askName: "முதலில் உங்கள் பெயரை சொல்லுங்கள் விவசாயி!",
    landSaved: (name, district) =>
      `அருமை, ${name}! ${district} -ல் உங்கள் நிலம் சேமிக்கப்பட்டது. என் கோளத்தில் பச்சை நிறத்தில் குறித்துவிட்டேன் — உங்கள் பண்ணையை பார்ப்போம்!`,
    lane1Intro: (district) =>
      `இது நிலம் மற்றும் செயற்கைக்கோள் பாதை. எந்த மாவட்டம் வேண்டுமானாலும் கேளுங்கள் — நான் NASA தரவை கொண்டுவருவேன்! தற்போது ${district}.`,
    liveDataReady: (district) =>
      `${district} -க்கு புதிய செயற்கைக்கோள் தரவு வந்தது! மண் ஈரப்பதம் மற்றும் மழை கணிப்பை பாருங்கள்.`,
    bestCrop: (crop, score) =>
      `இன்றைய செயற்கைக்கோள் படிவுகளின் படி, ${crop} உங்கள் வயலுக்கு 100-ல் ${score} மதிப்பெண். ஏன் என்று கேளுங்கள்!`,
    lane2Intro: "இதோ அரசு திட்டங்கள்! ஒவ்வொன்றையும் விளக்குவேன், நேரடியாக போர்ட்டலுக்கு அழைத்து செல்வேன்!",
    lane3Intro: "பயிர் டாக்டர் நேரம்! ஒரு இலை படத்தை காட்டுங்கள், உடனே கண்டறிகிறேன்.",
    scanPrompt: "நோயுள்ள இலையின் தெளிவான படத்தை எடுங்கள் விவசாயி!",
    lane4Intro: "இந்த பாதை நாம் செய்த அனைத்தையும் நினைவில் வைக்கும் — உங்கள் பண்ணை கதை!",
    thinking: "சற்று யோசிக்கட்டும்...",
    micPrompt: "நான் கேட்கிறேன்! தமிழில் பேசுங்கள்.",
    notSupported: "அது என் வேளாண் அறிவுக்கு வெளியே. நிலம், வானிலை, திட்டங்கள், பயிர்கள் பற்றி கேளுங்கள்!",
    security: "அதை சொல்ல முடியாது — பாதுகாக்கப்பட்டது.",
    error: "செயற்கைக்கோள் இணைப்பில் சிறு தடை. மீண்டும் முயற்சிக்கவும்!",
  },
  hi: {
    welcomeRegister:
      "नमस्ते किसान! 🐮 मैं आपका AGAM साथी हूँ। अपनी ज़मीन के बारे में बताइए — मैं अंतरिक्ष से उसकी रखवाली करूँगा!",
    askName: "पहले अपना नाम बताइए किसान!",
    landSaved: (name, district) =>
      `बहुत बढ़िया, ${name}! ${district} में आपकी ज़मीन सेव हो गई। मैंने ग्लोब पर हरा निशान लगा दिया — चलिए आपका खेत देखें!`,
    lane1Intro: (district) =>
      `यह ज़मीन और सैटेलाइट लेन है। कोई भी ज़िला पूछिए — मैं NASA डेटा लाऊँगा! अभी ${district} दिख रहा है।`,
    liveDataReady: (district) =>
      `${district} का ताज़ा सैटेलाइट डेटा आ गया! मिट्टी की नमी और बारिश का पूर्वानुमान देखिए।`,
    bestCrop: (crop, score) =>
      `आज के सैटेलाइट रीडिंग के हिसाब से, ${crop} आपके खेत के लिए 100 में से ${score} स्कोर करती है। कारण पूछिए!`,
    lane2Intro: "ये रही सरकारी योजनाएँ! मैं हर एक समझाऊँगा और सीधे पोर्टल तक ले जाऊँगा!",
    lane3Intro: "फसल डॉक्टर का समय! एक पत्ते की फोटो दिखाइए, मैं तुरंत पहचानूँगा।",
    scanPrompt: "बीमार पत्ते की साफ फोटो लीजिए किसान!",
    lane4Intro: "यह लेन हमारे सारे किए काम याद रखती है — आपके खेत की कहानी, दिन-प्रतिदिन!",
    thinking: "ज़रा सोचने दीजिए...",
    micPrompt: "मैं सुन रहा हूँ! हिंदी में बोलिए।",
    notSupported: "वह मेरी खेती की जानकारी से बाहर है। ज़मीन, मौसम, योजनाएँ या फसलें पूछिए!",
    security: "वह बताना संभव नहीं — यह सुरक्षित है।",
    error: "सैटेलाइट लिंक में हल्की दिक्कत। फिर कोशिश कीजिए!",
  },
};

/** Greeting word splash used during registration ("vanakkam farmer namaste farmer hello farmer") */
export const GREETING_WORDS: Record<DialogueLang, string[]> = {
  en: ['Hello Farmer!', 'Namaste Farmer!', 'Vanakkam Farmer!'],
  ta: ['வணக்கம் விவசாயி!', 'நமஸ்தே!', 'Hello Farmer!'],
  hi: ['नमस्ते किसान!', 'वानक्कम!', 'Hello Farmer!'],
};
