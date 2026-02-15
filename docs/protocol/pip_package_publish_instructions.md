# Publishing `apop` to PyPI

> Package: `apop` v1.0.0
> Registry: https://pypi.org

---

## Prerequisites

- Python >= 3.10 installed
- PyPI account (https://pypi.org/account/register/)
- `build` and `twine` packages installed

---

## Step-by-Step Instructions

### 1. Create a PyPI Account (if you don't have one)

1. Go to https://pypi.org/account/register/
2. Register with email and password
3. **Enable 2FA** (required by PyPI for publishing since 2024)
4. Verify your email

### 2. Create an API Token

PyPI no longer supports username/password for uploads. You need an API token.

1. Go to https://pypi.org/manage/account/
2. Scroll to **API tokens**
3. Click **Add API token**
4. Name: `apop-publish`
5. Scope: **Entire account** (for first publish; you can scope it to `apop` package afterward)
6. Click **Create token**
7. **Copy the token** — it starts with `pypi-` and is shown only once

### 3. Configure `~/.pypirc` (optional, for convenience)

Create or edit `~/.pypirc`:

```ini
[distutils]
index-servers =
    pypi

[pypi]
username = __token__
password = pypi-YOUR_TOKEN_HERE
```

> If you skip this, `twine` will prompt you for credentials during upload.

### 4. Check if the package name `apop` is available

Visit: https://pypi.org/project/apop/

If the page shows 404, the name is available. If it's taken, you'll need to rename the package in `pyproject.toml`.

### 5. Navigate to the SDK directory

```bash
cd sdk/python
```

### 6. Install build tools

```bash
pip install build twine
```

### 7. Run tests one final time

```bash
python -m pytest tests/ -v
```

All 107 tests should pass.

### 8. Build the distribution packages

```bash
python -m build
```

This creates two files in `dist/`:

- `apop-1.0.0.tar.gz` — source distribution
- `apop-1.0.0-py3-none-any.whl` — wheel (binary distribution)

### 9. Verify the build

```bash
ls dist/
```

You should see both the `.tar.gz` and `.whl` files.

### 10. Check the distribution with twine

```bash
twine check dist/*
```

This validates the package metadata and README. You should see `PASSED` for both files.

### 11. (Optional) Test on TestPyPI first

TestPyPI is a sandbox registry for testing. Recommended for first-time publishers.

```bash
# Upload to TestPyPI
twine upload --repository testpypi dist/*
```

When prompted:

- Username: `__token__`
- Password: your TestPyPI token (create one at https://test.pypi.org/manage/account/)

Test installation from TestPyPI:

```bash
pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ apop
```

> The `--extra-index-url` lets dependencies (jsonschema, httpx) install from real PyPI.

### 12. Publish to PyPI (production)

```bash
twine upload dist/*
```

When prompted (if you didn't configure `~/.pypirc`):

- Username: `__token__`
- Password: `pypi-YOUR_API_TOKEN`

### 13. Verify publication

```bash
pip install apop
```

Or visit: https://pypi.org/project/apop/

---

## Post-Publish Checklist

- [ ] Verify the PyPI page shows correct description, README, version, and classifiers
- [ ] Test installation in a fresh virtual environment:
  ```bash
  python -m venv /tmp/test-apop && source /tmp/test-apop/bin/activate
  pip install apop
  python -c "from apop import parse_policy, enforce; print('OK')"
  deactivate
  ```
- [ ] Test with framework extras:
  ```bash
  pip install apop[fastapi]
  pip install apop[flask]
  pip install apop[django]
  pip install apop[all]
  ```
- [ ] Scope your API token to the `apop` package (now that it exists on PyPI):
  1. Go to https://pypi.org/manage/account/
  2. Delete the account-wide token
  3. Create a new token scoped to `apop` project only
- [ ] Add the PyPI badge to the main project README if desired:
  ```markdown
  [![PyPI version](https://img.shields.io/pypi/v/apop)](https://pypi.org/project/apop/)
  ```

---

## Updating the Package Later

1. Update the version in `pyproject.toml`:

   ```toml
   version = "1.0.1"
   ```

2. Clean old builds, rebuild, and upload:
   ```bash
   rm -rf dist/
   python -m build
   twine check dist/*
   twine upload dist/*
   ```

---

## Troubleshooting

| Issue                      | Solution                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `403 Forbidden`            | Token is invalid or expired. Create a new one at https://pypi.org/manage/account/                                           |
| `400 File already exists`  | That version is already published. Bump the version in `pyproject.toml`.                                                    |
| `InvalidDistribution`      | Run `twine check dist/*` to see what's wrong with the metadata.                                                             |
| `README rendering error`   | PyPI only supports RST and Markdown. Ensure `readme = "README.md"` in pyproject.toml and that the README is valid Markdown. |
| `twine: command not found` | Run `pip install twine`                                                                                                     |
| `build: command not found` | Run `pip install build`                                                                                                     |
| `Name already taken`       | Someone else owns `apop` on PyPI. You'll need to choose a different name (e.g., `agent-policy`, `apop-sdk`).                |

---

## Quick Copy-Paste (All Commands)

```bash
cd sdk/python
pip install build twine
python -m pytest tests/ -v
python -m build
twine check dist/*
twine upload dist/*
pip install apop
python -c "from apop import parse_policy, enforce; print('OK')"
```
