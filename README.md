# BiteSpeed Chatbot Flow Builder

A modern, extensible chatbot flow builder built with **React** and **React Flow**. Drag-and-drop interface for creating conversational flows with connected message nodes.

---

## Demo

🔗 **Deployment Link:** [https://flow-builder-steel.vercel.app/]

---

## Overview

The BiteSpeed Flow Builder allows you to:
- Create chatbot conversations by connecting multiple message nodes
- Edit node text in real-time with a settings panel
- Validate flows before saving with intelligent validation rules
- Connect nodes with directional edges
- Delete edges to modify the flow structure

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:5173/`

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## Features

### Core Features
- ✅ **Text Nodes**: Create multiple message nodes in a single flow
- ✅ **Drag & Drop**: Drag `Message` nodes from the Nodes panel onto the canvas
- ✅ **Edges**: Connect nodes with directional edges (arrows)
- ✅ **Source Handles**: Each node has a right-side source handle that allows only one outgoing connection
- ✅ **Target Handles**: Each node has a left-side target handle that accepts multiple incoming connections
- ✅ **Settings Panel**: Click a node to edit its text content
- ✅ **Edge Updates**: Drag edge endpoints to reconnect them while respecting the single-outgoing rule
- ✅ **Edge Deletion**: Select an edge and delete it from the side panel
- ✅ **Flow Validation**: Save button prevents saving flows with multiple disconnected nodes

### Validation Rules
- Save fails if there are **2+ nodes** and **2+ nodes have no incoming edges**
- Single outgoing edge constraint: A source handle can only connect to one target
- All attempts to violate rules show clear error messages

---

## Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── NodesPanel.jsx       # Draggable node library
│   │   ├── SettingsPanel.jsx    # Node text editor
│   │   └── EdgePanel.jsx        # Edge selection & deletion
│   ├── App.jsx                  # Root component
│   ├── FlowBuilder.jsx          # Main flow builder logic
│   ├── main.jsx                 # Entry point
│   └── styles.css               # Global styles
├── index.html
├── package.json
├── vite.config.js               # Vite configuration
├── .gitignore
└── README.md
```

---

## How to Use

1. **Create Nodes**: 
   - Drag the `Message` node from the left panel onto the canvas
   - Create as many nodes as needed

2. **Edit Node Text**:
   - Click any node to select it
   - The Settings panel appears on the right
   - Edit the text and click `Apply`

3. **Connect Nodes**:
   - Click and drag from the right handle (source) of one node
   - Connect to the left handle (target) of another node
   - Only one outgoing edge per node is allowed

4. **Reconnect Edges**:
   - Drag an edge endpoint to connect it to a different node
   - Rules are still enforced during updates

5. **Delete Edges**:
   - Click an edge to select it
   - Click `Delete Edge` in the side panel

6. **Save Flow**:
   - Click `Save Changes` button
   - If validation fails, an error banner appears at the top
   - Fix the issues and try again

---

## Tech Stack

- **React 18**: UI framework
- **React Flow 11**: Flow builder library
- **Vite 5**: Build tool & dev server
- **CSS3**: Styling

---

## Future Enhancements

- [ ] Additional node types (conditions, delays, webhooks)
- [ ] Export/import flows as JSON
- [ ] Undo/redo functionality
- [ ] Flow history and versioning
- [ ] Mobile-friendly UI
- [ ] Dark mode

---

## Development

### Available Scripts

```bash
# Start dev server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
- All components include inline comments explaining key logic
- Extensible architecture for adding new node types
- Clear separation of concerns (components, state management)

---

## Contributing

Feel free to submit issues and enhancement requests!

---

## License

MIT

---

## Contact & Support

For questions or feedback about the BiteSpeed Flow Builder, please reach out.

**Deployment Link:** [Add your deployment URL here]
