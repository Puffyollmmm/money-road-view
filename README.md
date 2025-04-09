<div align="center">
  <img src="https://img.quotawish.com/i/2025/02/06/67a4509caefde.png" alt="MoneyRoad" width="600"/>

  <h3>Money Road, Your Financial Journey 🌍</h3>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![PNPM](https://img.shields.io/badge/pnpm-v9.15.4+-%23F69220)](https://pnpm.io/)
  ![Type: ESM](https://img.shields.io/badge/Module-ESM-brightgreen)

  **Next-generation Financial Management Platform**
</div>

---

## 🌟 Introduction

**MoneyRoad** is a modern financial management platform designed to revolutionize personal finance through three core components:

- **CMS**: Content Management System for financial data administration
- **View**: Frontend user interface
- **Ends**: API & backend services

**Live Demos**
📚 User Portal: [app.money.quotawish.com](https://app.money.quotawish.com)
🌐 Official Site: [money.quotawish.com](https://money.quotawish.com)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PNPM 9.15.4+

```bash
# Clone repository
git clone https://github.com/your-org/money-road.git
cd money-road

# Install dependencies
pnpm install
```

### Development Workflow
```bash
# Start CMS
pnpm dev:cms

# Start View Interface
pnpm dev:view

# Start Backend Services
pnpm dev:ends
```

### Production Builds
```bash
# Build all components
pnpm build:all

# Preview production builds
pnpm preview:cms
pnpm preview:view
pnpm preview:ends
```

---

## 🛠️ Project Architecture

```
money-road/app
├── app-cms/        # Content Management System
├── app-view/       # User Interface
└── app-ends/       # Backend Services & API
```

### Key Scripts
| Command               | Description                          |
|-----------------------|--------------------------------------|
| `pnpm lint:all`       | Run linter across all components     |
| `pnpm format:all`     | Format codebase                      |
| `pnpm test:all`       | Execute test suites                  |
| `pnpm clean:all`      | Remove build artifacts               |

---

## 🔧 Core Technologies

- Modern ESM architecture
- Monorepo pattern with PNPM workspaces
- Automated API generation (`openapi:*` scripts)
- Integrated code quality pipelines

---

## 🤝 Contribution Guidelines

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes
4. Push to branch
5. Open Pull Request

Ensure code quality by running:
```bash
pnpm format:all && pnpm lint:all && pnpm test:all
```

---

## 📜 License

Distributed under MIT License. See `LICENSE` for details.

---

<div align="center">
  <br/>
  Crafted with ❤️ by <a href="https://quotawish.com">QuotaWish</a> Team<br/>
  <sub>✨ Where Finance Meets Innovation</sub>
</div>