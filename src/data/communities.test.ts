import { describe, expect, it } from 'vitest';

import { REACT_COMMUNITIES } from './communities';

describe('REACT_COMMUNITIES', () => {
  it('includes the approved React Michigan community entry', () => {
    expect(REACT_COMMUNITIES).toContainEqual(
      expect.objectContaining({
        id: 'react-michigan',
        name: 'React Michigan',
        slug: 'react-michigan',
        city: 'Grand Rapids',
        region: 'Michigan',
        country: 'United States',
        timezone: 'America/Detroit',
        verified: true,
        verification_status: 'verified',
      })
    );
  });

  it('includes the approved React Prague community entry', () => {
    expect(REACT_COMMUNITIES).toContainEqual(
      expect.objectContaining({
        id: "community-c6a17e06-3b4e-413c-896e-08abe8ddeec6",
        name: "React Prague",
        slug: "react-prague",
        city: "Prague",
        country: "Czech Republic",
        timezone: "Europe/Prague",
        coordinates: {
          lat: 50.0949821,
          lng: 14.4516622
        },
        verified: true,
        verification_status: 'verified',
      })
    );
  });
});
