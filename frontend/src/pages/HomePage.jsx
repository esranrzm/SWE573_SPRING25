import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useCallback} from 'react';
import httpClient from "@/httpClient";
import { Box, Button, Container, Flex, Text, Stack, For, Card, Grid, Dialog, Portal, Field, Input, Textarea, InputGroup, Span, Group, Spinner, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode";
import ConfigHelper from '@/components/configHelper';

const HomePage = () => {
      
    const tags = [
      { title: "Kotlin", color: "orange.400" },
      { title: "JavaScript", color: "yellow.500" },
      { title: "Python", color: "blue.300" },
      { title: "C++", color: "red.600" },
      { title: "Swift", color: "pink.400" },
      { title: "Go", color: "cyan.500" },
      { title: "TypeScript", color: "purple.500" },
      { title: "Dart", color: "teal.400" }
    ];

    const [topicTitle, setTopicTitle] = useState("");
    const [topicDescription, setTopicDescription] = useState("");
    const [topicTags, setTopicTags] = useState("");
    const [searchedTopic, setSearchedTopic] = useState("");
    const [resultTopicList, setResultTopicList] = useState([]);
    const [resultPopularTopicList, setResultPopularTopicList] = useState([]);
    const getUrlPrefix = ConfigHelper.getItem("url");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const MAX_CHARACTERS = 1000

    const fetchData = useCallback(async () => {
      try {
        const resp = await httpClient.get(`${getUrlPrefix}/api/users/@me`);
        if (resp.status != 200) {
          navigate("/login");
        }
        
      } catch (e) {
        console.log(e);
        if (e.response?.status === 401) {
          navigate("/");
        } else {
          alert("An error occurred. Please try again.");
        }
      }
    }, []);

    const fetchResearchData = useCallback(async () => {
      try { 
        const resp = await httpClient.get(`${getUrlPrefix}/api/researches`);
        
        if (resp.status != 200) {
            alert("An error occurred. Please try again.");
        }
        else if(resp.status === 200) {
          const researches = resp.data;

          const researchesWithComments = await Promise.all(
            researches.map(async (item) => {
              const commentCount = await fetchCommentsCount(item.id); 
              return { ...item, commentCount };
            })
          );

          // Sort researches by comment count descending
          const top5Researches = researchesWithComments
            .sort((a, b) => b.commentCount - a.commentCount)
            .slice(0, 5);

          setResultTopicList(resp.data);
          setResultPopularTopicList(top5Researches);
        }
        
      } catch (e) {
        console.log(e);
        if (e.response?.status === 401) {
          navigate("/");
        } else {
          alert("No research found");
        }
      }
    }, []);

    const fetchCommentsCount = async (topicId) => {
      try {
        const resp = await httpClient.get(`${getUrlPrefix}/api/comments/research/${topicId}`);
        if (resp.status === 200) {
          return resp.data.length;
        } else {
          return 0;
        }
      } catch (e) {
        //console.log(e);
        return 0;
      }
    };

    useEffect(() => {
      const fetchAllData = async () => {
        setIsLoading(true);
        await fetchData();
        await fetchResearchData();
        setIsLoading(false);
      };
      fetchAllData();
    }, [fetchData, fetchResearchData]);

    const processTags = (input) => {
      const tags = input.split(",").map(tag => tag.trim());
      const validTags = tags.filter(tag => tag.startsWith("#") && !tag.includes(" "));
      return validTags.join(",");
    };

    const createTopic = async () => {
        try { 
          setTopicTags(processTags(topicTags));
          const resp = await httpClient.post(`${getUrlPrefix}/api/researches/create`, {
              "title": topicTitle,
              "description": topicDescription,
              "tags": topicTags
          });
          
      
          if (resp.status != 200) {
              alert("An error occurred. Please try again.");
          }
          else if(resp.status === 200) {
            alert("Research topic created successfully");
            fetchResearchData();
          }
          
        } catch (e) {
          //console.log(e);
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

    const searchResearchTopic = () => {
      if (searchedTopic === "") 
        { 
          fetchResearchData();
          setResultTopicList(resultTopicList);
          return;
        }
        const filterBySearch = resultTopicList.filter((item) => 
          item.title.toLowerCase().includes(searchedTopic.toLowerCase()) || 
          item.authorName.toLowerCase().includes(searchedTopic.toLowerCase())
          );
          setResultTopicList(filterBySearch);
    };

    const directToDetails = (topicId) => {
      // Navigate to another page with the topicId and filtered tags
      navigate(`/researchDetails?param=${topicId}`);
    };

    
    return (
      <Container maxW="100%">
        {isLoading ? (
          <VStack colorPalette="teal" pt="80px">
            <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.800" />
            <Text color="blue.800" pl="8px">Loading...</Text>
          </VStack>
          ) : (
        <Stack direction="column" spacing={4}>
          <Flex direction="row" justifyContent="space-between" wrap="nowrap" width="100%">
            <Box width="18%" pl="2" pr="4" display="flex" flexDirection="column">
              <Text fontSize="lg" fontWeight="bold" mb={2}>Popular Tags</Text>
              <Box 
                pt="4" pl="4" pb="4" borderRadius={8} bg={useColorModeValue("gray.100", "gray.500")}
                borderColor={useColorModeValue("gray.800", "gray.300")} border="2px solid"
                display="flex" flexDirection="column" maxHeight="400px"
              >
                <Grid templateColumns="repeat(2, 1fr)" gap="3" overflowY="auto" pr="4">
                  <For each={tags}>
                    {(tag) => (
                      <Button bg={tag.color} color="white" _hover={{ bg: "red.600" }} variant="outline" size="sm" height="auto" minHeight="40px" whiteSpace="normal">
                        {tag.title}
                      </Button>
                    )}
                  </For>
                </Grid>
              </Box>
              <Dialog.Root size="cover" placement="center" motionPreset="slide-in-bottom">
                <Dialog.Trigger asChild>
                  <Button 
                  textStyle="lg" 
                  minWidth="40px" 
                  height="auto" 
                  padding="8px"
                  whiteSpace="normal"
                  textAlign="center"
                  alignSelf="center"
                  mt={24}
                  bg="blue.800"
                >
                  + Create New Research Topic
                </Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner pr="24" pl="24">
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Create New Research!</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body pb="4">
                            <Stack gap="4">
                                <Field.Root required>
                                    <Field.Label>Title <Field.RequiredIndicator /></Field.Label>
                                    <Input value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} placeholder="Enter research title..."/>
                                </Field.Root>
                                <Field.Root required>
                                  <Field.Label>
                                    Description <Field.RequiredIndicator />
                                  </Field.Label>
                                  <InputGroup
                                    endElement={
                                      <Span color="fg.muted" textStyle="xs" position="relative" pt="180px">
                                        {topicDescription.length} / {MAX_CHARACTERS}
                                      </Span>
                                    }
                                  >
                                    <Textarea placeholder="Enter research description..." maxLength={MAX_CHARACTERS} height="200px" variant="outline" onChange={(e) => setTopicDescription(e.target.value.slice(0, MAX_CHARACTERS))}/>
                                  </InputGroup>
                              
                                </Field.Root>
                                <Field.Root required>
                                    <Field.Label>Tags <Field.RequiredIndicator /></Field.Label>
                                    <Input value={topicTags} onChange={(e) => setTopicTags(e.target.value)} placeholder="Enter research topics..."/>
                                    <Field.HelperText fontSize="2xs">You can add as many tag as much. You need to add '#' in front of each tag and seperate them with ','. Also, you should not use space character in your tags. Tags that does not satisfy these requirements will not be added to the tag list.</Field.HelperText>
                                    <Field.HelperText fontSize="2xs">e.g., #chatGPT, #GenerativeAI, #LLMSs, #bigData, #workingWithKubernates</Field.HelperText>
                                    
                                </Field.Root>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" >Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Dialog.ActionTrigger asChild>
                                <Button bg="blue.800" onClick={() => createTopic()}>Create</Button>
                            </Dialog.ActionTrigger>
                        </Dialog.Footer>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>
            </Box>

            <Box width="46%" pr="4" display="flex" flexDirection="column">
              <Text fontSize="lg" pl="2" fontWeight="bold" mb={2}>Latest Research Topics</Text>
              <Box pt="4" px="4" pb="4" borderRadius={8} borderColor={useColorModeValue("gray.800", "gray.300")}
                border="2px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="530px">
                <Stack gap="3" direction="column" overflowY="auto" pr="4">
                  <Group attached w="full" maxW="2md">
                    <Input flex="1" placeholder="Search Research" onChange={(e) => setSearchedTopic(e.target.value)}/>
                    <Button bg={useColorModeValue("black.500", "gray.400")} onClick={() => searchResearchTopic()}>
                      Search
                    </Button>
                  </Group>
                  <For each={resultTopicList}>
                    {(topic) => (
                      <Card.Root size="sm" width="100%" key={topic.title} pt="0.5" height="150px" bg={useColorModeValue("gray.300", "gray.500")}>
                        <Card.Body gap="2" pl="8" pt="5">
                          <Flex alignItems="center" justifyContent="space-between" height="100%">
                            <Stack gap="5" direction="column" flex="1">
                              <Card.Title mb="-0.5" textStyle="sm">{topic.title}</Card.Title>
                              <Stack gap="-0.5" direction="column">
                                <Text textStyle="2xs">Author: {topic.authorName}</Text>
                                <Text textStyle="2xs">Created At: {topic.createdAt}</Text>
                              </Stack>
                            </Stack>
                            <Card.Footer>
                              <Button 
                                textStyle="xs" 
                                width="65px" 
                                height="30px" 
                                onClick={() => directToDetails(topic.id)}
                              >View</Button>
                            </Card.Footer>
                          </Flex>
                        </Card.Body>
                      </Card.Root>
                    )}
                  </For>
                </Stack>
              </Box>
            </Box>

            <Box width="36%" display="flex" flexDirection="column">
              <Text fontSize="lg" fontWeight="bold" mb={2}>Popular Topics ⭐</Text> 
              <Box pt="4" px="4" pb="4" borderRadius={8} borderColor={useColorModeValue("gray.800", "gray.300")}
                border="2px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="530px">
                <Stack gap="3" direction="column" overflowY="auto" pr="4">
                  <For each={resultPopularTopicList}>
                    {(contribution) => (
                      <Card.Root size="sm" width="100%" key={contribution.title} pt="0.5" height="150px" bg={useColorModeValue("gray.300", "gray.500")}>
                        <Card.Body gap="2" pl="8" pt="5">
                          <Flex alignItems="center" justifyContent="space-between" height="100%">
                            <Stack gap="5" direction="column" flex="1">
                              <Card.Title mb="-0.5" textStyle="sm">{contribution.title}</Card.Title>
                              <Stack gap="-0.5" direction="column">
                                <Text textStyle="2xs">Author: {contribution.authorName}</Text>
                                <Text textStyle="2xs">Created At: {contribution.createdAt}</Text>
                              </Stack>
                            </Stack>
                            <Card.Footer>
                              <Button 
                                  textStyle="xs" 
                                  width="65px" 
                                  height="30px" 
                                  onClick={() => directToDetails(contribution.id)}
                                >View
                              </Button>
                            </Card.Footer>
                          </Flex>
                        </Card.Body>
                      </Card.Root>
                    )}
                  </For>
                </Stack>
              </Box>
            </Box>
          </Flex>
        </Stack>
        )}
        
      </Container>

    );
};

export default HomePage;