import { resolvePath, resolveFiles } from "@nuxt/kit";

/**
 *
 * @param path Relative to user project root
 * @returns Array of paths for files in @param path
 */
export async function getFilesInPath(path: string, pattern: string) {
  const localeFiles = await resolveFiles(
    // Path relative to user project root.
    await resolvePath(path),
    pattern
  );
  return localeFiles;
}

export async function getDefaultContentsOfFiles(files: string[]) {
  const contents = await Promise.all(
    files.map(async (_file) => {
      const { default: content } = await import(_file);
      return content;
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
) {
  const matchers: Array<IPathMatcher> = Array.isArray(matcher)
    ? matcher
    : [matcher];

  matchers.forEach((matcher: IPathMatcher) => {
    path = path.replace(matcher.exp, matcher.value);
  });

  return path;
}
