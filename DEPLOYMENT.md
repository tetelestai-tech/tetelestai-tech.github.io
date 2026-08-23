# First deployment plan — GitHub Pages + Hostinger DNS

## Recommendation

The GitHub organization `tetelestai-tech` and the public repository `tetelestai-tech/tetelestai-tech.github.io` have already been created.

Carlos's existing personal account, `carloshsrosa`, currently administers the organization. Invite Gabriela through her own personal GitHub account and promote her to owner once her exact account is confirmed, keeping at least two organization owners for continuity.

- Organization: `tetelestai-tech` (created)
- Repository: `tetelestai-tech.github.io` (public, created)

GitHub describes organizations as shared containers for business work and recommends maintaining ownership continuity. Do not share one person's credentials.

Official references:

- [About GitHub organizations](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations)
- [Create an organization](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/creating-a-new-organization-from-scratch)
- [Maintain organization ownership continuity](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/maintaining-ownership-continuity-for-your-organization)

## Why this deployment fits the first release

- The site is static and has no backend, database or secrets.
- GitHub Actions can build Vite and publish `dist/client` through the manual deployment workflow.
- Hostinger can remain the domain/DNS provider; its site builder is not required.
- A future form, scheduler or CMS can be added later without changing the brand foundation.

## Gate 0 — confirm before publishing

- WhatsApp contact and its use as the interim privacy channel are confirmed for `https://wa.me/5561998821206`.
- GitHub Pages is the confirmed hosting provider; the privacy notice identifies GitHub, Inc. and its visitor IP logging for security.
- Review the PT and EN copy one final time.

## Step 1 — leave Hostinger onboarding safely

In Hostinger onboarding, choose `Pular` because GitHub Pages is the confirmed hosting plan. Do not start Hostinger's site builder, and do not configure e-mail until the desired mailboxes are known.

Skipping this screen does not cancel the registered domain; it only avoids choosing an unnecessary builder at this stage.

## Step 2 — confirm organization access and repository settings

1. Confirm access to the existing `tetelestai-tech` organization.
2. Confirm that `tetelestai-tech/tetelestai-tech.github.io` remains public and empty before the first source push.
3. When Gabriela's exact GitHub account is confirmed, invite her and promote her to owner after she accepts.
4. Keep at least two organization owners for continuity.

## Step 3 — publish the verified source to GitHub

Before staging, validate the current source:

```bash
npm run build
npm run test:sites
```

Stop if either command fails.

The local Git repository already exists on `main`. Stage the 23 reviewed paths explicitly, using this exact allowlist:

```bash
git add -- \
  .github/workflows/deploy-pages.yml \
  .gitignore \
  .npmrc \
  .openai/hosting.json \
  AGENTS.md \
  DEPLOYMENT.md \
  README.md \
  design-qa.md \
  design/reference-approved.png \
  index.html \
  package-lock.json \
  package.json \
  public/assets/circuit-network.png \
  public/assets/tetelestai-symbol.png \
  public/robots.txt \
  public/sitemap.xml \
  scripts/prepare-sites-build.mjs \
  src/App.jsx \
  src/main.jsx \
  src/styles.css \
  tests/sites-worker.test.mjs \
  vite.config.mjs \
  worker/index.js

git status --short
git diff --cached --stat
git diff --cached
git commit -m "feat: launch Tetelestai website"
git remote add origin git@github.com:tetelestai-tech/tetelestai-tech.github.io.git
git push -u origin main
```

Never replace the explicit allowlist with `git add .`, `git add -A`, or `git add --all`. Review all three pre-commit outputs before creating the commit.

The repository already contains `.github/workflows/deploy-pages.yml`. Its only trigger is the manual `workflow_dispatch`; pushing to `main` does not deploy the site automatically.

## Step 4 — enable GitHub Pages

1. Open **Settings** → **Pages** and set **Source: GitHub Actions**.
2. Open **Actions** → **Deploy Tetelestai to GitHub Pages** → **Run workflow** → **main** → **Run workflow**.
3. Confirm that the manually started workflow completes successfully.
4. Inspect the temporary `github.io` URL before connecting the domain.

Official references:

- [Vite static deployment guide](https://vite.dev/guide/static-deploy)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## Step 5 — verify ownership of `tetelestai.tech`

GitHub recommends verifying the domain before adding DNS records for the live site.

1. In the GitHub organization, open **Settings** → **Pages** → **Add a domain**.
2. Enter `tetelestai.tech`.
3. GitHub will provide a TXT record containing the organization-specific verification token.
4. In Hostinger hPanel, open **Domains** → **DNS**, select `tetelestai.tech`, and add that TXT record exactly as GitHub shows it.
5. Wait for verification and click **Verify** in GitHub.
6. Keep the TXT record after verification.

Official references:

- [Verify a GitHub Pages custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Manage DNS records at Hostinger](https://www.hostinger.com/support/1583249-how-to-manage-dns-records-at-hostinger/)

## Step 6 — register the custom domain in the repository

Before changing the live DNS records:

1. Open repository **Settings** → **Pages**.
2. Under **Custom domain**, enter `tetelestai.tech` and save it.

GitHub specifically recommends registering the custom domain in Pages before pointing DNS to GitHub, reducing domain-takeover risk.

## Step 7 — back up and edit Hostinger DNS

Before editing records, export the current zone from Hostinger's DNS page. Do not delete MX, SPF, DKIM, DMARC or other e-mail records.

For the apex domain, create these four `A` records:

| Type | Name | Content |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

For `www`, create:

| Type | Name | Content |
| --- | --- | --- |
| CNAME | `www` | `tetelestai-tech.github.io` |

Important:

- Point `www` directly to `tetelestai-tech.github.io`; do not append a repository path.
- Remove only conflicting `@` A/AAAA/ALIAS records and a conflicting `www` CNAME after reviewing the backup.
- Do not create a wildcard `*` record.
- DNS changes can take up to 24 hours to propagate.

Recheck these values immediately before deployment in GitHub's official guide:

- [Manage a GitHub Pages custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## Step 8 — verify DNS and HTTPS

Use one of these checks:

```bash
dig tetelestai.tech +short A
dig www.tetelestai.tech +short CNAME
```

Expected results are the four GitHub Pages IPv4 addresses and `tetelestai-tech.github.io` for `www`.

When GitHub's DNS check succeeds, enable **Enforce HTTPS** under repository **Settings** → **Pages**. Certificate availability can lag behind DNS changes.

## Step 9 — first-release acceptance check

- `https://tetelestai.tech/` loads over HTTPS.
- `https://www.tetelestai.tech/` redirects correctly.
- PT and EN pages load with correct titles and language.
- The cross/T logo and local fonts load.
- The hero has no CTA; contact remains available through the WhatsApp button in the `#contact` section.
- The contact button opens `https://wa.me/5561998821206` and the telephone number is not displayed in the contact card or footer.
- Unknown URLs return 404 rather than the homepage.
- No analytics, form or non-essential cookies appear unexpectedly.

## Rollback

If the domain stops resolving correctly, restore the exported DNS zone or use Hostinger's **DNS history** restore function. Keep the GitHub repository intact; reverting DNS is independent from reverting source code.
