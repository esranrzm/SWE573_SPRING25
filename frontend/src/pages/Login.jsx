
import React, { useState } from "react";
import { Button } from "@chakra-ui/react";
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";
import "../components/pageDesigns/Login.css";
import ConfigHelper from '../components/configHelper';
import httpClient from "@/httpClient";
import { Spinner, Text, VStack  } from '@chakra-ui/react';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();
    const getUrlPrefix = ConfigHelper.getItem("url");
    const [isLoading, setIsLoading] = useState(false);


    const logInUser = async () => {
        try {
            setIsLoading(true);
            const resp = await httpClient.post(`${getUrlPrefix}/api/users/login`, {
                username,
                password,
            });
            ConfigHelper.setItem('username', username);
            ConfigHelper.setItem('userId', resp.data.id);
            setIsLoading(false);
            navigate("/home");
        }
        catch (e) {
            console.log(e)
            if (e.response.status === 401) {
              setIsLoading(false);
              alert("Invalid credentials")
            }
        }

    };


    return (
      
        <div className="login-wrapper">
          <div className="top-box-title">
            <p className="top-text">Please Login to continue</p>
          </div>
          {isLoading ? (
            <VStack colorPalette="teal" pt="80px">
              <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.800" />
              <Text color="blue.800">Loading...</Text>
            </VStack>
            ) : (
                <div className="login-container">
                  <div className="login-box">
                    <h2 className="login-title">Login</h2>
                    <form>
                      <div className="input-group">
                          <label className="input-label">Username</label>
                          <input
                              type="text" 
                              value={username} 
                              onChange={(e) => setUsername(e.target.value)}
                              id="username" 
                              className="input-field" 
                              placeholder="Enter your username" 
                          />
                      </div>
                      <div className="password-container">
                          <label className="input-label">Password</label>
                          <div className="password-input-wrapper">
                            <input
                              value={password}
                              type={visible ? "text" : "password"}
                              id="password"
                              placeholder="************"
                              onChange={(e) => setPassword(e.target.value)}
                              className="input-field"
                            />
                            <div className="password-toggle" onClick={() => setVisible(!visible)}>
                              {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </div>
                          </div>
                        </div>
                      <Button
                          type="button"
                          className="login-button"
                          onClick={() => logInUser()}
                          >Login
                      </Button>
                    </form>
                    <p className="signup-text">
                      Don't have an account? {" "} 
                      <Link
                          to="/signUp"
                          className="toggle-link"
                          style={{ color: "#007BFF", textDecoration: "underline" }}
                      >
                          Sign Up
                      </Link>
                    </p>
                  </div>
              </div>
            )}
          
        </div>
      );
  };
export default Login;
