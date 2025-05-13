import "../components/pageDesigns/ProfilePage.css";
import { Box, Button, Container, Flex, Text, Stack, For, Card, Image, Input, DataList, Tabs, Link, Group, Dialog, Portal, CloseButton} from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode";
import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import httpClient from "@/httpClient";
import ConfigHelper from "@/components/configHelper";

const OtherUserProfilePage = () => {

    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [occupation, setOccupation] = useState("");
    const [image, setImage] = useState("");
    const [bio, setBio] = useState("");
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('param');
    const [searchedTopic, setSearchedTopic] = useState("");
    const [searchedContributions, setSearchedContributionsTopic] = useState("");
    const [resultContributionsList, setResultContributionsList] = useState([]);
    const [resultTopicList, setResultTopicList] = useState([]);
    const LoggedUsername = ConfigHelper.getItem('username');
    const getUrlPrefix = ConfigHelper.getItem("url");
    const navigate = useNavigate();

    const currentUser = [
            { label: "Name", value: name },
            { label: "SurName", value: surname },
            { label: "username", value: username },
            { label: "Email", value: email },
            { label: "Occupation", value: occupation },
    ]
    
    const fetchData = async () => {
        try {
            const resp = await httpClient.get(`${getUrlPrefix}/api/users/getSearchedUser/${userId}`);
            setUsername(resp.data.username)
            setName(resp.data.name)
            setSurname(resp.data.surname)
            setEmail(resp.data.email)
            setOccupation(resp.data.occupation)
            setImage(resp.data.img_url)
            setBio(resp.data.bio ?? "Enter Bio description...")
            console.log(image)
        
            if (resp.status != 200) {
                alert("An error occurred. Please try again.");
            }
            
        } catch (e) {
            console.log(e);
            if (e.response?.status === 401) {
                navigate("/")
            } else {
                alert("An error occurred. Please try again.");
            }
        }
    };

    const fetchResearchData = async () => {
        try {
            console.log(userId);  
            const resp = await httpClient.get(`${getUrlPrefix}/api/researches/user/${userId}`);
            
        
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
                //alert(`No research found for the user ${username}`);
            }
        }
    };

    const fetchCommentsResearchData = async () => {
        try {
            console.log(userId);  
            const resp = await httpClient.get(`${getUrlPrefix}/api/comments/user/${userId}`);
            
        
            if (resp.status != 200) {
                alert("An error occurred. Please try again.");
            }
            else if(resp.status === 200) {
            setResultContributionsList(resp.data)
            }
            
        } catch (e) {
            console.log(e);
            if (e.response?.status === 401) {
                //window.location.href = "/";
            } else {
                //alert(`No comments/contributions found for the user ${username}`);
            }
        }
    };

    useEffect(() => {
            
        fetchData();
        if (userId) {
            fetchResearchData();
            fetchCommentsResearchData();
        }
    
        }, [userId]
    );

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

    const searchContributions = () => {
        if (searchedContributions === "") 
        { 
            setResultContributionsList(resultContributionsList);
          return;
        }
        const filterContributionsBySearch = resultContributionsList.filter((contribution) => 
            contribution.title.toLowerCase().includes(searchedContributions.toLowerCase()) || 
            contribution.authorName.toLowerCase().includes(searchedContributions.toLowerCase())
        )
        setResultContributionsList(filterContributionsBySearch);
      }

    const deleteUser = async () => {
        try {
            const resp = await httpClient.delete(`${getUrlPrefix}/api/users/${userId}`, {});

            if (resp.status === 200) {
                navigate(-1);
                alert("User deleted successfully");
            }
            else {
                alert("Error deleting account. Status code: " + resp.status);
            }
    
        }
        catch (e) {
            console.log(e.response.data)
            if (e.response.status === 400) {
                alert("User not found");
            }
            else {
                alert("Something went wrong!");
            }
        }
    
    };

    const directToDetails = (topicId) => {
        navigate(`/researchDetails?param=${topicId}`);
    };

    
    return (
        <Container>
            <Stack direction="row" spacing={4}>
                <Tabs.Root defaultValue="profile">
                    <Tabs.List>
                        <Tabs.Trigger value="profile" asChild>
                            <Link unstyled href="#profile" fontSize="lg" fontWeight="bold" sx={{ pointerEvents: "none", cursor: "default" }}>
                                {username}'s Profile Information
                            </Link>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Bio" asChild>
                            <Link unstyled href="#Bio" fontSize="lg" fontWeight="bold" sx={{ pointerEvents: "none", cursor: "default" }}>
                                About {username}
                            </Link>
                        </Tabs.Trigger>
                        
                    </Tabs.List>
                    <Tabs.Content value="profile">
                        <Box  display="flex" flexDirection="column" width="400px">
                            <Box pt="4" pl="4" pr="4" pb="4"
                            alignItems="center"
                                borderRadius={8} bg={useColorModeValue("gray.100", "gray.500")} 
                                borderColor={useColorModeValue("gray.800", "gray.300")} 
                                border="1px solid"
                                display="flex" flexDirection="column"  >
                                <Stack gap="1" direction="column">
                                    <Stack alignItems="center">
                                        <Image
                                            src={image}
                                            boxSize="150px"
                                            borderRadius="full"
                                            fit="cover"
                                        />
                                    </Stack>
                                    
                                    <DataList.Root orientation="horizontal" divideY="1px" maxW="sm">
                                        {currentUser.map((info) => (
                                            <DataList.Item key={info.label} pt="2">
                                                <DataList.ItemLabel>{info.label}</DataList.ItemLabel>
                                                <DataList.ItemValue>{info.value}</DataList.ItemValue>
                                            </DataList.Item>
                                        ))}
                                    </DataList.Root>
                                    <Stack gap="1" direction="column" pt="5">
                                        {LoggedUsername === "admin" && (
                                            <Dialog.Root role="alertdialog" placement="center">
                                            <Dialog.Trigger asChild>
                                                <Button>
                                                    Delete User Profile
                                                </Button>
                                            </Dialog.Trigger>
                                            <Portal>
                                                <Dialog.Backdrop />
                                                <Dialog.Positioner>
                                                    <Dialog.Content>
                                                        <Dialog.Header>
                                                            <Dialog.Title>Delete User Account?</Dialog.Title>
                                                        </Dialog.Header>
                                                        <Dialog.Body>
                                                            <p>
                                                                Are you sure you want to delete the current user account? This action cannot be undone. This will permanently delete the
                                                                user account and remove user data from the systems.
                                                            </p>
                                                        </Dialog.Body>
                                                        <Dialog.Footer>
                                                            <Dialog.ActionTrigger asChild>
                                                                <Button variant="outline">Cancel</Button>
                                                            </Dialog.ActionTrigger>
                                                            <Dialog.ActionTrigger asChild>
                                                                <Button colorPalette="red" onClick={() => deleteUser()}>Delete</Button>
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
                    </Tabs.Content>
                    <Tabs.Content value="Bio">
                        <Box  display="flex" flexDirection="column" width="500px">
                            <Box pt="4" pl="4" pr="4" pb="4"
                                alignItems="center"
                                borderRadius={8} bg={useColorModeValue("gray.100", "gray.500")} 
                                borderColor={useColorModeValue("gray.800", "gray.300")} 
                                border="1px solid"
                                display="flex" flexDirection="column"  >
                                <Stack gap="4" alignItems="center">
                                <Image
                                        src={image}
                                        boxSize="150px"
                                        borderRadius="full"
                                        fit="cover"
                                    />
                                    
                                    <Text>Bio</Text>
                                    <Box p="4" borderWidth="3px" borderColor="border.disabled" color="fg.disabled" borderRadius={8} >
                                        <Text placeholder="To write your bio, click on update button">{bio ? bio : 'empty bio info'}</Text>
                                    </Box>
                                    
                                </Stack>
                            </Box>
                        </Box>
                    </Tabs.Content>
                </Tabs.Root>
                
                <Tabs.Root defaultValue="Researchs" pl="20">
                    <Tabs.List>
                        <Tabs.Trigger value="Researchs" asChild>
                            <Link unstyled href="#Researchs" fontSize="lg" fontWeight="bold">{username}'s Research Topics</Link>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Contributions" asChild>
                            <Link unstyled href="#Contributions" fontSize="lg" fontWeight="bold">{username}'s Contributions/Comments</Link>
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

                    <Tabs.Content value="Contributions">
                        <Box flex="1" display="flex" flexDirection="column">
                            <Box pt="4" pl="4" pr="4" pb="4" borderRadius={8} borderColor={useColorModeValue("gray.800", "gray.300")} border="1px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="500px">
                                <Stack gap="3" direction="column" overflowY="auto" pr="4">
                                    <Group attached w="full" maxW="2md">
                                        <Input flex="1" placeholder={`Search ${username}'s Contributions/comments`}  onChange={(e) => setSearchedContributionsTopic(e.target.value)}/>
                                        <Button bg={useColorModeValue("black.500", "gray.400")} onClick={() => searchContributions()}>
                                            Search
                                        </Button>
                                    </Group>
                                    <For each={resultContributionsList}>
                                    {(contribution) => (
                                        <Card.Root size="sm" width="100%" key={contribution.title} pt="0.5" height="150px" bg={useColorModeValue("gray.300", "gray.500")}>
                                            <Card.Body gap="2" pl="8" pt="5">
                                                <Flex alignItems="center" justifyContent="space-between" height="100%">
                                                    <Stack gap="5" direction="column" flex="1">
                                                        <Card.Title mb="-0.5" textStyle="md">{contribution.title}</Card.Title>
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
                                                            onClick={() => directToDetails(contribution.id)}>
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
                
            </Stack>
            
        </Container>
    );          
};

export default OtherUserProfilePage;