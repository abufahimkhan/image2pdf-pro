# Image2PDF Pro — Professional Desktop Layout Suite

Image2PDF Pro is a commercial-grade, secure, and lightning-fast desktop-first application built utilizing **React 19**, **Vite 6**, **TypeScript**, **Tailwind CSS**, and **Tauri v2**. It resolves the need for batch converting collections of images into polished, optimized, high-fidelity PDF documents.

By adopting **Zustand** for transient and session states, and **pdf-lib** combined with HTML5 Canvas layers for processing, Image2PDF Pro executes all conversion math locally. **Zero user file bytes ever leave the client machine**, ensuring supreme security and premium performance.

---

## 🎨 Professional UX/UI Showcase
- **Title Bar Integration**: Replicates high-fidelity desktop chrome complete with Traffic Light controls, interactive History log caches, and adaptive Light/Dark theme selectors.
- **Assembly Queue Grid**: View visual thumbnails together with individual source format badges, file size calculations, and high-DPI resolution metrics.
- **Native Reordering**: Seamlessly shuffle image positions using fluid native HTML5 Drag and Drop handlers or robust keyboard keycaps.
- **Responsive Option Panel**: Select standard document frame sizes (A4, A5, Letter, Legal, or match original pixel grids), apply orientation overrides, define custom spacing margins, adjust compression qualities, and stamp watermark copy overlays.
- **IFrame PDF Preview**: Upon compile completion, a fully interactive embedded miniature frame provides an instantly scrollable live PDF preview alongside instant download triggers and celebration confetti.

---

## ⚡ Keyboard Navigation & Shortcuts
Navigate your assembly workspace with extreme precision using specialized desktop arrow binds:
- **`Ctrl + A`** / **`⌘ + A`**: Select all items in the assembly queue.
- **`ArrowRight` / `ArrowLeft` / `ArrowUp` / `ArrowDown`**: Move focused selection frame across the image grid.
- **`Shift + Mouse Click`**: Support elastic range/multi-select adjustments.
- **`Backspace` / `Delete`**: Bulk delete all currently selected/focused elements.
- **`Shift + [`** / **`PageUp`**: Shift highlighted image(s) backward inside the layout assembly.
- **`Shift + ]`** / **`PageDown`**: Shift highlighted image(s) forward inside the layout assembly.
- **`Escape`**: Dismiss active floating modal dialogs.

---

## ⚙️ Technical Architecture

```
/
├─ src/
│  ├─ types.ts                 # Type contracts, Margin coordinates, and Watermark structures
│  ├─ store.ts                 # Zustand state engine (theme persistence, queue operations, and history logs)
│  ├─ App.tsx                  # Core Application driver, layout partitions, and global shortcuts.
│  ├─ utils/
│  │  └─ pdfGenerator.ts       # Offscreen Canvas processors & pdf-lib vector compilation algorithms
│  └─ buy components/         # TitleBar, ImageDropzone, ImageGrid, SidebarOptions, SuccessDialog, etc.
├─ src-tauri/
│  ├─ tauri.conf.json          # Tauri v2 bundler, NSIS installer, executable rules, and file mappings
│  ├─ Cargo.toml               # Rust compiler package lists
│  ├─ build.rs                 # Tauri compilation builder script hook
│  └─ src/
│     └─ main.rs               # Rust window broker bootstrapper
└─ package.json                # Runtime dependencies and build scripts
```

---

## 🚀 Local Build & Run Instructions

To test or run the application locally in development mode:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Boot the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

3. **Production Web Compilation**:
   ```bash
   npm run build
   ```

---

## 📦 Native Desktop Compilation (Tauri v2 Boilerplate)

The project includes pre-configured v2 desktop bundler definitions inside `/src-tauri`. To package this application as a standalone executable (`Image2PDF.exe`) and installation wizard (`Image2PDF Setup.exe`):

### Prerequisites
- **Rust Compiler**: Ensure `rustc` and `cargo` are installed. (On Windows, ensure you have the C++ Build Tools installed).
- **Tauri CLI**: Installed globally or via npm package scripts.

### Build Executables

1. **Install Native Tools**:
   ```bash
   npm install @tauri-apps/cli -D
   ```

2. **Compile Installer (WiX / NSIS)**:
   - For a standalone single application executable (`Image2PDF.exe`):
     ```bash
     npx tauri build
     ```
   This will output:
   - **Standalone Executable**: `/src-tauri/target/release/Image2PDF.exe`
   - **NSIS Setup Wizard**: `/src-tauri/target/release/bundle/nsis/Image2PDF Setup.exe`

### Custom Installer Registrations (NSIS Bundler settings matching request)
The setup installer configuration inside `/src-tauri/tauri.conf.json` enforces:
- **Registry Directories**: Installs directly into `C:\Program Files\Image2PDF Pro`.
- **System Shortcuts**: Automatically creates a professional Desktop Shortcut and a Start Menu Shortcut on Windows.
- **Complete Uninstallation support**: Registers an uninstaller in Windows Add/Remove programs cleanly.
- **Application Icon**: Places `icon.ico` assets onto launcher bars and taskbar frames seamlessly.
# image2pdf-pro
