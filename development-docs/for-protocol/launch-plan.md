# Agent Policy Protocol (APoP) — Launch Plan

> Created: 2026-02-14
> Updated: 2026-02-14
> Status: Draft — Pending Founder Approval

---

## 1. Launch Readiness Assessment

**Current Status: Ready for "Developer Preview", NOT "Production Launch"**

| Area                                 | Status      | Launch-Critical?                             |
| ------------------------------------ | ----------- | -------------------------------------------- |
| v1.0 Spec (4 documents)              | ✅ Done     | Yes                                          |
| JSON Schema (draft 2020-12)          | ✅ Done     | Yes                                          |
| Node.js SDK + 3 middleware adapters  | ✅ Done     | Yes                                          |
| Python SDK (FastAPI/Flask/Django)    | ✅ Done     | Yes — for credibility with AI community      |
| Python SDK tests (107 tests)         | ✅ Done     | Yes                                          |
| 9 example policies                   | ✅ Done     | Yes                                          |
| Conformance tests (109 tests)        | ✅ Done     | Yes                                          |
| CI/CD, Docker, community files       | ✅ Done     | Yes                                          |
| npm package published                | ❌ Not done | **Yes — blocker**                            |
| PyPI package published               | ❌ Not done | **Yes — blocker**                            |
| Real rate limiting (actual counters) | ❌ Not done | No (advisory is fine for preview)            |
| Real signature verification (crypto) | ❌ Not done | No (fine for preview)                        |
| Domain (agentpolicy.org)             | ✅ Done     | Purchased                                    |
| Website (agentpolicy.org)            | ❌ Not done | Soft blocker — GitHub Pages landing suffices |
| Standards submissions (IETF/W3C)     | ❌ Not done | No                                           |
| Real-world deployment                | ❌ Not done | Would strengthen credibility                 |

**Estimated time to launch-ready: ~2-3 weeks**

- ~~Python SDK core: ~1-2 weeks~~ ✅ Complete (107 tests passing)
- Publish `@apop/node` + `apop` (Python) to npm/PyPI: ~1 day
- Landing page (GitHub Pages): ~2-3 days
- Deploy APoP on own site as proof-of-concept: ~1 day
- Write & publish 5 blog posts: ~3-5 days

---

## 2. Blog Post Series: "The Agentic Web Needs Rules"

### 5-Post Series Plan

| #   | Title                                                                   | Primary Audience                                                      | Secondary Audience            |
| --- | ----------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------- |
| 1   | "robots.txt Is Dead. The Agentic Web Needs a New Standard."             | Everyone                                                              | Media, AI ethics researchers  |
| 2   | "Introducing Agent Policy Protocol: Consent & Governance for AI Agents" | Developers, AI companies                                              | Website owners                |
| 3   | "Protect Your Website from AI Agents in 5 Minutes"                      | Website owners, CMS users                                             | Content publishers, news orgs |
| 4   | "Building Agent-Aware Apps with APoP: A Developer's Guide"              | Framework/SDK developers                                              | AI agent builders             |
| 5   | "An Open Letter to Google, Anthropic, and Every AI Agent Builder"       | Google, Anthropic, OpenAI, browser makers, agentic framework builders | Standards bodies, W3C/IETF    |

### Content Strategy per Post

**Post 1 — Problem Statement**

- The Amazon-Perplexity conflict as hook
- robots.txt limitations in the agentic era
- Why consent matters for AI agents
- Tone: Thought leadership, urgency

**Post 2 — Solution Announcement**

- What APoP is, how it works
- Schema overview, discovery mechanism
- Comparison with MCP, A2A, WebMCP, UCP, AP2
- Code examples (Node.js + Python)
- Tone: Technical but accessible

**Post 3 — Website Owner Guide**

- Step-by-step: create `agent-policy.json`
- 5 template policies (permissive → restrictive)
- WordPress, Vercel, Next.js deployment guides
- Tone: Practical, beginner-friendly

**Post 4 — Developer Deep-Dive**

- Node.js SDK walkthrough
- Python SDK walkthrough
- Express/Vercel/Next.js/FastAPI/Flask middleware
- Custom enforcement logic, path matching, agent identification
- Tone: Technical, code-heavy

**Post 5 — Industry Call to Action**

- Open letter format
- Why Chrome/Arc/Firefox should support APoP headers
- Why LangChain/CrewAI/AutoGPT should respect APoP
- Why Google/Anthropic/OpenAI should adopt APoP in their agents
- Specific asks for each company
- Tone: Bold, visionary, respectful

