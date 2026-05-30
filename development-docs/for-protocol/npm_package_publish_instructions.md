# Publishing `@apop/node` to npm

> Package: `@apop/node` v1.0.0
> Registry: https://www.npmjs.com

---

## Prerequisites

- Node.js >= 18 installed
- npm account (https://www.npmjs.com/signup)
- npm CLI logged in

---

## Step-by-Step Instructions

### 1. Create an npm Account (if you don't have one)

Go to https://www.npmjs.com/signup and create an account.

### 2. Log in to npm

```bash
npm login
```

Follow the prompts — email, password, OTP if 2FA is enabled.

Verify you're logged in:

```bash
npm whoami
```

### 3. Create the `@apop` npm Organization

The package is scoped as `@apop/node`, so you need the `@apop` org.

1. Go to https://www.npmjs.com/org/create
2. Enter org name: **apop**
3. Choose the **free** (unlimited public packages) plan
4. Click "Create"

> If `apop` is taken, you'll need to rename the package scope. Check availability at https://www.npmjs.com/org/apop

### 4. Navigate to the SDK directory

```bash
cd sdk/node
```

### 5. Install dependencies

```bash
npm install
```

### 6. Build the package

```bash
npm run build
```

This runs `tsc` and outputs compiled JS + type declarations to `dist/`.

### 7. Verify the build

```bash
ls dist/
```

You should see: `index.js`, `index.d.ts`, and the `middleware/` folder with `express.js`, `vercel.js`, `nextjs.js` files.

### 8. Run tests to confirm everything works

```bash
npm test
```

All tests should pass.

### 9. Preview what will be published

```bash
npm pack --dry-run
```

Review the file list. It should include `dist/**` and `README.md` only (as configured in `"files"` in package.json). Ensure no source files, tests, or node_modules are included.

### 10. Set the package access to public

Since `@apop` is a scoped package, npm defaults to private. Override this:

```bash
npm publish --access public
```

### 11. Verify publication

```bash
npm info @apop/node
```

Or visit: https://www.npmjs.com/package/@apop/node

---

## Post-Publish Checklist

- [ ] Verify the npm page shows correct description, README, and version
- [ ] Test installation in a fresh project:
  ```bash
  mkdir /tmp/test-apop && cd /tmp/test-apop
  npm init -y
  npm install @apop/node
  node -e "import('@apop/node').then(m => console.log(Object.keys(m)))"
  ```
- [ ] Verify middleware subpath exports work:
  ```bash
  node -e "import('@apop/node/middleware/express').then(m => console.log(Object.keys(m)))"
  ```
- [ ] Add the npm badge to the main project README if desired:
  ```markdown
  [![npm version](https://img.shields.io/npm/v/@apop/node)](https://www.npmjs.com/package/@apop/node)
  ```

---

## Updating the Package Later

To publish a new version:

```bash
# Bump version (patch/minor/major)
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# Build and publish
npm run build
npm publish --access public
```

---

## Troubleshooting

| Issue                  | Solution                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `403 Forbidden`        | You're not logged in, or the org doesn't exist. Run `npm login` and create the `@apop` org. |
| `402 Payment Required` | Scoped packages default to private. Use `--access public`.                                  |
| `E409 Conflict`        | Version already published. Bump the version first.                                          |
| `ENEEDAUTH`            | Run `npm login` again.                                                                      |
| Build fails            | Ensure `typescript` is installed: `npm install`                                             |

---

## Quick Copy-Paste (All Commands)

```bash
cd sdk/node
npm login
npm install
npm run build
npm test
npm pack --dry-run
npm publish --access public
npm info @apop/node
```
