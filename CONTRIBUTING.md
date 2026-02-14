# Contributing to APoP (Agent Policy Protocol)

Thank you for your interest in contributing to the Agent Policy Protocol! APoP is an open standard, and community contributions are essential to its success.

## How to Contribute

### Reporting Issues

- Use [GitHub Issues](https://github.com/agent-policy-protocol/spec/issues) to report bugs, suggest features, or ask questions.
- Search existing issues before creating a new one to avoid duplicates.
- Include as much context as possible: version, environment, steps to reproduce.

### Proposing Changes to the Specification

1. **Open an issue first** — describe the problem or gap the change addresses.
2. **Discuss** — wait for feedback from maintainers and the community before investing in a PR.
3. **Submit a PR** — reference the issue number, explain the rationale, and include any relevant spec sections.

Spec changes require careful review since they affect all implementations. Please be patient during the review process.

### Contributing Code (SDK, Middleware, Tools)

1. **Fork** the repository and create a feature branch from `main`.
2. **Follow existing patterns** — match the code style, naming conventions, and structure of the existing codebase.
3. **Write tests** — all new functionality must include tests. Run the conformance test suite before submitting.
4. **Keep PRs focused** — one logical change per PR. Large PRs are harder to review.

### Running Tests

```bash
# Conformance tests
cd tests/conformance
npm install
npm test

# SDK tests
cd sdk/node
npm install
npm test
```

### Code Style

- **JavaScript/TypeScript**: Follow the existing ESM conventions; use modern Node.js APIs (18+).
- **JSON Schema**: Follow JSON Schema draft 2020-12 conventions.
- **Markdown**: Use standard Markdown; keep line lengths reasonable.

## Pull Request Process

1. Ensure all tests pass and there are no linting errors.
2. Update documentation if your change affects the public API or spec.
3. Add a clear description of what changed and why.
4. A maintainer will review your PR and may request changes.
5. Once approved, a maintainer will merge your PR.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you agree to uphold this code. Please report unacceptable behavior to [security@agentpolicy.org](mailto:security@agentpolicy.org).

## License

By contributing to APoP, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
