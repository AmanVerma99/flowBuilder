import React, { useState, useEffect } from 'react'

// Settings panel replaces nodes panel when a node is selected
export default function SettingsPanel({ node, onChangeText }){
  const [text, setText] = useState(node.data?.text || '')

  useEffect(()=>{
    setText(node.data?.text || '')
  },[node])

  const onSave = ()=>{
    onChangeText(text)
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">Message</div>
      <label>Text</label>
      <textarea value={text} onChange={(e)=>setText(e.target.value)} />
      <button onClick={onSave}>Apply</button>
    </div>
  )
}
