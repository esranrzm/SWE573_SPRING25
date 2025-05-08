import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Flex, Stack, Text, Dialog, Portal, Field, Input, Spinner, Select, createListCollection, InputGroup, Span, Textarea} from '@chakra-ui/react';
import { useColorModeValue } from "../components/ui/color-mode";
import ReactFlow, { Background } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

const nodeWidth = 172;
const nodeHeight = 36;

function getLayoutedGraph(nodes, edges, direction = 'TB') {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction });
  
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
  
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
  
    dagre.layout(dagreGraph);
  
    const layoutedNodes = [];
    const usedPositions = [];
  
    // Helper function to check if two nodes overlap
    function isOverlapping(x, y, width, height) {
      return usedPositions.some(
        (pos) =>
          Math.abs(pos.x - x) < width &&
          Math.abs(pos.y - y) < height
      );
    }
  
    nodes.forEach((node, index) => {
      const layout = dagreGraph.node(node.id);
      const isLayouted = layout !== undefined;
  
      // For isolated nodes (without edges), place them randomly and avoid overlap
      if (!isLayouted) {
        let randomX, randomY;
        let tries = 0;
  
        // Try random positions until an empty spot is found
        do {
          randomX = Math.random() * 3000; // Increased width range
          randomY = Math.random() * 2000;  // Increased height range
  
          tries++;
          // Give up after a few tries to avoid an infinite loop
          if (tries > 100) break;
        } while (isOverlapping(randomX, randomY, nodeWidth, nodeHeight));
  
        // Save the position to avoid overlap
        usedPositions.push({ x: randomX, y: randomY });
  
        layoutedNodes.push({
          ...node,
          position: { x: randomX, y: randomY },
          sourcePosition: 'bottom',
          targetPosition: 'top',
        });
      } else {
        // If layouted by Dagre, keep the layouted position
        layoutedNodes.push({
          ...node,
          position: { x: layout.x, y: layout.y },
          sourcePosition: 'bottom',
          targetPosition: 'top',
        });
      }
    });
  
    return { nodes: layoutedNodes, edges };
  }
  

