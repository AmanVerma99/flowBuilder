# BiteSpeed Chatbot Flow Builder

Simple React + React Flow implementation for the BiteSpeed frontend task.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

Features implemented

- Drag & drop `Message` node from the Nodes panel onto the canvas.
- Multiple Text Nodes allowed.
- Connect nodes with edges.
- Source handle allows only one outgoing edge; attempts to add more will show an alert.
- Target handle allows multiple incoming edges.
- Settings panel replaces Nodes panel when a node is selected; edit node text there and click Apply.
- Save button validates: if there is more than one node and more than one node has no incoming connection, save is blocked.

Notes

- This is a small example scaffold built with Vite. Adjust versions in `package.json` as needed.
