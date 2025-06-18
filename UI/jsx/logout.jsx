import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApolloClient } from "@apollo/client";

export default function Logout() {
  const navigate = useNavigate();
  const client = useApolloClient();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear localStorage and sessionStorage
        localStorage.removeItem("userEmail");
        localStorage.removeItem("adminEmail");
       
        localStorage.removeItem("userRole");
        sessionStorage.clear();

        // Reset Apollo cache
        await client.clearStore();

        // Redirect to login
        navigate("/");
        console.log("Redirecting to /home");

      } catch (error) {
        console.error("Logout error:", error);
      }
    };

    performLogout();
  }, [client, navigate]);

  return <p className="text-center mt-5">Logging out...</p>;
}
