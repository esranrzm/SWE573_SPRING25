
import { Button, Stack, Container, Text} from '@chakra-ui/react';
import React, { Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingHome from "./pages/LandingHome";
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  
  return (
    <Stack minH={"100vh"}>
			<Navbar />

			<Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<LandingHome />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
		</Stack>
  );
}

export default App
