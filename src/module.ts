import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  resolvePath,
  hasNuxtModule,
  useLogger,
  addImports,
  addImportsDir,
  addServerImportsDir,
} from "@nuxt/kit";
import { convertPathToPattern, globbySync } from "globby";
import type { ModuleOptions } from "./types";
import { loadLocales } from "./loader";
import { COMPOSABLE_DEFINE_PROJECT_LOCALE } from "./constants";

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
      localeDefinition: "{localeDefinitionsPath}/*.ts",
      locales: "{localesPath}/{locale}/*.json",
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

    // @ts-ignore stfu
    nuxt.hook("i18n:registerModule", async (register) => {
      const localeDefinitions = await loadLocales(options);
      if (!localeDefinitions) return;

      if (nuxt.options.dev) {
        logger.debug(
          `Found locales: ${JSON.stringify(
            localeDefinitions.map((_def: any) => _def.code)
          )}`
        );
      }

      register({
        langDir: resolver.resolve(`${options.paths.localesPath}`),
        locales: localeDefinitions,
      });
    });
  },
});
