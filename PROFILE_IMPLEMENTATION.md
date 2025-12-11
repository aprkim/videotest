# User Profile Page Implementation

## Overview
A comprehensive user profile management page for TabbiMate that allows users to create and edit their profile with languages, interests, location, and profile photo.

## Tech Stack
- **Framework**: Vanilla JavaScript (no framework)
- **Styling**: CSS3 with custom styles matching TabbiMate design system
- **Storage**: LocalStorage for client-side persistence
- **Routing**: Simple HTML page routing (`profile.html`)

## Files Created

### 1. `profile.html`
Main profile page HTML with:
- Profile photo upload section
- Location inputs (city, country)
- Languages management with match toggle
- Interests tags (max 3)
- Responsive layout with draggable card

### 2. `profile.js`
JavaScript logic for profile management:
- LocalStorage persistence (`tabbimate_profile_v1` key)
- Photo upload with FileReader API
- Dynamic language list rendering
- Interest tag management
- Auto-save on every change
- Card dragging functionality
- Form validation

### 3. `profile.css`
Profile-specific styles including:
- Profile photo upload UI
- Toggle switches for language matching
- Interest tag chips
- Form inputs and buttons
- Save status indicator
- Mobile-responsive design

### 4. Modified Files
- `index.html`: Added profile link icon in header
- `styles.css`: Added styles for profile link and header layout

## Data Structure

### Profile Object
```javascript
{
  languages: [
    { 
      id: "unique-id",      // Generated UUID
      name: "English",       // Language name
      match: true           // Whether to use for matching
    }
  ],
  interests: ["Cooking", "Travel"],  // Max 3 items
  location: {
    city: "San Francisco",
    country: "United States"
  },
  photoUrl: "data:image/jpeg;base64,..."  // Optional Data URL
}
```

## Key Features

### 1. Profile Photo
- **Upload**: File input with image type validation
- **Preview**: Circular avatar display
- **Storage**: Data URL stored in localStorage (max 5MB file size)
- **Remove**: Option to remove uploaded photo
- **Default**: Placeholder icon when no photo

### 2. Location
- **City**: Text input for city name
- **Country**: Text input for country name
- **Auto-save**: Saves on input change

### 3. Languages
- **Add**: Text input + Add button
- **Match Toggle**: ON/OFF switch for matching algorithm
  - **ON** (green): Language used for finding partners
  - **OFF** (gray): Language saved but not used for matching
- **Remove**: Delete button for each language
- **Validation**: Prevents duplicate languages

**Example Use Case**:
> April speaks Korean but doesn't want to be matched as a Korean native speaker.
> She adds "Korean" and toggles "Use for matching" OFF.

### 4. Interests
- **Add**: Text input + Add button
- **Limit**: Maximum 3 interests
- **Display**: Colored tag chips with remove button
- **Counter**: Shows current count (e.g., "2/3 interests")
- **Validation**: Prevents duplicates and enforces max limit

## Navigation

### To Profile Page
1. From home page: Click the profile icon (person icon) in the top-right of the card
2. Direct URL: `https://aprkim.github.io/tabbimate/profile.html`

### From Profile Page
- Click the back arrow (←) to return to home page

## Usage Guide

### Running the App
1. Open `https://aprkim.github.io/tabbimate/`
2. Click the profile icon in the header
3. OR navigate directly to `https://aprkim.github.io/tabbimate/profile.html`

### Testing Features

#### Profile Photo
1. Click "Upload Photo" button
2. Select an image file (JPEG, PNG, etc.)
3. Photo appears immediately in circular preview
4. Click "Remove Photo" to delete

#### Location
1. Type city name in first input
2. Type country name in second input
3. Changes save automatically

#### Languages
1. Type language name (e.g., "Spanish")
2. Click "Add" or press Enter
3. Language appears in list with toggle ON by default
4. Click toggle to turn matching ON/OFF
5. Click X icon to remove language

#### Interests
1. Type interest (e.g., "Cooking")
2. Click "Add" or press Enter
3. Interest appears as colored tag
4. Add up to 3 interests
5. Click X on tag to remove

