interface Navigation {
  readonly canGoBack: boolean
  readonly canGoForward: boolean
}

interface Window {
  readonly navigation?: Navigation
}
