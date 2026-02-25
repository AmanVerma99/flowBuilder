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

  useEffect(()=>{
    // add a sample node for convenience
    if(nodes.length===0){
      const n1 = { id: nextId(), type: 'textNode', position: { x: 50, y: 50 }, data: { text: 'test message 1' } }
      const n2 = { id: nextId(), type: 'textNode', position: { x: 350, y: 50 }, data: { text: 'test message 2' } }
      setNodes([n1,n2])
    }
  },[])

  // count outgoing edges for a node
  const outgoingCount = useCallback((nodeId)=> edges.filter(e=>e.source===nodeId).length,[edges])

  // when user tries to connect, enforce single outgoing edge rule
  const onConnect = useCallback((params) => {
    const src = params.source
    if(outgoingCount(src) >= 1){
      alert('A source handle can only have one outgoing connection')
      return
    }
    setEdges((eds)=> addEdge(params, eds))
  },[outgoingCount, setEdges])

  // allow updating/reconnecting existing edges (dragging an edge endpoint)
  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    const newSource = newConnection.source
    // count outgoing edges for the new source excluding the edge being updated
    const outgoingFromNewSource = edges.filter(e => e.source === newSource && e.id !== oldEdge.id).length
    if(outgoingFromNewSource >= 1){
      alert('A source handle can only have one outgoing connection')
      return
    }
    setEdges((eds) => eds.map(e => e.id === oldEdge.id ? { ...e, ...newConnection } : e))
  }, [edges, setEdges])

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
    setNodes((nds)=> nds.concat(newNode))
  },[rfInstance, nextId])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  },[])

  // update text of selected node from settings panel
  const updateSelectedNodeText = useCallback((text)=>{
    setNodes((nds)=> nds.map(n=> n.id===selectedNode.id ? { ...n, data: { ...n.data, text } } : n))
    // keep selectedNode in sync with updated nodes so SettingsPanel shows latest
    setSelectedNode((prev)=> prev ? { ...prev, data: { ...prev.data, text } } : prev)
  },[selectedNode, setNodes])

  // Save validation: if more than one Node and more than one node has no incoming edges -> error
  const onSave = useCallback(()=>{
    // If there are 0 or 1 nodes, nothing to validate — treat as saved
    if(nodes.length <= 1){
      setSaveError('')
      alert('Flow saved.')
      return
    }
    // nodes without any incoming edges are considered "empty target handles"
    const nodesWithNoIncoming = nodes.filter(n => !edges.some(e => e.target === n.id))
    if(nodesWithNoIncoming.length > 1){
      // show top banner error as in spec
      setSaveError('Cannot save Flow')
      return
    }
    setSaveError('')
    alert('Flow saved successfully.')
  },[nodes, edges])

  // delete selected edge by id
  const deleteEdgeById = useCallback((edgeId)=>{
    setEdges((eds)=> eds.filter(e=> e.id !== edgeId))
    setSelectedEdge(null)
  },[setEdges])

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
        <div />
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
            <SettingsPanel node={selectedNode} onChangeText={updateSelectedNodeText} />
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