### Auto-Save
- All changes are **automatically saved** to localStorage
- Green "Changes saved" notification appears bottom-right
- No manual save button needed
- Data persists across browser sessions

## Design Consistency

### Colors (TabbiMate Palette)
- **Primary Red**: `#BF3143` (Tabbi Red)
- **Hover Red**: `#a02838`
- **Success Green**: `#4CAF50`
- **Background**: `#FAFAFA`
- **Card Background**: `white`
- **Borders**: `#E0E0E0`, `#E8E8E8`

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Components
- Matches existing TabbiMate button styles
- Same draggable card behavior
- Consistent spacing and shadows
- Mobile-first responsive design

## Mobile Optimization
- Touch-friendly button sizes (min 44px)
- Responsive layout (single column on mobile)
- Draggable card works on touch devices
- Compact toggle labels on small screens
- Scrollable card content for long forms

## Future Enhancements
1. **Backend Integration**: Replace localStorage with API calls
2. **Image Optimization**: Compress photos before storing
3. **Validation**: Add more robust form validation
4. **Profile Completion**: Show progress indicator
5. **Matching Algorithm**: Use profile data for smarter matching
6. **Avatar Library**: Default avatar options instead of placeholder
7. **Social Links**: Add optional social media links
8. **Bio Section**: Free-text about me section

## Code Organization

### Modularity
```
profile.js
├── Initialization (init)
├── LocalStorage (loadProfile, saveProfile)
├── Event Handlers (setupEventListeners)
├── Photo Management (handlePhotoUpload, removePhoto)
├── Location (handleLocationChange)
├── Languages (addLanguage, removeLanguage, toggleLanguageMatch, renderLanguages)
├── Interests (addInterest, removeInterest, renderInterests)
└── Utilities (generateId, escapeHtml, setupCardDragging)
```

### Security
- **XSS Prevention**: HTML escaping for user input
- **File Validation**: Type and size checks for photos
- **Input Sanitization**: Trim whitespace, prevent empty entries

## Browser Support
- Modern browsers with ES6+ support
- LocalStorage API required
- FileReader API for photo upload
- CSS Grid and Flexbox for layout

## Storage Limits
- **LocalStorage**: ~5-10MB depending on browser
- **Photo Size**: Limited to 5MB per image
- **Data Format**: JSON string in localStorage

## Debugging

### Check Profile Data
```javascript
// In browser console
JSON.parse(localStorage.getItem('tabbimate_profile_v1'))
```

### Clear Profile Data
```javascript
// In browser console
localStorage.removeItem('tabbimate_profile_v1')
```

### Reset Everything
```javascript
// In browser console
localStorage.clear()
```

## API Reference

### Key Functions

#### `loadProfile()`
Loads profile from localStorage and populates UI

#### `saveProfile()`
Saves current profile state to localStorage and shows confirmation

#### `addLanguage()`
Adds new language to profile with validation

#### `toggleLanguageMatch(id)`
Toggles the match status for a specific language

#### `addInterest()`
Adds new interest with max 3 limit and validation

#### `handlePhotoUpload(event)`
Processes photo upload and converts to Data URL

## Testing Checklist
- [ ] Upload profile photo
- [ ] Remove profile photo
- [ ] Enter city and country
- [ ] Add multiple languages
- [ ] Toggle language matching ON/OFF
- [ ] Remove languages
- [ ] Add 3 interests
- [ ] Try adding 4th interest (should be blocked)
- [ ] Remove interests
- [ ] Check data persists after page refresh
- [ ] Test on mobile device
- [ ] Drag card around screen
- [ ] Navigate back to home page

## Deployment
✅ Already deployed to GitHub Pages at:
- Main page: `https://aprkim.github.io/tabbimate/`
- Profile page: `https://aprkim.github.io/tabbimate/profile.html`

---

**Status**: ✅ Complete and deployed
**Version**: 1.0.0
**Last Updated**: December 11, 2025

