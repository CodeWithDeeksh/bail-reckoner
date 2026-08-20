import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AppLanguage = "en" | "hi" | "kn";
const STORAGE_KEY = "bail-reckoner-language";

const labels: Record<AppLanguage, Record<string, string>> = {
  en: { home: "Home", analyze: "Analyze a Case", dashboard: "Dashboard", integrations: "Integrations", signIn: "Sign in", signOut: "Sign out", language: "Language", footer: "Synthetic data only — Not connected to eCourts, ePrisons, CCTNS, ICJS or NALSA", ministry: "Ministry of Law & Justice — Smart India Hackathon 2026 — SIH260405", heroTagline: "Know the pathway. Understand the reason. Act on time.", heroBody: "An explainable legal decision-support system for undertrial prisoners, legal-aid providers and judicial authorities.", explore: "Explore How It Works", how: "How it works", serves: "Who this serves", undertrial: "Undertrial", legalAid: "Legal Aid", judiciary: "Judiciary", undertrialDetail: "Understands the pathway that may apply to their case and what is still needed.", legalAidDetail: "Triages a caseload quickly with a documented, explainable basis for each flag.", judiciaryDetail: "Reviews the statutory calculation behind a flag before applying judicial discretion.", positioning: "Not a bail-granting system. Not a judicial prediction system. A decision-support layer.", positioningBody: "Bail Reckoner identifies potential statutory and procedural pathways from structured case information and explains exactly why a case is flagged. It does not predict outcomes, assign confidence scores, or grant bail. All data in this prototype is synthetic." },
  hi: { home: "मुखपृष्ठ", analyze: "मामले का विश्लेषण", dashboard: "डैशबोर्ड", integrations: "एकीकरण", signIn: "साइन इन", signOut: "साइन आउट", language: "भाषा", footer: "केवल कृत्रिम डेटा — eCourts, ePrisons, CCTNS, ICJS या NALSA से जुड़ा नहीं है", ministry: "विधि एवं न्याय मंत्रालय — स्मार्ट इंडिया हैकथॉन 2026 — SIH260405", heroTagline: "मार्ग जानें। कारण समझें। समय पर कार्रवाई करें।", heroBody: "विचाराधीन कैदियों, विधिक-सहायता प्रदाताओं और न्यायिक प्राधिकारों के लिए व्याख्यात्मक कानूनी निर्णय-सहायता प्रणाली।", explore: "यह कैसे काम करता है", how: "यह कैसे काम करता है", serves: "यह किसके लिए है", undertrial: "विचाराधीन कैदी", legalAid: "विधिक सहायता", judiciary: "न्यायपालिका", undertrialDetail: "अपने मामले में लागू हो सकने वाले मार्ग और शेष आवश्यकताओं को समझता है।", legalAidDetail: "हर संकेत के प्रलेखित और व्याख्यात्मक आधार के साथ मामलों को शीघ्र व्यवस्थित करता है।", judiciaryDetail: "न्यायिक विवेक लागू करने से पहले संकेत के पीछे की वैधानिक गणना की समीक्षा करता है।", positioning: "यह जमानत देने वाली प्रणाली नहीं है। यह न्यायिक भविष्यवाणी प्रणाली नहीं है। यह निर्णय-सहायता परत है।", positioningBody: "बेल रेकनर संरचित मामले की जानकारी से संभावित वैधानिक और प्रक्रियात्मक मार्गों की पहचान करता है और बताता है कि मामला क्यों चिह्नित हुआ है। यह परिणाम की भविष्यवाणी, भरोसे का अंक या जमानत नहीं देता। इस प्रोटोटाइप का सारा डेटा कृत्रिम है।" },
  kn: { home: "ಮುಖಪುಟ", analyze: "ಪ್ರಕರಣ ವಿಶ್ಲೇಷಿಸಿ", dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", integrations: "ಏಕೀಕರಣಗಳು", signIn: "ಸೈನ್ ಇನ್", signOut: "ಸೈನ್ ಔಟ್", language: "ಭಾಷೆ", footer: "ಸಂಶ್ಲೇಷಿತ ದತ್ತಾಂಶ ಮಾತ್ರ — eCourts, ePrisons, CCTNS, ICJS ಅಥವಾ NALSA ಗೆ ಸಂಪರ್ಕವಿಲ್ಲ", ministry: "ಕಾನೂನು ಮತ್ತು ನ್ಯಾಯ ಸಚಿವಾಲಯ — ಸ್ಮಾರ್ಟ್ ಇಂಡಿಯಾ ಹ್ಯಾಕಥಾನ್ 2026 — SIH260405", heroTagline: "ಮಾರ್ಗವನ್ನು ತಿಳಿಯಿರಿ. ಕಾರಣವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ. ಸಮಯಕ್ಕೆ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಿ.", heroBody: "ವಿಚಾರಣಾಧೀನ ಕೈದಿಗಳು, ಕಾನೂನು ನೆರವು ಒದಗಿಸುವವರು ಮತ್ತು ನ್ಯಾಯಾಂಗ ಅಧಿಕಾರಿಗಳಿಗಾಗಿ ವಿವರಿಸಬಹುದಾದ ಕಾನೂನು ನಿರ್ಧಾರ-ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ.", explore: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ", how: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ", serves: "ಇದು ಯಾರಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ", undertrial: "ವಿಚಾರಣಾಧೀನ ಕೈದಿ", legalAid: "ಕಾನೂನು ನೆರವು", judiciary: "ನ್ಯಾಯಾಂಗ", undertrialDetail: "ತಮ್ಮ ಪ್ರಕರಣಕ್ಕೆ ಅನ್ವಯಿಸಬಹುದಾದ ಮಾರ್ಗ ಮತ್ತು ಇನ್ನೂ ಬೇಕಾಗಿರುವುದನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಾರೆ.", legalAidDetail: "ಪ್ರತಿ ಸೂಚನೆಗೆ ದಾಖಲಿತ, ವಿವರಿಸಬಹುದಾದ ಆಧಾರದೊಂದಿಗೆ ಪ್ರಕರಣಗಳನ್ನು ತ್ವರಿತವಾಗಿ ವಿಂಗಡಿಸುತ್ತದೆ.", judiciaryDetail: "ನ್ಯಾಯಾಂಗ ವಿವೇಚನೆಯನ್ನು ಅನ್ವಯಿಸುವ ಮೊದಲು ಸೂಚನೆಯ ಹಿಂದಿನ ಶಾಸನಬದ್ಧ ಲೆಕ್ಕಾಚಾರವನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ.", positioning: "ಇದು ಜಾಮೀನು ನೀಡುವ ವ್ಯವಸ್ಥೆಯಲ್ಲ. ಇದು ನ್ಯಾಯಾಂಗ ಭವಿಷ್ಯವಾಣಿ ವ್ಯವಸ್ಥೆಯಲ್ಲ. ಇದು ನಿರ್ಧಾರ-ಬೆಂಬಲ ಪದರವಾಗಿದೆ.", positioningBody: "ಬೇಲ್ ರೆಕನರ್ ರಚನಾತ್ಮಕ ಪ್ರಕರಣ ಮಾಹಿತಿಯಿಂದ ಸಂಭಾವ್ಯ ಶಾಸನಬದ್ಧ ಮತ್ತು ಕಾರ್ಯವಿಧಾನದ ಮಾರ್ಗಗಳನ್ನು ಗುರುತಿಸುತ್ತದೆ ಮತ್ತು ಪ್ರಕರಣವನ್ನು ಏಕೆ ಸೂಚಿಸಲಾಗಿದೆ ಎಂದು ವಿವರಿಸುತ್ತದೆ. ಇದು ಫಲಿತಾಂಶಗಳನ್ನು ಊಹಿಸುವುದಿಲ್ಲ, ವಿಶ್ವಾಸದ ಅಂಕಗಳನ್ನು ನೀಡುವುದಿಲ್ಲ ಅಥವಾ ಜಾಮೀನು ನೀಡುವುದಿಲ್ಲ. ಈ ಮಾದರಿಯ ಎಲ್ಲಾ ದತ್ತಾಂಶ ಸಂಶ್ಲೇಷಿತವಾಗಿದೆ." },
};

// Page copy is kept here so every screen uses the selected language, including
// legacy static components that pre-date the i18n provider.
const pageCopy: Record<Exclude<AppLanguage, "en">, Record<string, string>> = {
  hi: {
    "Case Data": "मामले का डेटा", "Normalization": "मानकीकरण", "Legal Rule Engine": "कानूनी नियम इंजन", "Custody Timeline": "हिरासत समयरेखा", "Potential Pathways": "संभावित मार्ग", "Explainability": "व्याख्यात्मकता", "Integration": "एकीकरण",
    "Structured case information, entered once": "संरचित मामले की जानकारी, एक बार दर्ज", "Person, charges, custody dates and procedural facts — captured as discrete fields, not free text. Nothing is inferred that wasn't supplied.": "व्यक्ति, आरोप, हिरासत की तिथियाँ और प्रक्रियात्मक तथ्य अलग-अलग फ़ील्ड में दर्ज किए जाते हैं, मुक्त पाठ में नहीं। जो जानकारी नहीं दी गई है उसका अनुमान नहीं लगाया जाता।",
    "Facts are normalized against known statutes": "तथ्यों का ज्ञात अधिनियमों के अनुसार मानकीकरण", "Sections are matched to their statute, maximum sentence, bailability, and compoundability so every downstream rule works from the same vocabulary.": "धाराओं को उनके अधिनियम, अधिकतम दंड, जमानतीयता और समझौतायोग्यता से मिलाया जाता है ताकि प्रत्येक नियम समान शब्दावली पर काम करे।",
    "A deterministic, versioned rule engine — not a model": "निर्धारित और संस्करणित नियम इंजन — मॉडल नहीं", "Every pathway is a fixed statutory test: BNSS §187, BNSS §479, offence classification, special-statute registry. Same facts in, same result out, every time.": "हर मार्ग एक निश्चित वैधानिक परीक्षण है: BNSS §187, BNSS §479, अपराध वर्गीकरण और विशेष-अधिनियम रजिस्ट्री। समान तथ्यों पर हर बार समान परिणाम।",
    "Custody duration calculated against today, visibly": "हिरासत अवधि आज की तारीख के अनुसार स्पष्ट रूप से गणना की गई", "Arrest date, custody start, chargesheet status and any delay attributable to the accused are laid out on a timeline you can inspect, not a hidden variable.": "गिरफ्तारी की तारीख, हिरासत शुरू होने की तारीख, आरोपपत्र की स्थिति और आरोपी के कारण हुई देरी निरीक्षण योग्य समयरेखा पर दिखाई जाती है।",
    "Pathways are flagged, never scores": "मार्ग चिह्नित होते हैं, अंक नहीं दिए जाते", "A case can surface a statutory-bail pathway, a default-bail pathway, an undertrial threshold, or a special-statute review — each independently triggered and shown together.": "एक मामले में वैधानिक जमानत मार्ग, डिफ़ॉल्ट-जमानत मार्ग, विचाराधीन सीमा या विशेष-अधिनियम समीक्षा दिख सकती है—हर एक स्वतंत्र रूप से सक्रिय और साथ में प्रदर्शित होता है।",
    "Every flag traces back to a provision and a fact": "हर संकेत एक प्रावधान और तथ्य से जुड़ा है", "Expand \"Why was this flagged?\" on any pathway to see the exact facts, the calculation, the conditions checked, and anything still unresolved.": "सटीक तथ्य, गणना, जाँची गई शर्तें और अनसुलझी बातें देखने के लिए किसी मार्ग पर ‘इसे क्यों चिह्नित किया गया?’ खोलें।",
    "Built to connect later, not connected now": "बाद में जोड़ने के लिए तैयार, अभी जुड़ा नहीं", "Adapters for eCourts, ePrisons, ICJS and CCTNS are integration-ready or government-restricted stubs. Nothing in this prototype touches a live system.": "eCourts, ePrisons, ICJS और CCTNS के अडैप्टर एकीकरण-तैयार या सरकार-प्रतिबंधित स्टब हैं। यह प्रोटोटाइप किसी लाइव प्रणाली से नहीं जुड़ता।",
    "Integrations": "एकीकरण", "Government system adapters": "सरकारी प्रणाली अडैप्टर", "Prototype • No live government data": "प्रोटोटाइप • कोई लाइव सरकारी डेटा नहीं", "Architecture": "वास्तुकला", "Note on authorization": "प्राधिकरण पर टिप्पणी",
    "Sign in": "साइन इन", "Password": "पासवर्ड", "Continue as Guest — see the demo without an account": "अतिथि के रूप में जारी रखें — बिना खाते के डेमो देखें", "Loading demo accounts… if this doesn't populate, the backend may be asleep — try Guest mode below, which can wake it for you.": "डेमो खाते लोड हो रहे हैं… यदि सूची न आए तो बैकएंड निष्क्रिय हो सकता है—नीचे अतिथि मोड आज़माएँ।",
    "Case Analyzer": "मामला विश्लेषक", "Case ID": "मामला आईडी", "Age": "आयु", "Current court": "वर्तमान न्यायालय", "Case stage": "मामले की अवस्था", "Statute": "अधिनियम", "Section(s)": "धारा/धाराएँ", "Offence name": "अपराध का नाम", "Arrest date": "गिरफ्तारी की तारीख", "Custody start date": "हिरासत आरंभ तारीख", "Yes": "हाँ", "No": "नहीं", "Unknown": "अज्ञात", "Dashboard": "डैशबोर्ड", "Undertrial Watch": "विचाराधीन निगरानी", "Analyze": "विश्लेषण करें", "Review →": "समीक्षा →"
  },
  kn: {
    "Case Data": "ಪ್ರಕರಣದ ದತ್ತಾಂಶ", "Normalization": "ಸಾಮಾನ್ಯೀಕರಣ", "Legal Rule Engine": "ಕಾನೂನು ನಿಯಮ ಎಂಜಿನ್", "Custody Timeline": "ಬಂಧನ ಕಾಲರೇಖೆ", "Potential Pathways": "ಸಂಭಾವ್ಯ ಮಾರ್ಗಗಳು", "Explainability": "ವಿವರಣಾತ್ಮಕತೆ", "Integration": "ಏಕೀಕರಣ",
    "Structured case information, entered once": "ರಚನಾತ್ಮಕ ಪ್ರಕರಣದ ಮಾಹಿತಿ, ಒಮ್ಮೆ ನಮೂದಿಸಲಾಗಿದೆ", "Person, charges, custody dates and procedural facts — captured as discrete fields, not free text. Nothing is inferred that wasn't supplied.": "ವ್ಯಕ್ತಿ, ಆರೋಪಗಳು, ಬಂಧನದ ದಿನಾಂಕಗಳು ಮತ್ತು ಕಾರ್ಯವಿಧಾನದ ಸಂಗತಿಗಳನ್ನು ಪ್ರತ್ಯೇಕ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ದಾಖಲಿಸಲಾಗುತ್ತದೆ; ಮುಕ್ತ ಪಠ್ಯದಲ್ಲಿ ಅಲ್ಲ. ಒದಗಿಸದ ಯಾವುದೇ ಮಾಹಿತಿಯನ್ನು ಊಹಿಸಲಾಗುವುದಿಲ್ಲ.",
    "Facts are normalized against known statutes": "ತಿಳಿದಿರುವ ಕಾಯ್ದೆಗಳ ವಿರುದ್ಧ ಸಂಗತಿಗಳ ಸಾಮಾನ್ಯೀಕರಣ", "Sections are matched to their statute, maximum sentence, bailability, and compoundability so every downstream rule works from the same vocabulary.": "ಧಾರೆಗಳನ್ನು ಅವುಗಳ ಕಾಯ್ದೆ, ಗರಿಷ್ಠ ಶಿಕ್ಷೆ, ಜಾಮೀನು ಅರ್ಹತೆ ಮತ್ತು ಸಂಧಾನ ಅರ್ಹತೆಯೊಂದಿಗೆ ಹೊಂದಿಸಲಾಗುತ್ತದೆ; ಇದರಿಂದ ಪ್ರತಿಯೊಂದು ನಿಯಮವೂ ಒಂದೇ ಪರಿಭಾಷೆಯಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.",
    "A deterministic, versioned rule engine — not a model": "ನಿರ್ಧಿಷ್ಟ, ಆವೃತ್ತಿಯ ನಿಯಮ ಎಂಜಿನ್ — ಮಾದರಿಯಲ್ಲ", "Every pathway is a fixed statutory test: BNSS §187, BNSS §479, offence classification, special-statute registry. Same facts in, same result out, every time.": "ಪ್ರತಿ ಮಾರ್ಗವೂ ನಿಗದಿತ ಶಾಸನಬದ್ಧ ಪರೀಕ್ಷೆಯಾಗಿದೆ: BNSS §187, BNSS §479, ಅಪರಾಧ ವರ್ಗೀಕರಣ ಮತ್ತು ವಿಶೇಷ ಕಾಯ್ದೆ ನೋಂದಣಿ. ಒಂದೇ ಸಂಗತಿಗಳಿಗೆ ಪ್ರತಿ ಬಾರಿಯೂ ಒಂದೇ ಫಲಿತಾಂಶ.",
    "Custody duration calculated against today, visibly": "ಇಂದಿನ ದಿನಾಂಕದಂತೆ ಸ್ಪಷ್ಟವಾಗಿ ಲೆಕ್ಕಿಸಿದ ಬಂಧನಾವಧಿ", "Arrest date, custody start, chargesheet status and any delay attributable to the accused are laid out on a timeline you can inspect, not a hidden variable.": "ಬಂಧನದ ದಿನಾಂಕ, ಬಂಧನ ಆರಂಭ, ಆರೋಪಪಟ್ಟಿಯ ಸ್ಥಿತಿ ಮತ್ತು ಆರೋಪಿಗೆ ಕಾರಣವಾದ ವಿಳಂಬವನ್ನು ಪರಿಶೀಲಿಸಬಹುದಾದ ಕಾಲರೇಖೆಯಲ್ಲಿ ತೋರಿಸಲಾಗುತ್ತದೆ.",
    "Pathways are flagged, never scores": "ಮಾರ್ಗಗಳನ್ನು ಸೂಚಿಸಲಾಗುತ್ತದೆ, ಅಂಕ ನೀಡುವುದಿಲ್ಲ", "A case can surface a statutory-bail pathway, a default-bail pathway, an undertrial threshold, or a special-statute review — each independently triggered and shown together.": "ಪ್ರಕರಣವು ಶಾಸನಬದ್ಧ ಜಾಮೀನು ಮಾರ್ಗ, ಡೀಫಾಲ್ಟ್ ಜಾಮೀನು ಮಾರ್ಗ, ವಿಚಾರಣಾಧೀನ ಮಿತಿ ಅಥವಾ ವಿಶೇಷ ಕಾಯ್ದೆ ಪರಿಶೀಲನೆಯನ್ನು ತೋರಿಸಬಹುದು—ಪ್ರತಿಯೊಂದೂ ಸ್ವತಂತ್ರವಾಗಿ ಸಕ್ರಿಯವಾಗಿ ಒಟ್ಟಿಗೆ ತೋರಿಸಲಾಗುತ್ತದೆ.",
    "Every flag traces back to a provision and a fact": "ಪ್ರತಿ ಸೂಚನೆ ಒಂದು ವಿಧಿ ಮತ್ತು ಸಂಗತಿಗೆ ಸಂಬಂಧಿಸಿದೆ", "Expand \"Why was this flagged?\" on any pathway to see the exact facts, the calculation, the conditions checked, and anything still unresolved.": "ನಿಖರ ಸಂಗತಿಗಳು, ಲೆಕ್ಕಾಚಾರ, ಪರಿಶೀಲಿಸಿದ ಷರತ್ತುಗಳು ಮತ್ತು ಬಗೆಹರಿಯದ ಅಂಶಗಳನ್ನು ನೋಡಲು ಯಾವುದೇ ಮಾರ್ಗದಲ್ಲಿ ‘ಇದನ್ನು ಏಕೆ ಸೂಚಿಸಲಾಗಿದೆ?’ ಅನ್ನು ತೆರೆಯಿರಿ.",
    "Built to connect later, not connected now": "ನಂತರ ಸಂಪರ್ಕಿಸಲು ಸಿದ್ಧ, ಈಗ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ", "Adapters for eCourts, ePrisons, ICJS and CCTNS are integration-ready or government-restricted stubs. Nothing in this prototype touches a live system.": "eCourts, ePrisons, ICJS ಮತ್ತು CCTNS ಗಾಗಿ ಅಡಾಪ್ಟರ್‌ಗಳು ಏಕೀಕರಣಕ್ಕೆ ಸಿದ್ಧ ಅಥವಾ ಸರ್ಕಾರ-ನಿರ್ಬಂಧಿತ ಸ್ಟಬ್‌ಗಳಾಗಿವೆ. ಈ ಮಾದರಿಯು ಯಾವುದೇ ನೇರ ವ್ಯವಸ್ಥೆಯನ್ನು ಸಂಪರ್ಕಿಸುವುದಿಲ್ಲ.",
    "Integrations": "ಏಕೀಕರಣಗಳು", "Government system adapters": "ಸರ್ಕಾರಿ ವ್ಯವಸ್ಥೆ ಅಡಾಪ್ಟರ್‌ಗಳು", "Prototype • No live government data": "ಮಾದರಿ • ನೇರ ಸರ್ಕಾರಿ ದತ್ತಾಂಶವಿಲ್ಲ", "Architecture": "ವಿನ್ಯಾಸ", "Note on authorization": "ಅಧಿಕಾರದ ಟಿಪ್ಪಣಿ",
    "Sign in": "ಸೈನ್ ಇನ್", "Password": "ಗುಪ್ತಪದ", "Continue as Guest — see the demo without an account": "ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಯಿರಿ — ಖಾತೆಯಿಲ್ಲದೆ ಮಾದರಿಯನ್ನು ನೋಡಿ", "Loading demo accounts… if this doesn't populate, the backend may be asleep — try Guest mode below, which can wake it for you.": "ಮಾದರಿ ಖಾತೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ… ಪಟ್ಟಿ ಕಾಣದಿದ್ದರೆ ಬ್ಯಾಕೆಂಡ್ ನಿಷ್ಕ್ರಿಯವಾಗಿರಬಹುದು—ಕೆಳಗಿನ ಅತಿಥಿ ವಿಧಾನವನ್ನು ಪ್ರಯತ್ನಿಸಿ.",
    "Case Analyzer": "ಪ್ರಕರಣ ವಿಶ್ಲೇಷಕ", "Case ID": "ಪ್ರಕರಣ ಐಡಿ", "Age": "ವಯಸ್ಸು", "Current court": "ಪ್ರಸ್ತುತ ನ್ಯಾಯಾಲಯ", "Case stage": "ಪ್ರಕರಣದ ಹಂತ", "Statute": "ಕಾಯ್ದೆ", "Section(s)": "ಧಾರಾ/ಧಾರೆಗಳು", "Offence name": "ಅಪರಾಧದ ಹೆಸರು", "Arrest date": "ಬಂಧನದ ದಿನಾಂಕ", "Custody start date": "ಬಂಧನ ಆರಂಭದ ದಿನಾಂಕ", "Yes": "ಹೌದು", "No": "ಇಲ್ಲ", "Unknown": "ತಿಳಿದಿಲ್ಲ", "Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "Undertrial Watch": "ವಿಚಾರಣಾಧೀನ ನಿಗಾವಳಿ", "Analyze": "ವಿಶ್ಲೇಷಿಸಿ", "Review →": "ಪರಿಶೀಲಿಸಿ →"
  }
};

function localizePage(language: AppLanguage) {
  const copy = language === "en" ? {} : pageCopy[language];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "OPTION"].includes(parent.tagName)) continue;
    const source = (node as Text & { __source?: string }).__source ?? node.nodeValue ?? "";
    (node as Text & { __source?: string }).__source = source;
    const trimmed = source.trim();
    const translated = copy[trimmed];
    if (translated) node.nodeValue = source.replace(trimmed, translated);
    else if (language === "en") node.nodeValue = source;
  }
}

