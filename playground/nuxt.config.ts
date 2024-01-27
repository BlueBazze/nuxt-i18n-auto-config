export default defineNuxtConfig({
  modules: ["../src/module", "@nuxtjs/i18n"],

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  i18n: {
    defaultLocale: "en",
    strategy: "prefix_except_default",
    baseUrl: "https://tvslagelse.dk",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root", // recommended
    },

  },
});