import { defineProjectLocale } from "../../../src/runtime/composables";

export default defineProjectLocale({
  locale: { code: "fr", iso: "fr", name: "French fries" },
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
      currency: "EUR",
    },
  },
});
