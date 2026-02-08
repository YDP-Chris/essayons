# Router Specification

## ADDED Requirements

### Requirement: Hash-Based Route Matching

The router SHALL use the URL hash fragment to determine the current route and match it against defined route patterns. Route patterns MAY include static segments (e.g., `/about`) and dynamic parameters (e.g., `/episode/:id`).

#### Scenario: Landing page route match

- **WHEN** the URL hash is `#/` or empty
- **THEN** the router SHALL match the landing page route

#### Scenario: Episode route match with parameter

- **WHEN** the URL hash is `#/episode/orbit-lab`
- **THEN** the router SHALL match the episode route and extract `id` parameter as `"orbit-lab"`

#### Scenario: Static route match

- **WHEN** the URL hash is `#/about`
- **THEN** the router SHALL match the about page route

#### Scenario: No route match (404)

- **WHEN** the URL hash is `#/unknown-path`
- **THEN** the router SHALL detect no matching route and trigger 404 handling

### Requirement: Browser Navigation Integration

The router SHALL listen to browser `hashchange` events and update the application state when users navigate using browser back/forward buttons. The router SHALL preserve and restore scroll positions when navigating backward through history.

#### Scenario: Back button navigation

- **WHEN** user is on episode page and clicks browser back button
- **THEN** the router SHALL navigate to the previous route and restore the previous scroll position

#### Scenario: Forward button navigation

- **WHEN** user has navigated back and clicks browser forward button
- **THEN** the router SHALL navigate to the next route in history

#### Scenario: Hash change event handling

- **WHEN** the URL hash changes via browser navigation or manual URL editing
- **THEN** the router SHALL detect the change and update the current route state

### Requirement: Programmatic Navigation

The router SHALL provide a function to programmatically navigate to routes by updating the URL hash. Navigation SHALL support both string paths (e.g., `/episode/orbit-lab`) and route objects with parameters.

#### Scenario: Navigate to episode by path

- **WHEN** `navigate('/episode/orbit-lab')` is called
- **THEN** the router SHALL update the URL hash to `#/episode/orbit-lab` and trigger route matching

#### Scenario: Navigate to landing page

- **WHEN** `navigate('/')` is called
- **THEN** the router SHALL update the URL hash to `#/` and trigger route matching

#### Scenario: Navigate with scroll to top

- **WHEN** navigation occurs to a new route
- **THEN** the router SHALL scroll the window to the top (0, 0) position

### Requirement: Deep Linking Support

The router SHALL detect and match routes on initial page load, enabling deep links to specific episodes or pages. Users SHALL be able to bookmark or share URLs that directly load specific content.

#### Scenario: Load episode from deep link

- **WHEN** user loads page with URL `essayons.app/#/episode/orbit-lab`
- **THEN** the router SHALL match the episode route on mount and display the episode content immediately

#### Scenario: Load landing page from deep link

- **WHEN** user loads page with URL `essayons.app/` or `essayons.app/#/`
- **THEN** the router SHALL match the landing route and display the landing page

#### Scenario: Load invalid route from deep link

- **WHEN** user loads page with URL `essayons.app/#/invalid-path`
- **THEN** the router SHALL detect 404 and redirect to landing page with notification

### Requirement: URL State Integration

The router SHALL support combining hash-based routing with URL query parameters for shareable simulation states. Query parameters SHALL be preserved when navigating between routes and accessible to the URL state codec.

#### Scenario: Episode with query parameters

- **WHEN** user loads `/#/episode/orbit-lab?angle=45&velocity=8000`
- **THEN** the router SHALL match the episode route AND the URL state codec SHALL decode the query parameters

#### Scenario: Share button with routing

- **WHEN** user clicks share button on episode page
- **THEN** the generated URL SHALL include both the hash route and query parameters (e.g., `/#/episode/orbit-lab?angle=45`)

#### Scenario: Query parameters preserved on navigation

- **WHEN** user navigates to a new route
- **THEN** existing query parameters SHALL be cleared unless explicitly preserved

### Requirement: 404 Handling and Redirection

The router SHALL detect when no route matches the current URL hash and redirect to the landing page with a user-friendly notification. The notification SHALL inform users that the requested page was not found.

#### Scenario: Invalid episode ID redirect

- **WHEN** user navigates to `#/episode/nonexistent-episode`
- **THEN** the router SHALL redirect to `#/` and display a toast notification "Episode not found"

#### Scenario: Malformed route redirect

- **WHEN** user navigates to `#/episode` (missing episode ID parameter)
- **THEN** the router SHALL redirect to `#/` and display a notification

#### Scenario: Unknown route redirect

- **WHEN** user navigates to `#/unknown-path`
- **THEN** the router SHALL redirect to `#/` and display a notification "Page not found"

### Requirement: Route State Subscription

The router SHALL provide a React hook that allows components to subscribe to route changes and re-render when the current route updates. The hook SHALL return the current route match including path parameters.

#### Scenario: Component subscribes to route changes

- **WHEN** component calls `useRoute()` hook
- **THEN** the hook SHALL return current route match and re-render on route changes

#### Scenario: Extract route parameters

- **WHEN** component calls `useRoute()` on route `#/episode/orbit-lab`
- **THEN** the hook SHALL return match object with `params.id === "orbit-lab"`

#### Scenario: No route match in hook

- **WHEN** component calls `useRoute()` on invalid route
- **THEN** the hook SHALL return null or undefined match

### Requirement: Scroll Position Management

The router SHALL save scroll positions when navigating away from a page and restore them when navigating back via browser back button. Forward navigation SHALL scroll to top.

#### Scenario: Save scroll position on navigation

- **WHEN** user scrolls down on landing page and navigates to episode
- **THEN** the router SHALL save the landing page scroll position

#### Scenario: Restore scroll position on back navigation

- **WHEN** user navigates back from episode to landing page
- **THEN** the router SHALL restore the previously saved scroll position

#### Scenario: Scroll to top on forward navigation

- **WHEN** user navigates forward to a new page
- **THEN** the router SHALL scroll window to (0, 0)

### Requirement: Lightweight Implementation

The router implementation SHALL remain under 150 lines of code (excluding types and comments) and SHALL NOT depend on external routing libraries. The router SHALL provide only essential routing features without unnecessary abstractions.

#### Scenario: No external router dependencies

- **WHEN** router is implemented
- **THEN** package.json SHALL NOT include react-router, @reach/router, or similar libraries

#### Scenario: Minimal API surface

- **WHEN** router is used in application
- **THEN** public API SHALL include only: route definitions, navigate function, and useRoute hook
