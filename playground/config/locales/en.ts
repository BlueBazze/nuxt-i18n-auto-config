import { defineProjectLocale } from "../../../src/runtime/composables";

export default defineProjectLocale({
  locale: { code: "en", iso: "en", name: "English" },
  datetimeFormats: {
    shorty: {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
    sho: {},
  },
  numberFormats: {
    currency: {
      style: "currency",
      currency: "USD",
    },
  },
});
