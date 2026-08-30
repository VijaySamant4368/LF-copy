// One-shot seed: loads the same placeholder authors/categories/tags/posts that used to
// live in lib/mock-data.ts as real rows in Postgres, so the site has content to render
// before real WordPress content is migrated (etl.py, later). Re-runnable: truncates first.
import { config } from "dotenv";
import { Pool } from "pg";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const authors = [
  {
    wp_id: 1,
    slug: "abhishek-shukla",
    display_name: "Abhishek Shukla",
    bio: "Advocate practising before the Allahabad High Court.",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
  },
  {
    wp_id: 2,
    slug: "priya-menon",
    display_name: "Priya Menon",
    bio: "Faculty of Law, University of Delhi.",
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
  },
];

const categories = [
  { wp_term_id: 1, slug: "articles", name: "Articles", color: "#111827", description: "High Court and Supreme Court judicial analyses and legal developments." },
  { wp_term_id: 2, slug: "du-llb", name: "DU LLB", color: "#EA580C", description: "Delhi University Faculty of Law coursework, notes and case digests." },
  { wp_term_id: 3, slug: "aibe", name: "AIBE", color: "#DC2626", description: "All India Bar Examination syllabus, previous year papers and eligibility." },
  { wp_term_id: 4, slug: "bare-acts", name: "Bare Acts", color: "#059669", description: "Family, Criminal, Civil and Tax law statutes." },
  { wp_term_id: 5, slug: "training", name: "Training", color: "#7C3AED", description: "Judiciary exam coaching, drafting practice and internship guidance." },
  { wp_term_id: 6, slug: "legaltech", name: "LegalTech", color: "#0284C7", description: "Legal research tools, workflow automation and digital practice." },
];

const tags = [
  { wp_term_id: 101, slug: "allahabad-high-court", name: "Allahabad High Court" },
  { wp_term_id: 102, slug: "service-law", name: "Service Law" },
  { wp_term_id: 103, slug: "aibe-exam", name: "AIBE Exam" },
  { wp_term_id: 104, slug: "cop-certificate", name: "COP Certificate" },
  { wp_term_id: 105, slug: "jurisprudence", name: "Jurisprudence" },
  { wp_term_id: 106, slug: "du-law-faculty", name: "DU Law Faculty" },
];

