import {
  PATH_LOCALE_DEFINITION_PATH_MATCHER,
  PATH_LOCALE_MATCHER,
  PATH_LOCALES_PATH_MATCHER,
} from "./constants";
import type { ModuleOptions } from "./types";
import {
  getDefaultContentsOfFiles,
  getFilesInPath,
  pathFiller,
} from "./utils/fs";

export async function loadLocales(options: ModuleOptions) {
  const localeFiles = await getFilesInPath(
    pathFiller(options.expressions.localeDefinition, {
      exp: PATH_LOCALE_DEFINITION_PATH_MATCHER,
      value: options.paths.localeDefinitionsPath,
    })
  );

  if (localeFiles.length === 0) {
    return null;
  }

  const localeDefinitions = await getDefaultContentsOfFiles(localeFiles);

  const computedLocales = await computedDefinitions(localeDefinitions, options);

  return computedLocales;
}

async function computedDefinitions(
  localeDefinitions: any,
  options: ModuleOptions
) {
  await localeDefinitions.forEach(async (_def: any) => {
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
          value: _def.code,
        },
      ])
    );

    _def.files = files;
  });
  return localeDefinitions;
}
