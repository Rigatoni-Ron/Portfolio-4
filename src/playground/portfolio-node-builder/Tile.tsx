import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useGraphStore } from './store/graphStore'
import { nodeTypes, edgeTypes } from './components/Canvas'

/*
 * Home-tile micro-moment: a read-only React Flow instance mirroring the SAME
 * store as the full canvas — the seeded ASSET→EARN→TIMELINE→PORTFOLIO row
 * (or whatever the visitor last built), auto-fit into the tile. All
 * interaction disabled; the tile button handles clicks.
 */
export default function NodeBuilderTile() {
  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)
  return (
    <div className="pnb pnb-tile" aria-hidden="true" inert>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          minZoom={0.02}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
