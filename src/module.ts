import {
  createResolver,
  defineNuxtModule,
  hasNuxtModule,
  useLogger,
  addTemplate,
  addTypeTemplate,
  addImportsDir,
} from "@nuxt/kit";
import {
  GenerateTemplate,
  GenerateTypeTemplate,
  computedDefinitions,
  loadLocales,
} from "./loader";
import type { ModuleOptions } from "./types";
import { TemplateGenerator } from "./generator";

// Module options TypeScript interface definition

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-i18n-auto-config",
    configKey: "i18nAutoConfig",

    compatibility: {
      nuxt: "^3.0.0",
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    paths: {
      localeDefinitionsPath: "config/locales",
      localesPath: "locales",
    },
    expressions: {
      localeDefinition: "{localeDefinitionsPath}/",
      locales: "{localesPath}/{locale}/",
    },
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const logger = useLogger();

    nuxt.hook("modules:done", () => {
      if (!hasNuxtModule("@nuxtjs/i18n", nuxt)) {
        logger.error(
          "nuxt-i18n-auto-config requires @nuxtjs/i18n to be installed"
        );
      }
    });

    addTemplate({
      filename: "i18n.auto-config.mjs",
      write: true,
      getContents: GenerateTemplate,
      options,
      // getContents(data) {
      //   console.log(Object.keys(data));
      //   return "";
      // },
    });

    addTypeTemplate({
      filename: "i18n.auto-config.d.ts",
      write: true,
      getContents: GenerateTypeTemplate,
      options,
    });

    addTemplate({
      filename: "i18n.mine.mjs",
      write: true,
      getContents: TemplateGenerator,
      options,
    });

    addImportsDir("./runtime/composables");

    nuxt.hook("app:templates", () => {
      console.log("app:templates");
    });

    nuxt.hook("app:templatesGenerated", () => {
      console.log("app:templatesGenerated");
    });

    nuxt.hook("builder:watch", () => {
      console.log("builder:watch");
    });

    // @ts-ignore stfu
    nuxt.hook("i18n:registerModule", async (register) => {
      // const localeDefinitions = await loadLocales(options);
      // if (!localeDefinitions) return;
      // @ts-ignore
      // const sourceLocales = await import("#build/i18n.mine.mjs");
      // const localeDefinitions = await computedDefinitions(
      //   Object.values(sourceLocales),
      //   options
      // );
      // if (nuxt.options.dev) {
      //   logger.debug(
      //     `Found locales: ${JSON.stringify(
      //       localeDefinitions.map((_def: any) => _def.code)
      //     )}`
      //   );
      // }
      // // console.log("localeDefinitions", JSON.stringify(localeDefinitions));
      // register({
      //   langDir: resolver.resolve(`${options.paths.localesPath}`),
      //   locales: localeDefinitions.map((locale) => locale.locale),
      // });
    });
  },
});

export { defineProjectLocale } from "./runtime/composables/defineProjectLocale";
