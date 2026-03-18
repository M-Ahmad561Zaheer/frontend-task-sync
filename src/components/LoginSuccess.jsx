import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LoginSuccess = ({ onSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const userData = searchParams.get("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userData));

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({
          name: parsedUser.name,
          email: parsedUser.email,
        }));

        // ✅ JWT se userId nikalo (backend _id bhejta hai token mein)
        const base64Payload = token.split(".")[1];
        const decoded = JSON.parse(atob(base64Payload));
        if (decoded.id) localStorage.setItem("userId", decoded.id);

        onSuccess();
        navigate("/");
      } catch (err) {
        console.error("Login parse error:", err);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, onSuccess]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Finishing Login...</p>
    </div>
  );
};

export default LoginSuccess;