import type { LocaleObject } from "@nuxtjs/i18n/dist/runtime/composables";
import { locales } from "./.nuxt/i18n.auto-config.mjs";
import { Locales } from "./.nuxt/i18n.mine.mjs";

export default defineNuxtConfig({
  modules: ["../src/module", "@nuxtjs/i18n"],

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  i18nAutoConfig: {
    paths: {
      localeDefinitionsPath: "config/locales",
      localesPath: "locales",
    },
    expressions: {
      localeDefinition: "{localeDefinitionsPath}/",
      locales: "{localesPath}/{locale}/",
    },
  },

  i18n: {
    defaultLocale: "en",
    strategy: "prefix_except_default",
    baseUrl: "https://google.com",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root", // recommended
    },
    debug: false,
    lazy: true,
    langDir: "./locales/",
    vueI18n: "i18n.options.ts",
    locales: locales,
    // i18nModules:
    // locales: Locales,
    // locales: [
    //   {}
    // ]
  },
});
