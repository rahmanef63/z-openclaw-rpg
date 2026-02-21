# 🚀 Super Space RPG

**Spatial Operating System** - A gamified life management dashboard built as a grid-based top-down RPG. Manage your workspace, interact with AI agents, and visualize your life data in real-time.

![Super Space RPG](https://img.shields.io/badge/Next.js-16.1.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🎮 Overview

Super Space RPG transforms life management into an engaging RPG experience. Navigate your studio apartment (Condo), place furniture that represents different aspects of your life, and interact with AI agents to boost productivity and well-being.

### Key Features

- **🏠 Grid-Based Condo** - Navigate and customize your living space
- **🎯 10 Life Aspects** - Track and improve all areas of your life
- **🪑 Interactive Furniture** - Each piece connects to your real data
- **🤖 AI Agents** - Chat with intelligent NPCs powered by AI
- **🏆 Achievement System** - Earn rewards for positive habits
- **📊 Data Visualization** - See your progress in real-time

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/rahmanef63/z-openclaw-rpg.git

# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🎯 Controls

| Key | Action |
|-----|--------|
| **WASD** | Move player |
| **B** | Toggle Build Mode |
| **R** | Rotate furniture (in build mode) |
| **Click** | Place furniture / Interact |
| **Escape** | Deselect |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main game page
│   ├── layout.tsx         # Root layout
│   └── api/               # API routes
│
├── components/
│   ├── game/              # Game-specific components
│   │   ├── BuildModePanel.tsx
│   │   └── LifeAspectsHUD.tsx
│   └── ui/                # UI components (shadcn)
│       └── ErrorBoundary.tsx
│
├── features/
│   ├── engine/            # Game engine (collision, movement, grid)
│   ├── world/             # World rendering (GameCanvas, HUD, NPCs)
│   ├── agents/            # AI agents and pathfinding
│   ├── business/          # Business simulation
│   └── character/         # Player character
│
├── stores/                # Zustand state management
│   ├── lifeStore.ts       # 10 Life Aspects
│   ├── buildStore.ts      # Build mode state
│   └── gameStore.ts       # Game state
│
├── providers/             # React context providers
│   ├── HydrationProvider.tsx
│   └── index.tsx
│
├── data/
│   ├── assets/            # Furniture catalog
│   └── maps/              # Room layouts
│
└── types/                 # TypeScript definitions
    └── index.ts
```

## 🎯 10 Life Aspects

| # | Aspect | Description | Color |
|---|--------|-------------|-------|
| 1 | **Personal** | Personal Development | 🟣 Purple |
| 2 | **Career** | Career & Business | 🔵 Blue |
| 3 | **Finance** | Financial Health | 🟡 Yellow |
| 4 | **Physical** | Physical Health | 🟢 Green |
| 5 | **Mental** | Mental Health | 🩷 Pink |
| 6 | **Social** | Relationships | 🟠 Orange |
| 7 | **Spiritual** | Spiritual Well-being | 🔵 Cyan |
| 8 | **Intellectual** | Learning & Knowledge | 🟣 Violet |
| 9 | **Recreation** | Fun & Hobbies | 💗 Rose |
| 10 | **Environment** | Environment & Contribution | 🟢 Emerald |

## 🛠️ Tech Stack

### Core Framework
- **Next.js 16** - App Router with Turbopack
- **TypeScript 5** - Full type safety
- **Tailwind CSS 4** - Utility-first styling

### State Management
- **Zustand** - Simple, scalable state with persistence

### UI & Animation
- **shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Consistent iconography
- **Framer Motion** - Smooth animations

### AI Integration
- **Openclaw AI** - Chat with intelligent agents

## 📊 Development Progress

### ✅ Phase 1: Foundation (Complete)
- [x] Project setup with Next.js 16
- [x] Game canvas with grid system
- [x] Player movement and collision
- [x] Basic UI components

### ✅ Phase 2: Core Features (Complete)
- [x] Build mode system
- [x] Furniture placement
- [x] NPC/Agent system
- [x] AI chat integration
- [x] SVG assets creation

### ✅ Phase 3: Life Management (Complete)
- [x] 10 Life Aspects system
- [x] Furniture catalog (25+ items)
- [x] Activity rewards & achievements
- [x] Room presets save/load
- [x] Refactored architecture

### 🚧 Phase 4: Advanced Features (In Progress)
- [ ] Furniture interactions
- [ ] Data binding to external sources
- [ ] Mini-games per furniture type
- [ ] Social features

### 📅 Phase 5: Polish & Deploy
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Production deployment
- [ ] User testing

## 🎨 Screenshots

*Screenshots will be added as the project progresses*

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [State Management](./docs/stores.md)
- [Components Guide](./docs/components.md)
- [API Reference](./docs/api.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using [Z.ai](https://chat.z.ai) 🚀