const posts = [
  {
    wp_id: 1001,
    slug: "responsibilities-higher-post-salary-lower-post-not-justified-court",
    title: "Responsibilities of a higher post and salary of a lower post are not justified: Court",
    excerpt: "Placeholder summary — a High Court ruling holding that denying pay commensurate with a higher post's duties is arbitrary and violative of Articles 14 and 16.",
    content: `## Placeholder: Equal Pay for Equal Work\n\nPlaceholder paragraph on the ruling that an employer cannot extract duties of a superior post while paying a subordinate grade.\n\n> Placeholder quoted line from the bench's reasoning.\n\n### Key Points\n\n1. Placeholder point on Article 14/16 equal-pay doctrine.\n2. Placeholder point on officiating arrangements.\n3. Placeholder point on non-recovery of bona fide payments.`,
    cover_path: "photo-1589829545856-d10d557cf95f",
    is_featured: true,
    is_breaking: false,
    view_count: 63,
    published_at: "2026-06-08T10:00:00.000Z",
    author_wp_id: 1,
    category_wp_term_id: 1,
    tag_wp_term_ids: [101, 102],
  },
  {
    wp_id: 1002,
    slug: "withholding-salary-other-than-suspension-dismissal-unfair-allahabad-high-court",
    title: "Withholding salary in any situation other than suspension and dismissal is unfair: Allahabad High Court",
    excerpt: "Placeholder summary — salary as property under Article 300A, and limits on administrative stoppage of pay.",
    content: `## Placeholder: Right to Salary as Constitutional Property\n\nPlaceholder paragraph on Article 300A and the limits on withholding pay without a formal order.\n\n### Findings\n\n- Placeholder finding on Article 300A safeguard.\n- Placeholder finding on administrative coercion.\n- Placeholder finding on arrears release.`,
    cover_path: "photo-1554224155-8d04cb21cd6c",
    is_featured: true,
    is_breaking: true,
    view_count: 142,
    published_at: "2026-06-05T08:30:00.000Z",
    author_wp_id: 1,
    category_wp_term_id: 1,
    tag_wp_term_ids: [101, 102],
  },
  {
    wp_id: 1003,
    slug: "how-to-obtain-certificate-of-practice-cop-passing-aibe-complete-guide",
    title: "How to Obtain the Certificate of Practice (COP) After Passing AIBE: A Complete Guide",
    excerpt: "Placeholder step-by-step guide for advocates applying for COP through State Bar Councils after clearing AIBE.",
    content: `## Placeholder: Applying for Certificate of Practice\n\nPlaceholder introduction on the statutory COP step after clearing AIBE.\n\n### Steps\n\n1. Placeholder step — verify result and roll number.\n2. Placeholder step — State Bar Council verification.\n3. Placeholder step — biometric and photo upload.\n4. Placeholder step — issuance of COP.`,
    cover_path: "photo-1450133064473-71024230f91b",
    is_featured: true,
    is_breaking: false,
    view_count: 389,
    published_at: "2026-06-02T12:00:00.000Z",
    author_wp_id: 1,
    category_wp_term_id: 3,
    tag_wp_term_ids: [103, 104],
  },
  {
    wp_id: 1004,
    slug: "political-satire-electoral-law-limits-parody-registration",
    title: "Placeholder: Political Satire, Electoral Law and the Limits of Parody Registration",
    excerpt: "Placeholder analysis of satire in political speech and party registration under election law.",
    content: `## Placeholder: Political Satire and Electoral Law\n\nPlaceholder paragraph on Article 19(1)(a) and Section 29A of the Representation of the People Act.\n\n### Dimensions\n\n- Placeholder point on freedom of political satire.\n- Placeholder point on registration standards.`,
    cover_path: "photo-1529107386315-e1a2ed48a620",
    is_featured: true,
    is_breaking: false,
    view_count: 512,
    published_at: "2026-05-28T14:15:00.000Z",
    author_wp_id: 2,
    category_wp_term_id: 1,
    tag_wp_term_ids: [101],
  },
  {
    wp_id: 1005,
    slug: "du-llb-6th-sem-jurisprudence-ii-revision-notes",
    title: "DU LLB 6th Semester: Jurisprudence II Revision Notes",
    excerpt: "Placeholder revision notes for Faculty of Law, Delhi University 6th Semester — Hohfeldian analysis, Rawlsian theory, and critical legal studies.",
    content: `## Placeholder: Faculty of Law, University of Delhi — Jurisprudence II\n\nPlaceholder syllabus notes covering analytical jurisprudence and rights analysis.\n\n### Units\n\n1. Placeholder unit — Hohfeld's analysis of legal rights.\n2. Placeholder unit — Rawlsian theory of justice.\n3. Placeholder unit — Feminist jurisprudence and CLS.`,
    cover_path: "photo-1456513080510-7bf3a84b82f8",
    is_featured: true,
    is_breaking: false,
    view_count: 1250,
    published_at: "2026-05-20T09:00:00.000Z",
    author_wp_id: 2,
    category_wp_term_id: 2,
    tag_wp_term_ids: [105, 106],
  },
  {
    wp_id: 1006,
    slug: "hohfeld-theory-rights-and-duties-explained",
    title: "Placeholder: Hohfeld's Theory of Rights and Duties, Explained",
    excerpt: "Placeholder breakdown of Hohfeld's jural correlatives and jural opposites with case illustrations.",
    content: `## Placeholder: Hohfeld's Analytical Framework\n\nPlaceholder paragraph introducing Hohfeld's eight jural relations.\n\n### Correlatives\n\n- Right (Claim) — Duty\n- Privilege (Liberty) — No-Right\n- Power — Liability\n- Immunity — Disability`,
    cover_path: "photo-1451187580459-43490279c0fa",
    is_featured: false,
    is_breaking: false,
    view_count: 420,
    published_at: "2026-02-04T11:00:00.000Z",
    author_wp_id: 2,
    category_wp_term_id: 2,
    tag_wp_term_ids: [105],
  },
  {
    wp_id: 1007,
    slug: "up-pcs-j-2026-preliminary-mains-preparation-strategy",
    title: "UP PCS (J) 2026: Preliminary and Mains Preparation Strategy",
    excerpt: "Placeholder preparation roadmap for UP Judicial Services covering local laws and judgment writing.",
    content: `## Placeholder: UP Judiciary Preparation Blueprint\n\nPlaceholder guide for civil judge aspirants covering BNS, BNSS, BSA and the UP Revenue Code.`,
    cover_path: "photo-1505664194779-8beaceb93744",
    is_featured: false,
    is_breaking: false,
    view_count: 980,
    published_at: "2026-07-15T08:00:00.000Z",
    author_wp_id: 1,
    category_wp_term_id: 5,
    tag_wp_term_ids: [101],
  },
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Idempotent: clear app tables in FK-safe order, then reload.
    await client.query("TRUNCATE post_tags, post_categories, posts, tags, categories, authors RESTART IDENTITY CASCADE");

    const authorIdByWpId = new Map<number, number>();
    for (const a of authors) {
      const { rows } = await client.query(
        `INSERT INTO authors (wp_id, slug, display_name, bio, avatar_url) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [a.wp_id, a.slug, a.display_name, a.bio, a.avatar_url]
      );
      authorIdByWpId.set(a.wp_id, rows[0].id);
    }

    const categoryIdByWpTermId = new Map<number, number>();
    for (const c of categories) {
      const { rows } = await client.query(
        `INSERT INTO categories (wp_term_id, slug, name, description, color) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [c.wp_term_id, c.slug, c.name, c.description, c.color]
      );
      categoryIdByWpTermId.set(c.wp_term_id, rows[0].id);
    }

    const tagIdByWpTermId = new Map<number, number>();
    for (const t of tags) {
      const { rows } = await client.query(
        `INSERT INTO tags (wp_term_id, slug, name) VALUES ($1,$2,$3) RETURNING id`,
        [t.wp_term_id, t.slug, t.name]
      );
      tagIdByWpTermId.set(t.wp_term_id, rows[0].id);
    }

    for (const p of posts) {
      const authorId = authorIdByWpId.get(p.author_wp_id);
      const categoryId = categoryIdByWpTermId.get(p.category_wp_term_id);
      const coverImage = `https://images.unsplash.com/${p.cover_path}?auto=format&fit=crop&q=80&w=1200`;
      const { rows } = await client.query(
        `INSERT INTO posts
           (wp_id, slug, title, excerpt, content, status, author_id, primary_category_id,
            published_at, is_featured, is_breaking, view_count, meta)
         VALUES ($1,$2,$3,$4,$5,'published',$6,$7,$8,$9,$10,$11,$12)
         RETURNING id`,
        [
          p.wp_id, p.slug, p.title, p.excerpt, p.content, authorId, categoryId,
          p.published_at, p.is_featured, p.is_breaking, p.view_count,
          JSON.stringify({ coverImage }),
        ]
      );
      const postId = rows[0].id;

      await client.query(`INSERT INTO post_categories (post_id, category_id) VALUES ($1,$2)`, [postId, categoryId]);
      for (const wpTermId of p.tag_wp_term_ids) {
        const tagId = tagIdByWpTermId.get(wpTermId);
        await client.query(`INSERT INTO post_tags (post_id, tag_id) VALUES ($1,$2)`, [postId, tagId]);
      }
    }

    await client.query("COMMIT");
    console.log(`Seeded ${authors.length} authors, ${categories.length} categories, ${tags.length} tags, ${posts.length} posts.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
