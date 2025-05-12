import { Box, Button, Container, Flex, Text, Stack, For, Card, Portal, Input, Field, Dialog, Tabs, Link, InputGroup, IconButton, Textarea, Span, CloseButton} from "@chakra-ui/react";
import { LuPencilLine, LuTrash  } from "react-icons/lu"
import { useColorModeValue } from "../components/ui/color-mode";
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from 'react-router-dom';
import httpClient from "@/httpClient";
import ConfigHelper from "@/components/configHelper";

const ResearchDetailsPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const researchId = queryParams.get('param');
    const [authorName, setAuthorName] = useState();
    const [researchTitle, setResearchTitle] = useState("");
    const [authorId, setAuthorId] = useState("");
    const [researchDescription, setResearchDesc] = useState("");
    const [researchTags, setResearchTags] = useState("");
    const [createdAt, setResearchDate] = useState("");
    const [userName, setUserName] = useState("");
    const [loggedUserId, setLoggedUserId] = useState("");
    const [currentComment, setCurrentComment] = useState("");
    const [newComment, setNewComment] = useState("");
    const [resultCommentList, setResultCommentList] = useState([]);
    const LoggedUsername = ConfigHelper.getItem('username');
    const getUrlPrefix = ConfigHelper.getItem("url");
    const navigate = useNavigate();


    const fetchUserId = async () => {
        try {
            const resp = await httpClient.get(`${getUrlPrefix}/api/users/@me`);
            setUserName(resp.data.username)
            setLoggedUserId(resp.data.id)
        
            if (resp.status != 200) {
                alert("An error occurred. Please try again.");
            }
            
        } catch (e) {
            console.log(e);
            if (e.response?.status === 401) {
                navigate("/");
            } else {
            alert("An error occurred. Please try again.");
            }
        }
        };

    const fetchResearchData = async () => {
        try {
            const resp = await httpClient.get(`${getUrlPrefix}/api/researches/${researchId}`);
            if (resp.status === 200) {
                setAuthorName(resp.data.authorName)
                setAuthorId(resp.data.authorId)
                setResearchTitle(resp.data.title)
                setResearchDesc(resp.data.description)
                if (resp.data.tags && resp.data.tags.length > 0) {
                    const convertedTags = resp.data.tags.split(",").map(tag => tag.trim()).join(" ");
                    setResearchTags(convertedTags);
                }
                setResearchDate(resp.data.createdAt)

            }
            
            if (resp.status != 200) {
                alert("An error occurred. Please try again.");
            }
            
        } catch (e) {
            console.log(e);
            if (e.response?.status === 401) {
                navigate("/");
            } else {
            alert("An error occurred. Please try again.");
            }
        }
    };

    const fecthResearchComments = async () => {
        try {
            const resp = await httpClient.get(`${getUrlPrefix}/api/comments/research/${researchId}`);
            if (resp.status === 200) {
                setResultCommentList(resp.data);

            }
            
            if (resp.status != 200 & resp.status != 404) {
                alert("An error occurred. Please try again.");
            }
            
        } catch (e) {
            console.log(e);
            if (e.response?.status === 401) {
                navigate("/");
            } 
            else if (e.response?.status === 404) {
                //alert("There are no comments for this research");
            }
            else {
                alert("An error occurred. Please try again.");
            }
        }
    };

    const processTags = (input) => {
        const tags = input.split(",").map(tag => tag.trim());
        const validTags = tags.filter(tag => tag.startsWith("#") && !tag.includes(" "));
        return validTags.join(",");
      };

    const updateTopic = async () => {
        try {
            if (!researchTitle.trim() || !researchDescription.trim()) {
                alert("Title and description cannot be empty.");
                return;
            }
            const resp = await httpClient.put(`${getUrlPrefix}/api/researches/${researchId}`, {
                "title": researchTitle,
                "description": researchDescription,
                "tags":processTags(researchTags)
            });

            if (resp.status === 200) {
                fetchResearchData();
                alert("Research details updated successfully.");
                if (resp.data.tags && resp.data.tags.length > 0) {
                    const convertedTags = resp.data.tags.split(",").map(tag => tag.trim()).join(" ");
                    setResearchTags(convertedTags);
                }

            }
            
            if (resp.status != 200) {
                alert("An error occurred. Please try again.");
            }
            
        } catch (e) {
            console.log(e);
            if (e.response?.status === 401) {
                navigate("/");
            } else {
            alert("An error occurred. Please try again.");
            }
        }
    };

    const deleteResearch = async () => {
        try {
            const resp = await httpClient.delete(`${getUrlPrefix}/api/researches/${researchId}`);

            if (resp.status === 200) {
                alert("Research deleted successfully.");
                window.history.back();
            }
            
            if (resp.status != 200) {
                alert("An error occurred. Please try again.");
            }
            
        } catch (e) {
            console.log(e);
            if (e.response?.status === 401) {
                navigate("/");
            } else {
            alert("An error occurred. Please try again.");
            }
        }
    };

    const updateCurrentComment = async (commentId) => {
        try {
            if (!currentComment.trim()) {
                alert("Comment cannot be empty.");
                return;
            }

            const resp = await httpClient.put(`${getUrlPrefix}/api/comments/${commentId}`, {
                "comment": currentComment
            });

            if (resp.status === 200) {
                fecthResearchComments();
                alert("Comment updated successfully.");
            }
            
            if (resp.status != 200) {
                alert("An error occurred. Please try again.");
            }

        } catch (e) {
            console.log(e);
            if (e.response?.status === 401) {
                navigate("/");
            } else {
            alert("An error occurred. Please try again.");
            }
    }

    };

    const deleteCurrentComment = async (commentId) => {
        try {
            const resp = await httpClient.delete(`${getUrlPrefix}/api/comments/${commentId}`);

            if (resp.status === 200) {
                alert("Comment deleted successfully.");
                fecthResearchComments();
            }
            
            if (resp.status != 200) {
                alert("An error occurred. Please try again.");
            }
            
        } catch (e) {
            console.log(e);
            if (e.response?.status === 401) {
                navigate("/");
            } else {
            alert("An error occurred. Please try again.");
            }
        }
    };

    const addNewComment = async () => {
        try {
            if (newComment.length < 1) {
                alert("You cannot leave the comment area empty!");
            } 
            else {
                const resp = await httpClient.post(`${getUrlPrefix}/api/comments/create`, {
                    "researchId": researchId,
                    "comment": newComment
                }) ;
    
                if (resp.status === 200) {
                    alert("Comment added successfully.");
                    fecthResearchComments();
                }
                
                if (resp.status != 200) {
                    alert("An error occurred. Please try again.");
                }
            }
            
        } catch (e) {
            console.log(e);
            if (e.response?.status === 401) {
                navigate("/");
            } else {
                alert("An error occurred. Please try again.");
            }
        }
    };

    const directUserProfile = () => {
        if (authorId === loggedUserId) {
            navigate("/profile");
          }
          else {
            navigate(`/otherUserProfile?param=${authorId}`);
          }
    }

    const directToGraphPage = () => {
        navigate(`/graphPage?param=${researchId}&userId=${loggedUserId}`);
    }

    useEffect(() => {
        fetchUserId();
        fetchResearchData();
        fecthResearchComments();
    
    }, []);

    
    return (
        <Container>
            <Stack direction="row" spacing={4}>
                <Tabs.Root defaultValue="graph" width="500px">
                    <Tabs.List>
                        <Tabs.Trigger value="graph" asChild>
                            <Link unstyled href="#graph" fontSize="lg" fontWeight="bold" sx={{ pointerEvents: "none", cursor: "default" }}>
                                Research Graph
                            </Link>
                        </Tabs.Trigger>
                        
                    </Tabs.List>
                    <Tabs.Content value="graph">
                        <Box pl="2" maxWidth="600px"  pr="4" display="flex" flexDirection="column">
                            <Button 
                                    textStyle="lg" 
                                    minWidth="40px" 
                                    height="auto" 
                                    padding="8px"
                                    whiteSpace="normal"
                                    textAlign="center"
                                    alignSelf="center"
                                    mt={10}
                                    bg="blue.800"
                                    onClick={() => directToGraphPage()}
                                >
                                    Go to Research Connection Graph
                            </Button>
                            <Flex direction="column" pt="50px" justifyContent="space-between" wrap="nowrap" width="100%">
                                <Text fontSize="xl" fontWeight="bold" textDecoration="underline" pb="2">
                                    Topic Tags
                                </Text>
                                <Text fontSize="xs">
                                    {researchTags}
                                </Text>
                            </Flex>
                        </Box>
                    </Tabs.Content>
                </Tabs.Root>
                
                <Tabs.Root defaultValue="Researchs" pl="10" pb="10" width="80%">
                    <Tabs.List>
                        <Tabs.Trigger value="Researchs" asChild>
                            <Link unstyled href="#Researchs" fontSize="lg" fontWeight="bold">{researchTitle}</Link>
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="Researchs" >
                        <Box flex="1" display="flex" flexDirection="column">
                            <Box pt="4" pl="4" pr="4" pb="4" borderRadius={8} 
                                borderColor={useColorModeValue("gray.800", "gray.300")} 
                                    border="1px solid" display="flex" flexDirection="column" overflowY="auto" maxHeight="90vh">
                                <Stack gap="3" direction="column" height="100%" pr="4">
                                    <Card.Root size="sm" width="100%" pt="0.5" height="100%" bg={useColorModeValue("gray.300", "gray.500")}>
                                        <Card.Body gap="2" pl="8" pt="5">
                                            <Flex alignItems="center" justifyContent="space-between" height="100%">
                                                <Stack gap="5" direction="column" flex="1">
                                                    <Card.Title mb="-0.5" textStyle="md" fontWeight="normal">{researchDescription}</Card.Title>
                                                    <Flex justifyContent="space-between" alignItems="center">
                                                        <Stack gap="-0.5" direction="column">
                                                            <Text textStyle="2xs" pb="3" onClick={directUserProfile} style={{ cursor: 'pointer' }}>
                                                                Author: {authorName}
                                                            </Text>
                                                            <Text textStyle="2xs">Created At: {createdAt}</Text>
                                                        </Stack>
                                                        {userName === authorName && (
                                                            <Stack gap="2" direction="row">
                                                                {/* Only show the Edit button for the author */}
                                                                <Dialog.Root size="cover" placement="center" motionPreset="slide-in-bottom">
                                                                    <Dialog.Trigger asChild>
                                                                        <IconButton
                                                                            aria-label="Call support"
                                                                            key="surface"
                                                                            variant="surface"
                                                                        >
                                                                            <LuPencilLine />
                                                                        </IconButton>
                                                                    </Dialog.Trigger>
                                                                    <Portal>
                                                                        <Dialog.Backdrop />
                                                                        <Dialog.Positioner pr="24" pl="24">
                                                                            <Dialog.Content>
                                                                                <Dialog.Header>
                                                                                    <Dialog.Title>Update Research Discussion Details</Dialog.Title>
                                                                                </Dialog.Header>
                                                                                <Dialog.Body pb="4">
                                                                                    <Stack gap="4">
                                                                                        <Field.Root required>
                                                                                            <Field.Label>Title <Field.RequiredIndicator /></Field.Label>
                                                                                            <Input value={researchTitle} onChange={(e) => setResearchTitle(e.target.value)} placeholder="Enter research title..." />
                                                                                        </Field.Root>
                                                                                        <Field.Root required>
                                                                                            <Field.Label>Description <Field.RequiredIndicator /></Field.Label>
                                                                                            <InputGroup
                                                                                                endElement={
                                                                                                    <Span color="fg.muted" textStyle="xs" position="relative" pt="180px">
                                                                                                        {researchDescription.length} / {1000}
                                                                                                    </Span>
                                                                                                }
                                                                                            >
                                                                                                <Textarea value={researchDescription} maxLength={1000} onChange={(e) => setResearchDesc(e.target.value)} placeholder="Enter research description..." height="200px" variant="outline" />
                                                                                            </InputGroup>
                                                                                        </Field.Root>
                                                                                        <Field.Root required>
                                                                                            <Field.Label>Tags <Field.RequiredIndicator /></Field.Label>
                                                                                            <Input value={researchTags} onChange={(e) => setResearchTags(e.target.value)} placeholder="Enter research topics..." />
                                                                                            <Field.HelperText fontSize="2xs">You can add as many tags as you want. You need to add '#' in front of each tag and separate them with ','. Also, you should not use space characters in your tags. Tags that do not satisfy these requirements will not be added to the tag list.</Field.HelperText>
                                                                                            <Field.HelperText fontSize="2xs">e.g., #chatGPT, #GenerativeAI, #LLMSs, #bigData, #workingWithKubernetes</Field.HelperText>
                                                                                        </Field.Root>
                                                                                    </Stack>
                                                                                </Dialog.Body>
                                                                                <Dialog.Footer>
                                                                                    <Dialog.ActionTrigger asChild>
                                                                                        <Button variant="outline">Cancel</Button>
                                                                                    </Dialog.ActionTrigger>
                                                                                    <Dialog.ActionTrigger asChild>
                                                                                        <Button bg="blue.800" onClick={() => updateTopic()} disabled={researchTitle.trim() === "" || researchDescription.trim() === ""}>Update</Button>
                                                                                    </Dialog.ActionTrigger>
                                                                                </Dialog.Footer>
                                                                            </Dialog.Content>
                                                                        </Dialog.Positioner>
                                                                    </Portal>
                                                                </Dialog.Root>
                                                                {/* Only show the Delete button for both the author and admin */}
                                                                <Dialog.Root role="alertdialog" placement="center">
                                                                    <Dialog.Trigger asChild>
                                                                        <IconButton
                                                                            aria-label="Call support"
                                                                            key="surface"
                                                                            colorPalette="red"
                                                                            variant="surface"
                                                                        >
                                                                            <LuTrash />
                                                                        </IconButton>
                                                                    </Dialog.Trigger>
                                                                    <Portal>
                                                                        <Dialog.Backdrop />
                                                                        <Dialog.Positioner>
                                                                            <Dialog.Content>
                                                                                <Dialog.Header>
                                                                                    <Dialog.Title>Delete Research?</Dialog.Title>
                                                                                </Dialog.Header>
                                                                                <Dialog.Body>
                                                                                    <p>
                                                                                        Are you sure you want to delete your research? This action cannot be undone. This will permanently delete your
                                                                                        research, comments, and connection graph from our system.
                                                                                    </p>
                                                                                </Dialog.Body>
                                                                                <Dialog.Footer>
                                                                                    <Dialog.ActionTrigger asChild>
                                                                                        <Button variant="outline">Cancel</Button>
                                                                                    </Dialog.ActionTrigger>
                                                                                    <Dialog.ActionTrigger asChild>
                                                                                        <Button colorPalette="red" onClick={() => deleteResearch()}>Delete</Button>
                                                                                    </Dialog.ActionTrigger>
                                                                                </Dialog.Footer>
                                                                                <Dialog.CloseTrigger asChild>
                                                                                    <CloseButton size="sm" />
                                                                                </Dialog.CloseTrigger>
                                                                            </Dialog.Content>
                                                                        </Dialog.Positioner>
                                                                    </Portal>
                                                                </Dialog.Root>
                                                            </Stack>
                                                        )}

                                                        {/* Only show the Delete button for the admin */}
                                                        {LoggedUsername === "admin" && (
                                                            <Stack gap="2" direction="row">
                                                                <Dialog.Root role="alertdialog" placement="center">
                                                                    <Dialog.Trigger asChild>
                                                                        <IconButton
                                                                            aria-label="Call support"
                                                                            key="surface"
                                                                            colorPalette="red"
                                                                            variant="surface"
                                                                        >
                                                                            <LuTrash />
                                                                        </IconButton>
                                                                    </Dialog.Trigger>
                                                                    <Portal>
                                                                        <Dialog.Backdrop />
                                                                        <Dialog.Positioner>
                                                                            <Dialog.Content>
                                                                                <Dialog.Header>
                                                                                    <Dialog.Title>Delete Research?</Dialog.Title>
                                                                                </Dialog.Header>
                                                                                <Dialog.Body>
                                                                                    <p>
                                                                                        Are you sure you want to delete this research? This action cannot be undone. This will permanently delete your
                                                                                        research, comments, and connection graph from the system.
                                                                                    </p>
                                                                                </Dialog.Body>
                                                                                <Dialog.Footer>
                                                                                    <Dialog.ActionTrigger asChild>
                                                                                        <Button variant="outline">Cancel</Button>
                                                                                    </Dialog.ActionTrigger>
                                                                                    <Dialog.ActionTrigger asChild>
                                                                                        <Button colorPalette="red" onClick={() => deleteResearch()}>Delete</Button>
                                                                                    </Dialog.ActionTrigger>
                                                                                </Dialog.Footer>
                                                                                <Dialog.CloseTrigger asChild>
                                                                                    <CloseButton size="sm" />
                                                                                </Dialog.CloseTrigger>
                                                                            </Dialog.Content>
                                                                        </Dialog.Positioner>
                                                                    </Portal>
                                                                </Dialog.Root>
                                                            </Stack>
                                                        )}

                                                    </Flex>
                                                </Stack>
                                            </Flex>
                                        </Card.Body>
                                    </Card.Root>
                                    <Box flex="1" display="flex" flexDirection="column">
                                        <Stack gap="3" direction="row" height="100%" pr="4" justify="space-between">
                                            <Text textStyle="xl" fontWeight="bold" pt={2}>Comments</Text>
                                            <Dialog.Root placement="center" motionPreset="slide-in-bottom">
                                                <Dialog.Trigger asChild>
                                                    <IconButton
                                                        aria-label="Call support"
                                                        bg="blue.800"
                                                        width={200}
                                                        textStyle="md" 
                                                        textAlign="center"
                                                        alignSelf="center"
                                                        >
                                                        <LuPencilLine  />Add new Comment
                                                    </IconButton>
                                                </Dialog.Trigger>
                                                <Portal>
                                                    <Dialog.Backdrop />
                                                    <Dialog.Positioner pr="24" pl="24">
                                                        <Dialog.Content>
                                                            <Dialog.Header>
                                                                <Dialog.Title>Add new comment</Dialog.Title>
                                                            </Dialog.Header>
                                                            <Dialog.Body pb="4">
                                                                <Stack gap="4">
                                                                    <Field.Root>
                                                                        <Field.Label>Write your comment</Field.Label>
                                                                        <InputGroup
                                                                            endElement={
                                                                                <Span color="fg.muted" textStyle="xs" position="relative" pt="280px">
                                                                                {newComment.length} / {1000}
                                                                                </Span>
                                                                            }
                                                                        >
                                                                            <Textarea value={newComment} placeholder="write your comment here..." maxLength={1000} onChange={(e) => setNewComment(e.target.value)} height="300px" variant="outline" />
                                                                        </InputGroup>
                                                                    </Field.Root>
                                                                </Stack>
                                                            </Dialog.Body>
                                                            <Dialog.Footer>
                                                                <Dialog.ActionTrigger asChild>
                                                                    <Button variant="outline" onClick={() => setNewComment("")}>Cancel</Button>
                                                                </Dialog.ActionTrigger>
                                                                <Dialog.ActionTrigger asChild>
                                                                    <Button bg="blue.500" color="white" _hover={{ bg: "blue.600" }}  alignContent="center" onClick={() => addNewComment()}>Add</Button>
                                                                </Dialog.ActionTrigger>
                                                            </Dialog.Footer>
                                                        </Dialog.Content>
                                                    </Dialog.Positioner>
                                                </Portal>
                                            </Dialog.Root>
                                        </Stack>
                                        
                                        <For each={resultCommentList}>
                                            {(comment) => (
                                                <Box flex="1" display="flex" pt="3" flexDirection="row" alignItems="center">
                                                    <img src='/comment_arrow.png' alt='React logo' width={50} height={2} style={{ flexShrink: 0 }} />
                                                    <Card.Root size="sm" width="100%" key={"comment.title"} pt="0.5" height="100%" bg={useColorModeValue("gray.100", "gray.300")}>
                                                        <Card.Body gap="2" pl="8" pt="5">
                                                            <Flex alignItems="center" justifyContent="space-between" height="100%">
                                                                <Stack gap="5" direction="column" flex="1">
                                                                    <Card.Title mb="-0.5" textStyle="sm" fontWeight="normal">{comment.comment}</Card.Title>
                                                                    <Flex justifyContent="space-between" alignItems="center">
                                                                        <Stack gap="-0.5" direction="column">
                                                                            <Text
                                                                                textStyle="2xs"
                                                                                >
                                                                                    Author: {comment.author_name}
                                                                            </Text>
                                                                            <Text textStyle="2xs">Created At: {comment.created_at}</Text>
                                                                        </Stack>
                                                                        {/* Show both buttons for the comment author */}
                                                                        {(userName === comment.author_name && LoggedUsername !== "admin") &&  (
                                                                            <Stack gap="2" direction="row">
                                                                                {/* Edit button for the comment author */}
                                                                                <Dialog.Root placement="center" motionPreset="slide-in-bottom">
                                                                                    <Dialog.Trigger asChild>
                                                                                        <IconButton
                                                                                            aria-label="Edit comment"
                                                                                            key="surface"
                                                                                            variant="surface"
                                                                                        >
                                                                                            <LuPencilLine />
                                                                                        </IconButton>
                                                                                    </Dialog.Trigger>
                                                                                    <Portal>
                                                                                        <Dialog.Backdrop />
                                                                                        <Dialog.Positioner pr="24" pl="24">
                                                                                            <Dialog.Content>
                                                                                                <Dialog.Header>
                                                                                                    <Dialog.Title>Update Comment</Dialog.Title>
                                                                                                </Dialog.Header>
                                                                                                <Dialog.Body pb="4">
                                                                                                    <Stack gap="4">
                                                                                                        <Field.Root>
                                                                                                            <Field.Label>Your comment</Field.Label>
                                                                                                            <InputGroup>
                                                                                                                <Textarea
                                                                                                                    value={currentComment}
                                                                                                                    placeholder="Write your comment here..."
                                                                                                                    maxLength={1000}
                                                                                                                    onChange={(e) => setCurrentComment(e.target.value)}
                                                                                                                    height="300px"
                                                                                                                    variant="outline"
                                                                                                                />
                                                                                                            </InputGroup>
                                                                                                        </Field.Root>
                                                                                                    </Stack>
                                                                                                </Dialog.Body>
                                                                                                <Dialog.Footer>
                                                                                                    <Dialog.ActionTrigger asChild>
                                                                                                        <Button variant="outline">Cancel</Button>
                                                                                                    </Dialog.ActionTrigger>
                                                                                                    <Dialog.ActionTrigger asChild>
                                                                                                        <Button
                                                                                                            bg="blue.500"
                                                                                                            color="white"
                                                                                                            _hover={{ bg: "blue.600" }}
                                                                                                            onClick={() => updateCurrentComment(comment.id)}
                                                                                                            alignContent="center"
                                                                                                        >
                                                                                                            Update
                                                                                                        </Button>
                                                                                                    </Dialog.ActionTrigger>
                                                                                                </Dialog.Footer>
                                                                                            </Dialog.Content>
                                                                                        </Dialog.Positioner>
                                                                                    </Portal>
                                                                                </Dialog.Root>

                                                                                {/* Delete button for both the author and admin */}
                                                                                <Dialog.Root role="alertdialog" placement="center">
                                                                                    <Dialog.Trigger asChild>
                                                                                        <IconButton
                                                                                            aria-label="Delete comment"
                                                                                            key="surface"
                                                                                            colorPalette="red"
                                                                                            variant="surface"
                                                                                        >
                                                                                            <LuTrash />
                                                                                        </IconButton>
                                                                                    </Dialog.Trigger>
                                                                                    <Portal>
                                                                                        <Dialog.Backdrop />
                                                                                        <Dialog.Positioner>
                                                                                            <Dialog.Content>
                                                                                                <Dialog.Header>
                                                                                                    <Dialog.Title>Delete Comment?</Dialog.Title>
                                                                                                </Dialog.Header>
                                                                                                <Dialog.Body>
                                                                                                    <p>
                                                                                                        Are you sure you want to delete your comment? This action cannot be undone. It will permanently delete your comment from our systems.
                                                                                                    </p>
                                                                                                </Dialog.Body>
                                                                                                <Dialog.Footer>
                                                                                                    <Dialog.ActionTrigger asChild>
                                                                                                        <Button variant="outline">Cancel</Button>
                                                                                                    </Dialog.ActionTrigger>
                                                                                                    <Dialog.ActionTrigger asChild>
                                                                                                        <Button colorPalette="red" onClick={() => deleteCurrentComment(comment.id)}>Delete</Button>
                                                                                                    </Dialog.ActionTrigger>
                                                                                                </Dialog.Footer>
                                                                                                <Dialog.CloseTrigger asChild>
                                                                                                    <CloseButton size="sm" />
                                                                                                </Dialog.CloseTrigger>
                                                                                            </Dialog.Content>
                                                                                        </Dialog.Positioner>
                                                                                    </Portal>
                                                                                </Dialog.Root>
                                                                            </Stack>
                                                                        )}

                                                                        {/* Show only the delete button for the admin */}
                                                                        {LoggedUsername === "admin" && (
                                                                            <Stack gap="2" direction="row">
                                                                                <Dialog.Root role="alertdialog" placement="center">
                                                                                    <Dialog.Trigger asChild>
                                                                                        <IconButton
                                                                                            aria-label="Delete comment"
                                                                                            key="surface"
                                                                                            colorPalette="red"
                                                                                            variant="surface"
                                                                                        >
                                                                                            <LuTrash />
                                                                                        </IconButton>
                                                                                    </Dialog.Trigger>
                                                                                    <Portal>
                                                                                        <Dialog.Backdrop />
                                                                                        <Dialog.Positioner>
                                                                                            <Dialog.Content>
                                                                                                <Dialog.Header>
                                                                                                    <Dialog.Title>Delete Comment?</Dialog.Title>
                                                                                                </Dialog.Header>
                                                                                                <Dialog.Body>
                                                                                                    <p>
                                                                                                        Are you sure you want to delete this comment? This action cannot be undone. It will permanently delete this comment from our systems.
                                                                                                    </p>
                                                                                                </Dialog.Body>
                                                                                                <Dialog.Footer>
                                                                                                    <Dialog.ActionTrigger asChild>
                                                                                                        <Button variant="outline">Cancel</Button>
                                                                                                    </Dialog.ActionTrigger>
                                                                                                    <Dialog.ActionTrigger asChild>
                                                                                                        <Button colorPalette="red" onClick={() => deleteCurrentComment(comment.id)}>Delete</Button>
                                                                                                    </Dialog.ActionTrigger>
                                                                                                </Dialog.Footer>
                                                                                                <Dialog.CloseTrigger asChild>
                                                                                                    <CloseButton size="sm" />
                                                                                                </Dialog.CloseTrigger>
                                                                                            </Dialog.Content>
                                                                                        </Dialog.Positioner>
                                                                                    </Portal>
                                                                                </Dialog.Root>
                                                                            </Stack>
                                                                        )}

                                                                    </Flex>
                                                                    
                                                                </Stack>
                                                            </Flex>
                                                        </Card.Body>
                                                    </Card.Root>
                                                </Box>
                                            )}
                                        </For>
                                    </Box>
                                </Stack>
                            </Box>
                        </Box>
                    </Tabs.Content>
                </Tabs.Root>
                
            </Stack>
        </Container>
    );        
};

export default ResearchDetailsPage;
