import React, { useState } from "react";
import "./Register.css";

function Register() {
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Registration form submitted. Backend registration will be connected next.");
  };

  return (
    <main className="register_container">
      <h1 className="header">Sign-up</h1>

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
          <input className="input_field" id="email" name="email"
            type="email" value={form.email} onChange={handleChange} required />

          <label htmlFor="password">Password</label>
          <input className="input_field" id="password" name="password"
            type="password" value={form.password} onChange={handleChange} required />

          <div className="submit_panel">
            <button className="submit" type="submit">Register</button>
          </div>
        </div>
      </form>
    </main>
  );
}

export default Register;
