# Tabbimate Brand & Design Guidelines

## Brand Colors

### Primary Colors
- **Tabbi Red**: `#BF3143`
  - Primary brand color
  - Used for: CTAs, primary buttons, logo accent, important actions
  - Hover state: `#a52938`

- **Dark Charcoal**: `#1A1A1A`
  - Primary text color
  - Used for: Headlines, main text content

### Secondary Colors
- **Dark Gray**: `#4A4A4A`
  - Subtitle and secondary heading text

- **Medium Gray**: `#6B7280`
  - Secondary text, descriptions, footer text

- **Light Gray Borders**: `#E5E5E5`, `#D1D1D6`
  - Borders, dividers, subtle separations

- **Off-White**: `#F7F7F8`
  - Hover states, subtle backgrounds

### Background & Gradients
- **Purple Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
  - Background decorative gradients (used sparingly)

- **White Overlays**:
  - `rgba(255, 255, 255, 0.95)` - Content containers
  - `rgba(255, 255, 255, 0.25)` - Subtle overlays

- **Dark Overlays**: `rgba(0, 0, 0, 0.05)` - Subtle shadows

## Button Styles

### Primary Button
```css
background: #BF3143;
color: white;
border: none;
padding: 14px 24px;
border-radius: 10px;
font-size: 15px;
font-weight: 600;
cursor: pointer;
box-shadow: 0 4px 12px rgba(191, 49, 67, 0.3);
transition: all 0.2s ease;
```

**Hover State:**
```css
background: #a52938;
transform: translateY(-2px);
box-shadow: 0 6px 16px rgba(191, 49, 67, 0.4);
```

### Secondary Button
```css
background: #F3F4F6;
color: #374151;
border: none;
padding: 14px 24px;
border-radius: 10px;
font-size: 15px;
font-weight: 600;
cursor: pointer;
transition: all 0.2s ease;
```

**Hover State:**
```css
background: #E5E7EB;
```

## Modal Design Pattern

### Structure
- **Overlay**: `rgba(0, 0, 0, 0.5)` at `z-index: 10000`
- **Container**: White background, `border-radius: 16px`, max-width: `420px`
- **Box Shadow**: `0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)`

### Modal Header
- **Background**: `#BF3143` (Tabbi Red)
- **Padding**: `32px 32px 24px`
- **Icon Container**:
  - White circular background (`64px` diameter)
  - Centered with margin-bottom: `16px`
  - Box shadow: `0 4px 6px -1px rgba(0,0,0,0.1)`
  - Icon stroke: `#BF3143`
- **Title**:
  - Color: white
  - Font-size: `22px`
  - Font-weight: `700`

### Modal Body
- **Padding**: `32px`
- **Text Color**: `#4B5563` (main message)
- **Secondary Text**: `#9CA3AF` at `14px`
- **Text Align**: Center
- **Line Height**: `1.6`

### Modal Footer
- **Padding**: `0 32px 32px`
- **Layout**: Flexbox with `gap: 12px`
- Buttons use standard primary/secondary styles

## Typography

### Font Weights
- Regular: `400`
- Medium: `500`
- Semi-bold: `600`
- Bold: `700`

### Font Sizes
- Headings: `22px`
- Body: `16px`
- Secondary: `14px` - `15px`
- Small: `12px`

### Line Heights
- Body text: `1.6`
- Headings: `1.2`

## Design Effects

### Glassmorphism
```css
backdrop-filter: blur(10px);
background: rgba(255, 255, 255, 0.95);
```

### Transitions
- Standard: `all 0.2s ease`
- Slower: `all 0.3s ease`

### Shadows
- Light: `0 2px 8px rgba(0, 0, 0, 0.1)`
- Medium: `0 4px 12px rgba(191, 49, 67, 0.3)` (for red elements)
- Heavy: `0 6px 30px rgba(0, 0, 0, 0.15)`

## Responsive Breakpoints
- Mobile: `max-width: 480px`
- Tablet: `max-width: 768px`

## Icon Style
- Stroke width: `2`
- Stroke linecap: `round`
- Stroke linejoin: `round`
- Size: `24px` - `32px` (context dependent)

## Dark Mode Colors

### Backgrounds
- **Primary Background**: `#1A1A1A` or `#1E1E1E` (main app background)
- **Secondary Background**: `#2A2A2A` or `#2D2D2D` (cards, containers)
- **Video Container**: `#2D2D2D` to `#333333` (video feed backgrounds)
- **Header Background**: `#2A2A2A` (top navigation bar)

### Text Colors (Dark Mode)
- **Primary Text**: `#FFFFFF` or `#F5F5F5` (headings, main content)
- **Secondary Text**: `#B0B0B0` or `#9CA3AF` (labels, descriptions)
- **Muted Text**: `#6B7280` (less important information)

### Buttons (Dark Mode)
- **Primary Button**: `#BF3143` (Tabbi Red - same as light mode)
  - Active state shown in screenshot with red highlight
- **Secondary Buttons**: Dark gray background `#3A3A3A` to `#404040`
  - Text: `#E5E5E5` or `#FFFFFF`
  - Border radius: `24px` to `32px` (pill-shaped)
  - Hover state: Slightly lighter `#454545`

### Control Buttons (Bottom Bar)
Based on the screenshot, the control bar buttons follow this pattern:
- **Default State**: `background: #3A3A3A` or similar dark gray
- **Active State**: `background: #BF3143` (Tabbi Red)
- **Button Shape**: Pill-shaped with rounded corners
- **Icons**: White color `#FFFFFF`
- **Text**: White color `#FFFFFF`

Example buttons shown:
- Video, Audio, Chat, Share: Dark gray background
- AI: Active state with Tabbi Red background `#BF3143`

### Borders & Dividers (Dark Mode)
- **Subtle Borders**: `#3A3A3A` to `#404040`
- **Stronger Borders**: `#4A4A4A`

### Overlays (Dark Mode)
- **Modal Overlay**: `rgba(0, 0, 0, 0.7)` to `rgba(0, 0, 0, 0.85)` (darker than light mode)

### Special Elements
- **Cool-down Timer**: Dark background with light text
- **Leave Button**: Tabbi Red `#BF3143` background with white text
- **Settings Icon**: Light color `#FFFFFF` or `#E5E5E5`

## DO NOT USE
- Blue colors (`#3B82F6`, etc.) - Not part of Tabbi brand
- Bright colors outside the defined palette
- Overly saturated colors
