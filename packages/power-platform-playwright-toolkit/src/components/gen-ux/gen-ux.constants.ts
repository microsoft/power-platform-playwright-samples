/**
 * GenUX constants — test data and field detection patterns for generated Power Apps
 */
export const GenUxConstants = {
  /** Regex patterns for detecting common form field names in generated apps */
  FIELD_PATTERNS: {
    FIRSTNAME: /first.*name|firstName/i,
    LASTNAME: /last.*name|lastName/i,
    EMAIL: /email/i,
    PHONE: /phone|tel/i,
    ADDRESS: /address|street/i,
  },

  /** Standard valid test data for form filling */
  VALID_FORM_DATA: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  },

  /** Edge case data: unicode, apostrophes, plus-addressing */
  EDGE_CASE_DATA: {
    firstName: 'José María',
    lastName: "O'Connor-Smith",
    email: 'test.email+tag@example.co.uk',
  },
} as const;
