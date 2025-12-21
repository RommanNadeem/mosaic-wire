# Setup Instructions for MosaicWire Frontend

## Important Note

This is a **JavaScript/Node.js project** (React + Vite), **NOT a Python project**. 
- ❌ Python virtual environments (venv) are NOT used here
- ✅ Node.js and npm are used instead

## Prerequisites

You need to have **Node.js** installed on your system. Node.js includes npm (Node Package Manager).

### Installing Node.js

#### Option 1: Using Homebrew (Recommended for macOS)

1. Install Homebrew (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install Node.js:
   ```bash
   brew install node
   ```

3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Option 2: Download from Official Website

1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Option 3: Using nvm (Node Version Manager)

1. Install nvm:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. Restart your terminal or run:
   ```bash
   source ~/.zshrc
   ```

3. Install Node.js:
   ```bash
   nvm install --lts
   nvm use --lts
   ```

## Project Setup Steps

Once Node.js is installed, follow these steps:

### 1. Navigate to Project Directory

```bash
cd /Users/romman/Downloads/MosaicWire-Frontend
```

### 2. Install Dependencies

This is similar to `pip install` in Python, but for JavaScript packages:

```bash
npm install
```

This will:
- Read `package.json` to determine required packages
- Download and install all dependencies to `node_modules/` folder
- Create `package-lock.json` (similar to `requirements.txt` in Python)

### 3. (Optional) Configure Supabase

If you want to use real data from Supabase, create a `.env` file:

```bash
# Create .env file
touch .env
```

Add your Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Note**: If you don't configure Supabase, the app will use sample data automatically.

### 4. Start the Development Server

```bash
npm run dev
```

This will:
- Start the Vite development server
- Usually run on `http://localhost:5173`
- Show the URL in the terminal output
- Automatically reload when you make changes

### 5. Open in Browser

Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Troubleshooting

### "command not found: node"

Node.js is not installed. Follow the installation steps above.

### "command not found: npm"

npm comes with Node.js. If you see this, Node.js installation may be incomplete. Reinstall Node.js.

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. Check the terminal output for the actual URL.

### Dependencies Installation Fails

Try:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Comparison: Python vs Node.js

| Python | Node.js (JavaScript) |
|--------|---------------------|
| `python -m venv venv` | Not needed (uses `node_modules/`) |
| `source venv/bin/activate` | Not needed |
| `pip install -r requirements.txt` | `npm install` |
| `python app.py` | `npm run dev` |
| `requirements.txt` | `package.json` + `package-lock.json` |

## Need Help?

- Check Node.js installation: `node --version` (should show v16+)
- Check npm installation: `npm --version`
- Check if dependencies are installed: `ls node_modules` (should show many folders)

