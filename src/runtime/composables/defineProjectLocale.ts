/**
 * From vue-i18n-routing
 */
interface LocaleObject {
  code: any; // Locale;
  name?: string;
  dir?: any; // Directions;
  domain?: string;
  file?: string;
  files?: string[];
  isCatchallLocale?: boolean;
  iso?: string;
}

export interface ComputedLocaleObject extends LocaleObject {
  files: string[];
}

export interface ProjectLocale {
  locale: LocaleObject;
  // @ts-ignore
  datetimeFormats: import("#build/locale/auto.d.ts").DatetimeFormats;
  // @ts-ignore
  numberFormats: import("#build/locale/auto.d.ts").NumberFormats;
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
