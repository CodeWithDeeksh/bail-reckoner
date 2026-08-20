"""Presentation-only localization for deterministic rule-engine results.

The rule engine continues to calculate exactly the same result.  This module
only renders its explanatory strings in the language requested by the client.
"""
from __future__ import annotations

from copy import deepcopy
from .models import EligibilityResult

SUPPORTED_LANGUAGES = {"en", "hi", "kn"}

# These messages are intentionally kept server-side: no legal outcome or
# calculation is translated/computed by the browser.
MESSAGES = {
    "hi": {
        "Potentially Eligible": "संभावित रूप से पात्र", "Eligibility Condition Detected": "पात्रता की शर्त मिली",
        "Requires Judicial Review": "न्यायिक समीक्षा आवश्यक", "Insufficient Information": "अपर्याप्त जानकारी",
        "Procedural Action Required": "प्रक्रियात्मक कार्रवाई आवश्यक", "POTENTIAL STATUTORY PATHWAY IDENTIFIED": "संभावित वैधानिक मार्ग पहचाना गया",
        "POTENTIAL DEFAULT-BAIL PATHWAY": "संभावित डिफ़ॉल्ट-जमानत मार्ग", "STATUTORY THRESHOLD REACHED": "वैधानिक सीमा पूरी हुई",
        "ENHANCED SPECIAL-STATUTE REVIEW": "विशेष अधिनियम के अंतर्गत विस्तृत समीक्षा", "BAIL APPLICATION NOT YET FILED": "जमानत आवेदन अभी दायर नहीं हुआ",
        "INSUFFICIENT INFORMATION": "अपर्याप्त जानकारी", "NO PATHWAY IDENTIFIED UNDER CHECKED RULES": "जाँचे गए नियमों में कोई मार्ग नहीं मिला",
        "Arrest date": "गिरफ्तारी की तारीख", "Charge information": "आरोप की जानकारी", "Custody duration": "हिरासत अवधि",
        "Criminal history": "आपराधिक इतिहास", "First-time offender status": "पहली बार अपराधी की स्थिति",
        "Delay attributable to accused": "आरोपी के कारण हुई देरी", "Provided": "प्रदान किया गया", "No charges recorded": "कोई आरोप दर्ज नहीं",
        "Cannot be calculated": "गणना नहीं की जा सकती", "Recorded as supplied by user": "उपयोगकर्ता द्वारा दी गई जानकारी के अनुसार दर्ज",
        "No": "नहीं", "Yes": "हाँ", "Unknown": "अज्ञात", "THRESHOLD REACHED": "सीमा पूरी हुई",
        "Maximum sentence": "अधिकतम दंड", "Threshold fraction": "सीमा का अंश", "Threshold": "सीमा", "Status": "स्थिति",
        "Custody completed": "पूरी हुई हिरासत", "Difference": "अंतर", "Governing charge": "नियंत्रक आरोप",
        "Bail previously applied": "पहले जमानत आवेदन", "Recommended next step": "अनुशंसित अगला कदम",
        "Refer to legal-aid provider / authorized legal professional for case-specific verification.": "मामला-विशिष्ट सत्यापन के लिए विधिक सहायता प्रदाता / अधिकृत विधि विशेषज्ञ से संपर्क करें।",
        "Complete the missing case fields, then re-run the analysis.": "गुम मामले के विवरण भरें, फिर विश्लेषण दोबारा चलाएँ।",
        "Refer to an authorized legal professional experienced in the relevant special statute for case-specific verification.": "मामला-विशिष्ट सत्यापन के लिए संबंधित विशेष अधिनियम के अनुभवी अधिकृत विधि विशेषज्ञ से संपर्क करें।",
    },
    "kn": {
        "Potentially Eligible": "ಸಂಭಾವ್ಯವಾಗಿ ಅರ್ಹ", "Eligibility Condition Detected": "ಅರ್ಹತೆಯ ಷರತ್ತು ಕಂಡುಬಂದಿದೆ",
        "Requires Judicial Review": "ನ್ಯಾಯಾಂಗ ಪರಿಶೀಲನೆ ಅಗತ್ಯ", "Insufficient Information": "ಸಾಕಷ್ಟು ಮಾಹಿತಿ ಇಲ್ಲ",
        "Procedural Action Required": "ಕಾರ್ಯವಿಧಾನದ ಕ್ರಮ ಅಗತ್ಯ", "POTENTIAL STATUTORY PATHWAY IDENTIFIED": "ಸಂಭಾವ್ಯ ಶಾಸನಬದ್ಧ ಮಾರ್ಗ ಗುರುತಿಸಲಾಗಿದೆ",
        "POTENTIAL DEFAULT-BAIL PATHWAY": "ಸಂಭಾವ್ಯ ಡೀಫಾಲ್ಟ್ ಜಾಮೀನು ಮಾರ್ಗ", "STATUTORY THRESHOLD REACHED": "ಶಾಸನಬದ್ಧ ಮಿತಿ ತಲುಪಿದೆ",
        "ENHANCED SPECIAL-STATUTE REVIEW": "ವಿಶೇಷ ಕಾಯ್ದೆಯ ವರ್ಧಿತ ಪರಿಶೀಲನೆ", "BAIL APPLICATION NOT YET FILED": "ಜಾಮೀನು ಅರ್ಜಿ ಇನ್ನೂ ಸಲ್ಲಿಕೆಯಾಗಿಲ್ಲ",
        "INSUFFICIENT INFORMATION": "ಸಾಕಷ್ಟು ಮಾಹಿತಿ ಇಲ್ಲ", "NO PATHWAY IDENTIFIED UNDER CHECKED RULES": "ಪರಿಶೀಲಿಸಿದ ನಿಯಮಗಳಲ್ಲಿ ಯಾವುದೇ ಮಾರ್ಗ ಕಂಡುಬಂದಿಲ್ಲ",
        "Arrest date": "ಬಂಧನದ ದಿನಾಂಕ", "Charge information": "ಆರೋಪದ ಮಾಹಿತಿ", "Custody duration": "ಬಂಧನಾವಧಿ",
        "Criminal history": "ಅಪರಾಧದ ಇತಿಹಾಸ", "First-time offender status": "ಮೊದಲ ಬಾರಿಯ ಅಪರಾಧಿ ಸ್ಥಿತಿ",
        "Delay attributable to accused": "ಆರೋಪಿಗೆ ಕಾರಣವಾದ ವಿಳಂಬ", "Provided": "ಒದಗಿಸಲಾಗಿದೆ", "No charges recorded": "ಯಾವುದೇ ಆರೋಪ ದಾಖಲಾಗಿಲ್ಲ",
        "Cannot be calculated": "ಲೆಕ್ಕ ಹಾಕಲು ಸಾಧ್ಯವಿಲ್ಲ", "Recorded as supplied by user": "ಬಳಕೆದಾರರು ಒದಗಿಸಿದಂತೆ ದಾಖಲಾಗಿದೆ",
        "No": "ಇಲ್ಲ", "Yes": "ಹೌದು", "Unknown": "ತಿಳಿದಿಲ್ಲ", "THRESHOLD REACHED": "ಮಿತಿ ತಲುಪಿದೆ",
        "Maximum sentence": "ಗರಿಷ್ಠ ಶಿಕ್ಷೆ", "Threshold fraction": "ಮಿತಿಯ ಭಾಗ", "Threshold": "ಮಿತಿ", "Status": "ಸ್ಥಿತಿ",
        "Custody completed": "ಪೂರ್ಣಗೊಂಡ ಬಂಧನ", "Difference": "ವ್ಯತ್ಯಾಸ", "Governing charge": "ನಿಯಂತ್ರಕ ಆರೋಪ",
        "Bail previously applied": "ಹಿಂದಿನ ಜಾಮೀನು ಅರ್ಜಿ", "Recommended next step": "ಶಿಫಾರಸು ಮಾಡಿದ ಮುಂದಿನ ಹಂತ",
        "Refer to legal-aid provider / authorized legal professional for case-specific verification.": "ಪ್ರಕರಣ-ನಿರ್ದಿಷ್ಟ ಪರಿಶೀಲನೆಗಾಗಿ ಕಾನೂನು ನೆರವು ಒದಗಿಸುವವರು / ಅಧಿಕೃತ ಕಾನೂನು ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        "Complete the missing case fields, then re-run the analysis.": "ಕಾಣೆಯಾದ ಪ್ರಕರಣದ ವಿವರಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ, ನಂತರ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಮತ್ತೆ ಚಲಾಯಿಸಿ.",
        "Refer to an authorized legal professional experienced in the relevant special statute for case-specific verification.": "ಪ್ರಕರಣ-ನಿರ್ದಿಷ್ಟ ಪರಿಶೀಲನೆಗಾಗಿ ಸಂಬಂಧಿತ ವಿಶೇಷ ಕಾಯ್ದೆಯಲ್ಲಿ ಅನುಭವವಿರುವ ಅಧಿಕೃತ ಕಾನೂನು ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    },
}

def _text(value: str, language: str) -> str:
    if language == "en": return value
    messages = MESSAGES[language]
    if value in messages: return messages[value]
    # Preserve statutory citations and computed figures while localizing common
    # explanatory fragments generated around them.
    for source, target in messages.items():
        if source in value: value = value.replace(source, target)
    return value

def localize_result(result: EligibilityResult, language: str) -> EligibilityResult:
    """Return a localized copy; the audited English calculation is untouched."""
    if language not in SUPPORTED_LANGUAGES or language == "en": return result
    localized = deepcopy(result)
    for flag in localized.data_quality:
        flag.field, flag.note = _text(flag.field, language), _text(flag.note, language)
    for outcome in localized.outcomes:
        # `status` is a stable enum used by the frontend for colour and logic;
        # keep its machine-readable value unchanged.
        for attr in ("headline", "summary"):
            setattr(outcome, attr, _text(getattr(outcome, attr), language))
        for line in outcome.facts_used + outcome.calculation:
            line.label, line.value = _text(line.label, language), _text(line.value, language)
        outcome.conditions_checked = [_text(x, language) for x in outcome.conditions_checked]
        outcome.unresolved_items = [_text(x, language) for x in outcome.unresolved_items]
        for step in outcome.explanation:
            step.title, step.detail = _text(step.title, language), _text(step.detail, language)
        outcome.legal_source.short_title = _text(outcome.legal_source.short_title, language)
    localized.judicial_factors = [_text(x, language) for x in localized.judicial_factors]
    localized.next_step = _text(localized.next_step, language)
    return localized
