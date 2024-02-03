import type { I18nOptions } from "vue-i18n";

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

export interface ComputedLocaleObject extends LocaleObject {
  files: string[];
}

export interface ProjectLocale {
  locale: LocaleObject;
  // @ts-ignore
  datetimeFormats: import("#build/i18n.auto-config.d.ts").DatetimeFormats;
  // @ts-ignore
  numberFormats: import("#build/i18n.auto-config.d.ts").NumberFormats;
}

// const ll: ProjectLocale = {
//   datetimeFormats: {
//     // ss: {

//     // }
//   }
// }

export interface InternalProjectLocale extends ProjectLocale {
  locale: ComputedLocaleObject;
}

export function defineProjectLocale(config: ProjectLocale) {
  return config;
}
