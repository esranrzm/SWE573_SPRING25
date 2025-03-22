import "../components/pageDesigns/ProfilePage.css";
import { Box, Button, Container, Flex, Text, Stack, For, Card, Image, Portal, Input, Field, Dialog, CloseButton} from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode";
import { useRef, useState, useEffect } from "react"
import httpClient from "@/httpClient";

const ProfilePage = () => {
    //const ref = useRef<HTMLInputElement>(null)
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [occupation, setOccupation] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [image, setImage] = useState("");
    const [userId, setUserId] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const usernameRef = useRef(null); // Create a ref for the input

    const fetchData = async () => {
        try {
          const resp = await httpClient.get("//localhost:5000/api/users/@me");
          //console.log(resp.status)
          setUsername(resp.data.username)
          setName(resp.data.name)
          setSurname(resp.data.surname)
          setEmail(resp.data.email)
          setOccupation(resp.data.occupation)
          setImage(resp.data.img_url)
          setUserId(resp.data.id)
          setHashedPassword(resp.data.hashedPassword)
          console.log(image)
      
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

    useEffect(() => {
        
        fetchData();
    
      }, []);

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

    
    const updateValues = async () => {
            setIsOpen(false);
            try {
                const resp = await httpClient.put(`//localhost:5000/api/users/${userId}`, {
                    username,
                    name,
                    surname,
                    email,
                    occupation
                });

                if (resp.status === 200) {
                    alert("User updated successfully");
                    fetchData();
                }
                
                
            }
            catch (e) {
                console.log(e.response.data)
                if (e.response.status === 404) {
                    alert("User not found!");
                }
                else if (e.response.status === 400) {
                    fetchData();
                    alert("Same username is being used by another user, please try with another username");
                }
                else {
                    alert("Something went wrong!");
                }
            }
    
        };

    const Logout = async () => {
    
            try {
                const resp = await httpClient.post("//localhost:5000/api/users/logout", {});
                
                if(resp.status === 200) {
                    deleteAccount();
                }
                else {
                    alert("Logout failed with status: " + resp.status);
                }
            }
            catch (e) {
                console.log(e)
                if (e.response.status != 200) {
                    alert("An error occured while logging out")
                }
            }
    
        };
    
    const deleteAccount = async () => {
        try {
            const resp = await httpClient.delete(`//localhost:5000/api/users/${userId}`, {

            });

            if (resp.status === 200) {
                window.location.href = "/login"
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

    const updatePassword = async () => {
        try {
            const resp = await httpClient.put(`//localhost:5000/api/users/updatePass/${userId}`, {
                "oldPassword": oldPassword,
                "newPassword": newPassword
            });

            if (resp.status === 200) {
                alert("User password changed successfully");
                setOldPassword("");
                setNewPassword("");
                fetchData();
            }
            
            
        }
        catch (e) {
            console.log(e.response.data)
            if (e.response.status === 404) {
                alert("User not found!");
            }
            else if (e.response.status === 401) {
                alert("Current Password is not correct!");
            }
            else {
                alert("Something went wrong!");
            }
        }

    };

    return (
        <Container>
            <Stack direction="row" spacing={4}>
                <Box flex="1" alignItems="center"  display="flex" flexDirection="column">
                    <Text fontSize="lg" fontWeight="bold" mb={2}>Your Profile Information</Text>
                    
                    <Box pt="4" pl="4" pr="4" pb="4" borderRadius={8} bg={useColorModeValue("gray.100", "gray.500")} borderColor={useColorModeValue("gray.800", "gray.300")} border="1px solid" width="25%" maxWidth="1200px" display="flex" flexDirection="column"  maxHeight="900px">
                        <Stack gap="1" direction="column">
                            <Stack alignItems="center">
                                <Image
                                    src={image}
                                    boxSize="150px"
                                    borderRadius="full"
                                    fit="cover"
                                />
                                <Stack gap="2" direction="row">
                                    <Text fontSize="sm" fontWeight="bold" mb={2}>Username:</Text>
                                    <Text fontSize="sm" mb={2}>{username}</Text>
                                </Stack>
                            </Stack>
                            
                            <Stack gap="6" direction="row" pl="8">
                                <Stack gap="2" direction="row">
                                    <Text fontSize="sm" fontWeight="bold" mb={2} >Name:</Text>
                                    <Text fontSize="sm" mb={2} style={{
                                                                        whiteSpace: 'nowrap', 
                                                                        overflow: 'hidden', 
                                                                        textOverflow: 'ellipsis',
                                                                        maxWidth: '70px'
                                                                    }}>{name}
                                    </Text>
                                </Stack>
                                <Stack gap="2" direction="row">
                                    <Text fontSize="sm" fontWeight="bold" mb={2}>Surname:</Text>
                                    <Text fontSize="sm" mb={2} style={{
                                                                        whiteSpace: 'nowrap', 
                                                                        overflow: 'hidden', 
                                                                        textOverflow: 'ellipsis',
                                                                        maxWidth: '80px'
                                                                    }}>{surname}
                                        </Text>
                                </Stack>
                            </Stack>
                            <Stack gap="2" direction="row" pl="20">
                                <Text fontSize="sm" fontWeight="bold" mb={2}>Email:</Text>
                                <Text fontSize="sm" mb={2}>{email}</Text>
                            </Stack>
                            <Stack gap="2" direction="row" pl="10">
                                <Text fontSize="sm" fontWeight="bold" mb={2}>Profession/Occupation:</Text>
                                <Text fontSize="sm" mb={2} style={{
                                                                        whiteSpace: 'nowrap', 
                                                                        overflow: 'hidden', 
                                                                        textOverflow: 'ellipsis',
                                                                        maxWidth: '80px'
                                                                    }}>{occupation}
                                </Text>
                            </Stack>
                            <Stack gap="6" direction="row" justifyContent="space-evenly">
                                <Stack gap="2" direction="row">
                                    <Dialog.Root role="alertdialog" placement="center">
                                        <Dialog.Trigger asChild>
                                            <Button bg="red.500" color="white" _hover={{bg: "red.600"}} variant="outline" size="sm">
                                                Delete Profile
                                            </Button>
                                        </Dialog.Trigger>
                                        <Portal>
                                            <Dialog.Backdrop />
                                            <Dialog.Positioner>
                                                <Dialog.Content>
                                                    <Dialog.Header>
                                                        <Dialog.Title>Delete Account?</Dialog.Title>
                                                    </Dialog.Header>
                                                    <Dialog.Body>
                                                        <p>
                                                            Are you sure you want to delete your account? This action cannot be undone. This will permanently delete your
                                                            account and remove your data from our systems.
                                                        </p>
                                                    </Dialog.Body>
                                                    <Dialog.Footer>
                                                        <Dialog.ActionTrigger asChild>
                                                            <Button variant="outline">Cancel</Button>
                                                        </Dialog.ActionTrigger>
                                                        <Button colorPalette="red" onClick={() => Logout()}>Delete</Button>
                                                    </Dialog.Footer>
                                                    <Dialog.CloseTrigger asChild>
                                                        <CloseButton size="sm" />
                                                    </Dialog.CloseTrigger>
                                                </Dialog.Content>
                                            </Dialog.Positioner>
                                        </Portal>
                                    </Dialog.Root>
                                </Stack>
                                <Stack gap="2" direction="row">
                                    <Dialog.Root initialFocusEl={() => usernameRef.current}>
                                        <Dialog.Trigger asChild>
                                            <Button bg="blue.500" color="white" _hover={{ bg: "blue.600" }} onClick={() => setIsOpen(true)} variant="solid">Update Profile</Button>
                                        </Dialog.Trigger>
                                        <Portal>
                                            <Dialog.Backdrop />
                                            <Dialog.Positioner>
                                                <Dialog.Content>
                                                    <Dialog.Header>
                                                        <Dialog.Title>Update profile Information</Dialog.Title>
                                                    </Dialog.Header>
                                                    <Dialog.Body pb="4">
                                                        <Stack gap="4">
                                                            <Field.Root>
                                                                <Field.Label>Username</Field.Label>
                                                                <Input ref={usernameRef} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username"/>
                                                            </Field.Root>
                                                            <Field.Root>
                                                                <Field.Label>Name</Field.Label>
                                                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="name"/>
                                                            </Field.Root>
                                                            <Field.Root>
                                                                <Field.Label>Surname</Field.Label>
                                                                <Input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="surname"/>
                                                            </Field.Root>
                                                            <Field.Root>
                                                                <Field.Label>Email</Field.Label>
                                                                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email"/>
                                                            </Field.Root>
                                                            <Field.Root>
                                                                <Field.Label>Occupation</Field.Label>
                                                                <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="occupation"/>
                                                            </Field.Root>
                                                        </Stack>
                                                    </Dialog.Body>
                                                    <Dialog.Footer>
                                                        <Dialog.ActionTrigger asChild>
                                                            <Button variant="outline" >Cancel</Button>
                                                        </Dialog.ActionTrigger>
                                                        <Dialog.ActionTrigger asChild>
                                                            <Button bg="blue.500" color="white" _hover={{ bg: "blue.600" }} onClick={() => updateValues()}>Save</Button>
                                                        </Dialog.ActionTrigger>
                                                    </Dialog.Footer>
                                                </Dialog.Content>
                                            </Dialog.Positioner>
                                        </Portal>
                                    </Dialog.Root> 
                                </Stack>
                            </Stack>
                            <Stack alignItems="center" pt={2}>
                                <Dialog.Root initialFocusEl={() => usernameRef.current}>
                                    <Dialog.Trigger asChild>
                                        <Button onClick={() => setIsOpen(true)} variant="solid">Change Password</Button>
                                    </Dialog.Trigger>
                                    <Portal>
                                        <Dialog.Backdrop />
                                        <Dialog.Positioner>
                                            <Dialog.Content>
                                                <Dialog.Header>
                                                    <Dialog.Title>Update Password</Dialog.Title>
                                                </Dialog.Header>
                                                <Dialog.Body pb="4">
                                                    <Stack gap="4">
                                                        <Field.Root>
                                                            <Field.Label>Old Password</Field.Label>
                                                            <Input value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter your current password"/>
                                                        </Field.Root>
                                                        <Field.Root>
                                                            <Field.Label>New Password</Field.Label>
                                                            <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password"/>
                                                        </Field.Root>
                                                    </Stack>
                                                </Dialog.Body>
                                                <Dialog.Footer>
                                                    <Dialog.ActionTrigger asChild>
                                                        <Button variant="outline" >Cancel</Button>
                                                    </Dialog.ActionTrigger>
                                                    <Dialog.ActionTrigger asChild>
                                                        <Button onClick={() => updatePassword()}>Save</Button>
                                                    </Dialog.ActionTrigger>
                                                </Dialog.Footer>
                                            </Dialog.Content>
                                        </Dialog.Positioner>
                                    </Portal>
                                </Dialog.Root>
                            </Stack>
                        </Stack>
                    </Box>
                </Box>
            </Stack>
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

export default ProfilePage;