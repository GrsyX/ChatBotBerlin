/**
 * Konstanten für die Chat-Anwendung
 * - Sprachoptionen
 * - Begrüßungstexte
 * - Sprachwechsel-Bestätigungen
 * - Willkommensnachricht
 */

// Sprachoptionen für die Auswahl
export const LANGUAGES = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ar', label: 'العربية' }
];

// Begrüßungstexte für jede Sprache
export const GREETINGS = {
  de: 'Wie kann ich Ihnen helfen?',
  en: 'How can I help you?',
  tr: 'Size nasıl yardımcı olabilirim?',
  ar: 'كيف يمكنني مساعدتك؟'
};

// Sprachwechsel-Bestätigung für jede Sprache
export const LANGUAGE_CHANGED = {
  de: 'Die Sprache wurde auf Deutsch geändert.',
  en: 'Language was changed to English.',
  tr: 'Dil Türkçe olarak değiştirildi.',
  ar: 'تم تغيير اللغة إلى العربية.'
};

// Feste ID für die erste Botnachricht (Willkommensnachricht)
export const FIRST_BOT_ID = 1;
export const WELCOME_MESSAGE = {
  id: FIRST_BOT_ID,
  role: 'bot',
  content: 'Willkommen! Welche Sprache möchten Sie verwenden?'
};