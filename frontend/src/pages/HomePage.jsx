import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import httpClient from "@/httpClient";
import { Box, Button, Container, Flex, Text, Stack, For, Card, Grid, Dialog, Portal, Field, Input, Textarea, InputGroup, Span } from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode";

const HomePage = () => {

    const [topicTitle, setTopicTitle] = useState("");
    const [topicDescription, setTopicDescription] = useState("");
    const [topicTags, setTopicTags] = useState("");
    const navigate = useNavigate();

    const MAX_CHARACTERS = 500

    const fetchData = async () => {
      try {
        const resp = await httpClient.get("//localhost:5000/api/users/@me");
        console.log(resp.status)
        if (resp.status != 200) {
          window.location.href = "/login";
        }
        
      } catch (e) {
        console.log(e);
        if (e.response?.status === 401) {
          window.location.href = "/";
        } else {
          alert("An error occurred. Please try again.");
        }
      }
    };

    useEffect(() => {
      //fetchData();
    });

    const createTopic = async () => {
            console.log(topicTitle);
            console.log(topicDescription);
            console.log(topicTags);
            setTopicTitle("");
            setTopicDescription("");
            setTopicTags("");
    
        };


    const topics = [
      { title: "The usage of multi-agent LLMs in Code Generation", author: "esranzm", date: "2025-03-18 16:43:54" },
      { title: "Which AI tool is best for unit test creation?", author: "esranzm", date: "2025-03-18 16:45:12" },
      { title: "Kotlin vs Flutter. Which one to choose?", author: "esranzm", date: "2025-03-18 16:47:30" },
      { title: "Advanced Kotlin Features You Should Know", author: "esranzm", date: "2025-03-19 09:15:00" },
      { title: "How to Optimize Your Android Application's Performance", author: "esranzm", date: "2025-03-19 09:30:23" },
      { title: "Exploring the Future of Artificial Intelligence in Software Development", author: "esranzm", date: "2025-03-19 09:45:45" },
      { title: "Best Practices for Working with APIs in Mobile Development", author: "esranzm", date: "2025-03-19 10:00:12" }
    ];

    const contributions = [
        { title: "Tips for Writing Efficient SQL Queries in Kotlin", author: "esranzm", date: "2025-03-19 10:10:34" },
        { title: "What Makes Kotlin a Great Choice for Android Development?", author: "esranzm", date: "2025-03-19 10:20:51" },
        { title: "The Role of Machine Learning in Modern Software Engineering", author: "esranzm", date: "2025-03-19 10:35:18" },
        { title: "Unit Testing Best Practices in Kotlin", author: "esranzm", date: "2025-03-19 10:50:03" },
        { title: "How to Build Scalable Web Applications with Kotlin and Spring Boot", author: "esranzm", date: "2025-03-19 11:05:25" },
        { title: "Understanding the Basics of Kotlin Coroutines", author: "esranzm", date: "2025-03-19 11:20:42" }
        ];
      
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


    return (
      <Container maxW="100%">
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
                  <For each={topics}>
                    {(topic) => (
                      <Card.Root size="sm" width="100%" key={topic.title} pt="0.5" height="150px" bg={useColorModeValue("gray.300", "gray.500")}>
                        <Card.Body gap="2" pl="8" pt="5">
                          <Flex alignItems="center" justifyContent="space-between" height="100%">
                            <Stack gap="5" direction="column" flex="1">
                              <Card.Title mb="-0.5" textStyle="sm">{topic.title}</Card.Title>
                              <Stack gap="-0.5" direction="column">
                                <Text textStyle="2xs">Author: {topic.author}</Text>
                                <Text textStyle="2xs">Created At: {topic.date}</Text>
                              </Stack>
                            </Stack>
                            <Card.Footer>
                              <Button textStyle="xs" width="65px" height="30px">View</Button>
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
              <Text fontSize="lg" fontWeight="bold" mb={2}>Hot Topics 🔥</Text> 
              <Box pt="4" px="4" pb="4" borderRadius={8} borderColor={useColorModeValue("gray.800", "gray.300")}
                border="2px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="530px">
                <Stack gap="3" direction="column" overflowY="auto" pr="4">
                  <For each={contributions}>
                    {(contribution) => (
                      <Card.Root size="sm" width="100%" key={contribution.title} pt="0.5" height="150px" bg={useColorModeValue("gray.300", "gray.500")}>
                        <Card.Body gap="2" pl="8" pt="5">
                          <Flex alignItems="center" justifyContent="space-between" height="100%">
                            <Stack gap="5" direction="column" flex="1">
                              <Card.Title mb="-0.5" textStyle="sm">{contribution.title}</Card.Title>
                              <Stack gap="-0.5" direction="column">
                                <Text textStyle="2xs">Author: {contribution.author}</Text>
                                <Text textStyle="2xs">Created At: {contribution.date}</Text>
                              </Stack>
                            </Stack>
                            <Card.Footer>
                              <Button textStyle="xs" width="65px" height="30px">View</Button>
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
      </Container>

    );
};

export default HomePage;