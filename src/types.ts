import type { NuxtConfigLayer } from "@nuxt/schema";

export interface ModuleOptions {
  _layers?: NuxtConfigLayer[];
  _paths?: {
    root: string;
  };

  paths: {
    localeDefinitionsPath: string;
    localesPath: string;
  };

  expressions: {
    localeDefinition: string;
    locales: string;
  };
}
