// import locales from "#build/locale/locales.json";

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
      localeDefinitionsPath: "locales/definitions",
      localesPath: "locales/translations",
    },
    expressions: {
      localeDefinition: "{localeDefinitionsPath}/",
      locales: "{localesPath}/{locale}/",
    },
  },

  // i18n: {
  //   defaultLocale: "en",
  //   strategy: "prefix_except_default",
  //   baseUrl: "https://google.com",
  //   detectBrowserLanguage: {
  //     useCookie: true,
  //     cookieKey: "i18n_redirected",
  //     redirectOn: "root", // recommended
  //   },
  //   debug: false,
  //   lazy: true,
  //   langDir: "./locales/",
  //   vueI18n: "i18n.options.ts",
  //   locales: locales,
  //   // i18nModules:
  //   // locales: Locales,
  //   // locales: [
  //   //   {}
  //   // ]
  // },
});
