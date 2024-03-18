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
  pathFiller,
  type FileContent,
} from "./utils/fs";
import { relative } from "pathe";
import type { LocaleObject } from "@nuxtjs/i18n/dist/runtime/composables";

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
  // console.log(JSON.stringify(localeDefinitions));

  const computedLocales = await computedDefinitions(localeDefinitions, options);

  // console.log(JSON.stringify(computedLocales));

  return computedLocales;
}

export async function computedDefinitions(
  localeDefinitions: FileContent<ProjectLocale>[],
  options: ModuleOptions
) {
  const promises = localeDefinitions.map(
    async (_def: FileContent<ProjectLocale>) => {
      console.log("Fails", _def.content);
      const files = await getFilesInPath(
        pathFiller(options.expressions.locales, [
          {
            exp: PATH_LOCALE_DEFINITION_PATH_MATCHER,
            value: options.paths.localeDefinitionsPath,
          },
          {
            exp: PATH_LOCALES_PATH_MATCHER,
            value: options.paths.localesPath,
          },
          {
            exp: PATH_LOCALE_MATCHER,
            value: _def.content.locale.code,
          },
        ]),
        "*.json"
      );
      _def.content.locale.files = files;
      return _def;
    }
  );
  const updatedLocaleDefinitions = await Promise.all(promises);

  return updatedLocaleDefinitions;
}

export async function GenerateTemplate(data: {
  nuxt: Nuxt;
  app: NuxtApp;
  options: ModuleOptions;
}): Promise<string> {
  // const locales = await loadLocales(options);

  const localeFiles = await getFilesInPath(
    getLocaleDefinitionsPath(data.options),
    "*.ts"
  );

  const localeDefinitions = await getDefaultContentsOfFiles<ProjectLocale>(
    localeFiles,
    true
  );

  console.log("REEEEEE");

  const locales = await computedDefinitions(localeDefinitions, data.options);
  console.log("Generator", JSON.stringify(locales));

  return `
${locales
  .map(
    (locale: (typeof locales)[0]) =>
      `import ${locale.content.locale.code} from "${relative(
        data.nuxt.options.buildDir,
        locale.path
      )}"`
  )
  .join(";\n")}



export const localeCodes = [${locales
    .map((locale: (typeof locales)[0]) => `"${locale.content.locale.code}"`)
    .join(", ")}];

export const locales = [
${locales
  .map((locale: (typeof locales)[0]) => {
    console.log("REEEEEEEEEEEEEEEEEEA", locale.content.locale.files);
    return `{
  ...${locale.content.locale.code + ".locale"},
  files: [${locale.content.locale.files?.map(
    (file) => `"${file}"` // ``
  )}]
}`;
  })
  .join(", ")}];

export const datetimeFormats = {
  ${locales
    .map((locale: (typeof locales)[0]) => {
      return locale.content.datetimeFormats
        ? `"${locale.content.locale.code}": ${locale.content.locale.code}.datetimeFormats`
        : false;
    })
    .filter((val) => val !== false)
    .join(",\n\t")}
}

export const numberFormats = {
  ${locales
    .map((locale: (typeof locales)[0]) => {
      return locale.content.numberFormats !== undefined
        ? `"${locale.content.locale.code}": ${locale.content.locale.code}.numberFormats`
        : false;
    })
    .filter((val) => val !== false)
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
    getLocaleDefinitionsPath(data.options),
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
