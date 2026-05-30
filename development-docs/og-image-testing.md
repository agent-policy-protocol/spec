# OG Image Testing Guide

## Direct OG Image Preview URLs

### Local Development (http://localhost:3000)

#### Docs Example

```
http://localhost:3000/api/og?title=Getting%20Started&type=docs&section=Docs%20/%20Quick%20Start
```

#### Blog Example

```
http://localhost:3000/api/og?title=Introducing%20Agent%20Policy%20Protocol&type=blog&author=Arun%20Vijayarengan&date=February%2016,%202026
```

#### Playground

```
http://localhost:3000/api/og?title=Build%20Your%20AI%20Agent%20Policy&type=playground
```

#### Default/Homepage

```
http://localhost:3000/api/og?title=Agent%20Policy%20Protocol
```

---

### Production (https://agentpolicy.org)

#### Docs Example

```
https://agentpolicy.org/api/og?title=Getting%20Started&type=docs&section=Docs%20/%20Quick%20Start
```

#### Blog Example

```
https://agentpolicy.org/api/og?title=Introducing%20Agent%20Policy%20Protocol&type=blog&author=Arun%20Vijayarengan&date=February%2016,%202026
```

#### Playground

```
https://agentpolicy.org/api/og?title=Build%20Your%20AI%20Agent%20Policy&type=playground
```

#### Default/Homepage

```
https://agentpolicy.org/api/og?title=Agent%20Policy%20Protocol
```

---

## Social Media Preview Tools

Use these tools to test how the OG images appear when shared on social platforms:

### OpenGraph Preview

- **URL**: https://www.opengraph.xyz/
- **Usage**: Paste any page URL (e.g., `https://agentpolicy.org/docs/getting-started`) to see social preview

### Twitter Card Validator

- **URL**: https://cards-dev.twitter.com/validator
- **Usage**: Validate Twitter card rendering

### LinkedIn Post Inspector

- **URL**: https://www.linkedin.com/post-inspector/
- **Usage**: Clear LinkedIn's cache and preview

### Facebook Sharing Debugger

- **URL**: https://developers.facebook.com/tools/debug/
- **Usage**: Debug and clear Facebook's OG cache

---

## Testing in Browser

### View OG Meta Tags

1. Visit any page (docs, blog, playground)
2. Right-click → "View Page Source"
3. Search for `og:image` to see the meta tag

### DevTools Network Tab

1. Open DevTools → Network tab
2. Navigate to a page
3. Look for the `/api/og` request to verify parameters

---

## OG Image Query Parameters

| Parameter | Type   | Description                                        | Example                             |
| --------- | ------ | -------------------------------------------------- | ----------------------------------- |
| `title`   | string | Page title (required)                              | `Getting Started`                   |
| `type`    | string | Page type: `docs`, `blog`, `playground`, `default` | `docs`                              |
| `section` | string | Breadcrumb for docs pages                          | `Docs / Quick Start / Installation` |
| `author`  | string | Author name for blog posts                         | `Arun Vijayarengan`                 |
| `date`    | string | Formatted date for blog posts                      | `February 16, 2026`                 |

---

## Expected Rendering

### Docs Pages

- **Badge**: Blue "Documentation"
- **Section**: Breadcrumb trail (e.g., "Docs › Getting Started › Installation")
- **Title**: Page title
- **Footer**: Tagline + Author credit + Domain

### Blog Posts

- **Badge**: Green "Blog"
- **Author**: Name with person icon
- **Date**: Formatted date with calendar icon
- **Title**: Post title
- **Footer**: Tagline + Author credit + Domain

### Playground

- **Badge**: Amber "Playground"
- **Title**: "Build Your AI Agent Policy"
- **Subtitle**: "Create, validate & export your agent-policy.json"
- **Footer**: Tagline + Author credit + Domain

---

## Development Workflow

1. Start dev server: `npm run dev`
2. Visit direct OG URL to preview image
3. Make changes to `/src/app/api/og/route.tsx`
4. Refresh OG URL to see updates (hot reload)
5. Test actual page metadata by viewing source or using social preview tools
