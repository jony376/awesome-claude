/**
 * Entry detail assembly helpers extracted into a pure library module.
 *
 * The deterministic string/markdown/HTML layer lives in `@/lib/detail-assembly-lib`
 * and is re-exported below so the public `@/lib/detail-assembly` surface is
 * unchanged for routes and sibling modules.
 */
export {
  getCollectionItems,
  getDownloadHref,
  getMetadataFallback,
  getPrimarySnippet,
  getRelatedEntries,
  getSourceSignals,
  getTopFacts,
  htmlToPlainText,
  renderMarkdown,
  stripCodeBlocks,
} from "@/lib/detail-assembly-lib";
