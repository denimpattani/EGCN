import { z } from 'zod'

// Static data (same as frontend constants — served from backend for SEO/dynamic updates)
const TESTIMONIALS = [
  { id: 1, name: 'Rohan Mehta', role: 'Founder', company: 'Mehta Textiles Pvt. Ltd.', initials: 'RM', rating: 5, review: 'EGCN transformed the way we track our sales and monthly targets. The insights dashboard alone saved us 3 hours a week in reporting.' },
  { id: 2, name: 'Priya Sharma', role: 'Director', company: 'QuickServe Foods', initials: 'PS', rating: 5, review: `We were bleeding cash without knowing why. EGCN's cashflow module pinpointed exactly where we were losing money.` },
  { id: 3, name: 'Arvind Kapoor', role: 'CEO', company: 'Kapoor Auto Parts', initials: 'AK', rating: 5, review: `The workspace feature lets me talk to my EGCN expert whenever I need. It feels like having a CFO in my pocket.` },
  { id: 4, name: 'Sneha Jain', role: 'Partner', company: 'Jain & Associates', initials: 'SJ', rating: 5, review: 'Setting up marketing targets and watching them get fulfilled in real time is incredibly motivating.' },
  { id: 5, name: 'Deepak Nair', role: 'MD', company: 'Nair Constructions', initials: 'DN', rating: 5, review: 'The daily reports are precise and actionable. Highly recommended for any SME.' },
  { id: 6, name: 'Kavya Reddy', role: 'Owner', company: 'Reddy Organic Farms', initials: 'KR', rating: 5, review: `EGCN's BEP analysis changed how I price my products. Game changer.` },
]

const SERVICES = [
  { id: 'marketing', title: 'Marketing Advisory', tagline: 'Strategy that converts.', description: 'Set campaign targets, track daily marketing efforts, and measure ROI with precision.' },
  { id: 'finance', title: 'Finance Advisory', tagline: 'Clarity in every number.', description: 'Understand your P&L, manage budgets intelligently, and get monthly financial analysis.' },
  { id: 'cashflow', title: 'CashFlow Management', tagline: 'Never run dry again.', description: 'Map every rupee in and out. Get 30/60/90-day cashflow projections and early warning alerts.' },
]

const newsletterSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
})

// In-memory store for newsletter (replace with MongoDB model later)
const newsletterEmails = new Set()

export async function getTestimonials(req, res) {
  res.json({ success: true, data: TESTIMONIALS })
}

export async function getServices(req, res) {
  res.json({ success: true, data: SERVICES })
}

export async function subscribeNewsletter(req, res) {
  const result = newsletterSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ success: false, message: result.error.issues[0].message })
  }

  const { email } = result.data

  if (newsletterEmails.has(email)) {
    return res.status(409).json({ success: false, message: 'This email is already subscribed.' })
  }

  newsletterEmails.add(email)
  console.log(`Newsletter subscription: ${email}`)

  res.json({ success: true, message: 'Subscribed successfully! Welcome to EGCN updates.' })
}
