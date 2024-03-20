import locales from "./.nuxt/locale/locales.json";

export default defineNuxtConfig({
  modules: ["@nuxtjs/i18n", "../src/module"],

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  i18nAutoConfig: {
    paths: {
      localeDefinitionsPath: "locales/definitions",
      localesPath: "locales/translations",
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
    locales: Object.values(locales).map((locale) => locale.locale),
    // i18nModules:
    // locales: Locales,
    // locales: [
    //   {}
    // ]
  },
});
