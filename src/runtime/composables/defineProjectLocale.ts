/**
 * From vue-i18n-routing
 */
interface LocaleObject {
  code: any; // Locale;
  name?: string;
  dir?: any; // Directions;
  domain?: string;
  file?: string;
  isCatchallLocale?: boolean;
  iso?: string;
}

interface ProjectLocale extends LocaleObject {}

export function defineProjectLocale(config: ProjectLocale) {
  // TODO: generate the locale file paths

  return config;
}
