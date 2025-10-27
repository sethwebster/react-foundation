# 🧭 Eligibility for React Impact Score (RIS) Funding

The React Foundation exists to strengthen the React ecosystem in the places that need it most — ensuring that open source libraries, tools, and maintainers who make React possible have the support to continue their work.

## Guiding Principle

**RIS funding is designed to help sustain independent, community-maintained, and under-resourced projects** that are critical to the health and innovation of the React ecosystem.

**It is not intended to subsidize projects that already benefit from significant, ongoing corporate investment.**

---

## Eligibility Overview

The React Foundation exists to strengthen the React ecosystem in the places that need it most — ensuring that open source libraries, tools, and maintainers who make React possible have the support to continue their work.

| Category | Description | Funding Eligibility |
|----------|-------------|---------------------|
| **Community-maintained libraries** | Independent maintainers or small teams sustaining libraries widely used in the React ecosystem. | ✅ **Fully eligible** |
| **Collaborative or partially-sponsored projects** | Independent projects with limited or non-exclusive corporate support (e.g. shared maintainership, open governance). | 🟡 **Eligible with adjusted weighting** |
| **Corporate-maintained frameworks or products** | Projects primarily funded and maintained by large commercial entities with substantial engineering resources. Examples include Next.js (Vercel), Remix (Shopify), and Expo (Expo.dev). | ❌ **Ineligible for direct grants** |

---

## Why Certain Libraries Are Ineligible

To keep RIS funding equitable and impactful, we focus our resources on projects that **depend on community support to remain viable**.

Corporate-backed frameworks already benefit from:
- Dedicated full-time engineering teams
- Marketing budgets and promotional resources
- Internal funding that ensures long-term sustainability
- Enterprise support contracts and consulting revenue

### This approach allows the Foundation to:

- **Strengthen the open source commons** around React
- **Support independent innovation** that might not otherwise have resources
- **Ensure that funding decisions reflect genuine need** and ecosystem impact

---

## Strategic Collaboration Program

Corporate-maintained projects remain **essential partners** in the React ecosystem.

While they are not eligible for direct RIS-based grants, they may participate through the **Strategic Collaboration Program**, which focuses on:

- **Ecosystem alignment and standards** — Coordinating on best practices and interoperability
- **Interoperability initiatives** — Ensuring libraries work well together
- **Shared infrastructure and community events** — Conferences, documentation, and tooling

This ensures continued collaboration without diverting limited grant resources away from independent maintainers.

---

## Transparency and Review

**Eligibility decisions are reviewed annually** as part of the Foundation's open governance process.

If your project's structure or sponsorship model changes, you may **request a reevaluation** of your eligibility status by contacting the Foundation.

### How to Request Reevaluation

1. **Email the Foundation** at [eligibility@react.foundation](mailto:eligibility@react.foundation) (when available)
2. **Provide updated information** about your project's governance, funding, and maintainership structure
3. **The Foundation will review** your request within 30 days
4. **Decisions and rationale** will be shared transparently

---

## Examples

### ✅ Fully Eligible Projects

- **React Hook Form** — Maintained by small independent team
- **Zustand** — Community-maintained state management library
- **React Spring** — Independent animation library with volunteer maintainers
- **React Query / TanStack Query** — Independent with optional sponsorship but no exclusive corporate control

### 🟡 Eligible with Adjusted Weighting

- **React Router** — Partially sponsored by Remix/Shopify but maintains independent governance
- **Formik** — Has corporate sponsors but no exclusive control
- Projects with **GitHub Sponsors** or **Open Collective** funding but no dedicated engineering team

### ❌ Ineligible for Direct Grants

- **Next.js** — Maintained by Vercel with full-time dedicated engineering team
- **Remix** — Maintained by Shopify with full-time dedicated engineering team
- **Expo** — Maintained by Expo.dev with full-time dedicated engineering team
- **Gatsby** — Maintained by Netlify with full-time dedicated engineering team

Note: These projects are incredibly valuable to the ecosystem and remain welcome participants in the Strategic Collaboration Program.

---

## Adjusted Weighting for Partially-Sponsored Projects

For projects in the 🟡 **"Eligible with adjusted weighting"** category, we apply a sponsorship adjustment factor to ensure fair distribution:

### Weighting Calculation

```typescript
// Sponsorship level determines adjustment
const sponsorshipAdjustment = {
  none: 1.0,           // No corporate sponsorship
  minimal: 0.9,        // <$50k/year or volunteer-only
  moderate: 0.7,       // $50k-$200k/year or part-time support
  substantial: 0.4,    // $200k-$500k/year or 1-2 FTE
  exclusive: 0.0,      // $500k+/year or 3+ dedicated FTE (ineligible)
};

adjustedScore = rawRISScore * sponsorshipAdjustment;
```

This ensures that:
- Projects with **no sponsorship** receive **full funding** based on impact
- Projects with **some support** receive **proportional funding** that complements (not replaces) existing resources
- Projects with **exclusive corporate backing** are **ineligible** for direct grants

---

## Frequently Asked Questions

### Q: What if my project receives a one-time corporate donation?

**A:** One-time donations or grants do not affect eligibility. We look at **ongoing, structural support** (dedicated engineering time, sustained funding commitments).

### Q: What if our maintainers are employed by a company but work on the project in their spare time?

**A:** This is fine! Many open source maintainers have day jobs. Eligibility is based on whether the **project itself** receives dedicated corporate engineering resources, not individual employment status.

### Q: What if we have a corporate sponsor but they don't control the project?

**A:** This is the **🟡 partially-sponsored category**. You're eligible with adjusted weighting based on the level of support. Open governance and independence matter.

### Q: Can corporate projects become eligible if they change their structure?

**A:** Yes! If a corporate-backed project transitions to **independent governance** and **community maintenance**, it can become eligible. Contact us to request a reevaluation.

### Q: How do you verify corporate relationships?

**A:** We review:
- Public GitHub organization affiliations
- Company websites and blog posts
- Job postings and team pages
- Financial disclosures (Open Collective, GitHub Sponsors)
- Direct communication with maintainers when unclear

We prioritize **transparency** and will always discuss findings with maintainers before making final decisions.

---

## Governance and Updates

This eligibility policy is:
- **Reviewed annually** by the Foundation board
- **Open to community feedback** via GitHub issues and discussion forums
- **Updated transparently** with changelog and rationale for any changes

**Last Updated:** 2025-01-27
**Next Review:** 2026-01-27

---

## Contact

Questions about eligibility?
- **GitHub Discussions:** [react-foundation/discussions](https://github.com/react-foundation/discussions)
- **Email:** eligibility@react.foundation (coming soon)
- **Public Transparency Log:** All eligibility decisions will be logged publicly (anonymized where appropriate)

The React Foundation is committed to **fair, transparent, and community-driven** funding decisions that strengthen the entire React ecosystem.
