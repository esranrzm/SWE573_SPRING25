import { Button } from "@chakra-ui/react";
import { Link } from 'react-router-dom';
import "../components/pageDesigns/LandingHome.css";
import React, {useState, useEffect} from 'react';
import httpClient from '@/httpClient';

function LandingHome(){

    const [user, setUser] = useState(null);

    const logoutUser = async () => {
      const resp = await httpClient.post("//localhost:5000/api/users/logout");
      window.location.href = "/"
    }

    useEffect(() => {
        (async () => {
            try {
                const resp = await httpClient.get("//localhost:5000/api/users/@me");

                setUser(resp.data);
            }
            catch (e) {
                console.log("Not Authenticated")
            }
        
        })();
    }, []);



    return (
            <div className="title-wrapper">
              <div className="top-box-title">
                <p className="top-text">Welcome to the SWE573 Website - A Hub for insightful discussions & Research!</p>
                <br></br>
                
              </div>
              <div className="text-container">
                <div className="top-box">
                    <p className="top-text">Join a community of curious minds exploring knowledgei sharing ideas, and engaging in meaningful discussions. Log in to contribute, learn, and connect with fellow researchers and thinkers.</p>
                </div>
              </div>
              {user != null ? (
                <div>
                    <h1>Logged In</h1>
                    <Button
                           className="button-home"
                           onClick={logoutUser()}
                     >Logout</Button>
                </div>
                
              ) : (
                <div className="buttons">
                <Link to="/login">
                    <Button className="button-home">Login</Button>
                </Link>
                <Link to="/signUp">
                    <Button className="button-home">Register</Button>
                </Link>
               </div>               
              )}
            </div>
          );
}

export default LandingHome;