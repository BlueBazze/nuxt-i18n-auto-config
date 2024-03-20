import type { Nuxt, NuxtApp } from "@nuxt/schema";
import {
  PATH_LOCALE_DEFINITION_PATH_MATCHER,
  PATH_LOCALE_MATCHER,
  PATH_LOCALES_PATH_MATCHER,
} from "./constants";
import type {
  ComputedLocaleObject,
  InternalProjectLocale,
  ProjectLocale,
} from "./runtime/composables";
import type { ModuleOptions } from "./types";
import {
  getDefaultContentsOfFiles,
  getFilesInPath,
  getLocaleDefinitionsPath,
  getTranslationFilesPath,
  pathFiller,
  type FileContent,
} from "./utils/fs";
import { join, relative, basename } from "pathe";
import type { LocaleObject } from "@nuxtjs/i18n/dist/runtime/composables";
import { addTemplate, createResolver } from "@nuxt/kit";
import { pathToFileURL } from "url";

export async function loadLocales(options: ModuleOptions) {
  const localeFiles = await getFilesInPath(
    getLocaleDefinitionsPath(options),
    "*.ts"
  );

  if (localeFiles.length === 0) {
    return null;
  }

  const localeDefinitions = await getDefaultContentsOfFiles<ProjectLocale>(
    localeFiles
  );

  const computedLocales = await getTranslationFilesList(
    localeDefinitions,
    options
  );

  return computedLocales;
}

export async function getTranslationFilesList(
  cwd: string,
  codes: { [code: string]: string[] },
  options: ModuleOptions
) {
  const promises = Object.keys(codes).map(async (_code: string) => {
    const files = await getFilesInPath(
      getTranslationFilesPath(_code, cwd, options),
      "*.json"
    );
    codes[_code] = files;
    return { [_code]: files };
  });
  const updatedTranslationFilesList = await Promise.all(promises);

  return updatedTranslationFilesList.reduce((a, b) => ({ ...a, ...b }), {});
}

export async function GenerateTemplate(data: {
  nuxt: Nuxt;
  app: NuxtApp;
  options: ModuleOptions;
}): Promise<string> {
  // const locales = await loadLocales(options);

  const localeFiles: { [key: string]: string } = {};
  // Singular layer for locale
  for (const layer of data.nuxt.options._layers || []) {
    // You can check for a custom directory existence to extend for each layer
    const _localeFiles = await getFilesInPath(
      getLocaleDefinitionsPath(layer.cwd, data.options),
      "*.ts"
    );

    new Promise(async (r) => {
      const resolve = createResolver(layer.cwd);

      const resolved = pathToFileURL(resolve.resolve(_localeFiles[0] || ""));

      const content = await import(resolved.href);
      console.log({ content });

      r(resolved);
    });

    if (_localeFiles.length > 0) {
      _localeFiles.forEach((file) => {
        // If filename already exists dont append it
        const _bn = basename(file).replace(".ts", "");
        if (!localeFiles[_bn]) {
          localeFiles[_bn] = file;
        }
      });
    }
  }

  const locales: { [key: string]: string[] } = {};

  // const locales = await getTranslationFilesList(
  //   Object.keys(localeFiles)
  //     .map((key) => ({ [key]: [] as string[] }))
  //     .reduce((a, b) => ({ ...a, ...b }), {}),
  //   data.options
  // );
  for (const layer of data.nuxt.options._layers || []) {
    // You can check for a custom directory existence to extend for each layer
    const _layerLocales = await getTranslationFilesList(
      layer.cwd,
      Object.keys(localeFiles)
        .map((key) => ({ [key]: [] as string[] }))
        .reduce((a, b) => ({ ...a, ...b }), {}),
      data.options
    );

    if (Object.keys(_layerLocales).length > 0) {
      Object.keys(_layerLocales).forEach((key) => {
        if (!locales[key]) {
          locales[key] = [];
        }
        locales[key].push(..._layerLocales[key]);
      });
    }
  }

  // localeFiles = await getFilesInPath(
  //   getLocaleDefinitionsPath(data.options),
  //   "*.ts"
  // );

  /**
   * SINGULAR braincelled me thinking that i need to read the file contents
   * ...
   * INSTEAD OF THE FILE NAME!
   */

  // const localeDefinitions = await getDefaultContentsOfFiles<ProjectLocale>(
  //   Object.values(localeFiles),
  //   true
  // );

  // console.log("localeDefinitions", localeDefinitions);

  // ${locales
  //   .map(
  //     (locale: (typeof locales)[0]) =>
  //       `import ${locale.content.locale.code} from "${relative(
  //         data.nuxt.options.buildDir,
  //         locale.path
  //       )}"`
  //   )
  //   .join(";\n")}
  return `
const imports = {
${Object.entries(localeFiles)
  .map(([key, value]) => {
    return `${key}: () => import("${relative(
      data.nuxt.options.buildDir,
      value
    )}")`;
  })
  .join(",\n")}
}

export const localeCodes = [${Object.keys(locales).map((key) => `"${key}"`)}];
export const locales = [
${Object.entries(locales)
  .map(([key, value]) => {
    return `
  {
    code: "${key}",
    ...imports.${key}(),
    files: [${value.map((file) => `"${file}"`).join(", ")}]
  }
  `;
  })
  .join(",\n\t")}
]

export const datetimeFormats = {
  ${Object.entries(locales)
    .map(([key]) => {
      return `${key}: imports.${key}.datetimeFormats`;
    })
    .join(",\n\t")}
}

export const numberFormats = {
  ${Object.keys(locales)
    .map((key) => {
      return `${key}: imports.${key}.numberFormats`;
    })
    .join(",\n\t")}
}
  `;
}

export async function GenerateTypeTemplate(data: {
  nuxt: Nuxt;
  app: NuxtApp;
  options: ModuleOptions;
}): Promise<string> {
  // const locales = await loadLocales(options);

  const localeFiles = await getFilesInPath(
    getLocaleDefinitionsPath(data.app.dir, data.options),
    "*.ts"
  );

  const locales = await getDefaultContentsOfFiles<ProjectLocale>(
    localeFiles,
    true
  );

  // ${locales
  //     .map(
  //       (locale: (typeof locales)[0]) =>
  //         `import ${locale.content.locale.code} from "${relative(
  //           data.nuxt.options.buildDir,
  //           locale.path
  //         )}"`
  //     )
  //     .join(";\n")}
  return `
export interface DatetimeFormats {
  ${[
    ...new Set(
      locales.flatMap((locale: (typeof locales)[0]) =>
        locale.content.datetimeFormats
          ? Object.keys(locale.content.datetimeFormats).map((key) => `"${key}"`)
          : []
      )
    ),
  ]
    .map((key) => `${key}: Intl.DateTimeFormatOptions`)
    .join("\n\t")}
}

export interface NumberFormats {
  ${[
    ...new Set(
      locales.flatMap((locale: (typeof locales)[0]) =>
        locale.content.numberFormats
          ? Object.keys(locale.content.numberFormats).map((key) => `"${key}"`)
          : []
      )
    ),
  ]
    .map((key) => `${key}: Intl.NumberFormatOptions`)
    .join("\n\t")}
}
`;
}
