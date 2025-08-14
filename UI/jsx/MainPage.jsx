import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";


import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import { NavPage } from "./NavPage.jsx";
import UserNavPage from "./UserNavPage.jsx";
import Logout from "./logout.jsx"; 
import "bootstrap/dist/css/bootstrap.min.css";
import ForgetPassword from "./ForgetPassword.jsx";


const client = new ApolloClient({
  uri: "http://localhost:5000/graphql",
  cache: new InMemoryCache(),
});

const App = () => (
  <ApolloProvider client={client}>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/*" element={<NavPage />} />
        <Route path="/user/*" element={<UserNavPage />} /> 
        <Route path="/logout" element={<Logout />} />
        <Route path="/forget-password" element={<ForgetPassword />} /> 
      
      </Routes>
    </Router>
  </ApolloProvider>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

