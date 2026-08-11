// Dialog renders `null` until `open` is true and then portals a
// `fixed inset-0` overlay into document.body — so every story drives `open`
// from real state (initialised open) to photograph the real modal.
// NOTE FOR CONFIG: needs cfg.overrides.Dialog.cardMode = "single" — in the
// grid card each portalled overlay is clipped to its own 320px cell.
import { useState } from 'react';
import { Dialog, Button, Input, Label, SemanticBadge } from 'storefront';

export const RFCReview = () => {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Submit RFC for core team review"
      description="RFC-0042 · Concurrent data loading primitives"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Once submitted, the RFC enters the two-week public comment window. Reviewers from
          React Core, React Router and TanStack Query are notified automatically.
        </p>
        <div className="rounded-lg border border-border bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Reviewers assigned</span>
            <SemanticBadge variant="secondary">3 of 5</SemanticBadge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            sophie-liu · dan-mercer · aparna-rao
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm">Save draft</Button>
          <Button variant="primary" size="sm">Submit RFC</Button>
        </div>
      </div>
    </Dialog>
  );
};

export const DropWaitlist = () => {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Join the Maintainers Drop waitlist"
      description="Limited to 500 units. Contributors get first access."
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="dlg-email">Email address</Label>
          <Input id="dlg-email" type="email" defaultValue="maintainer@reactfoundation.org" />
        </div>
        <p className="text-sm text-muted-foreground">
          We only email once, when the drop opens. Your contribution tier is read from your
          linked GitHub account.
        </p>
        <Button variant="primary" size="md" className="w-full">Notify me</Button>
      </div>
    </Dialog>
  );
};

export const BodyOnly = () => {
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-foreground">
          Revoking the token ends every active session for{' '}
          <span className="font-medium">redux-toolkit-bot</span>. Scheduled RIS ingests will
          fail until a new token is issued.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm">Keep token</Button>
          <Button variant="primary" size="sm">Revoke</Button>
        </div>
      </div>
    </Dialog>
  );
};
