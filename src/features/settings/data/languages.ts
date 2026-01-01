export interface Language {
  code: string // ISO 639-1 code
  name: string // English name
  nativeName: string // Native language name
  countryCode: string // ISO 3166-1 alpha-2 for flag
  popularity?: number // Optional: for sorting (1-10 for popular languages)
}

export const SUPPORTED_LANGUAGES: Language[] = [
  // Popular languages first (top 10)
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    countryCode: 'US',
    popularity: 1,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    countryCode: 'ES',
    popularity: 2,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    countryCode: 'FR',
    popularity: 3,
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    countryCode: 'DE',
    popularity: 4,
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    countryCode: 'PT',
    popularity: 5,
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    countryCode: 'CN',
    popularity: 6,
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    countryCode: 'JP',
    popularity: 7,
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    countryCode: 'KR',
    popularity: 8,
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    countryCode: 'RU',
    popularity: 9,
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    countryCode: 'SA',
    popularity: 10,
  },

  // Rest alphabetically by English name
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', countryCode: 'ZA' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', countryCode: 'AM' },
  {
    code: 'az',
    name: 'Azerbaijani',
    nativeName: 'Azərbaycan',
    countryCode: 'AZ',
  },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', countryCode: 'ES' },
  {
    code: 'be',
    name: 'Belarusian',
    nativeName: 'Беларуская',
    countryCode: 'BY',
  },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', countryCode: 'BD' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', countryCode: 'BA' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', countryCode: 'BG' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', countryCode: 'ES' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', countryCode: 'HR' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', countryCode: 'CZ' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', countryCode: 'DK' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', countryCode: 'NL' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', countryCode: 'EE' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', countryCode: 'FI' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', countryCode: 'ES' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', countryCode: 'GE' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', countryCode: 'GR' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', countryCode: 'IN' },
  {
    code: 'ht',
    name: 'Haitian Creole',
    nativeName: 'Kreyòl Ayisyen',
    countryCode: 'HT',
  },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', countryCode: 'IL' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', countryCode: 'IN' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', countryCode: 'HU' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', countryCode: 'IS' },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    countryCode: 'ID',
  },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', countryCode: 'IT' },
  { code: 'jw', name: 'Javanese', nativeName: 'Basa Jawa', countryCode: 'ID' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', countryCode: 'IN' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', countryCode: 'KZ' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', countryCode: 'KH' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', countryCode: 'LA' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', countryCode: 'LV' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', countryCode: 'LT' },
  {
    code: 'mk',
    name: 'Macedonian',
    nativeName: 'Македонски',
    countryCode: 'MK',
  },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy', countryCode: 'MG' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', countryCode: 'MY' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', countryCode: 'IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', countryCode: 'IN' },
  { code: 'mi', name: 'Maori', nativeName: 'Te Reo Māori', countryCode: 'NZ' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', countryCode: 'MN' },
  { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာ', countryCode: 'MM' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', countryCode: 'NP' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', countryCode: 'NO' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', countryCode: 'AF' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', countryCode: 'IR' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', countryCode: 'PL' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', countryCode: 'IN' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', countryCode: 'RO' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', countryCode: 'IN' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', countryCode: 'RS' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', countryCode: 'LK' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', countryCode: 'SK' },
  {
    code: 'sl',
    name: 'Slovenian',
    nativeName: 'Slovenščina',
    countryCode: 'SI',
  },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', countryCode: 'SO' },
  {
    code: 'su',
    name: 'Sundanese',
    nativeName: 'Basa Sunda',
    countryCode: 'ID',
  },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', countryCode: 'KE' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', countryCode: 'SE' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', countryCode: 'PH' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', countryCode: 'TJ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', countryCode: 'IN' },
  { code: 'tt', name: 'Tatar', nativeName: 'Татарча', countryCode: 'RU' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', countryCode: 'IN' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', countryCode: 'TH' },
  { code: 'bo', name: 'Tibetan', nativeName: 'བོད་སྐད་', countryCode: 'CN' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', countryCode: 'TR' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmençe', countryCode: 'TM' },
  {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    countryCode: 'UA',
  },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', countryCode: 'PK' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbek', countryCode: 'UZ' },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    countryCode: 'VN',
  },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', countryCode: 'GB' },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש', countryCode: 'IL' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', countryCode: 'NG' },
]

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code)
}

export function getPopularLanguages(count: number = 10): Language[] {
  return SUPPORTED_LANGUAGES.filter(lang => lang.popularity)
    .sort((a, b) => (a.popularity || 999) - (b.popularity || 999))
    .slice(0, count)
}

export function getLanguagesForTray(): Language[] {
  return getPopularLanguages(7)
}
