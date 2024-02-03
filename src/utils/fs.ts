import { resolvePath, resolveFiles } from "@nuxt/kit";
import { PATH_LOCALE_DEFINITION_PATH_MATCHER } from "../constants";
import type { ModuleOptions } from "../types";

/**
 *
 * @param path Relative to user project root
 * @returns Array of paths for files in @param path
 */
export async function getFilesInPath(
  path: string,
  pattern: string
): Promise<string[]> {
  const localeFiles = await resolveFiles(
    // Path relative to user project root.
    await resolvePath(path),
    pattern
  );
  return localeFiles;
}

type FileContent<T> = { content: T; path: string };

/**
 * Reads all the files given and returns their default exports
 * @param files Array of paths to files
 * @returns
 */
export async function getDefaultContentsOfFiles<T>(
  files: string[],
  withPath: true
): Promise<FileContent<T>[]>;
export async function getDefaultContentsOfFiles<T>(
  files: string[],
  withPath: false
): Promise<T[]>;
export async function getDefaultContentsOfFiles<T>(
  files: string[]
): Promise<T[]>;
export async function getDefaultContentsOfFiles<T>(
  files: string[],
  withPath?: boolean
): Promise<(FileContent<T> | T)[]> {
  const contents = await Promise.all(
    files.map(async (_file) => {
      const { default: content } = await import(_file);
      return withPath ? { content, path: _file } : content;
    })
  );
  return contents;
}

interface IPathMatcher {
  exp: RegExp;
  value: string;
}

export function pathFiller(
  path: string,
  matcher: Array<IPathMatcher> | IPathMatcher
): string {
  const matchers: Array<IPathMatcher> = Array.isArray(matcher)
    ? matcher
    : [matcher];

  matchers.forEach((matcher: IPathMatcher) => {
    path = path.replace(matcher.exp, matcher.value);
  });

  return path;
}

export function getLocaleDefinitionsPath(options: ModuleOptions): string {
  return pathFiller(options.expressions.localeDefinition, {
    exp: PATH_LOCALE_DEFINITION_PATH_MATCHER,
    value: options.paths.localeDefinitionsPath,
  });
}
