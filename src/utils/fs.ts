import { resolvePath, resolveFiles } from "@nuxt/kit";
import { PATH_LOCALE_DEFINITION_PATH_MATCHER } from "../constants";
import type { ModuleOptions } from "../types";
import { readFileSync as _readFileSync } from "node:fs";
import { transform as stripType } from "sucrase";
import { parse as ParseCode } from "@babel/parser";

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

export type FileContent<T> = { content: T; path: string };

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



// const code = readCode(_file, ".ts");
// const parsed = ParseCode(code, {
//   allowImportExportEverywhere: true,
//   sourceType: "module",
// });

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

export function readCode(absolutePath: string, ext: string) {
  let code = readFileSync(absolutePath);
  if ([".ts"].includes(ext)) {
    // @ts-ignore
    const out = stripType(code, {
      transforms: ["typescript", "jsx"],
      keepUnusedImports: true,
    });
    // @ts-ignore
    code = out.code;
  }
  return code;
}
export function readFileSync(path: string) {
  return _readFileSync(path, { encoding: "utf-8" });
}
