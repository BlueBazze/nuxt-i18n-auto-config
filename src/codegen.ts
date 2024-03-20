import type { Nuxt, NuxtApp } from "@nuxt/schema";
import type { ModuleOptions } from "./types";
import { basename } from "pathe";
import {
  getFilesInPath,
  getLocaleDefinitionsPath,
  getTranslationFilesPath,
} from "./utils/fs";
import { createResolver, type Resolver } from "@nuxt/kit";
import { pathToFileURL } from "url";
import type { ProjectLocale } from "./runtime/composables";
import type { LocaleObject } from "@nuxtjs/i18n/dist/runtime/composables";

export async function codegenTypesTemplate(data: {
  nuxt: Nuxt;
  app: NuxtApp;
  options: ModuleOptions;
}): Promise<string> {
  const localeFiles: { [key: string]: string } = {};

  // export interface DatetimeFormats {
  //   "shorty": Intl.DateTimeFormatOptions
  // 	"sho": Intl.DateTimeFormatOptions
  // }

  // export interface NumberFormats {
  //   "currency": Intl.NumberFormatOptions
  // }

  // get types for unique datetimeFormats base on the file "./.nuxt/locale/locales.json"

  const resolve = createResolver(data.nuxt.options.buildDir);
  console.log("Pre type gen");
  const locales: ProjectLocale[] = Object.values(
    await ImportFile("./locale/locales.json", resolve)
  );

  const datetimeFormats = locales.reduce((a, b) => {
    const datetimeFormats = b.datetimeFormats;
    return { ...a, ...datetimeFormats };
  }, {});

  const numberFormats = locales.reduce((a, b) => {
    const numberFormats = b.numberFormats;
    return { ...a, ...numberFormats };
  }, {});
  return `import type { LocaleObject } from "@nuxtjs/i18n/dist/runtime/composables";

export interface DatetimeFormats {
${[...new Set(Object.keys(datetimeFormats))]
  .map((key) => `  "${key}": Intl.DateTimeFormatOptions`)
  .join("\n")}
}

export interface NumberFormats {
${[...new Set(Object.keys(numberFormats))]
  .map((key) => `  "${key}": Intl.NumberFormatOptions`)
  .join("\n")}
}

export function defineProjectLocale(data: {
  locale: LocaleObject;
  datetimeFormats: DatetimeFormats;
  numberFormats: NumberFormats;
}) {
  return data;
}  `;
}

export function codegenTypeCodeTemplate(data: {
  nuxt: Nuxt;
  app: NuxtApp;
  options: ModuleOptions;
}): string {
  return `export function defineProjectLocale(data) {
  return data;
}
`;
}

export async function codegenLocaleTemplate(data: {
  nuxt: Nuxt;
  app: NuxtApp;
  options: ModuleOptions;
}): Promise<string> {
  let locales: { [key: string]: ProjectLocale } = {};

  for (const layer of data.nuxt.options._layers || []) {
    const resolve = createResolver(layer.cwd);

    const _localeFiles = await getFilesInPath(
      getLocaleDefinitionsPath(layer.cwd, data.options),
      "*.ts"
    ).then((files) => {
      return files.map(async (file) => {
        return await ImportFile(file, resolve);
      });
    });

    locales = (await Promise.all(_localeFiles))
      .map((locale: ProjectLocale) => ({ [locale.locale.code]: locale }))
      .reduce((a, b) => ({ ...a, ...b }), {});

    locales = await getTranslationFilesList(layer.cwd, locales, data.options);
  }

  return JSON.stringify(locales, null, 2);
}

async function ImportFile(absolutePath: string, resolve: Resolver) {
  const resolved = pathToFileURL(resolve.resolve(absolutePath || ""));
  const content = await import(resolved.href);

  return content;
}

export async function getTranslationFilesList(
  cwd: string,
  locales: { [key: string]: ProjectLocale },
  options: ModuleOptions
): Promise<{ [key: string]: ProjectLocale }> {
  const promises = Object.keys(locales).map(async (_code: string) => {
    const files = await getFilesInPath(
      getTranslationFilesPath(_code, cwd, options),
      "*.json"
    );
    locales[_code].locale.files = files;
    return locales;
  });
  const updatedTranslationFilesList = await Promise.all(promises);

  return updatedTranslationFilesList.reduce((a, b) => ({ ...a, ...b }), {});
}
