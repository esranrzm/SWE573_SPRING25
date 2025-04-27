import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useCallback} from 'react';
import httpClient from "@/httpClient";
import { Box, Button, Container, Flex, Text, Stack, For, Card, Grid, Input,  Group, Avatar } from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode";

const SearchUserPage = () => {


    const [searchedUser, setSearchedUser] = useState("");
    const [loggedUserId, setUserId] = useState("");
    const [resultUserList, setResultUserList] = useState([]);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const resp = await httpClient.get("//localhost:5000/api/users/@me");
            setUserId(resp.data.id);
            console.log(loggedUserId);
            if (resp.status != 200) {
                alert("An error occurred. Please try again.");
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

    const fetchUsers = useCallback(async () => {
      try {
        const resp = await httpClient.get("//localhost:5000/api/users");
        const updatedUserList = resp.data.filter(user => user.username !== "admin");
        if (updatedUserList.length === 0) {
            alert("No user found");
        }
        else {
            setResultUserList(updatedUserList)
        }
        
      } catch (e) {
        console.log(e);
        if (e.response?.status === 401) {
            alert("An error occurred. Please try again.");
        } else {
          alert("An error occurred. Please try again.");
        }
      }
    }, []);

    

    useEffect(() => {
        fetchData();
        const fetchAllData = async () => {
        await fetchUsers();
        };
        fetchAllData();
    }, [fetchUsers]);

    

    const searchUserProfile = () => {
        if (searchedUser === "") 
        { 
            fetchUsers();
            setResultUserList(resultUserList);
            return;
        }
        const filterBySearch = resultUserList.filter((user) => 
            user.username.toLowerCase().includes(searchedUser.toLowerCase()) || 
            user.name.toLowerCase().includes(searchedUser.toLowerCase())
        );
        setResultUserList(filterBySearch);
    }

    const directToDetails = (userId) => {
      // Navigate to another page with the topicId and filtered tags
      if (userId === loggedUserId) {
        navigate("/profile");
      }
      else {
        navigate(`/otherUserProfile?param=${userId}`);
      }
    };

    
    return (
        <Container maxW="100%">
        <Stack direction="column" spacing={4}>
          <Flex direction="row" justifyContent="center" wrap="nowrap" width="100%">
            <Box width="90%" pr="4" display="flex" flexDirection="column">
              <Text fontSize="lg" pl="2" fontWeight="bold" mb={2}>User Profiles</Text>
              <Box pt="4" px="4" pb="4" borderRadius={8} borderColor={useColorModeValue("gray.800", "gray.300")}
                border="2px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="530px">
                <Stack gap="3" direction="column" overflowY="auto" pr="4">
                  <Group attached w="full" maxW="2md">
                    <Input flex="1" placeholder="Search User Profile" onChange={(e) => setSearchedUser(e.target.value)} />
                    <Button bg={useColorModeValue("black.500", "gray.400")} onClick={() => searchUserProfile()}>
                      Search
                    </Button>
                  </Group>
      
                  {/* Use Grid to display cards */}
                  <Grid templateColumns="repeat(4, 1fr)" gap={10} pt="5" pb="5">
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
                                        <Button textStyle="sm" width="120px" height="40px" onClick={() => directToDetails(user.id)}>View Profile</Button>
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
          </Flex>
        </Stack>
      </Container>
      

    );
};

export default SearchUserPage;