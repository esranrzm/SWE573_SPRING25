import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import httpClient from "@/httpClient";

const HomePage = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await httpClient.get("//localhost:5000/api/users/@me");
        console.log(resp.status)
        if (resp.status != 200) {
          window.location.href = "/login";
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

    fetchData();

  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>HOME PAGE</h1>
      <p>Congratualizations you logged in successfully!</p>
      
    </div>
  );
};

export default HomePage;