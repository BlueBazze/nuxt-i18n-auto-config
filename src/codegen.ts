import type { Nuxt, NuxtApp } from "@nuxt/schema";
import type { ModuleOptions } from "./types";
import { basename, join } from "pathe";
import {
  getFilesInPath,
  getLocaleDefinitionsPath,
  getTranslationFilesPath,
  getTranslationRootPath,
} from "./utils/fs";
import { createResolver, type Resolver } from "@nuxt/kit";
import { pathToFileURL } from "url";
import type { ProjectLocale } from "./runtime/composables";
import type { LocaleObject } from "@nuxtjs/i18n/dist/runtime/composables";
import { readdir, readdirSync } from "node:fs";

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

export async function codegenTypeCodeTemplate(data: {
  nuxt: Nuxt;
  app: NuxtApp;
  options: ModuleOptions;
}): Promise<string> {
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
  const locales: { [layer: string]: { [key: string]: ProjectLocale } } = {};

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

    const _layerLocales = await Promise.all(_localeFiles);
    const _locales = _layerLocales
      .map((locale: ProjectLocale) => ({ [locale.locale.code]: locale }))
      .reduce((a, b) => ({ ...a, ...b }), {});


    if (Object.values(_locales).length === 0) {
      continue;
    }

    locales[layer.cwd] = await getTranslationFilesList(
      layer.cwd,
      _locales,
      data.options
    );
  }
  Object.values(locales);

  return JSON.stringify(
    Object.values(locales)
      .map((layer) => layer)
      .reduce((a, b) => ({ ...a, ...b })),
    null,
    2
  );
}

export async function codegenLocaleFilesTemplate(data: {
  nuxt: Nuxt;
  app: NuxtApp;
  options: ModuleOptions;
}): Promise<string> {
  // const locales: { [layer: string]: { [key: string]: ProjectLocale } } = {};
  const localeFiles: { [key: string]: string[] } = {};

  for (const layer of data.nuxt.options._layers || []) {
    const resolve = createResolver(layer.cwd);

    // const _localeFolders = await getFilesInPath(
    //   getTranslationRootPath(layer.cwd, data.options),
    //   "*/"
    // );
    // console.log({
    //   _localeFolders,
    //   looking: getTranslationRootPath(layer.cwd, data.options),
    // });
    // if (_localeFolders.length === 0) {
    //   continue;
    // }

    try {
      const localeCodes = readdirSync(
        await resolve.resolvePath(
          getTranslationRootPath(layer.cwd, data.options)
        )
      );
      if (localeCodes.length === 0) {
        continue;
      }

      localeCodes.forEach((code) => {
        if (!localeFiles[code]) {
          localeFiles[code] = [];
        }
        const localePath = getTranslationFilesPath(
          code,
          layer.cwd,
          data.options
        );
        const files = readdirSync(localePath);
        if (files.length === 0) {
          return;
        }
        files.forEach((file) => {
          localeFiles[code].push(join(localePath, file));
        });
      });
    } catch (e) {
      continue;
    }

    //   const _localeFiles = await getFilesInPath(
    //     getLocaleDefinitionsPath(layer.cwd, data.options),
    //     "*.ts"
    //   ).then((files) => {
    //     return files.map(async (file) => {
    //       console.log({ foundLocale: file });
    //       return await ImportFile(file, resolve);
    //     });
    //   });

    //   const _layerLocales = await Promise.all(_localeFiles);
    //   console.log({ _layerLocales });
    //   const _locales = _layerLocales
    //     .map((locale: ProjectLocale) => ({ [locale.locale.code]: locale }))
    //     .reduce((a, b) => ({ ...a, ...b }), {});
    //   console.log({ _locales });

    //   console.log(
    //     "Found locale",
    //     await getTranslationFilesList(layer.cwd, _locales, data.options)
    //   );

    //   if (Object.values(_locales).length === 0) {
    //     continue;
    //   }

    //   locales[layer.cwd] = await getTranslationFilesList(
    //     layer.cwd,
    //     _locales,
    //     data.options
    //   );
    // }
    // Object.values(locales);
  }
  return JSON.stringify(localeFiles, null, 2);
}

async function ImportFile(absolutePath: string, resolve: Resolver) {
  const resolved = pathToFileURL(resolve.resolve(absolutePath || ""));

  const content = await import(resolved.href).catch((e) => {
    console.error("Error", e);
    return {};
  });

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
