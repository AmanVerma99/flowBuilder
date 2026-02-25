import React from 'react'

// Draggable node item that can be dropped onto the React Flow canvas
export default function NodesPanel(){
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="nodes-panel">
      <h4>Nodes</h4>
      <div
        className="draggable-node"
        onDragStart={(e)=>onDragStart(e, 'textNode')}
        draggable
      >
        Message
      </div>
      <p className="hint">Drag & drop node onto canvas</p>
    </div>
  )
}
