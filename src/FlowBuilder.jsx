import React, { useCallback, useState, useRef, useEffect } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from 'reactflow'
import NodesPanel from './components/NodesPanel'
import SettingsPanel from './components/SettingsPanel'
import EdgePanel from './components/EdgePanel'

// A simple text node renderer

function TextNode({ data, id }){
  // Custom node rendering: left target handle, right source handle
  return (
    <div className="text-node">
      <Handle type="target" position={Position.Left} id={`target_${id}`} style={{ background: '#555' }} />
      <div style={{paddingLeft:12, paddingRight:12}}>
        <div className="node-header">Send Message</div>
        <div className="node-body">{data.text}</div>
      </div>
      <Handle type="source" position={Position.Right} id={`source_${id}`} style={{ right: -8, background: '#111' }} />
    </div>
  )
}

const nodeTypes = { textNode: TextNode }

export default function FlowBuilder(){
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [rfInstance, setRfInstance] = useState(null)
  const [saveError, setSaveError] = useState('')

  // incrementing id generator
  const idRef = useRef(1)
  const nextId = useCallback(()=>`node_${idRef.current++}`,[idRef])

  // localStorage key for persisting flow state
  const STORAGE_KEY = 'bitespeed_flow_state'

  // Save flow state to localStorage
  const saveToLocalStorage = useCallback((nodesData, edgesData) => {
    try {
      const state = { nodes: nodesData, edges: edgesData }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save flow to localStorage:', error)
    }
  }, [])

  // Load flow state from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const state = JSON.parse(saved)
        // Update nodeRef id counter based on loaded nodes
        const maxId = state.nodes.reduce((max, n) => {
          const numPart = parseInt(n.id.replace('node_', ''))
          return Math.max(max, numPart + 1)
        }, 1)
        idRef.current = maxId
        return state
      }
    } catch (error) {
      console.error('Failed to load flow from localStorage:', error)
    }
    return null
  }, [])

  // Initialize: load from localStorage or use sample nodes
  useEffect(()=>{
    const savedState = loadFromLocalStorage()
    if (savedState && savedState.nodes.length > 0) {
      setNodes(savedState.nodes)
      setEdges(savedState.edges)
    } else {
      // Default sample nodes if nothing in localStorage
      const n1 = { id: nextId(), type: 'textNode', position: { x: 50, y: 50 }, data: { text: 'test message 1' } }
      const n2 = { id: nextId(), type: 'textNode', position: { x: 350, y: 50 }, data: { text: 'test message 2' } }
      setNodes([n1,n2])
    }
  },[])

  // Clear error banner when nodes/edges change (user is fixing the flow to resolve the validation error)
  useEffect(()=>{
    if(saveError){
      setSaveError('')
    }
  },[nodes, edges])

  // count outgoing edges for a node
  const outgoingCount = useCallback((nodeId)=> edges.filter(e=>e.source===nodeId).length,[edges])

  // Handle new connections: enforce single outgoing edge per source handle
  // IMPORTANT: Multiple incoming edges per target handle are ALLOWED
  const onConnect = useCallback((params) => {
    const src = params.source
    // Only check source constraint: one outgoing edge max
    if(outgoingCount(src) >= 1){
      alert('A source handle can only have one outgoing connection')
      return
    }
    // Target can receive multiple edges (no validation needed for target)
    setEdges((eds)=> {
      const newEdges = addEdge(params, eds)
      // Save explicitly after adding edge
      saveToLocalStorage(nodes, newEdges)
      return newEdges
    })
  },[outgoingCount, setEdges, nodes, saveToLocalStorage])

  // Allow updating/reconnecting existing edges by dragging endpoints
  // IMPORTANT: Constraint is only on source handle (max 1 outgoing per source)
  // Target handles can receive multiple incoming edges freely
  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    const newSource = newConnection.source
    // count outgoing edges for the new source excluding the edge being updated
    const outgoingFromNewSource = edges.filter(e => e.source === newSource && e.id !== oldEdge.id).length
    if(outgoingFromNewSource >= 1){
      alert('A source handle can only have one outgoing connection')
      return
    }
    // No validation on target - multiple incoming edges allowed
    setEdges((eds) => {
      const updated = eds.map(e => e.id === oldEdge.id ? { ...e, ...newConnection } : e)
      // Save explicitly after updating edge
      saveToLocalStorage(nodes, updated)
      return updated
    })
  }, [edges, setEdges, nodes, saveToLocalStorage])

  // handle node selection
  const onSelectionChange = useCallback((selection)=>{
    const node = selection && selection.nodes && selection.nodes[0]
    const edge = selection && selection.edges && selection.edges[0]
    setSelectedNode(node || null)
    setSelectedEdge(edge || null)
  },[])

  // drop from nodes panel
  const onDrop = useCallback((event) => {
    event.preventDefault()
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
    const type = event.dataTransfer.getData('application/reactflow')
    if(!type) return
    const position = rfInstance.project({ x: event.clientX - reactFlowBounds.left, y: event.clientY - reactFlowBounds.top })
    const newNode = { id: nextId(), type, position, data: { text: 'textNode' } }
    setNodes((nds)=> {
      const updated = nds.concat(newNode)
      // Save explicitly after adding new node
      saveToLocalStorage(updated, edges)
      return updated
    })
  },[rfInstance, nextId, edges, saveToLocalStorage])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  },[])

  // update text of selected node from settings panel
  const updateSelectedNodeText = useCallback((text)=>{
    setNodes((nds)=> {
      const updated = nds.map(n=> n.id===selectedNode.id ? { ...n, data: { ...n.data, text } } : n)
      // Save explicitly after updating node text
      saveToLocalStorage(updated, edges)
      return updated
    })
    // keep selectedNode in sync with updated nodes so SettingsPanel shows latest
    setSelectedNode((prev)=> prev ? { ...prev, data: { ...prev.data, text } } : prev)
  },[selectedNode, setNodes, edges, saveToLocalStorage])

  // Delete selected node and all its connected edges
  const deleteNodeById = useCallback((nodeId)=>{
    setNodes((nds)=> {
      const filtered = nds.filter(n=> n.id !== nodeId)
      // Also update edges in same operation
      setEdges((eds)=> {
        const filteredEdges = eds.filter(e=> e.source !== nodeId && e.target !== nodeId)
        // Save after both deletions
        saveToLocalStorage(filtered, filteredEdges)
        return filteredEdges
      })
      return filtered
    })
    setSelectedNode(null)
  },[setNodes, setEdges, saveToLocalStorage])

  // Save validation: if more than one Node and more than one node has no incoming edges -> error
  const onSave = useCallback(()=>{
    // Always save to localStorage first (persist the flow state)
    saveToLocalStorage(nodes, edges)
    
    // If there are 0 or 1 nodes, nothing to validate — just save
    if(nodes.length <= 1){
      setSaveError('')
      alert('Flow saved successfully.')
      return
    }
    
    // nodes without any incoming edges are considered "empty target handles"
    const nodesWithNoIncoming = nodes.filter(n => !edges.some(e => e.target === n.id))
    if(nodesWithNoIncoming.length > 1){
      // Show error banner as warning but still allow save
      setSaveError('Cannot save Flow')
      alert('Warning: Flow has multiple disconnected nodes. Saved with warnings.')
      return
    }
    
    setSaveError('')
    alert('Flow saved successfully.')
  },[nodes, edges, saveToLocalStorage])

  // Clear saved flow from localStorage and reset to defaults
  const clearSavedFlow = useCallback(()=>{
    if(window.confirm('Clear all saved flow data? This will reset to default nodes.')){
      try {
        localStorage.removeItem(STORAGE_KEY)
        idRef.current = 1
        const n1 = { id: 'node_1', type: 'textNode', position: { x: 50, y: 50 }, data: { text: 'test message 1' } }
        const n2 = { id: 'node_2', type: 'textNode', position: { x: 350, y: 50 }, data: { text: 'test message 2' } }
        const defaultNodes = [n1, n2]
        const defaultEdges = []
        setNodes(defaultNodes)
        setEdges(defaultEdges)
        // Save the default nodes to localStorage
        saveToLocalStorage(defaultNodes, defaultEdges)
        setSelectedNode(null)
        setSelectedEdge(null)
        setSaveError('')
        alert('Flow cleared. Reset to default nodes.')
      } catch (error) {
        console.error('Failed to clear flow:', error)
      }
    }
  },[setNodes, setEdges, saveToLocalStorage])

  // delete selected edge by id
  const deleteEdgeById = useCallback((edgeId)=>{
    setEdges((eds)=> {
      const filtered = eds.filter(e=> e.id !== edgeId)
      // Save explicitly after deleting edge
      saveToLocalStorage(nodes, filtered)
      return filtered
    })
    setSelectedEdge(null)
  },[setEdges, nodes, saveToLocalStorage])

  // clear banner when flow changes
  useEffect(()=>{
    if(saveError){
      setSaveError('')
    }
  },[nodes, edges])

  return (
    <div className="flow-root">
      <div className="topbar">
        {saveError && <div className="error-banner">{saveError}</div>}
        <button className="clear-btn" onClick={clearSavedFlow}>Clear Saved Flow</button>
        <button className="save-btn" onClick={onSave}>Save Changes</button>
      </div>
      <div className="main">
        <div className="canvas" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeUpdate={onEdgeUpdate}
              onInit={setRfInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{ markerEnd: { type: MarkerType.Arrow } }}
              fitView
            >
              <MiniMap />
              <Controls />
              <Background gap={16} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        <div className="sidepanel">
          {selectedNode ? (
            <SettingsPanel node={selectedNode} onChangeText={updateSelectedNodeText} onDeleteNode={deleteNodeById} />
          ) : selectedEdge ? (
            <EdgePanel edge={selectedEdge} onDelete={deleteEdgeById} />
          ) : (
            <NodesPanel />
          )}
        </div>
      </div>
    </div>
  )
}
