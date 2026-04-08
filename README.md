# CostGuard AI 🛡️

A production-ready **Cloud Cost & Security Auditor Dashboard** built with Next.js 14, Tailwind CSS, and Recharts.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Dashboard overview
│   ├── cost/page.tsx               # Cost Analysis
│   ├── security/page.tsx           # Security Analyzer
│   ├── optimization/page.tsx       # Optimization Insights
│   └── api/
│       ├── cost/route.ts           # GET /api/cost
│       ├── security/route.ts       # GET /api/security
│       ├── usage/route.ts          # GET /api/usage
│       └── summary/route.ts        # GET /api/summary
├── components/
│   ├── layout/Sidebar.tsx
│   ├── layout/TopBar.tsx
│   ├── dashboard/MetricCard.tsx
│   ├── dashboard/IssueCard.tsx
│   ├── dashboard/LiveCounter.tsx
│   ├── dashboard/FilterBar.tsx
│   ├── dashboard/SeverityBadge.tsx
│   └── charts/CpuUsageChart.tsx
│   └── charts/CostSavingsChart.tsx
├── lib/
│   ├── mockData.ts                 # Realistic AWS mock data
│   ├── analyzers.ts                # Cost/Security/Usage engines
│   ├── aiRecommendations.ts        # AI explanation generator
│   └── utils.ts                    # Helpers
└── types/index.ts                  # TypeScript interfaces
```

---

## 🔌 API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/cost` | Unattached EBS volumes + estimated waste |
| `GET /api/security` | Security groups with risky open ports |
| `GET /api/usage` | Under-utilized instances + downsize recommendations |
| `GET /api/summary` | Combined insights + AI top recommendations |

---

## ☁️ Deployment

**Frontend → Vercel:**
```bash
npx vercel --prod
```

**Environment:** No environment variables needed (uses mock data).

---

## 🎨 Features

- ✅ Dark/Light mode toggle
- ✅ Animated metric cards with count-up
- ✅ Live savings counter
- ✅ AI-style explanations per issue
- ✅ Severity filtering (Critical / High / Medium / Low)
- ✅ Region filtering
- ✅ Fix All / Delete All / Optimize All buttons
- ✅ Before vs After cost comparison chart
- ✅ 7-day CPU utilization line charts
- ✅ Security port exposure map
- ✅ Glassmorphism UI with smooth animations
