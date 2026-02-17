# SVG Icons Usage Guide

This document explains how to use and customize SVG icons in the Kanban Board project.

## 📁 Icon Files

All SVG icons are located in the `icons/` directory:

### Available Icons

| Icon | File | Use Case |
|------|------|----------|
| Plus/Add | `add.svg` | Add new tasks |
| Edit | `edit.svg` | Edit existing tasks |
| Trash/Delete | `delete.svg` | Delete tasks |
| Undo | `undo.svg` | Undo last action |
| Redo | `redo.svg` | Redo action |
| Chart/Stats | `stats.svg` | Show board statistics |
| Download | `download.svg` | Export board data |
| Upload | `upload.svg` | Import board data |
| Search | `search.svg` | Search functionality |
| Menu | `menu.svg` | Navigation menu |
| Calendar | `calendar.svg` | Date fields |
| Alert | `alert.svg` | Warning messages |
| Check | `check.svg` | Success indicator |
| Close | `close.svg` | Close/Cancel action |

## 🎨 Using SVG Icons

### Method 1: Direct SVG in HTML

```html
<button class="icon-btn">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
</button>
```

### Method 2: Import SVG as Background Image

```css
.add-button {
    background-image: url('icons/add.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}
```

### Method 3: Using SVG Sprites

Create a sprite file combining all icons:

```html
<svg style="display: none;">
    <defs>
        <symbol id="icon-add">
            <!-- Add SVG content here -->
        </symbol>
    </defs>
</svg>

<!-- Use with: -->
<svg class="icon">
    <use xlink:href="#icon-add"></use>
</svg>
```

## 🎯 Icon Sizing

### CSS Classes for Size

```css
.icon.sm     /* Small: 16px */
.icon.md     /* Medium: 24px (default) */
.icon.lg     /* Large: 32px */
```

### Example Usage

```html
<span class="icon sm">
    <img src="icons/add.svg" alt="Add" />
</span>

<span class="icon">
    <img src="icons/edit.svg" alt="Edit" />
</span>

<span class="icon lg">
    <img src="icons/stats.svg" alt="Statistics" />
</span>
```

## 🎨 Icon Colors

### Using CSS Color Variables

```html
<svg class="icon icon-success" viewBox="0 0 24 24">
    <!-- Icon content -->
</svg>
```

### Available Color Classes

```css
.icon-success    /* Green - #4caf50 */
.icon-warning    /* Orange - #ff9800 */
.icon-danger     /* Red - #f44336 */
.icon-info       /* Cyan - #00d4ff */
.icon-primary    /* Primary color */
.icon-secondary  /* Secondary color */
```

## 💡 Tips and Best Practices

### 1. Use `currentColor`
This allows the icon color to inherit from text color or CSS:

```html
<!-- Icon will inherit button's text color -->
<button style="color: blue;">
    <svg stroke="currentColor">
        <!-- Icon -->
    </svg>
</button>
```

### 2. Accessibility
Always add alt text or aria-labels:

```html
<button title="Add Task">
    <svg aria-label="Add Task">
        <!-- Icon -->
    </svg>
</button>
```

### 3. Responsive Icons
Use CSS variables for responsive sizing:

```css
@media (max-width: 768px) {
    --icon-size-md: 20px;
}
```

### 4. Animation
Apply smooth animations to icons:

```css
.icon-pulse {
    animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}
```

## 🔄 Creating Custom Icons

### Requirements
- 24x24 viewBox (standard size)
- Stroke width of 2
- Use `stroke="currentColor"` for dynamic colors
- Include proper padding in viewBox

### Example Template

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" 
     stroke="currentColor" stroke-width="2" stroke-linecap="round" 
     stroke-linejoin="round">
  <!-- Your icon path here -->
</svg>
```

### Icon Design Guidelines
1. **Simplicity**: Keep icons simple and recognizable
2. **Consistency**: Match stroke width and style across all icons
3. **Spacing**: Leave adequate padding around the icon
4. **Clarity**: Ensure icons are clear at small sizes (16px)
5. **Accessibility**: Use meaningful paths and consider contrast

## 📝 Adding New Icons

### Steps to Add a New Icon

1. Create the SVG file in `icons/` directory
2. Use the standard 24x24 viewBox
3. Use `stroke="currentColor"` for consistency
4. Update this documentation
5. Add to the icon list above

### Example

```bash
# Create new icon
cat > icons/my-icon.svg << 'EOF'
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" 
     stroke="currentColor" stroke-width="2" stroke-linecap="round" 
     stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"></circle>
</svg>
EOF
```

## 🚀 Performance Tips

### 1. Optimize SVG Files
Use an SVG optimizer to reduce file size:

```bash
# Using SVGO (if installed)
svgo icons/*.svg
```

### 2. Inline Critical Icons
For frequently used icons, consider inlining them in HTML

### 3. Use CSS for Styling
Avoid inline styles - use CSS classes for better performance:

```css
.btn-icon {
    color: #00d4ff;
    transition: color 0.3s ease;
}

.btn-icon:hover {
    color: #0099cc;
}
```

## 🔗 Icon Libraries Reference

If you need more icons, consider these resources:
- [Feather Icons](https://feathericons.com/) - Minimal icon set
- [Heroicons](https://heroicons.com/) - Modern icon set
- [Tabler Icons](https://tabler-icons.io/) - 5000+ icons
- [Material Design Icons](https://fonts.google.com/icons) - Google's collection

All icons should follow the same style (24x24 viewBox, stroke-based, etc.)

## 📞 Troubleshooting

### Icons Not Showing
- Check file path is correct
- Verify SVG file syntax
- Check browser console for 404 errors
- Ensure server is serving SVG files correctly

### Icons Look Blurry
- Use viewBox instead of fixed width/height
- Ensure viewBox is "0 0 24 24"
- Use vector graphics, not raster images

### Colors Not Changing
- Use `stroke="currentColor"` instead of hardcoded colors
- Check CSS color classes are applied
- Remove fill attributes if not needed

### Animation Jittery
- Use transform instead of left/top properties
- Use will-change on animated elements sparingly
- Check for conflicting CSS transitions

---

**Last Updated: February 2026**
**Icon System Version: 1.0**
