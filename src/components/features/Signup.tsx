"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
  password: string;
  language: string;
};

// Temporary in-memory user storage
let users: User[] = [];

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("English");
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple check if email already exists
    if (users.find(u => u.email === email)) {
      alert("User with this email already exists!");
      return;
    }

    // Add user to local array
    users.push({ name, email, password, language });
    alert("Signup successful!");
    router.push("/login");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full p-2 border rounded" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full p-2 border rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" />
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-2 border rounded">
          <option>English</option>
          <option>Hindi</option>
          <option>Marathi</option>
        </select>
        <button className="w-full p-2 bg-blue-600 text-white rounded">Sign Up</button>
      </form>
    </div>
  );
}
