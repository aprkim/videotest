# TabbiMate 🌍💬

**Live Language Practice Platform with AI Coach**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://aprkim.github.io/tabbimate/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](VERSION.md)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Overview

TabbiMate is a live language-practice platform that connects learners worldwide for real-time video conversations. With an integrated AI language coach, users get instant corrections, translations, and conversation suggestions while practicing with native speakers and fellow learners.

![TabbiMate Interface](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

## ✨ Key Features

### 🗺️ Interactive World Map
- Live user dots showing active learners worldwide
- Hover tooltips with user profiles
- Smooth animated background
- Filter by selected language

### 🎯 Smart Matching System
- **4 Practice Levels**: Basic (3 min), Intermediate (15 min), Professional (30 min), Native (30 min)
- Level-based matching algorithm
- Native speaker option for each language
- User proficiency awareness

### 🤖 AI Language Coach
- **Quick Actions**: Correct, Translate, Suggest
- Context-aware responses (knows your level, language, partner)
- Conversation history management
- Loading states and error handling
- Pop-out window for dual monitors

### 💬 Video Chat Interface
- Split-screen video layout
- Timer with automatic session tracking
- Video/Audio toggle controls
- Screen sharing (ready for implementation)
- Message channel for text chat

### 🎨 User Experience
- Draggable UI components
- Mobile-responsive design
- TabbiMate brand color palette
- Custom modal dialogs
- Confetti celebration on completion
- User favorites with localStorage
- Session guidelines and help menu

## 🛠️ Technical Stack

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with CSS animations
- **Graphics**: SVG icons and world map
- **Storage**: localStorage for client-side data
- **API**: Fetch API for backend communication
- **Dependencies**: None (except canvas-confetti CDN)

## 🎯 Supported Languages

- 🇺🇸 English
- 🇪🇸 Spanish
- 🇰🇷 Korean
- 🇯🇵 Japanese
- 🇵🇭 Filipino
- 🇮🇳 Hindi

*More languages can be added via the "Request a new language" form*

## 🚀 Quick Start

### Option 1: View Live Demo
Visit **[https://aprkim.github.io/tabbimate/](https://aprkim.github.io/tabbimate/)**

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/aprkim/tabbimate.git
cd tabbimate

# Start a local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

### Option 3: Fork and Customize
1. Click "Fork" on GitHub
2. Clone your fork
3. Customize user data, colors, languages
4. Deploy to GitHub Pages or your own server

## 📖 Documentation

- **[AI_COACH_IMPLEMENTATION.md](AI_COACH_IMPLEMENTATION.md)**: Complete AI coach technical documentation
- **[VERSION.md](VERSION.md)**: Version history and forking instructions
- **Code Comments**: Extensive inline documentation in all files

## 🎨 Design System

### Brand Colors
```css
Primary:     #BF3143  /* Tabbi Red */
Backgrounds: #FFFFFF, #F7F7F8, #E5E5E7
Text:        #4A4A4D, #111214
Accent:      #EEF2F5
Success:     #41B883
Error:       #D64545
```

### Typography
- Font Family: `Inter` (Google Fonts)
- Weights: 400, 500, 600, 700

## 🔌 Backend Integration

The app works standalone with fallback responses. To enable full AI features:

### Required API Endpoint
```
POST /api/ai-chat
```

**Request:**
```json
{
  "systemPrompt": "string",
  "messages": [
    { "role": "user|assistant|system", "content": "string" }
  ],
  "action": "correct|translate|suggest|general"
}
```

**Response:**
```json
{
  "content": "string"
}
```

See [AI_COACH_IMPLEMENTATION.md](AI_COACH_IMPLEMENTATION.md) for complete backend specs.

## 📁 Project Structure

```
tabbimate/
├── index.html                    # Main page structure
├── styles.css                    # All styling and animations
├── script.js                     # Core functionality (1900+ lines)
├── map.svg                       # World map vector graphic
├── favicon.svg                   # TabbiMate branding icon
├── .nojekyll                     # GitHub Pages configuration
├── AI_COACH_IMPLEMENTATION.md    # AI coach documentation
├── VERSION.md                    # Version history & forking guide
└── README.md                     # This file
```

## 🎮 Usage Flow

1. **Select Language**: Choose which language to practice
2. **Select Level**: Pick your proficiency level or "Talk with Native"
3. **Get Matched**: System finds a suitable practice partner
4. **Video Chat**: Practice speaking with timer countdown
5. **AI Coach**: Get help with corrections, translations, suggestions
6. **Text Chat**: Send messages during the session
7. **Complete**: Session ends with confetti celebration
8. **Favorite**: Star users to match with them again

## 🌟 Features in Detail

### World Map Animation
- 120-second smooth horizontal scroll
- Seamless looping (continuous rotation)
- User dots move with the map
- Grayscale styling with subtle opacity

### User Profiles
- 20 sample users across different countries
- Multiple language proficiencies per user
- Interest tags (Parenting, AI, Music, etc.)
- Realistic geo-locations

### Matching Logic
- Same language + Same level matching
- Native speaker matching for "Talk with Native"
- Level-appropriate button disabling
- Guest mode (all buttons active when level unknown)

### AI Coach Features
- **Correct**: Paste sentence → Get corrected version + explanation
- **Translate**: Enter phrase → Get translation + pronunciation
- **Suggest**: Get 2-3 relevant conversation starters
- **Chat**: Free-form language learning questions

### Data Persistence
- User favorites saved to localStorage
- Language requests saved locally
- Session count tracking
- Date stamps for all saved data

## 🔧 Customization

### Add New Users
Edit `script.js` line 10-229:
```javascript
const users = [
  {
    name: "YourName",
    location: { top: "40%", left: "50%" },
    languages: {
      english: "Professional",
      spanish: "Basic"
    },
    interests: ["Travel", "Tech"]
  },
  // ... more users
];
```

### Add New Languages
1. Add language to selection screen in `index.html`
2. Update user language data in `script.js`
3. Update matching logic if needed

### Change Branding
Update colors in `styles.css`:
```css
:root {
  --primary-color: #BF3143;
  --background: #FFFFFF;
  /* ... more variables */
}
```

## 🐛 Known Limitations

- AI features require backend (fallback mode available)
- Video/audio are placeholders (WebRTC needed)
- Screen sharing needs implementation
- User authentication not included
- Matchmaking is simulated

## 🚀 Production Roadmap

### Phase 1: Backend Integration
- [ ] Implement AI chat endpoint
- [ ] Add user authentication
- [ ] Set up database
- [ ] Implement real matchmaking

### Phase 2: Real-Time Features
- [ ] WebRTC video/audio
- [ ] Real-time text messaging
- [ ] Screen sharing
- [ ] Connection quality indicators

### Phase 3: Advanced Features
- [ ] Voice input/output
- [ ] Progress tracking
- [ ] Vocabulary flashcards
- [ ] Session recordings
- [ ] Analytics dashboard

### Phase 4: Scale & Polish
- [ ] Payment system
- [ ] Mobile apps
- [ ] More languages
- [ ] Performance optimization
- [ ] GDPR compliance

## 🤝 Contributing

This is a prototype/demo project. If you fork it:
1. Star the original repository
2. Give credit to TabbiMate/Tabbi AI
3. Share improvements back via pull requests

## 📝 License

MIT License - feel free to use this for learning or as a foundation for your own project.

## 🙏 Credits

- **Design Inspiration**: Tabbi AI (https://tabbi.ai)
- **World Map**: Extracted from Tabbi AI "Test Your English Ears"
- **Confetti**: canvas-confetti library
- **Icons**: Custom SVG designs

## 📞 Support

- 🐛 Report issues: [GitHub Issues](https://github.com/aprkim/tabbimate/issues)
- 📖 Documentation: See [AI_COACH_IMPLEMENTATION.md](AI_COACH_IMPLEMENTATION.md)
- 💬 Questions: Open a discussion on GitHub

---

**Built with ❤️ for language learners worldwide**

*Last Updated: December 11, 2025*
