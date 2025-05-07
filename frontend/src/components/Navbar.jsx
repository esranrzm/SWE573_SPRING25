import { Box, Button, Container, Flex, Text } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import httpClient from "@/httpClient";
import ConfigHelper from "./configHelper";

const Navbar = () => {

	const location = useLocation();
	// Check if the current route is one of the routes to hide buttons
	const hideButtons = ['/login', '/signUp', '/'].includes(location.pathname);
	const username = ConfigHelper.getItem('username');
	const getUrlPrefix = ConfigHelper.getItem("url");
	const navigate = useNavigate();

	const Logout = async () => {
 
		try {
			const resp = await httpClient.post(`${getUrlPrefix}/api/users/logout`, {});
			navigate("/login");
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
							<Link to="/searchUser">
								<Button>Search User profile</Button>
							</Link>
							<Link to={username === "admin" ? "/adminPage" : "/profile"}>
								<Button>{username === "admin" ? "Admin Panel" : "Profile"}</Button>
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