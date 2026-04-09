import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabase, type BlogPost } from "@/lib/supabase"
import type { Metadata } from "next"

async function getPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !data) return null
  return data as BlogPost
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Not found" }
  return {
    title: `${post.title} — Sunday`,
    description: post.content.split("\n").filter(Boolean)[1]?.slice(0, 160) ?? "",
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-SG", { day: "numeric", month: "long", year: "numeric" })
}

function readTime(content: string) {
  const words = content?.split(/\s+/).length ?? 0
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

// Render markdown-like content into HTML elements
function renderContent(content: string) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let key = 0

  function flushList() {
    if (!listItems.length) return
    elements.push(
      <ul key={key++} style={{ paddingLeft: 20, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {listItems.map((li, i) => (
          <li key={i} style={{ fontSize: 16, lineHeight: 1.8, color: "var(--ink)", fontFamily: "'Inter', sans-serif" }}>
            {renderInline(li)}
          </li>
        ))}
      </ul>
    )
    listItems = []
  }

  function renderInline(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i}>{p.slice(2, -2)}</strong>
        : p
    )
  }

  let firstHeading = true
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flushList(); continue }

    if (line.startsWith("### ")) {
      flushList()
      elements.push(
        <h3 key={key++} style={{
          fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700,
          color: "var(--sageD)", margin: "28px 0 10px",
        }}>{line.slice(4)}</h3>
      )
    } else if (line.startsWith("## ")) {
      flushList()
      elements.push(
        <h2 key={key++} style={{
          fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700,
          color: "var(--ink)", margin: "32px 0 12px",
        }}>{line.slice(3)}</h2>
      )
    } else if (line.startsWith("# ") || firstHeading) {
      flushList()
      firstHeading = false
      // Skip — title is rendered in the header above
    } else if (line.startsWith("> ")) {
      flushList()
      elements.push(
        <blockquote key={key++} style={{
          borderLeft: "3px solid var(--sage)", paddingLeft: 16,
          margin: "0 0 20px",
        }}>
          <p style={{ fontSize: 15, color: "var(--stone)", lineHeight: 1.7, fontStyle: "italic", fontFamily: "'Inter', sans-serif" }}>
            {line.slice(2)}
          </p>
        </blockquote>
      )
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2))
    } else {
      flushList()
      elements.push(
        <p key={key++} style={{
          fontSize: 16, lineHeight: 1.8, color: "var(--ink)",
          margin: "0 0 20px", fontFamily: "'Inter', sans-serif",
        }}>
          {renderInline(line)}
        </p>
      )
    }
  }
  flushList()
  return elements
}

export const revalidate = 60

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{
        padding: "18px 24px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--divider)",
        background: "var(--cream)",
      }}>
        <Link href="/blog" style={{
          display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#4A7A62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <Image src="/app-icon.png" alt="Sunday" width={28} height={28} style={{ borderRadius: 7 }} />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 22, color: "var(--sageD)", letterSpacing: "-0.3px" }}>
            unday
          </span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: "var(--stone)", textDecoration: "none" }}>
          Download the app
        </Link>
      </nav>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Breadcrumb */}
        <p style={{ fontSize: 12, color: "var(--stone)", marginBottom: 20 }}>
          <Link href="/blog" style={{ color: "var(--stone)", textDecoration: "none" }}>The Sunday Edit</Link>
          {" / "}
          <span style={{ textTransform: "capitalize" }}>{post.topic ?? "General"}</span>
        </p>

        {/* Post header */}
        <span style={{
          display: "block", fontWeight: 700, fontSize: 11,
          color: "var(--sageD)", letterSpacing: "0.1em",
          textTransform: "uppercase", marginBottom: 14,
        }}>
          {post.topic ?? "General"}
        </span>

        <h1 style={{
          fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 32,
          color: "var(--ink)", lineHeight: 1.2,
          letterSpacing: "-0.5px", marginBottom: 24,
        }}>
          {post.title}
        </h1>

        <div style={{ height: 1, background: "var(--divider)", marginBottom: 16 }} />

        <p style={{ fontSize: 13, color: "var(--stone)", marginBottom: 36 }}>
          By Sunday · {formatDate(post.published_at)} · {readTime(post.content)}
        </p>

        {/* Body */}
        <div>{renderContent(post.content)}</div>

        {/* CTA */}
        <div style={{
          marginTop: 48, border: "1.5px solid var(--sageL)",
          borderRadius: 12, padding: 20,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <Image src="/mascot_happy.png" alt="Sunday" width={56} height={56} style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>
              Sunday for iPhone
            </p>
            <p style={{ fontSize: 14, color: "var(--stone)", marginBottom: 12, lineHeight: 1.4 }}>
              Find pet-friendly places near you — free.
            </p>
            <Link href="/" style={{
              display: "inline-block",
              border: "1.5px solid var(--sageD)",
              borderRadius: 12, padding: "8px 16px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600, fontSize: 13,
              color: "var(--sageD)", textDecoration: "none",
            }}>
              Download on the App Store
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}
