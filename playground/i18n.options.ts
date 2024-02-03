import { datetimeFormats, numberFormats } from "#build/i18n.auto-config.mjs";

export default defineI18nConfig(() => ({
  datetimeFormats: datetimeFormats,
  numberFormats,
}));
