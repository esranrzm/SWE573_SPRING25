import { Box, Button, Container, Flex, Text } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";
import { Link, useLocation } from 'react-router-dom';
import httpClient from "@/httpClient";

const Navbar = () => {

	const location = useLocation();
	// Check if the current route is one of the routes to hide buttons
	const hideButtons = ['/login', '/signup', '/'].includes(location.pathname);
	const Logout = async () => {

		try {
			const resp = await httpClient.post("//localhost:5000/api/users/logout", {});
			
			window.location.href = "/login"
		}
		catch (e) {
			console.log(e)
			if (e.response.status != 200) {
				alert("An error occured while logging out")
			}
		}

	};

	return (
		<Container maxW={"1500px"}>
			<Box px={4} my={4} borderRadius={5} bg={useColorModeValue("gray.500", "gray.800")}>
				<Flex h='16' alignItems={"center"} justifyContent={"space-between"}>
					{/* Left side */}
					<Flex
						alignItems={"center"}
						justifyContent={"center"}
						gap={3}
						display={{ base: "none", sm: "flex" }}
					>
						<img src='/react.png' alt='React logo' width={50} height={50} />
						{!hideButtons && (
						<>
							<Link to="/home">
								<Button>Home</Button>
							</Link>
						</>
						)}
					</Flex>
					{/* Right side */}
					<Flex gap={3} alignItems={"center"}>
						{!hideButtons && (
						<>
							<Link to="/profile">
							<Button>Profile</Button>
							</Link>
							<Button onClick={() => Logout()}>Logout</Button>
						</>
						)}
						
					</Flex>
				</Flex>
			</Box>
		</Container>
	);
};
export default Navbar;