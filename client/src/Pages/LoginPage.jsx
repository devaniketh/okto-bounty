import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOkto } from "okto-sdk-react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function LoginPage() {
  console.log("LoginPage component rendered");
  const navigate = useNavigate();
  const { authenticate } = useOkto();
  const [authToken, setAuthToken] = useState(null);
  const BASE_URL = "https://sandbox-api.okto.tech";
  const OKTO_CLIENT_API = "3469fac8-410e-4fab-8f16-a0345461045c";

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  };

  const apiService = axios.create({
    baseURL: BASE_URL,
    headers: {
      "x-api-key": OKTO_CLIENT_API,
      "Content-Type": "application/json",
    },
  });

  const setPin = (idToken, token, reloginPin) => {
    return apiService.post("/api/v1/set_pin", {
      id_token: idToken,
      token: token,
      relogin_pin: reloginPin,
      purpose: "set_pin",
    });
  };

  const handleGoogleLogin = async (credentialResponse) => {
    console.log("Google login response:", credentialResponse);
    
    // Check if the credentialResponse contains the 'credential' property
    if (!credentialResponse.credential) {
      console.error("No credential found in the response");
      return;
    }

    const idToken = credentialResponse.credential;
    console.log("Google ID Token: ", idToken);

    authenticate(idToken, async (authResponse, error) => {
      if (authResponse) {
        console.log("Authentication response: ", authResponse);
        setAuthToken(authResponse.auth_token);
        if (!authToken && authResponse.action === "signup") {
          console.log("User Signup");
          const pinToken = authResponse.token;
          await setPin(idToken, pinToken, "0000");
          await authenticate(idToken, async (res, err) => {
            if (res) {
              setAuthToken(res.auth_token);
            }
          });
        }
        console.log("Auth token received: ", authToken);
        navigate("/home");
      } else if (error) {
        console.error("Authentication error:", error);
      }
    });
  };

  return (
    <div style={containerStyle}>
      <h1>Login</h1>
      {!authToken ? (
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={(error) => {
            console.log("Login Failed", error);
          }}
          useOneTap
          promptMomentNotification={(notification) =>
            console.log("Prompt moment notification:", notification)
          }
        />
      ) : (
        <> Authenticated </>
      )}
    </div>
  );
}
export default LoginPage;