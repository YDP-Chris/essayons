## ADDED Requirements

### Requirement: URL State Encoding

The system SHALL serialize simulation parameters into URL query parameters so that a complete simulation state can be represented as a shareable URL. Parameter keys MUST be human-readable where possible, using short aliases (e.g., `a` for angle, `v` for velocity). The system SHALL use standard URL query string format (e.g., `?a=45&v=7800&mission=hohmann`).

#### Scenario: Encode simulation parameters to URL

- **WHEN** the user has configured simulation parameters (e.g., angle=45, velocity=7800, mission=hohmann)
- **THEN** the system produces a URL containing those parameters as query string values (e.g., `essayons.app/orbit-lab?a=45&v=7800&mission=hohmann`)

#### Scenario: Encode only non-default parameters

- **WHEN** some simulation parameters are at their default values
- **THEN** the system omits default-valued parameters from the URL to keep it short

#### Scenario: Round-trip fidelity

- **WHEN** a simulation state is encoded to a URL and then decoded
- **THEN** the decoded state MUST be identical to the original state

### Requirement: URL State Decoding

The system SHALL parse URL query parameters on page load and restore the simulation to the state they describe. Decoding MUST convert string parameter values to their correct types (number, boolean, enum) based on the episode's parameter schema.

#### Scenario: Restore simulation from URL parameters

- **WHEN** a user navigates to a URL containing simulation parameters (e.g., `?a=45&v=7800&mission=hohmann`)
- **THEN** the simulation loads with angle=45, velocity=7800, and mission=hohmann applied

#### Scenario: Load without URL parameters

- **WHEN** a user navigates to an episode URL with no query parameters
- **THEN** the simulation loads with all default parameter values

### Requirement: Share UI

The system SHALL provide a share button that generates a URL encoding the current simulation state and copies it to the user's clipboard. The system SHALL integrate with the native Web Share API on supported platforms and MUST fall back to clipboard copy when the Web Share API is unavailable.

#### Scenario: Copy shareable link to clipboard

- **WHEN** the user clicks the share/copy button
- **THEN** the current simulation state is encoded as a URL, copied to the clipboard, and the user sees visual confirmation (e.g., button text changes to "Copied!")

#### Scenario: Native share on supported device

- **WHEN** the user activates the share button on a device that supports the Web Share API
- **THEN** the system invokes the native share dialog with the generated URL

#### Scenario: Fallback on unsupported device

- **WHEN** the user activates the share button on a device that does not support the Web Share API
- **THEN** the system copies the URL to the clipboard and shows visual confirmation

#### Scenario: Share button accessibility

- **WHEN** a keyboard user navigates to the share button
- **THEN** the button MUST be focusable, activatable via Enter or Space, and have an accessible label describing its purpose

### Requirement: Parameter Validation

The system SHALL validate all URL parameters against the episode's parameter schema on decode. Invalid, missing, or out-of-range values MUST fall back to the episode's default values. Unknown parameters MUST be silently ignored. The system MUST NOT display error messages to end users for invalid URL parameters.

#### Scenario: Invalid parameter value

- **WHEN** a URL contains a parameter with a value outside its allowed range (e.g., `?a=999` where angle range is 0-360)
- **THEN** the system uses the default value for that parameter and loads normally

#### Scenario: Missing required parameter

- **WHEN** a URL contains some but not all parameters
- **THEN** missing parameters use their default values and the simulation loads with a combination of URL-provided and default values

#### Scenario: Wrong parameter type

- **WHEN** a URL contains a numeric parameter with a non-numeric value (e.g., `?v=abc`)
- **THEN** the system uses the default value for that parameter

#### Scenario: Unknown parameters ignored

- **WHEN** a URL contains parameters not defined in the episode's schema (e.g., `?foo=bar`)
- **THEN** the system silently ignores the unknown parameters and loads normally

#### Scenario: Developer console warnings

- **WHEN** invalid parameter values are encountered during decoding
- **THEN** the system logs a warning to the browser console identifying the invalid parameter and the default value used

### Requirement: URL Length Management

The system SHALL keep generated URLs reasonably short to remain shareable across messaging platforms. When a URL would exceed 2000 characters in length, the system MUST compress the parameters into a compact encoding (e.g., Base64-encoded JSON in a single query parameter). The system SHALL prefer human-readable query parameters when the URL is short enough.

#### Scenario: Short URL uses readable parameters

- **WHEN** the encoded URL with human-readable query parameters is under 2000 characters
- **THEN** the system uses standard query string format with readable parameter names

#### Scenario: Long URL triggers compression

- **WHEN** the encoded URL with human-readable query parameters would exceed 2000 characters
- **THEN** the system compresses the parameters into a compact single-parameter encoding

#### Scenario: Compressed URL decodes correctly

- **WHEN** a user navigates to a URL with compressed parameters
- **THEN** the system detects the compressed format, decompresses, and restores the full simulation state

### Requirement: Cross-Episode Support

The system SHALL provide a generic parameter encoding mechanism that works across all episodes. Each episode MUST declare its shareable parameters via a parameter schema that specifies parameter name, type, default value, allowed range, and URL alias. The encoding and decoding logic MUST NOT contain episode-specific code.

#### Scenario: Episode registers parameters

- **WHEN** a new episode is added to the platform
- **THEN** the episode declares its shareable parameters via a schema, and URL state encoding/decoding works automatically without modifying the shared codec

#### Scenario: Different episodes use same codec

- **WHEN** two different episodes (e.g., Orbit Lab and a future episode) each define their parameter schemas
- **THEN** both episodes use the same `encodeState` and `decodeState` functions with their respective schemas

#### Scenario: Episode-specific URL routing

- **WHEN** a user navigates to an episode URL with parameters (e.g., `/orbit-lab?a=45`)
- **THEN** the system uses the parameter schema registered for that specific episode to decode and validate the parameters
