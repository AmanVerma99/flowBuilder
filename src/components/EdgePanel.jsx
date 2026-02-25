import React from 'react'

export default function EdgePanel({ edge, onDelete }){
  if(!edge) return null

  return (
    <div className="edge-panel">
      <div style={{fontWeight:600, marginBottom:8}}>Edge</div>
      <div style={{fontSize:13, marginBottom:12}}>From <strong>{edge.source}</strong> → To <strong>{edge.target}</strong></div>
      <button onClick={()=>onDelete(edge.id)} style={{background:'#ef4444',color:'#fff',border:'none',padding:'8px 10px',borderRadius:6,cursor:'pointer'}}>Delete Edge</button>
    </div>
  )
}
