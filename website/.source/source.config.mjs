// source.config.ts
import {
  defineDocs,
  defineCollections,
  defineConfig,
  frontmatterSchema
} from "fumadocs-mdx/config";
import { z } from "zod";
var docs = defineDocs({
  dir: "content/docs"
});
var blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: frontmatterSchema.extend({
    date: z.string(),
    author: z.object({
      name: z.string(),
      title: z.string().optional(),
      url: z.string().optional(),
      avatar: z.string().optional()
    }).optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional()
  })
});
var source_config_default = defineConfig({
  mdxOptions: {
    // MDX options here
  }
});
export {
  blog,
  source_config_default as default,
  docs
};