---

## 3. Publishing Platforms

### Primary (Must-do)

| Platform                  | Audience                       | Use For                     |
| ------------------------- | ------------------------------ | --------------------------- |
| **Medium.com**            | General tech, business         | All 5 posts                 |
| **Dev.to**                | Developers                     | Posts 1, 2, 4               |
| **Hacker News** (Show HN) | Early adopters, tech community | Post 2 (launch post)        |
| **LinkedIn Articles**     | Decision makers, enterprise    | Posts 1, 5                  |
| **X/Twitter Threads**     | Everyone                       | Thread versions of all 5    |
| **Reddit**                | Varied communities             | Posts 1-5 across subreddits |

### Reddit Subreddits to Target

- r/artificial
- r/MachineLearning
- r/webdev
- r/programming
- r/selfhosted
- r/javascript
- r/Python
- r/nextjs
- r/Wordpress

### Secondary (Nice-to-have)

| Platform                      | Audience                  | Use For                            |
| ----------------------------- | ------------------------- | ---------------------------------- |
| **Hashnode**                  | Developer blogs           | Republish Posts 2, 4               |
| **Product Hunt**              | Startup/product community | When more polished (Phase 3+)      |
| **GitHub Discussions**        | Open source community     | Ongoing engagement                 |
| **InfoQ / The New Stack**     | Enterprise developers     | Pitch Posts 1, 2 as guest articles |
| **YouTube / Loom**            | Visual learners           | 5-min explainer video              |
| **W3C Community Group lists** | Standards community       | Phase 7                            |
| **IETF mailing lists**        | Standards engineers       | Phase 7                            |

---

## 4. Action Plan — Revised Sequence

### Phase A: Complete the Foundation ~~(Week 1-2)~~ ✅ DONE

1. ~~Build Python SDK (parser, enforcer, discovery, matcher, headers)~~ ✅
2. ~~Build Python middleware (FastAPI + Flask + Django)~~ ✅
3. ~~Write Python SDK tests (107 tests passing)~~ ✅
4. Publish `@apop/node` to npm
5. Publish `apop` Python package to PyPI
6. Fix middleware version to 1.0.0

### Phase B: Pre-Launch Prep (Week 1-2)

1. Publish `@apop/node` to npm
2. Publish `apop` to PyPI
3. Deploy APoP on own domain as proof-of-concept
4. Create minimal landing page (GitHub Pages or agentpolicy.org)
5. Create a 1-page "APoP Cheat Sheet" PDF
6. Prepare Show HN post draft

### Phase C: Content Blitz (Week 2-3)

1. Write all 5 blog posts (with both Node.js + Python examples)
2. Create X/Twitter thread versions
3. Create LinkedIn article versions

### Phase D: Launch Sequence (Week 3-4)

1. Day 1: Publish Post 1 (Medium + Dev.to)
2. Day 3: Publish Post 2 (Medium + Dev.to + HN)
3. Day 5: Publish Post 3 (Medium)
4. Day 7: Publish Post 4 (Medium + Dev.to)
5. Day 9: Publish Post 5 (Medium + LinkedIn)
6. Days 3-10: Reddit posts across subreddits
7. Ongoing: X/Twitter threads, engagement, community building

### Phase E: Post-Launch Growth (Week 4+)

1. Monitor adoption, respond to feedback
2. Submit to Product Hunt (when 10+ stars / real users)
3. Begin Phase 3 (CLI validator, web validator, policy builder)
4. Begin W3C CG application
5. Outreach to Tier 1 partners (Google Chrome, Anthropic, WordPress)

---

## 5. Success Metrics (First 30 Days Post-Launch)

| Metric                  | Target |
| ----------------------- | ------ |
| GitHub stars            | 100+   |
| npm weekly downloads    | 50+    |
| PyPI weekly downloads   | 50+    |
| Blog post total views   | 5,000+ |
| Hacker News points      | 50+    |
| Websites adopting APoP  | 5+     |
| Contributors (non-team) | 3+     |
| Media/blog mentions     | 2+     |

---

## 6. Key Decisions Pending

- [ ] Founder approval of this plan
- [x] Domain: agentpolicy.org — purchased ✅
- [ ] npm org: @apop — registered?
- [ ] PyPI package name: apop — available?
- [ ] Superdom AI branding on blog posts vs. personal (Arun Vijayarengan)?
- [ ] Timeline commitment: target launch week?

---

_Plan prepared by AI assistant. All strategic decisions require founder approval._
