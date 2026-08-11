// Switch IS custom-styled (sr-only input + track/thumb divs), but its track
// colour and thumb offset are driven by the CONTROLLED `checked` prop only —
// `defaultChecked` renders in the off position. So stories pass checked +
// readOnly to pin each visual state.
import { Label, Switch } from 'storefront';

export const NotificationSettings = () => (
  <div className="flex flex-col gap-4 max-w-sm">
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="sw-rfc">New RFCs</Label>
        <span className="text-xs text-muted-foreground">
          Email me when an RFC opens for review.
        </span>
      </div>
      <Switch id="sw-rfc" name="notifyRfc" checked readOnly />
    </div>
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="sw-digest">Monthly ecosystem digest</Label>
        <span className="text-xs text-muted-foreground">
          Funding, releases, and maintainer news.
        </span>
      </div>
      <Switch id="sw-digest" name="notifyDigest" checked={false} readOnly />
    </div>
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="sw-drops">Limited drop alerts</Label>
        <span className="text-xs text-muted-foreground">
          Store releases for contributors.
        </span>
      </div>
      <Switch id="sw-drops" name="notifyDrops" checked readOnly />
    </div>
  </div>
);

export const OnAndOff = () => (
  <div className="flex items-center gap-8">
    <div className="flex items-center gap-2">
      <Switch id="sw-off" checked={false} readOnly />
      <Label htmlFor="sw-off">Off</Label>
    </div>
    <div className="flex items-center gap-2">
      <Switch id="sw-on" checked readOnly />
      <Label htmlFor="sw-on">On</Label>
    </div>
  </div>
);

export const StatesAndVariant = () => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-2">
        <Switch id="sw-s-dis-off" checked={false} disabled readOnly />
        <Label htmlFor="sw-s-dis-off">Disabled, off</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="sw-s-dis-on" checked disabled readOnly />
        <Label htmlFor="sw-s-dis-on">Disabled, on</Label>
      </div>
    </div>
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-2">
        <Switch id="sw-s-err" variant="error" checked={false} readOnly />
        <Label htmlFor="sw-s-err">variant=&quot;error&quot;</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="sw-s-def" variant="default" checked readOnly />
        <Label htmlFor="sw-s-def">variant=&quot;default&quot;</Label>
      </div>
    </div>
    <p className="text-xs text-muted-foreground max-w-md">
      Known limits: `disabled` sits on the hidden input, and the track&apos;s
      `disabled:opacity-50` never fires, so a disabled Switch looks identical to
      an enabled one. `variant=&quot;error&quot;` only recolours the focus ring —
      pair it with a message for a visible error state.
    </p>
  </div>
);
