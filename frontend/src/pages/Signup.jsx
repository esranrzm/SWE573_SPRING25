
import React, { useState } from "react";
import { Button, Flex, HStack, RadioGroup } from "@chakra-ui/react";
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import "../components/pageDesigns/SignUp.css";
import httpClient from "@/httpClient";
import ConfigHelper from "@/components/configHelper";

const genders = [
  { label: "Female", value: "Female" },
  { label: "Male", value: "Male" }
]

const SignUp = () => {

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [gender, setGender] = useState("Female");
  const [visible, setVisible] = useState(true);
  const getUrlPrefix = ConfigHelper.getItem("url");
  const navigate = useNavigate();

  let selectedGender = "Female";

  const formSchema = z.object({
    value: z.string({ message: "Value is required" }),
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  })


  const clickButton = async () => {
    console.log(name)
    console.log(surname)
    console.log(username)
    console.log(password)
    console.log(confirmPassword)
    console.log(email)
    console.log(gender)
    console.log(occupation)

  }

  const registerUser = async () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (password != confirmPassword) {
      console.log("Passwords does not match!")
      alert("Passwords does not match!")
    }
    else if (!emailRegex.test(email)) {
      console.log("Email format is not valid!")
      alert("Email format is not valid!")
    }
    else if (name == "" || surname == "" || username == "" || email == "" || password == "" || confirmPassword == "" || occupation == "") {
      console.log("Please fill all input fields!")
      alert("Please fill all input fields!")
    }
    else {
      try {
        const resp = await httpClient.post(`${getUrlPrefix}/api/users/register`, {
            name,
            surname,
            username,
            email,
            password,
            gender,
            occupation
        });
        
        navigate("/login");
      }
      catch (e) {
          console.log(e)
          if (e.response.status === 409 || e.response.status === 400 ) {
              alert("User with this username is already exist")
          }
      }
    }
  
  };



  return (
    <div className="signup-wrapper">
      <div className="top-box-title">
        <p className="top-text">Join SWE573 Research Community - Where Ideas and Research Thrive!</p>
        <br></br>
        
      </div>
      <div className="text-container">
        <div className="top-box">
            <p className="top-text">Be part of a dynamic community of researchers, thinkers, and innovators. Sign Up today to share insights, discuss groundbreaking topics, and collaborate with like-minded individuals.</p>
        </div>
      </div>  
      <div className="signup-container">
        <div className="signup-box">
          <h2 className="signup-title">Sign Up</h2>
          <form>
              <Flex gap={3} alignItems={"center"}>
                <div>
                  <label className="input-label">Name</label>
                  <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text" 
                      id="name" 
                      className="input-field" 
                      placeholder="Enter your name" 
                  />
                </div>
                <div>
                  <label className="input-label">Surname</label>
                  <input
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      type="text" 
                      id="surname" 
                      className="input-field" 
                      placeholder="Enter your surname" 
                  />
                </div>
              </Flex>

              <Flex gap={3} alignItems={"center"}>
                <div className="input-group">
                    <label className="input-label">Email</label>
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email" 
                        id="email"
                        className="input-field" 
                        placeholder="Enter your mail" 
                    />
                </div>
                <div>
                  <Controller
                    name="value"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup.Root
                        style={{ marginTop: "12px" }}
                        defaultValue="Female"
                        name={field.name}
                        value={field.value}
                        onValueChange={({ value }) => {
                          field.onChange(value)
                          setGender(value)
                        }}
                      >
                        <HStack gap="2">
                          {genders.map((gender) => (
                            <RadioGroup.Item key={gender.value} value={gender.value}>
                              <RadioGroup.ItemHiddenInput/>
                              <RadioGroup.ItemIndicator />
                              <RadioGroup.ItemText>{gender.label}</RadioGroup.ItemText>
                            </RadioGroup.Item>
                          ))}
                        </HStack>
                      </RadioGroup.Root>
                    )}
                  />
                </div>
              </Flex>

              <div>
                  <label className="input-label">Username</label>
                  <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      type="text" 
                      id="username" 
                      className="input-field" 
                      placeholder="Enter your username" 
                  />
              </div>

              <Flex gap={2} alignItems="center">
                <div className="password-container">
                  <label className="input-label">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      value={password}
                      type={visible ? "text" : "password"}
                      id="password"
                      placeholder="password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                    />
                    <div className="password-toggle" onClick={() => setVisible(!visible)}>
                      {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </div>
                  </div>
                </div>
                <div className="password-container">
                  <label className="input-label">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      value={confirmPassword}
                      type={visible ? "text" : "password"}
                      id="confirm password"
                      placeholder="confirm password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                    />
                    <div className="password-toggle" onClick={() => setVisible(!visible)}>
                      {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </div>
                  </div>
                </div>
              </Flex>

              <div>
                  <label className="input-label">Profession/Occupation</label>
                  <input
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      type="text" 
                      id="profession" 
                      className="input-field" 
                      placeholder="e.g. Software Engineer, Doctor, AI Engineer" 
                  />
              </div>
              
              <Button
                  type="button" 
                  onClick={() => registerUser()}
                  className="signup-button"
                  >Signup
              </Button>
          </form>
          <p className="signup-text">
            Already have an account? {" "} 
            <Link
                to="/login"
                className="toggle-link"
                style={{ color: "#007BFF", textDecoration: "underline" }}
            >
                Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;