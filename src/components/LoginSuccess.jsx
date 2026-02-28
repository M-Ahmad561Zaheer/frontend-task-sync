import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LoginSuccess = ({ onSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const userDataParam = searchParams.get("user");

    if (token && userDataParam) {
      try {
        // 1. Token save karein
        localStorage.setItem("token", token);
        
        // 2. User data decode aur parse karein
        const decodedUser = JSON.parse(decodeURIComponent(userDataParam));
        
        // 3. User object aur UserId dono ko sync mein save karein
        // ✅ MongoDB hamesha _id bhejta hai, toh wahi use karein
        const userId = decodedUser._id || decodedUser.id; 
        
        localStorage.setItem("user", JSON.stringify(decodedUser));
        localStorage.setItem("userId", userId); 

        // 4. App state update karein aur redirect
        onSuccess(); 
        navigate("/dashboard");
      } catch (err) {
        console.error("Error parsing user data:", err);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, onSuccess]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400 font-medium text-lg tracking-tight">Finishing Login...</p>
    </div>
  );
};

export default LoginSuccess;