// import { datetimeFormats, numberFormats } from "#build/i18n.auto-config.mjs";
import locales from "./.nuxt/locale/locales.json";

export default defineI18nConfig(() => ({
  datetimeFormats: Object.entries(locales)
    .map(([code, locale]) => ({ [code]: locale.datetimeFormats }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {}),
  numberFormats: Object.entries(locales)
    .map(([code, locale]) => ({ [code]: locale.numberFormats }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {}),
}));
