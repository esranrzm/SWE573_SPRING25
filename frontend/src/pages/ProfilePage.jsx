import "../components/pageDesigns/ProfilePage.css";
import { Box, Button, Container, Flex, Text, Stack, For, Card, Image, Portal, Input, Field, Dialog, CloseButton, DataList, Tabs, Link, InputGroup, Span, Textarea} from "@chakra-ui/react";
import { useColorModeValue } from "../components/ui/color-mode";
import { useRef, useState, useEffect } from "react"
import httpClient from "@/httpClient";

const ProfilePage = () => {
    //const ref = useRef<HTMLInputElement>(null)
    const [username, setUsername] = useState("testUsername");
    const [name, setName] = useState("testName");
    const [surname, setSurname] = useState("testSurname");
    const [email, setEmail] = useState("testEmail.gmail.com");
    const [occupation, setOccupation] = useState("test test");
    const [oldPassword, setOldPassword] = useState("test123");
    const [newPassword, setNewPassword] = useState("test123");
    const [image, setImage] = useState("https://avatar.iran.liara.run/public/girl?username=esra%20nur");
    const [userId, setUserId] = useState("");
    const [dummyBio, setBio] = useState("Passionate software engineer with expertise in Android development. Always eager to learn, solve problems, and build efficient solutions. Lover of tech, games, and innovation. 🚀");

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
        
        //fetchData();
    
      }, []);

    const currentUser = [
    { label: "Name", value: name },
    { label: "SurName", value: surname },
    { label: "username", value: username },
    { label: "Email", value: email },
    { label: "Occupation", value: occupation },
    ]

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

    const updateBioValues = async () => {
        
        console.log(dummyBio)

    };

    
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
                <Tabs.Root defaultValue="profile">
                    <Tabs.List>
                        <Tabs.Trigger value="profile" asChild>
                            <Link unstyled href="#profile" fontSize="lg" fontWeight="bold" sx={{ pointerEvents: "none", cursor: "default" }}>
                                Your Profile Information
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
                                    <Stack gap="6" direction="row" justifyContent="space-evenly" pt="5">
                                        <Stack gap="2" direction="row">
                                            <Dialog.Root role="alertdialog" placement="center">
                                                <Dialog.Trigger asChild>
                                                    <Button bg="red.500" color="white" _hover={{bg: "red.600"}} variant="outline">
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
                                        <Text placeholder="To write your bio, click on update button">{dummyBio}</Text>
                                    </Box>
                                    <Dialog.Root>
                                        <Dialog.Trigger asChild>
                                            <Button bg="blue.500" color="white" _hover={{ bg: "blue.600" }} onClick={() => setIsOpen(true)} variant="solid">Update</Button>
                                        </Dialog.Trigger>
                                        <Portal>
                                            <Dialog.Backdrop />
                                            <Dialog.Positioner>
                                                <Dialog.Content>
                                                    <Dialog.Header>
                                                        <Dialog.Title>Update Bio Information</Dialog.Title>
                                                    </Dialog.Header>
                                                    <Dialog.Body pb="4">
                                                        <Stack gap="4">
                                                            
                                                            <Field.Root>
                                                                <Field.Label>About you</Field.Label>
                                                                <InputGroup
                                                                    endElement={
                                                                        <Span color="fg.muted" textStyle="xs" position="relative" pt="180px">
                                                                        {dummyBio.length} / {200}
                                                                        </Span>
                                                                    }
                                                                >
                                                                    <Textarea value={dummyBio} placeholder="Enter Bio description..." maxLength={200} onChange={(e) => setBio(e.target.value)} height="200px" variant="outline" />
                                                                </InputGroup>
                                                            </Field.Root>
                                                            
                                                        </Stack>
                                                    </Dialog.Body>
                                                    <Dialog.Footer>
                                                        <Dialog.ActionTrigger asChild>
                                                            <Button variant="outline" >Cancel</Button>
                                                        </Dialog.ActionTrigger>
                                                        <Dialog.ActionTrigger asChild>
                                                            <Button bg="blue.500" color="white" _hover={{ bg: "blue.600" }}  alignContent="center" onClick={() => updateBioValues()}>Save</Button>
                                                        </Dialog.ActionTrigger>
                                                    </Dialog.Footer>
                                                </Dialog.Content>
                                            </Dialog.Positioner>
                                        </Portal>
                                    </Dialog.Root>  
                                </Stack>
                            </Box>
                        </Box>
                    </Tabs.Content>
                </Tabs.Root>
                
                <Tabs.Root defaultValue="Researchs" pl="20">
                    <Tabs.List>
                        <Tabs.Trigger value="Researchs" asChild>
                            <Link unstyled href="#Researchs" fontSize="lg" fontWeight="bold">Your Research Topics</Link>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Contributions" asChild>
                            <Link unstyled href="#Contributions" fontSize="lg" fontWeight="bold">Your Contributions/Comments</Link>
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="Researchs">
                        <Box flex="1"  display="flex" flexDirection="column">
                            <Box pt="4" pl="4" pr="4" pb="4" borderRadius={8} 
                                borderColor={useColorModeValue("gray.800", "gray.300")} 
                                    border="1px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="500px">
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
                    </Tabs.Content>

                    <Tabs.Content value="Contributions">
                        <Box flex="1" display="flex" flexDirection="column">
                            <Box pt="4" pl="4" pr="4" pb="4" borderRadius={8} borderColor={useColorModeValue("gray.800", "gray.300")} border="1px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="500px">
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
                    </Tabs.Content>
                </Tabs.Root>
                
            </Stack>
            
        </Container>
    );        
};

export default ProfilePage;