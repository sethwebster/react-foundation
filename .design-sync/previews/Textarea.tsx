// Textarea is min-h-[80px] and full width. Empty and unlabelled it reads as a
// blank rectangle, so every story pairs it with a Label and real prose.
import { Label, Textarea } from 'storefront';

export const RfcAbstract = () => (
  <div className="flex flex-col gap-2 max-w-md">
    <Label htmlFor="ta-abstract" required>
      RFC abstract
    </Label>
    <Textarea
      id="ta-abstract"
      name="abstract"
      rows={4}
      defaultValue={
        'This RFC proposes a first-class API for coordinating View Transitions with Suspense boundaries, so that streamed content can animate in without tearing the layout.'
      }
    />
    <p className="text-xs text-muted-foreground">
      Two or three sentences. Reviewers read this before the full proposal.
    </p>
  </div>
);

export const Variants = () => (
  <div className="flex flex-col gap-4 max-w-md">
    <div className="flex flex-col gap-2">
      <Label htmlFor="ta-default">Maintainer bio</Label>
      <Textarea
        id="ta-default"
        variant="default"
        rows={3}
        defaultValue="Co-maintainer of TanStack Query. Focused on caching primitives and docs."
      />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="ta-error" required>
        Grant justification
      </Label>
      <Textarea id="ta-error" variant="error" rows={3} defaultValue="Need funds." />
      <p className="text-xs text-destructive">
        Too short — describe the work and the expected ecosystem impact.
      </p>
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="ta-success">Release notes</Label>
      <Textarea
        id="ta-success"
        variant="success"
        rows={3}
        defaultValue={
          'v6.2.0 — adds partial hydration for route modules, drops the legacy CJS build, and fixes a leak in the scroll restoration cache.'
        }
      />
      <p className="text-xs text-success">Ready to publish to the changelog.</p>
    </div>
  </div>
);

export const PlaceholderAndDisabled = () => (
  <div className="flex flex-col gap-4 max-w-md">
    <div className="flex flex-col gap-2">
      <Label htmlFor="ta-placeholder">Empty with placeholder</Label>
      <Textarea
        id="ta-placeholder"
        rows={3}
        placeholder="What problem does this library solve for React developers?"
      />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="ta-disabled">Disabled after review closed</Label>
      <Textarea
        id="ta-disabled"
        rows={3}
        disabled
        defaultValue="Review window for the Q3 grant cycle has closed."
      />
    </div>
  </div>
);
