import { useLogger } from "@nuxt/kit";
import type { ModuleOptions } from "./types";
import {
  getFilesInPath,
  getLocaleDefinitionsPath,
  pathFiller,
  readCode,
} from "./utils/fs";
import type { Nuxt, NuxtApp } from "@nuxt/schema";
import { basename, parse, relative } from "pathe";
import { genDynamicImport } from "knitwork";
import {
  PATH_LOCALES_PATH_MATCHER,
  PATH_LOCALE_DEFINITION_PATH_MATCHER,
  PATH_LOCALE_MATCHER,
} from "./constants";
import type {
  ComputedLocaleObject,
  InternalProjectLocale,
} from "./runtime/composables";

export async function TemplateGenerator(data: {
  nuxt: Nuxt;
  app: NuxtApp;
  options: ModuleOptions;
}) {
  const logger = useLogger();

  const localeFiles = await getFilesInPath(
    getLocaleDefinitionsPath(data.options),
    "*.ts"
  );

  if (localeFiles.length === 0) {
    logger.info("No locale files found");
    return "";
  }

  const relativePaths = localeFiles.map((file) =>
    relative(data.nuxt.options.buildDir, file)
  );

  const codes = localeFiles.map((file) => readCode(file, ".ts"));

  console.log(codes);

  const dynamicImports = generateDynamicImports(relativePaths);

  const computedLocales = await Promise.all(
    Object.entries(dynamicImports).map(
      async (
        locale
      ): Promise<{ code: string; dynamicImport: string; files: string }> => {
        const [code, dynamicImport] = locale;
        const localeFiles = `[${(await getLocaleFiles(code, data.options)).map(
          (localeFile) =>
            `"${relative(data.nuxt.options.buildDir, localeFile)}"`
        )}]`;

        return {
          code,
          dynamicImport,
          files: localeFiles,
        };
        //         return [
        //           localeCode,
        //           `{
        //   ...(${dynamicImport})(),
        //   files: ${localeFiles}
        // }`,
        //         ];
      }
    )
  );

  //     return [localeCode, `{
  // ${dynamicImport},
  // files: ${localeFiles}
  //     }`]
  return `
export const SourceLocales = {
  ${Object.entries(dynamicImports)
    .map(([key, value]) => `${key}: ${value}`)
    .join(",\n\t")}
}

export const Locales = [
  ${computedLocales
    .map(
      (locale) => `{
    ...(${locale.dynamicImport})(),
    files: ${locale.files}
  }`
    )
    .join(",\n\t")}
]

${codes.join("\n")}
  `;
}

function generateDynamicImports(files: string[]): Record<string, string> {
  return files.reduce((acc: { [key: string]: string }, file) => {
    acc[parse(file).name] = genDynamicImport(file);
    return acc;
  }, {});
  //   files.map((file) => genDynamicImport(file));
}

interface GeneratedLocale {
  [code: string]: string;
}

export async function computedDefinitions(
  localeDefinitions: GeneratedLocale,
  options: ModuleOptions
): Promise<GeneratedLocale> {
  const promises = Object.entries(localeDefinitions).map(
    async ([code, _def]) => {
      const files = await getLocaleFiles(code, options);
      _def.locale.files = files;
      return { def: _def, code };
    }
  );
  const updatedLocaleDefinitions = await Promise.all(promises);

  const final = updatedLocaleDefinitions.reduce((acc, _def) => {
    // @ts-ignore
    acc[_def.code] = _def.def;
    return acc;
  }, {});

  return final;
}

async function getLocaleFiles(code: string, options: ModuleOptions) {
  return getFilesInPath(
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
        value: code,
      },
    ]),
    "*.json"
  );
}
