// SemanticInput owns its own label/helper/error slots. Rendered bare with no props
// it is an empty full-width box, which is why the floor card looked blank.
import { SemanticInput } from 'storefront';

export const Variants = () => (
  <div className="flex w-full max-w-md flex-col gap-5">
    <SemanticInput
      label="Library name"
      placeholder="tanstack-query"
      defaultValue="tanstack-query"
      helperText="Used as the package handle on the impact dashboard."
    />
    <SemanticInput
      variant="error"
      label="Maintainer GitHub handle"
      defaultValue="tannerlinsley!"
      errorText="Handles may only contain letters, numbers and hyphens."
    />
    <SemanticInput
      variant="success"
      label="Sponsorship email"
      defaultValue="sponsors@reactfoundation.org"
      helperText="Verified — invoices will be sent here."
    />
  </div>
);

export const States = () => (
  <div className="flex w-full max-w-md flex-col gap-5">
    <SemanticInput label="Repository URL" placeholder="https://github.com/remix-run/react-router" />
    <SemanticInput
      label="Annual pledge (USD)"
      type="number"
      defaultValue={25000}
      helperText="Minimum for a Gold sponsorship tier."
    />
    <SemanticInput label="Foundation member ID" defaultValue="RF-2024-0117" disabled helperText="Assigned at onboarding." />
  </div>
);
