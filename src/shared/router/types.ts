export interface RouteMatch {
  route: 'landing' | 'episode' | 'not-found'
  params: Record<string, string>
}
