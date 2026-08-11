// Checkbox renders a bare 16px input on its own, which is why the floor card
// read as blank. Compose it the way a form actually uses it — paired with Label.
import { Checkbox, Label } from 'storefront';

export const WithLabels = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <Checkbox id="cb-rfc" defaultChecked />
      <Label htmlFor="cb-rfc">Notify me about new RFCs</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="cb-digest" />
      <Label htmlFor="cb-digest">Send the monthly ecosystem digest</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="cb-locked" defaultChecked disabled />
      <Label htmlFor="cb-locked">Required for membership (locked)</Label>
    </div>
  </div>
);

export const States = () => (
  <div className="flex items-center gap-6">
    <div className="flex items-center gap-2">
      <Checkbox id="cb-off" />
      <Label htmlFor="cb-off">Unchecked</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="cb-on" defaultChecked />
      <Label htmlFor="cb-on">Checked</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="cb-err" variant="error" />
      <Label htmlFor="cb-err">Error</Label>
    </div>
  </div>
);
