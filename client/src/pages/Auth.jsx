import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

//   const port = process.env.PORT;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const endpoint = isLogin
      ? "https://gossip-uvaa.onrender.com/api/login"
      : "https://gossip-uvaa.onrender.com/api/signup";
  
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
  
      if (!res.ok) {
        alert(data.message || "Something went wrong");
        return;
      }
  
      //If user is logging in
      if (isLogin) {
        localStorage.setItem("token", data.token);
        navigate("/gossip/home");
      } 
      
      // If user just signed up
      else {
        alert("Signup successful! Please login.");
        setIsLogin(true);   //switch to login form
        setFormData({
          username: "",
          email: "",
          password: ""
        });
      }
  
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: "",
      email: "",
      password: ""
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>
          {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
        </h2>

        <form onSubmit={handleSubmit}>
          
          <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              style={styles.input}
            />

         {!isLogin && ( 
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}
          <span onClick={toggleMode} style={styles.toggle}>
            {isLogin ? " Sign Up" : " Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    padding: "40px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    width: "350px",
    transition: "all 0.3s ease"
  },
  heading: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#333",
    fontWeight: "600"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    transition: "0.2s"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  toggleText: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#555"
  },
  toggle: {
    color: "#667eea",
    cursor: "pointer",
    fontWeight: "600",
    marginLeft: "5px"
  }
};

export default Auth;