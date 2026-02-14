// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "contributing/how-to-contribute.mdx": () => import("../content/docs/contributing/how-to-contribute.mdx?collection=docs"), "introduction/ecosystem.mdx": () => import("../content/docs/introduction/ecosystem.mdx?collection=docs"), "introduction/quick-start.mdx": () => import("../content/docs/introduction/quick-start.mdx?collection=docs"), "introduction/what-is-apop.mdx": () => import("../content/docs/introduction/what-is-apop.mdx?collection=docs"), "introduction/why-apop.mdx": () => import("../content/docs/introduction/why-apop.mdx?collection=docs"), "sdks/overview.mdx": () => import("../content/docs/sdks/overview.mdx?collection=docs"), "specification/agent-identification.mdx": () => import("../content/docs/specification/agent-identification.mdx?collection=docs"), "specification/discovery.mdx": () => import("../content/docs/specification/discovery.mdx?collection=docs"), "specification/http-extensions.mdx": () => import("../content/docs/specification/http-extensions.mdx?collection=docs"), "specification/overview.mdx": () => import("../content/docs/specification/overview.mdx?collection=docs"), }),
};
export default browserCollections;