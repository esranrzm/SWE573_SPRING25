import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import httpClient from "@/httpClient";
import { Box, Button, Container, Flex, Text, Stack, For, Card, Image, Portal, Input, Field, Dialog, CloseButton} from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode";

const HomePage = () => {

    const navigate = useNavigate();

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
      fetchData();
    });


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

  

    return (
      <Container>
          <Stack direction="column" spacing={4}>
              <Flex direction="row" justifyContent="space-between" wrap="wrap" width="100%">
                  
                  <Box flex="1" maxWidth="48%" my={4} display="flex" flexDirection="column">
                      <Text fontSize="lg" fontWeight="bold" mb={2}>Your Research Topics</Text>
                      
                      <Box pt="4" pl="4" pr="4" pb="4" borderRadius={8} borderColor={useColorModeValue("gray.800", "gray.300")} border="1px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="400px">
                          <Stack gap="3" direction="column" overflowY="auto" pr="4">
                              <For each={topics}>
                                  {(topic) => (
                                      <Card.Root size="sm" width="100%" key={topic.title} pt="0.5" height="150px" bg={useColorModeValue("gray.300", "gray.500")}>
                                          <Card.Body gap="2" pl="8" pt="5">
                                              <Flex alignItems="center" justifyContent="space-between" height="100%">
                                                  <Stack gap="5" direction="column" flex="1">
                                                      <Card.Title mb="-0.5" textStyle="md">{topic.title}</Card.Title>
                                                      <Stack gap="-0.5" direction="column">
                                                          <Text textStyle="2xs">Author: {topic.author}</Text>
                                                          <Text textStyle="2xs">Created At: {topic.date}</Text>
                                                      </Stack>
                                                  </Stack>
                                                  <Card.Footer>
                                                      <Button>View</Button>
                                                  </Card.Footer>
                                              </Flex>
                                          </Card.Body>
                                      </Card.Root>
                                  )}
                              </For>
                          </Stack>
                      </Box>
                  </Box>

                  <Box flex="1" maxWidth="48%" my={4} display="flex" flexDirection="column">
                      <Text fontSize="lg" fontWeight="bold" mb={2}>Your Contributions to the Topics</Text>
                      
                      <Box pt="4" pl="4" pr="4" pb="4" borderRadius={8} borderColor={useColorModeValue("gray.800", "gray.300")} border="1px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="400px">
                          <Stack gap="3" direction="column" overflowY="auto" pr="4">
                              <For each={contributions}>
                                  {(contribution) => (
                                      <Card.Root size="sm" width="100%" key={contribution.title} pt="0.5" height="150px" bg={useColorModeValue("gray.300", "gray.500")}>
                                          <Card.Body gap="2" pl="8" pt="5">
                                              <Flex alignItems="center" justifyContent="space-between" height="100%">
                                                  <Stack gap="5" direction="column" flex="1">
                                                      <Card.Title mb="-0.5" textStyle="md">{contribution.title}</Card.Title>
                                                      <Stack gap="-0.5" direction="column">
                                                          <Text textStyle="2xs">Author: {contribution.author}</Text>
                                                          <Text textStyle="2xs">Created At: {contribution.date}</Text>
                                                      </Stack>
                                                  </Stack>
                                                  <Card.Footer>
                                                      <Button>View</Button>
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