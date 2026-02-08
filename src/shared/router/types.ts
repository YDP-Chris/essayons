export interface RouteMatch {
  route: 'landing' | 'episode' | 'teach' | 'not-found'
  params: Record<string, string>
}
