// Radio is a bare 16px native input (no appearance-none), so on its own the
// card reads as blank. Compose it as a real radio group: shared `name`, one
// checked option, each control bound to its Label.
import { Label, Radio } from 'storefront';

export const TierGroup = () => (
  <fieldset className="flex flex-col gap-3">
    <legend className="text-sm font-medium text-foreground mb-2">
      Sponsorship tier
    </legend>
    <div className="flex items-center gap-2">
      <Radio id="rd-founding" name="tier" value="founding" />
      <Label htmlFor="rd-founding">Founding Member — $250,000/yr</Label>
    </div>
    <div className="flex items-center gap-2">
      <Radio id="rd-gold" name="tier" value="gold" defaultChecked />
      <Label htmlFor="rd-gold">Gold — $25,000/yr</Label>
    </div>
    <div className="flex items-center gap-2">
      <Radio id="rd-silver" name="tier" value="silver" />
      <Label htmlFor="rd-silver">Silver — $10,000/yr</Label>
    </div>
    <div className="flex items-center gap-2">
      <Radio id="rd-inkind" name="tier" value="inkind" disabled />
      <Label htmlFor="rd-inkind">In-kind only (contact us)</Label>
    </div>
  </fieldset>
);

export const Variants = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">
        RFC stage — default
      </span>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Radio id="rd-v-draft" name="stage" defaultChecked />
          <Label htmlFor="rd-v-draft">Draft</Label>
        </div>
        <div className="flex items-center gap-2">
          <Radio id="rd-v-review" name="stage" />
          <Label htmlFor="rd-v-review">In review</Label>
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">
        RFC stage — error
      </span>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Radio id="rd-v-err-a" name="stage-err" variant="error" />
          <Label htmlFor="rd-v-err-a">Draft</Label>
        </div>
        <div className="flex items-center gap-2">
          <Radio id="rd-v-err-b" name="stage-err" variant="error" />
          <Label htmlFor="rd-v-err-b">In review</Label>
        </div>
      </div>
      <p className="text-xs text-destructive">
        Choose a stage. Note: the native radio glyph ignores border colour, so
        `variant=&quot;error&quot;` only tints the focus ring — pair it with a message.
      </p>
    </div>
  </div>
);

export const States = () => (
  <div className="flex items-center gap-6">
    <div className="flex items-center gap-2">
      <Radio id="rd-s-off" name="states" />
      <Label htmlFor="rd-s-off">Unselected</Label>
    </div>
    <div className="flex items-center gap-2">
      <Radio id="rd-s-on" name="states" defaultChecked />
      <Label htmlFor="rd-s-on">Selected</Label>
    </div>
    <div className="flex items-center gap-2">
      <Radio id="rd-s-dis" name="states-b" disabled />
      <Label htmlFor="rd-s-dis">Disabled</Label>
    </div>
    <div className="flex items-center gap-2">
      <Radio id="rd-s-dis-on" name="states-c" defaultChecked disabled />
      <Label htmlFor="rd-s-dis-on">Disabled + selected</Label>
    </div>
  </div>
);
