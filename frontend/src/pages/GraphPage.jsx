import React, { useState, useEffect, useCallback  } from 'react';
import { Box, Button, Flex, Stack, Text, Dialog, Portal, Field, Select, createListCollection, InputGroup, Span, Textarea, CloseButton, Spinner, VStack, Container} from '@chakra-ui/react';
import { useColorModeValue } from "../components/ui/color-mode";
import ReactFlow, { Background } from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import httpClient from "@/httpClient";
import ConfigHelper from "@/components/configHelper";
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
  const navigate = useNavigate();
  const [nodes, setNodes] = useState([]);
  const [nodeList, setNodeList] = useState([]);
  const [edges, setEdges] = useState([]);
  const [edgeList, setEdgeList] = useState([]);
  const [selectedNode, setSelectedNode] = useState("");
  const [selectedNodeLabel, setNodeLabel] = useState("");
  const [selectedNodeEdgeDesc, setEdgeDescription] = useState("")
  const [selectedDeleteNode, setSelectedDeleteNode] = useState("")
  const [selectedEdge, setSelectedEdge] = useState("")
  const [myNode, setMyNode] = useState("")
  const [otherNode, setOtherNode] = useState("")
  const [newConnectionDesc, setNewConnectionDesc] = useState("")
  const [stateNodes, setStateNodes] = useState([]);
  const [stateEdges, setStateEdges] = useState([]);
  const [stateUserNodes, setStateUserNodes] = useState([]);
  const queryParams = new URLSearchParams(location.search);
  const researchId = queryParams.get('param');
  const userId = queryParams.get('userId');
  const LoggedUsername = ConfigHelper.getItem('username');
  const getUrlPrefix = ConfigHelper.getItem("url");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false)

  const [collectionDeleteNode, setCollectionDeleteNode] = useState(createListCollection({
    items: [], // Initialize with an empty array
    itemToString: (node) => node.label,
    itemToValue: (node) => node.label,
  }));
  const [collectionDeleteNodeAdmin, setCollectionDeleteNodeAdmin] = useState(createListCollection({
    items: [], // Initialize with an empty array
    itemToString: (node) => node.label,
    itemToValue: (node) => node.label,
  }));
  const [collection, setNewCollectionNodes] = useState(createListCollection({
    items: [], // Initialize with an empty array
    itemToString: (node) => node.label,
    itemToValue: (node) => node.label,
  }));
  const [collectionEdges, setNewCollectionEdges] = useState(createListCollection({
    items: [], // Initialize with an empty array
    itemToString: (edge) => edge.source + " -> " + edge.target,
    itemToValue: (edge) => edge.description,
  }));
  const [collectionEdgesAdmin, setNewCollectionEdgesAdmin] = useState(createListCollection({
    items: [], // Initialize with an empty array
    itemToString: (edge) => edge.source + " -> " + edge.target,
    itemToValue: (edge) => edge.description,
  }));
  
  const fetchNodeData = useCallback(async () => {
    try {
      const resp = await httpClient.get(`${getUrlPrefix}/api/nodes/research/${researchId}`);
      if (resp.status === 200) {
        const nodes = resp.data;
        const currentUserNode = resp.data.filter(node => node.user_id === userId);
        setNodeList(nodes);

      
        const { edges = [], currentUserEdges = [] } = await fetchEdgeData() || {};

        const graphData = await generateGraphData(nodes, edges);
        if (graphData) {
          setNodes(graphData.nodes);
          setEdges(graphData.edges);
        }

        const newCollectionDeleteNode = createListCollection({
          items: currentUserNode ?? [],
          itemToString: (node) => node.label,
          itemToValue: (node) => node.label,
        });
        setCollectionDeleteNode(newCollectionDeleteNode);

        const newCollectionDeleteNodeAdmin = createListCollection({
          items: nodes ?? [],
          itemToString: (node) => node.label,
          itemToValue: (node) => node.label,
        });
        setCollectionDeleteNodeAdmin(newCollectionDeleteNodeAdmin);

        const newCollection = createListCollection({
          items: nodes ?? [],
          itemToString: (node) => node.label,
          itemToValue: (node) => node.label,
        });
        setNewCollectionNodes(newCollection);

        if (currentUserEdges.length > 0 ) {
          const newCollectionEdge = createListCollection({
            items: currentUserEdges ?? [],
            itemToString: (edge) => edge.source + " -> " + edge.target,
            itemToValue: (edge) => edge.description,
          });
          setNewCollectionEdges(newCollectionEdge);
        }

        if (edges.length > 0 ) {
          const newCollectionEdgeAdmin = createListCollection({
            items: edges ?? [],
            itemToString: (edge) => edge.source + " -> " + edge.target,
            itemToValue: (edge) => edge.description,
          });
          setNewCollectionEdgesAdmin(newCollectionEdgeAdmin);
        }
        
      }
      
    } catch (e) {
      //console.log(e);
      if (e.response?.status === 401) {
        navigate("/");
      } else {
        //alert("An error occurred. Please try again.");
      }
    }
  }, [userId, researchId]);

  const fetchEdgeData = useCallback(async () => {
    try {
      const resp = await httpClient.get(`${getUrlPrefix}/api/edges/research/${researchId}`);
      if (resp.status === 200) {
        const edges = resp.data;
        const currentUserEdges = resp.data.filter(edge => edge.user_id === userId);
        setEdgeList(edges);
        return { edges, currentUserEdges };
      }
      
    } catch (e) {
      console.log(e);
      if (e.response?.status === 401) {
        navigate("/");
      } else {
        //alert("An error occurred. Please try again.");
      }
    }
    return null;
  }, [userId, researchId]);

  const generateGraphData = async (nodess, edgess) => {
    if (nodess.length > 0) {
      const nodesMap = new Map();

      nodess.forEach((node) => {
        nodesMap.set(node.id, {
          id: String(node.id),
          data: { label: node.label },
          position: { x: 0, y: 0 },
        });
      });

      const rawNodes = Array.from(nodesMap.values());
      const graphEdges = edgess.map(({ id, sourceId, targetId, description }) => ({
          id,
          source: String(sourceId),
          target: String(targetId),
          label: description,
          animated: true,
          style: { stroke: '#888' },
          labelStyle: { fill: '#000', fontWeight: 600 },
        }));

      return getLayoutedGraph(rawNodes, graphEdges);
    }
    
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
        await fetchNodeData();
        setIsLoading(false);
      };
    fetchAllData();
  }, [fetchNodeData]);


  const onNodeClick = (event, node) => {
    console.log("Node clicked:", node.id);
    setOpen(true);
  };

  const applyNodeAddOperation = async () => { 
          if (selectedNodeLabel == "") {
            alert("Please enter node label!");
          }
          else {
            console.log(selectedNodeLabel);
            console.log(selectedNodeEdgeDesc);

            try { 
              const resp = await httpClient.post(`${getUrlPrefix}/api/nodes/add`, {
                  "userId": userId,
                  "researchId": researchId,
                  "username": LoggedUsername,
                  "label": selectedNodeLabel,
                  "connectionNode": selectedNode?.value?.[0] || "",
                  "connectionDesc": selectedNodeEdgeDesc.length > 0 ? selectedNodeEdgeDesc : ""
              });
              
          
              if(resp.status === 201) {
                alert("Node created successfully");
                fetchNodeData();
                window.location.reload();
              }
              
            } catch (e) {
              console.log(e);
              if (e.response?.status === 401) {
                navigate("/");
              } 
              else if (e.response?.status === 404) {
                alert("User Not found in db. Please contact support!");
              }
              else {
                alert("No research found");
              }
            }
          }
      };

  const deleteNode = async () => { 
    if (!selectedDeleteNode.value?.[0]) {
      alert("Please select node to delete!");
      setSelectedDeleteNode("");
    }else {
      console.log(selectedDeleteNode.value[0]);
      try { 
        const selectedNodeDetails = nodeList.filter(node => node.label === selectedDeleteNode.value[0]);
        const resp = await httpClient.delete(`${getUrlPrefix}/api/nodes/${selectedNodeDetails[0].id}`);
        
    
        if(resp.status === 200) {
          alert("Node deleted successfully");
          fetchNodeData();
          fetchEdgeData();
          window.location.reload();
          //cal getNodes again
        }
        
      } catch (e) {
        console.log(e);
        if (e.response?.status === 401) {
          navigate("/");
        } 
        else if (e.response?.status === 404) {
          alert("Node Not found in db. Please contact support!");
        }
        else {
          alert("No Node found");
        }
      }
    }
  };

  const removeConnection = async () => { 
    if (!selectedEdge.value?.[0]) {
      alert("Please select connection to remove!");
      setSelectedEdge("");
    }else {
      console.log(selectedEdge.items[0]);
      edgeList.forEach(edge => {
          console.log(edge.source + " -> " + edge.target)
      })
      const selected = selectedEdge.items[0].id;
      const selectedDeleteEdge = edgeList.filter(edge => edge.id === selected);

      try { 
        const resp = await httpClient.delete(`${getUrlPrefix}/api/edges/${selectedDeleteEdge[0].id}`);
        
        if(resp.status === 200) {
          alert("Connection deleted successfully");
          fetchEdgeData();
          fetchEdgeData();
          window.location.reload();
        }
        
      } catch (e) {
        console.log(e);
        if (e.response?.status === 401) {
          navigate("/");
        } 
        else if (e.response?.status === 404) {
          alert("Connection Not found in db. Please contact support!");
        }
        else {
          alert("No connection found");
        }
      }
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
    else if (myNode.value?.[0] === otherNode.value?.[0]) {
      alert("You cannot select same nodes for connection!");
      setOtherNode("");
      setMyNode("");
      setEdgeDescription("");
    }
    else {
      console.log(myNode.value[0]);
      console.log(otherNode.value[0]);
      const selectedSourceNode = nodeList.filter(node => node.label === myNode.value[0]);
      const selectedTargetNode = nodeList.filter(node => node.label === otherNode.value[0]);

      try { 
        const resp = await httpClient.post(`${getUrlPrefix}/api/edges/add`, {
            "userId": userId,
            "researchId": researchId,
            "username": LoggedUsername,
            "source": myNode.value[0],
            "sourceId": selectedSourceNode[0].id,
            "target": otherNode.value[0],
            "targetId": selectedTargetNode[0].id,
            "description": newConnectionDesc
        });
        
    
        if(resp.status === 201) {
          alert("Connection created successfully");
          fetchEdgeData();
          window.location.reload();
        }
        
      } catch (e) {
        console.log(e);
        if (e.response?.status === 401) {
          navigate("/");
        } 
        else if (e.response?.status === 404) {
          alert("User Not found in db. Please contact support!");
        }
        else {
          alert("No research found");
        }
      }
    }
  };

  const deleteGraph = async () => { 
    try { 
      const resp = await httpClient.delete(`${getUrlPrefix}/api/nodes/research/delete/${researchId}`);
    
      if(resp.status === 201) {
        alert("Graph deleted successfully");
        navigate("/home");
      }
      
    } catch (e) {
      console.log(e);
      if (e.response?.status === 401) {
        navigate("/");
      } 
      else if (e.response?.status === 404) {
        alert("User Not found in db. Please contact support!");
      }
      else {
        alert("No research found");
      }
    }
  };

  return (
    <Container maxW="100%">
      {isLoading ? (
      <VStack colorPalette="teal" pt="80px">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.800" />
        <Text color="blue.800">Loading...</Text>
      </VStack>) : 
      (
        <Flex alignItems="flex-start" height="100%" pl="80px" pr="20px" flexDirection="row">
          {/* Sidebar Section */}
          <Box display="flex" flexDirection="column" width="200px" pr="40px" justifyContent="center" height="100vh" alignItems="center">
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
                                <InputGroup
                                  endElement={
                                      <Span color="fg.muted" textStyle="2xs" position="relative" pt="60px">
                                      {selectedNodeLabel.length} / {30}
                                      </Span>
                                  }
                                >
                                  <Textarea placeholder="Label" maxLength={30} onChange={(e) => setNodeLabel(e.target.value)} height="40px" variant="outline" />
                                </InputGroup>
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
                                      {stateNodes.loading && (
                                        <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
                                      )}
                                      <Select.Indicator />
                                    </Select.IndicatorGroup>
                                  </Select.Control>
                                  <Select.Positioner>
                                      <Select.Content>
                                        {collection.items.map((node) => (
                                          <Select.Item item={node} key={node.label}>
                                            {node.label}
                                            <Select.ItemIndicator />
                                          </Select.Item>
                                        ))}
                                      </Select.Content>
                                    </Select.Positioner>
                                </Select.Root>
                              </Field.Root>
                              <Field.Root>
                                <Field.Label>Please specify the description of the connection you added</Field.Label>
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
                            <Dialog.ActionTrigger asChild>
                              <Button onClick={() => applyNodeAddOperation()}>Add</Button>
                            </Dialog.ActionTrigger>
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
                                <Select.Root collection={LoggedUsername === "admin" ? collectionDeleteNodeAdmin : collectionDeleteNode} size="sm" width="320px" onValueChange={setSelectedDeleteNode}>
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
                                      {stateUserNodes.loading && (
                                        <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
                                      )}
                                      <Select.Indicator />
                                    </Select.IndicatorGroup>
                                  </Select.Control>
                                  <Select.Positioner>
                                      <Select.Content>
                                        {(LoggedUsername === "admin" ? collectionDeleteNodeAdmin : collectionDeleteNode).items.map((node) => (
                                          <Select.Item item={node} key={node.label}>
                                            {node.label}
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
                            <Dialog.ActionTrigger asChild>
                                <Button onClick={() => deleteNode()}>Delete</Button>
                            </Dialog.ActionTrigger>
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
                                <Select.Root collection={LoggedUsername === "admin" ? collectionDeleteNodeAdmin : collectionDeleteNode} size="sm" width="320px" onValueChange={setMyNode}>
                                  <Select.HiddenSelect />
                                  <Field.Label>
                                    {LoggedUsername === "admin" ? "Please select first node" : "Please select your node"}
                                  </Field.Label>
                                  <Select.Control>
                                    <Select.Trigger>
                                      <Select.ValueText placeholder={LoggedUsername === "admin" ? "Select first node" : "Select your node"} />
                                    </Select.Trigger>
                                    <Select.IndicatorGroup>
                                      <Select.ClearTrigger />
                                      <Select.Indicator />
                                    </Select.IndicatorGroup>
                                    <Select.IndicatorGroup>
                                      {stateUserNodes.loading && (
                                        <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
                                      )}
                                      <Select.Indicator />
                                    </Select.IndicatorGroup>
                                  </Select.Control>
                                  <Select.Positioner>
                                      <Select.Content>
                                        {(LoggedUsername === "admin" ? collectionDeleteNodeAdmin : collectionDeleteNode).items.map((node) => (
                                          <Select.Item item={node} key={node.label}>
                                            {node.label}
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
                                      {stateNodes.loading && (
                                        <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
                                      )}
                                      <Select.Indicator />
                                    </Select.IndicatorGroup>
                                  </Select.Control>
                                  <Select.Positioner>
                                      <Select.Content>
                                        {collection.items.map((node) => (
                                          <Select.Item item={node} key={node.label}>
                                            {node.label}
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
                            <Dialog.ActionTrigger asChild>
                              <Button bg="blue.500" onClick={() => addNewConnection()}>Add Connection</Button>
                            </Dialog.ActionTrigger>
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
                                <Select.Root collection={LoggedUsername === "admin" ? collectionEdgesAdmin : collectionEdges} size="sm" width="320px" onValueChange={setSelectedEdge}>
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
                                      {stateEdges.loading && (
                                        <Spinner size="xs" borderWidth="1.5px" color="fg.muted" />
                                      )}
                                      <Select.Indicator />
                                    </Select.IndicatorGroup>
                                  </Select.Control>
                                  <Select.Positioner>
                                      <Select.Content>
                                        {(LoggedUsername === "admin" ? collectionEdgesAdmin : collectionEdges).items.map((edge) => (
                                          <Select.Item item={edge} key={edge.source + " -> " + edge.target}>
                                            {edge.source + " -> " + edge.target}
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
                            <Dialog.ActionTrigger asChild>
                              <Button onClick={() => removeConnection()}>Remove</Button>
                            </Dialog.ActionTrigger>
                          </Dialog.Footer>
                        </Dialog.Content>
                      </Dialog.Positioner>
                    </Portal>
                  </Dialog.Root>

                  {/* DELETE GRAPH ADMIN */}
                  {LoggedUsername === "admin" && (
                    <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <Button>Delete Graph</Button>
                      </Dialog.Trigger>
                      <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                          <Dialog.Content>
                            <Dialog.Header>
                              <Dialog.Title>Delete Graph?</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                              <p>
                                Are you sure you want to delete connection graph? This action cannot be undone. This will permanently
                                delete all connections and nodes from the system.
                              </p>
                            </Dialog.Body>
                            <Dialog.Footer>
                              <Dialog.ActionTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                              </Dialog.ActionTrigger>
                              <Dialog.ActionTrigger asChild>
                                <Button colorPalette="red" onClick={() => deleteGraph()}>Delete</Button>
                              </Dialog.ActionTrigger>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                              <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                          </Dialog.Content>
                        </Dialog.Positioner>
                      </Portal>
                    </Dialog.Root>
                  )}
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

          {/* Node Dialog */}
          <Dialog.Root lazyMount open={open} placement={"center"} scrollBehavior="inside" onOpenChange={(e) => setOpen(e.open)}>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>Wikidata Information</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Text>sdjhkfjkdshfjkds kdjfhjskdhf</Text>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                      <Button variant="outline">Close</Button>
                    </Dialog.ActionTrigger>
                  </Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </Flex>
      )}
    </Container>
  );
}

export default GraphPage;
