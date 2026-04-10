# nanansm.github.io

Personal portfolio website built with HTML5, Tailwind CSS, and Vanilla JavaScript. Minimalist, high-end design inspired by [Jonah Lmadeya](https://www.jonahlmadeya.com).

## 🚀 Live Site

Visit: [https://nanansm.github.io](https://nanansm.github.io)

## 📁 Project Structure

```
nanansm.github.io/
├── index.html          # Main HTML file
├── css/
│   ├── main.css        # Custom styles
│   └── main-old.css    # Backup of old styles
├── js/
│   ├── main.js         # Animations & interactions
│   └── main-old.js     # Backup of old scripts
├── img/                # Images and assets
└── README.md           # This file
```

## 🎨 Design Features

- **Minimalist aesthetic** with clean typography (Inter font)
- **Responsive design** (mobile-first approach)
- **Smooth scroll** navigation
- **Fade-in animations** on scroll using Intersection Observer
- **2-column project grid** on desktop
- **Backdrop blur** navbar on scroll

## 🛠️ Technologies

- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript ES6+
- Google Fonts (Inter)

## 📝 How to Update Content

### Adding a New Project

1. Open `index.html`
2. Find the Work section (`<!-- Work Section -->`)
3. Copy an existing project card `<article>` block
4. Update the following fields:
   - `src`: Path to project image
   - `alt`: Image alt text
   - Project title in `<h3>`
   - Category and role text
   - Optional: Add `data-aos-delay` for staggered animation

### Updating Contact Information

Find the Contact section and update:
- Email address in `mailto:` link
- Social media links (LinkedIn, Instagram, GitHub)

### Changing Hero Text

Edit the Hero section heading and subheading to match your current focus.

## 🚀 Deployment

This site is deployed via GitHub Pages:

1. Push changes to the `main` branch
2. Go to GitHub Repo → Settings → Pages
3. Ensure Source is set to "Deploy from branch" → `main` / `(root)`
4. Changes will be live within 1-2 minutes

## ✅ Performance Checklist

- [x] Lazy loading images (`loading="lazy"`)
- [x] Semantic HTML structure
- [x] Accessible navigation (keyboard support)
- [x] Responsive breakpoints (320px - 1920px+)
- [x] Minimal external dependencies
- [x] Smooth animations with CSS transitions

## 📄 License

© 2024 Nanan SM. All rights reserved.
