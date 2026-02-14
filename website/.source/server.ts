// @ts-nocheck
import * as __fd_glob_11 from "../content/docs/specification/overview.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/specification/http-extensions.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/specification/discovery.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/specification/agent-identification.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/sdks/overview.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/introduction/why-apop.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/introduction/what-is-apop.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/introduction/quick-start.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/introduction/ecosystem.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/contributing/how-to-contribute.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/index.mdx?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, }, {"index.mdx": __fd_glob_1, "contributing/how-to-contribute.mdx": __fd_glob_2, "introduction/ecosystem.mdx": __fd_glob_3, "introduction/quick-start.mdx": __fd_glob_4, "introduction/what-is-apop.mdx": __fd_glob_5, "introduction/why-apop.mdx": __fd_glob_6, "sdks/overview.mdx": __fd_glob_7, "specification/agent-identification.mdx": __fd_glob_8, "specification/discovery.mdx": __fd_glob_9, "specification/http-extensions.mdx": __fd_glob_10, "specification/overview.mdx": __fd_glob_11, });