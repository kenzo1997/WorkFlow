# WorkFlow ⚡

A beautiful, cross-platform time tracking app built with React Native and Expo. Track your work sessions, manage projects, and analyze your productivity with a sleek, modern interface.

## Features

- ⏱️ **Smart Timer** - Start, pause, and track work sessions with precision
- 📊 **Project Management** - Organize your time across different projects
- 📈 **History & Analytics** - Review past sessions and track productivity trends
- 🎨 **Beautiful UI** - Modern design with dark theme and smooth animations
- 🔐 **Authentication** - Secure login powered by Supabase
- 📱 **Cross-Platform** - Works on iOS, Android, and Web

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and toolchain
- **Expo Router** - File-based navigation
- **Supabase** - Backend as a Service (Authentication & Database)
- **TypeScript** - Type-safe development
- **Lucide React Native** - Beautiful icon set
- **Expo Haptics** - Native haptic feedback

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your mobile device (for testing)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd workflow-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Supabase**
   - Create a [Supabase](https://supabase.com) account
   - Create a new project
   - Update `supabase.ts` with your credentials:
     ```typescript
     const supabaseUrl = 'YOUR_SUPABASE_URL';
     const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
     ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

## Running the App

### iOS
```bash
npm run ios
# or press 'i' in the Expo CLI
```

### Android
```bash
npm run android
# or press 'a' in the Expo CLI
```

### Web
```bash
npm run web
# or press 'w' in the Expo CLI
```

### Using Expo Go
1. Install [Expo Go](https://expo.dev/client) on your mobile device
2. Scan the QR code shown in the terminal
3. The app will load on your device

## Project Structure

```
workflow-app/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigation configuration
│   │   ├── index.tsx        # Main timer screen
│   │   ├── TimerScreen.tsx  # Timer component
│   │   ├── projects.tsx     # Projects management
│   │   ├── history.tsx      # Time tracking history
│   │   └── explore.tsx      # Additional features
│   └── AuthScreen.tsx       # Authentication screen
├── components/              # Reusable components
├── constants/              # App constants and themes
├── assets/                 # Images, fonts, and other assets
└── supabase.ts            # Supabase configuration
```

## Configuration

### Supabase Setup

The app uses Supabase for authentication and data storage. To configure:

1. **Authentication**
   - Enable Email authentication in your Supabase dashboard
   - Configure redirect URLs for your app

2. **Database Schema** (recommended tables)
   ```sql
   -- Users table (handled by Supabase Auth)
   
   -- Time entries table
   CREATE TABLE time_entries (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id),
     project_id UUID,
     start_time TIMESTAMP WITH TIME ZONE,
     end_time TIMESTAMP WITH TIME ZONE,
     duration INTEGER,
     description TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Projects table
   CREATE TABLE projects (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id),
     name TEXT NOT NULL,
     color TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### Environment Variables

For production, create a `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features in Detail

### Timer Screen
- Start/stop timer functionality
- Real-time duration display
- Project selection
- Session notes
- Haptic feedback on interactions

### Authentication
- Email/password login
- Account creation
- Secure session management
- Persistent login state

### Projects (Coming Soon)
- Create and manage projects
- Color-coded organization
- Project-based time tracking

### History (Coming Soon)
- View past time entries
- Daily/weekly/monthly summaries
- Export reports

## Development

### Adding New Screens

1. Create a new file in `app/(tabs)/`
2. Add the route to `_layout.tsx`
3. Implement your screen component

### Styling Guidelines

- Follow the existing dark theme color scheme
- Use consistent spacing (multiples of 4 or 8)
- Maintain haptic feedback for user interactions
- Test on both iOS and Android

### Code Style

- Use TypeScript for type safety
- Follow React hooks best practices
- Keep components modular and reusable
- Add comments for complex logic

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

### Web
```bash
npx expo export:web
```

## Troubleshooting

### Common Issues

**Supabase Connection Error**
- Verify your Supabase URL and API key
- Check network connectivity
- Ensure Supabase project is active

**Expo Go Connection Issues**
- Make sure your device and computer are on the same network
- Try restarting the Expo server
- Clear Expo cache: `npx expo start -c`

**Build Errors**
- Clear node modules: `rm -rf node_modules && npm install`
- Clear Expo cache: `npx expo start -c`
- Update Expo: `npm install expo@latest`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Expo](https://expo.dev/) for the amazing development platform
- [Supabase](https://supabase.com/) for backend infrastructure
- [Lucide](https://lucide.dev/) for beautiful icons
- [React Native](https://reactnative.dev/) community

## Support

For support, email your-email@example.com or open an issue in the repository.

## Roadmap

- [ ] Enhanced analytics and charts
- [ ] Calendar integration
- [ ] Team collaboration features
- [ ] Export to CSV/PDF
- [ ] Dark/Light theme toggle
- [ ] Pomodoro timer mode
- [ ] Offline mode support
- [ ] Push notifications
- [ ] Widget support

---

**Made with ⚡ by [Your Name]**
