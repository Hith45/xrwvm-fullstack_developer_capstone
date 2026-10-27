import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import Header from "../Header/Header";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/djangoapp/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

      alert("Registration successful. Please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <Header />
      <main className="register_container">
        <h1 className="header">Sign-up</h1>
        {error && <p role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="inputs">
            <label htmlFor="username">Username</label>
            <input className="input_field" id="username" name="username"
              value={form.username} onChange={handleChange} required />

            <label htmlFor="firstName">First Name</label>
            <input className="input_field" id="firstName" name="firstName"
              value={form.firstName} onChange={handleChange} required />

            <label htmlFor="lastName">Last Name</label>
            <input className="input_field" id="lastName" name="lastName"
              value={form.lastName} onChange={handleChange} required />

            <label htmlFor="email">Email</label>
            <input className="input_field" id="email" name="email" type="email"
              value={form.email} onChange={handleChange} required />

            <label htmlFor="password">Password</label>
            <input className="input_field" id="password" name="password"
              type="password" value={form.password} onChange={handleChange} required />

            <button className="submit" type="submit">Register</button>
          </div>
        </form>
        <p>Already registered? <Link to="/login">Login</Link></p>
      </main>
    </div>
  );
}

export default Register;
