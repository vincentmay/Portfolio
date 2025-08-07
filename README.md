# Portfolio

A modern, interactive portfolio website built with SvelteKit and Three.js, featuring a mesmerizing particle animation system that responds to user interactions and adapts to different screen sizes.

## ✨ Features

- **Interactive 3D Particle Animation**: Powered by Three.js with 1,000 animated particles
- **Dark/Light Mode Support**: Automatically adapts to user's system preferences
- **Responsive Design**: Optimized for all screen sizes and devices
- **Modern Tech Stack**: Built with SvelteKit, TypeScript, and Tailwind CSS
- **Performance Optimized**: Smooth 60fps animations with efficient rendering
- **Accessibility**: Follows modern web accessibility standards

## 🛠️ Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) - Modern web framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **3D Graphics**: [Three.js](https://threejs.org/) - 3D animation library
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast build tool and dev server
- **Code Quality**: ESLint + Prettier for code formatting and linting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/vincentmay/Portfolio.git
cd Portfolio
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or start and open in browser
npm run dev -- --open
```

The application will be available at `http://localhost:5173`

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint and Prettier checks
- `npm run format` - Format code with Prettier
- `npm run check` - Run Svelte type checking

### Project Structure

```
src/
├── lib/
│   ├── components/     # Svelte components
│   │   └── Canvas.svelte
│   ├── three/         # Three.js modules
│   │   ├── animate.ts
│   │   ├── particles.ts
│   │   └── scene.ts
│   └── assets/        # Static assets
├── routes/            # SvelteKit routes
│   ├── +layout.svelte
│   └── +page.svelte
└── app.html          # HTML template
```

## 🎨 Customization

### Particle System

The particle animation can be customized in `src/lib/three/particles.ts`:

- `particleCount`: Number of particles (default: 1,000)
- `speedMultiplier`: Animation speed (default: 100)
- `color`: Particle color (default: white)
- `size`: Particle size (default: 0.01)

### Styling

The project uses Tailwind CSS for styling. Customize colors, spacing, and themes in:

- `src/app.css` - Global styles
- `src/routes/tailwind.config.js` - Tailwind configuration

## 🚀 Deployment

### Building for Production

```bash
npm run build
```

The built application will be in the `.svelte-kit/output` directory.

### Deployment Options

This project can be deployed to various platforms:

- **Vercel**: Auto-deployment with zero configuration
- **Netlify**: Static site hosting with continuous deployment
- **GitHub Pages**: Free hosting for public repositories
- **Any static host**: Upload the build output

> **Note**: You may need to install a specific [SvelteKit adapter](https://svelte.dev/docs/kit/adapters) for your target platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) for the amazing 3D graphics library
- [SvelteKit](https://kit.svelte.dev/) for the excellent web framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first styling approach
