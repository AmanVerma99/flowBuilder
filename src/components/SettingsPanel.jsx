import React, { useState, useEffect } from 'react'

// Settings panel replaces nodes panel when a node is selected
// Allows editing node text and deleting the node
export default function SettingsPanel({ node, onChangeText, onDeleteNode }){
  const [text, setText] = useState(node.data?.text || '')

  useEffect(()=>{
    setText(node.data?.text || '')
  },[node])

  const onSave = ()=>{
    onChangeText(text)
  }

  const handleDelete = ()=>{
    if(window.confirm('Are you sure you want to delete this node? This will also remove all connected edges.')){
      onDeleteNode(node.id)
    }
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">Message</div>
      <label>Text</label>
      <textarea value={text} onChange={(e)=>setText(e.target.value)} />
      <button onClick={onSave}>Apply</button>
      <button onClick={handleDelete} style={{background:'#ef4444',color:'#fff',marginTop:'12px'}}>Delete Node</button>
    </div>
  )
}
