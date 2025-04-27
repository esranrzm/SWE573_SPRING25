import "../components/pageDesigns/ProfilePage.css";
import { Box, Button, Container, Flex, Text, Stack, For, Card, Input,  Tabs, Link, Group, Grid, Avatar} from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode";
import { useRef, useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import httpClient from "@/httpClient";

const AdminPage = () => {

    
    const [searchedTopic, setSearchedTopic] = useState("");
    const [searchedUser, setSearchedUser] = useState("");
    const [resultTopicList, setResultTopicList] = useState([]);
    const [resultUserList, setResultUserList] = useState([]);
    const navigate = useNavigate();

    const fetchResearchData = async () => {
    try {
        const resp = await httpClient.get(`//localhost:5000/api/researches`);

        if (resp.status != 200) {
            alert("An error occurred. Please try again.");
        }
        else if(resp.status === 200) {
        setResultTopicList(resp.data)
        }
        
    } catch (e) {
        console.log(e);
        if (e.response?.status === 401) {
        //window.location.href = "/";
        } else {
        alert("No research found");
        }
    }
    };

    const fetchUserData = async () => {
    try {
        const resp = await httpClient.get(`//localhost:5000/api/users`);

        if (resp.status != 200) {
            alert("An error occurred. Please try again.");
        }
        else if(resp.status === 200) {
            const updatedUserList = resp.data.filter(user => user.username !== "admin");
            if (updatedUserList.length === 0) {
                alert("No user found");
            }
            else {
                setResultUserList(updatedUserList)
            }
        }
        
    } catch (e) {
        console.log(e);
        if (e.response?.status === 401) {
        //window.location.href = "/";
        } else {
            alert("No user found");
        }
    }
    };

    

    useEffect(() => {
        
        fetchResearchData();
        fetchUserData();
    
      }, []);

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
    }

    const searchUser = () => {
        if (searchedUser === "") 
        { 
            fetchUserData();
            setResultUserList(resultUserList);
            return;
        }
        const filterBySearch = resultUserList.filter((item) => 
            item.username.toLowerCase().includes(searchedUser.toLowerCase()) || 
            item.name.toLowerCase().includes(searchedUser.toLowerCase())
        );
        setResultUserList(filterBySearch);
    }


    const directToDetails = (topicId) => {
        navigate(`/researchDetails?param=${topicId}`);
    };

    const directToProfileDetails = (userId) => {
        navigate(`/otherUserProfile?param=${userId}`);
    };

    return (
        <Container>
            
            <Stack direction="row" spacing={4}>
                <Tabs.Root defaultValue="Researchs" pl="5">
                    <Tabs.List>
                        <Tabs.Trigger value="Researchs" asChild>
                            <Link unstyled href="#Researchs" fontSize="lg" fontWeight="bold">All Research Topics</Link>
                        </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="Researchs">
                        <Box flex="1"  display="flex" flexDirection="column">
                            <Box pt="4" pl="4" pr="4" pb="4" borderRadius={8} 
                                borderColor={useColorModeValue("gray.800", "gray.300")} 
                                    border="1px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="500px">
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
                                                        <Card.Title mb="-0.5" textStyle="md">{topic.title}</Card.Title>
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
                                                            onClick={() => directToDetails(topic.id)}>
                                                            View
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
                    </Tabs.Content>
                </Tabs.Root>

                <Tabs.Root defaultValue="Users" pl="12">
                    <Tabs.List>
                        <Tabs.Trigger value="Users" asChild>
                            <Link unstyled href="#Users" fontSize="lg" fontWeight="bold">All Users</Link>
                        </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="Users">
                        <Box flex="1"  display="flex" flexDirection="column">
                            <Box pt="4" pl="4" pr="4" pb="4" borderRadius={8} 
                                borderColor={useColorModeValue("gray.800", "gray.300")} 
                                    border="1px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="500px">
                                <Stack gap="3" direction="column" overflowY="auto" pr="4">
                                    <Group attached w="full" maxW="2md">
                                        <Input flex="1" placeholder="Search User" onChange={(e) => setSearchedUser(e.target.value)}/>
                                        <Button bg={useColorModeValue("black.500", "gray.400")} onClick={() => searchUser()}>
                                            Search
                                        </Button>
                                    </Group>
                                    <Grid templateColumns="repeat(2, 1fr)" gap={10} pt="5" pb="5">
                                        <For each={resultUserList}>
                                            {(user) => (
                                            <Card.Root size="sm" width="100%" key={user.username} pt="0.5" height="auto" bg={useColorModeValue("gray.300", "gray.500")}>
                                                <Card.Body gap="2" pl="8" pt="5">
                                                <Flex direction="column" height="100%">
                                                    <Flex direction="column"  alignItems="center" >
                                                        <Avatar.Root key={"subtle"} variant={"subtle"} size="2xl">
                                                            <Avatar.Fallback name={`${user.name} ${user.surname}`} />
                                                        </Avatar.Root>
                                                        <Text fontSize="lg" fontWeight="bold" pt="6" pb="5" mb="2">{user.username}</Text>
                                                    </Flex>
                                                    <Flex direction="column">
                                                        <Stack direction="column" spacing={4}>
                                                            <Text textStyle="sm"><strong>Name:</strong> {user.name}</Text>
                                                            <Text textStyle="sm"><strong>Surname:</strong> {user.surname}</Text>
                                                            <Text textStyle="sm" style={{ 
                                                                width: '200px',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                color: user.bio ? 'inherit' : 'red'
                                                                }}>
                                                                <strong>Bio:</strong> {user.bio ? user.bio : 'empty bio info'}
                                                            </Text>
                                                        </Stack>
                                                    </Flex>
                    
                                                    <Flex direction="column"  alignItems="center" pt="6">
                                                        <Card.Footer mt="4" alignItems="center">
                                                            <Button textStyle="sm" width="120px" height="40px" onClick={() => directToProfileDetails(user.id)}>View Profile</Button>
                                                        </Card.Footer>
                                                    </Flex>
                                                    
                                                </Flex>
                                                </Card.Body>
                                            </Card.Root>
                                            
                                            )}
                                        </For>
                                    </Grid>
                                </Stack>
                            </Box>
                        </Box>
                    </Tabs.Content>
                </Tabs.Root>
            </Stack>
            
        </Container>
    );        
};

export default AdminPage;