function GraphPage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState("")
  const [selectedNodeLabel, setNodeLabel] = useState("")
  const [selectedNodeEdgeDesc, setEdgeDescription] = useState("")
  const [selectedDeleteNode, setSelectedDeleteNode] = useState("")
  const [selectedEdge, setSelectedEdge] = useState("")
  const [myNode, setMyNode] = useState("")
  const [otherNode, setOtherNode] = useState("")
  const [newConnectionDesc, setNewConnectionDesc] = useState("")

  const edgesFromDB = [
    { id: 'e1', source: 'node1', target: 'node2', description: 'Link 1 → 2' },
    { id: 'e2', source: 'node2', target: 'node3', description: 'Link 2 → 3' },
    { id: 'e3', source: 'node2', target: 'node4', description: 'Link 2 → 4' },
    { id: 'e4', source: 'node3', target: 'node5', description: 'Link 3 → 5' },
    { id: 'e5', source: 'node4', target: 'node6', description: 'Link 4 → 6' },
    { id: 'e6', source: 'node6', target: 'node7', description: 'Link 6 → 7' },
  ];

  const allNodeIds = [
    'node1', 'node2', 'node3', 'node4', 'node5', 'node6', 'node7',
    'standalone1', 'standalone2', 'standalone3','standalone5',
  ];

  const spinnerData = [
    { id: 'e1', name: 'esra' },
    { id: 'e2', name: 'scarf'},
    { id: 'e3', name: 'emily' },
    { id: 'e4', name: 'car' },
    { id: 'e5', name: '1989'},
    { id: 'e6', name: 'Taylor' },
  ];

  const spinnerEdgeData = [
    { id: 'e1', source: 'esra', target: 'emily' },
    { id: 'e2', source: 'scarf', target: 'esra'},
    { id: 'e3', source: 'emily', target: 'car' },
    { id: 'e4', source: 'car', target: 'Taylor' },
    { id: 'e5', source: '1989', target: 'scarf'},
    { id: 'e6', source: 'Taylor', target: 'emily' },
  ];

  const state = { value: spinnerData }
  const stateEdge = { value: spinnerEdgeData }

  const collection = useMemo(() => {
    return createListCollection({
      items: state.value ?? [],
      itemToString: (node) => node.name,
      itemToValue: (node) => node.name,
    })
  }, [state.value])

  const collectionDeleteNode = useMemo(() => {
    return createListCollection({
      items: state.value ?? [],
      itemToString: (node) => node.name,
      itemToValue: (node) => node.name,
    })
  }, [state.value])

  const collectionRemoveEdge = useMemo(() => {
    return createListCollection({
      items: stateEdge.value ?? [],
      itemToString: (node) => node.source + " -> " + node.target,
      itemToValue: (node) => node.source + " -> " + node.target,
    })
  }, [stateEdge.value])


  useEffect(() => {
    const generateGraphData = () => {
      const nodesMap = new Map();

      allNodeIds.forEach((id) => {
        nodesMap.set(id, {
          id,
          data: { label: id },
          position: { x: 0, y: 0 },
        });
      });

      const rawNodes = Array.from(nodesMap.values());

      const graphEdges = edgesFromDB.map(({ id, source, target, description }) => ({
        id,
        source,
        target,
        label: description,
        animated: true,
        style: { stroke: '#888' },
        labelStyle: { fill: '#000', fontWeight: 600 },
      }));

      return getLayoutedGraph(rawNodes, graphEdges);
    };

    const { nodes, edges } = generateGraphData();
    setNodes(nodes);
    setEdges(edges);
  }, []);

  const onNodeClick = (event, node) => {
    console.log("Node clicked:", node.id);
    // Example: navigate(`/node-details?id=${node.id}`);
  };

  const applyNodeAddOperation = async () => { 
          if (selectedNodeLabel == "") {
            alert("Please enter node label!");
          }else {
            console.log(selectedNodeLabel);
            console.log(selectedNodeEdgeDesc);
            console.log(selectedNode.value[0]);
          }
      };

  const deleteNode = async () => { 
    if (!selectedDeleteNode.value?.[0]) {
      alert("Please select node to delete!");
      setSelectedDeleteNode("");
    }else {
      console.log(selectedDeleteNode.value[0]);
    }
  };

  const removeConnection = async () => { 
    if (!selectedEdge.value?.[0]) {
      alert("Please select connection to remove!");
      setSelectedEdge("");
    }else {
      console.log(selectedEdge.value[0]);
    }
  };

  const addNewConnection = async () => { 
    if (!myNode.value?.[0]) {
      alert("Please select one of your nodes!");
      setMyNode("");
    }
    else if (!otherNode.value?.[0]) {
      alert("Please select another node to connect with you node!");
      setOtherNode("");
    }
    else {
      console.log(myNode.value[0]);
      console.log(otherNode.value[0]);
    }
  };


  return (
    <Flex alignItems="flex-start" height="100%" pl="80px" pr="20px" flexDirection="row">
      {/* Sidebar Section */}
      <Box display="flex" flexDirection="column" width="280px" pr="50px" justifyContent="center" height="100vh" alignItems="center">
        <Box 
          pt="4" pl="4" pr="4" pb="4"
          alignItems="center"
          borderRadius={8} 
          bg={useColorModeValue("gray.100", "gray.500")} 
          borderColor={useColorModeValue("gray.800", "gray.300")} 
          border="1px solid"
          display="flex" 
          flexDirection="column" 
          mb="4"
        >
          <Stack gap="1" direction="column">
            <Stack gap="8" alignItems="center">
              {/* ADD NODE */}
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <Button bg="green.600">Add New Node</Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>Add new node to the graph</Dialog.Title>
                      </Dialog.Header>
                      <Dialog.Body pb="4">
                        <Stack gap="4">
                          <Field.Root required>
                            <Field.Label>Node Label*</Field.Label>
                            <Input placeholder="Label" onChange={(e) => setNodeLabel(e.target.value)}/>
                          </Field.Root>
                          <Field.Root>
                            <Field.Label>Select a node if you want to create a connection</Field.Label>
                            <Select.Root collection={collection} size="sm" width="320px" onValueChange={setSelectedNode}>
                              <Select.HiddenSelect />
                              <Select.Label>Select Node</Select.Label>
                              <Select.Control>
                                <Select.Trigger>
                                  <Select.ValueText placeholder="Select node" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                  <Select.ClearTrigger />
                                  <Select.Indicator />
                                </Select.IndicatorGroup>
                                <Select.IndicatorGroup>
                                  {state.loading && (
                                    <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
                                  )}
                                  <Select.Indicator />
                                </Select.IndicatorGroup>
                              </Select.Control>
                              <Select.Positioner>
                                  <Select.Content>
                                    {collection.items.map((node) => (
                                      <Select.Item item={node} key={node.name}>
                                        {node.name}
                                        <Select.ItemIndicator />
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select.Positioner>
                            </Select.Root>
                          </Field.Root>
                          <Field.Root>
                            <Field.Label>Please specify the decsription of the connection you added</Field.Label>
                            <InputGroup
                              endElement={
                                  <Span color="fg.muted" textStyle="2xs" position="relative" pt="60px">
                                  {selectedNodeEdgeDesc.length} / {60}
                                  </Span>
                              }
                          >
                              <Textarea value={selectedNodeEdgeDesc} placeholder="Enter connection description" maxLength={60} onChange={(e) => setEdgeDescription(e.target.value)} height="40px" variant="outline" />
                          </InputGroup>
                          </Field.Root>
                        </Stack>
                      </Dialog.Body>
                      <Dialog.Footer>
                        <Dialog.ActionTrigger asChild>
                          <Button variant="outline">Cancel</Button>
                        </Dialog.ActionTrigger>
                        <Button onClick={() => applyNodeAddOperation()}>Add</Button>
                      </Dialog.Footer>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>

              {/* DELETE NODE */}
              <Dialog.Root>
                <Dialog.Trigger asChild>
                <Button bg="red.500">Delete Node</Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>Delete node from graph</Dialog.Title>
                      </Dialog.Header>
                      <Dialog.Body pb="4">
                        <Stack gap="4">
                          <Field.Root>
                            <Select.Root collection={collectionDeleteNode} size="sm" width="320px" onValueChange={setSelectedDeleteNode}>
                              <Select.HiddenSelect />
                              <Field.Label>Please select a node to delete</Field.Label>
                              <Select.Control>
                                <Select.Trigger>
                                  <Select.ValueText placeholder="Select node" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                  <Select.ClearTrigger />
                                  <Select.Indicator />
                                </Select.IndicatorGroup>
                                <Select.IndicatorGroup>
                                  {state.loading && (
                                    <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
                                  )}
                                  <Select.Indicator />
                                </Select.IndicatorGroup>
                              </Select.Control>
                              <Select.Positioner>
                                  <Select.Content>
                                    {collectionDeleteNode.items.map((node) => (
                                      <Select.Item item={node} key={node.name}>
                                        {node.name}
                                        <Select.ItemIndicator />
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select.Positioner>
                            </Select.Root>
                          </Field.Root>
                          <Field.Root>
                            <Text color="red.500" style={{ fontSize: "13px" }}>Please node that when you delete a node, its connections with the other nodes will also be deleted!</Text>
                          </Field.Root>
                        </Stack>
                      </Dialog.Body>
                      <Dialog.Footer>
                        <Dialog.ActionTrigger asChild>
                          <Button variant="outline">Cancel</Button>
                        </Dialog.ActionTrigger>
                        <Button onClick={() => deleteNode()}>Delete</Button>
                      </Dialog.Footer>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>

              {/* ADD NEW CONNECTION */}
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <Button bg="blue.500">Add New Connection</Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>Add connection</Dialog.Title>
                      </Dialog.Header>
                      <Dialog.Body pb="4">
                        <Stack gap="4">
                          <Field.Root>
                            <Select.Root collection={collection} size="sm" width="320px" onValueChange={setMyNode}>
                              <Select.HiddenSelect />
                              <Field.Label>Please select your node</Field.Label>
                              <Select.Control>
                                <Select.Trigger>
                                  <Select.ValueText placeholder="Select your node" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                  <Select.ClearTrigger />
                                  <Select.Indicator />
                                </Select.IndicatorGroup>
                                <Select.IndicatorGroup>
                                  {state.loading && (
                                    <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
                                  )}
                                  <Select.Indicator />
                                </Select.IndicatorGroup>
                              </Select.Control>
                              <Select.Positioner>
                                  <Select.Content>
                                    {collection.items.map((node) => (
                                      <Select.Item item={node} key={node.name}>
                                        {node.name}
                                        <Select.ItemIndicator />
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select.Positioner>
                            </Select.Root>
                          </Field.Root>
                          <Field.Root>
                            <Select.Root collection={collection} size="sm" width="320px" onValueChange={setOtherNode}>
                              <Select.HiddenSelect />
                              <Field.Label>Please select other node</Field.Label>
                              <Select.Control>
                                <Select.Trigger>
                                  <Select.ValueText placeholder="Select other node" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                  <Select.ClearTrigger />
                                  <Select.Indicator />
                                </Select.IndicatorGroup>
                                <Select.IndicatorGroup>
                                  {state.loading && (
                                    <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
                                  )}
                                  <Select.Indicator />
                                </Select.IndicatorGroup>
                              </Select.Control>
                              <Select.Positioner>
                                  <Select.Content>
                                    {collection.items.map((node) => (
                                      <Select.Item item={node} key={node.name}>
                                        {node.name}
                                        <Select.ItemIndicator />
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select.Positioner>
                            </Select.Root>
                          </Field.Root>
                          <Field.Root>
                            <Field.Label>Please specify the decsription of the connection you added</Field.Label>
                            <InputGroup
                              endElement={
                                  <Span color="fg.muted" textStyle="2xs" position="relative" pt="60px">
                                  {newConnectionDesc.length} / {60}
                                  </Span>
                              }
                          >
                              <Textarea value={newConnectionDesc} placeholder="Enter connection description" maxLength={60} onChange={(e) => setNewConnectionDesc(e.target.value)} height="40px" variant="outline" />
                          </InputGroup>
                          </Field.Root>
                        </Stack>
                      </Dialog.Body>
                      <Dialog.Footer>
                        <Dialog.ActionTrigger asChild>
                          <Button variant="outline" onClick={() => setNewConnectionDesc("")}>Cancel</Button>
                        </Dialog.ActionTrigger>
                        <Button bg="blue.500" onClick={() => addNewConnection()}>Add Connection</Button>
                      </Dialog.Footer>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>

              {/* REMOVE CONNECTION */}
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <Button>Remove Connection</Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>Remove connection</Dialog.Title>
                      </Dialog.Header>
                      <Dialog.Body pb="4">
                        <Stack gap="4">
                          <Field.Root>
                            <Select.Root collection={collectionRemoveEdge} size="sm" width="320px" onValueChange={setSelectedEdge}>
                              <Select.HiddenSelect />
                              <Field.Label>Please select a connection to remove</Field.Label>
                              <Select.Control>
                                <Select.Trigger>
                                  <Select.ValueText placeholder="Select connection" />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                  <Select.ClearTrigger />
                                  <Select.Indicator />
                                </Select.IndicatorGroup>
                                <Select.IndicatorGroup>
                                  {stateEdge.loading && (
                                    <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
                                  )}
                                  <Select.Indicator />
                                </Select.IndicatorGroup>
                              </Select.Control>
                              <Select.Positioner>
                                  <Select.Content>
                                    {collectionRemoveEdge.items.map((node) => (
                                      <Select.Item item={node} key={node.source + " -> " + node.target}>
                                        {node.source + " -> " + node.target}
                                        <Select.ItemIndicator />
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select.Positioner>
                            </Select.Root>
                          </Field.Root>
                        </Stack>
                      </Dialog.Body>
                      <Dialog.Footer>
                        <Dialog.ActionTrigger asChild>
                          <Button variant="outline">Cancel</Button>
                        </Dialog.ActionTrigger>
                        <Button onClick={() => removeConnection()}>Remove</Button>
                      </Dialog.Footer>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>
              
            </Stack>
          </Stack>
        </Box>
      </Box>
  
      {/* Graph Section */}
      <Box flex="1" display="flex" pb="5" flexDirection="column">
        <Text mb="1" fontSize="2xl" fontWeight="bold">Connection Graph</Text>
        <Box
          w="100%"
          h="550px"
          borderRadius="2xl"
          boxShadow="2xl"
          bg="white"
        >
          <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={onNodeClick}
                fitView
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnScroll
                zoomOnScroll
          >
            <Background />
          </ReactFlow>
        </Box>
      </Box>
    </Flex>
  );
  
}

export default GraphPage;
