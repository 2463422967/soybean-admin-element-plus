interface AuthorizedHomeRedirectOptions {
  authorizedHome: string;
  configuredHome: string;
  configuredHomePath?: string;
  currentPath: string;
}

export function resolveAuthorizedHomeRedirect(options: AuthorizedHomeRedirectOptions) {
  const { authorizedHome, configuredHome, configuredHomePath, currentPath } = options;

  if (!configuredHomePath || !authorizedHome || authorizedHome === configuredHome) {
    return null;
  }

  return currentPath === configuredHomePath ? authorizedHome : null;
}
