import {
  createResolver,
  defineNuxtModule,
  hasNuxtModule,
  useLogger,
  addTemplate,
  addTypeTemplate,
  addImportsDir,
  addImports,
  updateTemplates,
} from "@nuxt/kit";
import {
  GenerateTemplate,
  GenerateTypeTemplate,
  getTranslationFilesList,
  loadLocales,
} from "./loader";
import type { ModuleOptions } from "./types";
import { TemplateGenerator } from "./generator";
import {
  codegenLocaleTemplate,
  codegenTypeCodeTemplate,
  codegenTypesTemplate,
} from "./codegen";

// Module options TypeScript interface definition

declare module "@nuxt/schema" {
}

// @ts-ignore
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

    options._paths = {
      root: nuxt.options.rootDir,
    };

    nuxt.hook("modules:done", () => {
      if (!hasNuxtModule("@nuxtjs/i18n", nuxt)) {
        logger.error(
          "nuxt-i18n-auto-config requires @nuxtjs/i18n to be installed"
        );
      }
    });

    // addTemplate({
    //   filename: "i18n.auto-config.mjs",
    //   write: true,
    //   getContents: GenerateTemplate,
    //   options,
    //   // getContents(data) {
    //   //   console.log(Object.keys(data));
    //   //   return "";
    //   // },
    // });

    // addTypeTemplate({
    //   filename: "i18n.auto-config.d.ts",
    //   write: true,
    //   getContents: GenerateTypeTemplate,
    //   options,
    // });

    // @ts-ignore
    addTemplate({
      filename: "./locale/defineProjectLocale.mjs",
      write: true,
      // @ts-ignore
      getContents: codegenTypeCodeTemplate,
      options,
    });
    // @ts-ignore
    addTemplate({
      filename: "./locale/locales.json",
      write: true,
      // @ts-ignore
      getContents: codegenLocaleTemplate,
      options,
    });
    // @ts-ignore
    addTypeTemplate({
      filename: "./locale/defineProjectLocale.d.ts",
      write: true,
      // @ts-ignore
      getContents: codegenTypesTemplate,
      options,
    });

    nuxt.hook("builder:watch", async (event, relativePath) => {
      console.log("Builder change");
      if (event == "change") return;

      const path = resolver.resolve(nuxt.options.srcDir, relativePath);
      console.log({ path });
      if (
        ["locales/definitions", "locales/translations"].some((dir) =>
          path.startsWith(dir)
        )
      ) {
        console.log("REBUILDING LOCALES");
        await updateTemplates({
          filter: (template) =>
            template.filename === "locales.json" ||
            template.filename === "defineProjectLocale.d.ts",
        });
      }
    });

    // addTemplate({
    //   filename: "i18n.mine.mjs",
    //   write: true,
    //   getContents: TemplateGenerator,
    //   options,
    // });

    const composables = resolver.resolve("./runtime/composables");
    addImports([{ from: composables, name: "defineProjectLocale" }]);
    // addImportsDir("./runtime/composables");

    // nuxt.hook("app:templates", () => {
    //   console.log("app:templates");
    // });

    // nuxt.hook("app:templatesGenerated", () => {
    //   console.log("app:templatesGenerated");
    // });

    // nuxt.hook("builder:watch", () => {
    //   console.log("builder:watch");
    // });

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
