# Graph Report - .  (2026-06-03)

## Corpus Check
- Corpus is ~42,191 words - fits in a single context window. You may not need a graph.

## Summary
- 322 nodes · 419 edges · 27 communities (25 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Photo Gallery & UI Components|Photo Gallery & UI Components]]
- [[_COMMUNITY_Admin Panel & CMS UI|Admin Panel & CMS UI]]
- [[_COMMUNITY_App Shell & Routing|App Shell & Routing]]
- [[_COMMUNITY_Investment Sales Campaign|Investment Sales Campaign]]
- [[_COMMUNITY_Content State & Services|Content State & Services]]
- [[_COMMUNITY_Dev Dependencies & Tooling|Dev Dependencies & Tooling]]
- [[_COMMUNITY_Villa Content Data|Villa Content Data]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Graphify Knowledge Graph Skill|Graphify Knowledge Graph Skill]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_R2 Image Migration|R2 Image Migration]]
- [[_COMMUNITY_CMS Migration Script|CMS Migration Script]]
- [[_COMMUNITY_R2 Migration Preparation|R2 Migration Preparation]]
- [[_COMMUNITY_Build Helper|Build Helper]]
- [[_COMMUNITY_Image Upload Utility|Image Upload Utility]]
- [[_COMMUNITY_Claude Code Settings|Claude Code Settings]]
- [[_COMMUNITY_App Metadata|App Metadata]]
- [[_COMMUNITY_Local Permissions|Local Permissions]]
- [[_COMMUNITY_Vite Config|Vite Config]]