declare global {
  interface Window { googleTranslateElementInit?: () => void; google?: any; }
}

function translateWholePage(language: AppLanguage) {
  // Google Translate is used only as a coverage fallback for legacy static
  // copy and dynamically-rendered result text that does not yet have a local
  // reviewed message entry. It translates the complete visible document.
  const apply = () => {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (!select) return;
    select.value = language;
    select.dispatchEvent(new Event("change"));
  };
  if (language === "en") {
    if (document.cookie.includes("googtrans=/en/hi") || document.cookie.includes("googtrans=/en/kn")) {
      document.cookie = "googtrans=/en/en;path=/";
      window.location.reload();
    }
    return;
  }
  document.cookie = `googtrans=/en/${language};path=/`;
  if (window.google?.translate) { apply(); return; }
  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: "hi,kn", autoDisplay: false }, "google_translate_element");
    apply();
  };
  if (!document.getElementById("google-translate-script")) {
    const mount = document.createElement("div");
    mount.id = "google_translate_element";
    mount.style.display = "none";
    document.body.appendChild(mount);
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(script);
  }
}

interface LanguageContextValue { language: AppLanguage; setLanguage: (language: AppLanguage) => void; t: (key: string) => string; }
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function currentLanguage(): AppLanguage {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "hi" || value === "kn" ? value : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<AppLanguage>(currentLanguage);
  const setLanguage = (next: AppLanguage) => { localStorage.setItem(STORAGE_KEY, next); updateLanguage(next); };
  useEffect(() => {
    localizePage(language);
    const observer = new MutationObserver(() => localizePage(language));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);
  useEffect(() => { translateWholePage(language); }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, t: (key) => labels[language][key] ?? key }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
