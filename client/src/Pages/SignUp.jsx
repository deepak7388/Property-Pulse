import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import OAuth from "../components/OAuth";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Initialize loading state as false
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true before making the request
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
      } else {
        setError(null); // Clear error state if the request is successful
        navigate("/sign-in");
      }
    } catch (error) {
      setError(error.message); // Generic error message
    }
    setLoading(false); // Set loading state to false after request completion
    // console.log(data);
  };

  return (
    <div className="p-3 w-[800px] h-[500px] mx-auto border my-6 border-blue-900 shadow-lg bg-zinc-800 rounded-lg">
      <h1 className="text-3xl text-center text-white font-semibold my-7">
        SignUp
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <input
          type="text"
          placeholder="Username"
          className="border p-3 rounded-lg"
          id="username"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          id="password"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className={`bg-blue-500 p-3 rounded-lg uppercase hover:opacity-95 ${
            loading ? "cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>
        <OAuth />
      </form>
      {error && <p className="text-red-500">{error}</p>}{" "}
      {/* Display error message */}
      <div className="flex gap-2 mt-5 text-white">
        <p>Have an account?</p>
        <Link to="/sign-in" className="text-blue-700">
          Sign In
        </Link>
      </div>
    </div>
  );
}