## God Nodes (most connected - your core abstractions)
1. `useContent()` - 21 edges
2. `compilerOptions` - 18 edges
3. `textContent` - 13 edges
4. `graphify Skill` - 10 edges
5. `Villa Luar Sale Campaign Plan` - 10 edges
6. `useAuth()` - 7 edges
7. `Villa Luar index.html (SPA Entry Point)` - 7 edges
8. `VillaContent` - 6 edges
9. `optimizeAndConvertToBase64()` - 5 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Villa Luar Investment Pack PDF` --conceptually_related_to--> `Villa Luar Sale Campaign Plan`  [INFERRED]
  Villa-Luar-Investment-Pack.pdf → villa-playa-blanca-campaign-plan.md
- `Villa Luar index.html (SPA Entry Point)` --references--> `Villa Luar Favicon (SVG Logo)`  [EXTRACTED]
  index.html → public/favicon.svg
- `Investment One-Pager PDF` --conceptually_related_to--> `Villa Luar Investment Pack PDF`  [INFERRED]
  villa-playa-blanca-campaign-plan.md → Villa-Luar-Investment-Pack.pdf
- `Villa Luar SEO & Schema.org RealEstateListing` --semantically_similar_to--> `Multi-Channel Campaign Strategy`  [INFERRED] [semantically similar]
  index.html → villa-playa-blanca-campaign-plan.md
- `Villa Luar OG Image (Social Share)` --conceptually_related_to--> `villaluar.com as Campaign Hub`  [INFERRED]
  public/og-image.jpg → villa-playa-blanca-campaign-plan.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Villa Luar Sales Campaign System** — villa_luar_property, campaign_plan, campaign_villaluar_hub, villa_luar_react_app, campaign_investment_onepager, villa_luar_investment_pack_pdf, public_og_image, villa_luar_calendly [INFERRED 0.85]
- **graphify Extraction Pipeline Components** — graphify_ast_extraction, graphify_semantic_extraction, graphify_semantic_cache, references_extraction_spec, graphify_pipeline [EXTRACTED 1.00]
- **Villa Luar Investment Proposition** — campaign_10pct_yield, campaign_jet2_solmar_contract, campaign_break_clause_urgency, campaign_uk_investment_buyer [EXTRACTED 1.00]

## Communities (27 total, 2 thin omitted)

### Community 0 - "Photo Gallery & UI Components"
Cohesion: 0.07
Nodes (18): PhotoGallery, PhotoGalleryHandle, PhotoGalleryProps, DEFAULT_STATS, ICON_OPTIONS, TextManager(), DEFAULT_STATS, featureIconMap (+10 more)

### Community 1 - "Admin Panel & CMS UI"
Cohesion: 0.11
Nodes (17): AdminPanel(), Tab, FaqManager(), LocationManager(), MainImageManager(), DragItem, DragType, PhotoManager() (+9 more)

### Community 2 - "App Shell & Routing"
Cohesion: 0.10
Nodes (18): AdminPage, AppContent(), AppHeader(), LoginForm(), PrivateRoute(), ThemeToggle(), AuthContext, AuthContextType (+10 more)

### Community 3 - "Investment Sales Campaign"
Cohesion: 0.13
Nodes (23): 10% Net Yield Investment Proposition, Break Clause Deadline Urgency (June 2026), Multi-Channel Campaign Strategy, 12-Week Content Calendar (Apr-Jun 2026), Investment One-Pager PDF, Jet2/Solmar Villas Management Contract, Villa Luar Sale Campaign Plan, UK Investment Buyer (Target Audience) (+15 more)

### Community 4 - "Content State & Services"
Cohesion: 0.15
Nodes (18): INITIAL_CONTENT, ContentContext, ContentContextType, clearDraftContent(), dbAction(), getContent(), getDraftContent(), isValidContent() (+10 more)

### Community 5 - "Dev Dependencies & Tooling"
Cohesion: 0.09
Nodes (22): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript (+14 more)

### Community 6 - "Villa Content Data"
Cohesion: 0.09
Nodes (22): faqs, faviconUrl, gallerySections, location, description, imageUrl, title, logoUrl (+14 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+13 more)

### Community 8 - "Graphify Knowledge Graph Skill"
Cohesion: 0.10
Nodes (21): graphify Skill Reference (CLAUDE.md), AST Structural Extraction, Community Detection and Clustering, God Nodes (High-Degree Hubs), graphify.ingest (URL Fetch), MCP stdio Server for Graph Queries, graphify Full Pipeline, Constrained Query Vocab Expansion (+13 more)

### Community 9 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (16): dependencies, @google/genai, react, react-dom, react-router-dom, engines, node, name (+8 more)

### Community 10 - "R2 Image Migration"
Cohesion: 0.24
Nodes (10): after, before, content, MIME_TO_EXT, newJson, parseDataUrl(), processImages(), raw (+2 more)

### Community 11 - "CMS Migration Script"
Cohesion: 0.24
Nodes (10): cleaned, cleanJson, content, MIME_TO_EXT, processObject(), processValue(), raw, slugify() (+2 more)

### Community 12 - "R2 Migration Preparation"
Cohesion: 0.20
Nodes (10): data, imgTotal, inputSize, lines, manifest, MIME2EXT, outSize, raw (+2 more)

### Community 13 - "Build Helper"
Cohesion: 0.22
Nodes (8): destDir, destExists, destFile, __dirname, __filename, rootExists, rootFile, rootPath

### Community 14 - "Image Upload Utility"
Cohesion: 0.25
Nodes (4): content, images, MIME_EXT, raw

### Community 15 - "Claude Code Settings"
Cohesion: 0.50
Nodes (3): hooks, PreToolUse, SessionStart

### Community 16 - "App Metadata"
Cohesion: 0.50
Nodes (3): description, name, requestFramePermissions

## Knowledge Gaps
- **148 isolated node(s):** `session-start.sh script`, `SessionStart`, `PreToolUse`, `allow`, `AdminPage` (+143 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useContent()` connect `Admin Panel & CMS UI` to `Photo Gallery & UI Components`, `App Shell & Routing`, `Content State & Services`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies & Tooling` to `Runtime Dependencies`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `session-start.sh script`, `SessionStart`, `PreToolUse` to the rest of the system?**
  _148 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Photo Gallery & UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07207207207207207 - nodes in this community are weakly interconnected._
- **Should `Admin Panel & CMS UI` be split into smaller, more focused modules?**
  _Cohesion score 0.10685483870967742 - nodes in this community are weakly interconnected._
- **Should `App Shell & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.09788359788359788 - nodes in this community are weakly interconnected._
- **Should `Investment Sales Campaign` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._