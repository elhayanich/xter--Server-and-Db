import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('All fields are required!');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords must match');
            return;
        }

        const { username, email, password } = formData;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Invalid email format');
            return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters long and contain at least one letter and one number');
            return;
        }

        try {
            const response = await axios.post("http://localhost:3310/register", {
                username,
                email,
                password,
            });
    
            if (response.data.error) {
                setError(response.data.error);
                setSuccess('');
            } else {
                setSuccess('Registration successful!');
                setError('');
    
                // Display the avatar URL if available
                if (response.data.avatar_url) {
                    console.log("User avatar URL:", response.data.avatar_url);
                }
    
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            setSuccess('');
            setError('Request error');
            console.error(error);
        }
    };

      
    return (
        <div className="max-w-md mx-auto p-8 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold text-center mb-6 text-pink-600">Register</h2>

            {error && <p className="text-pink-500 text-center mb-4">{error}</p>}
            {success && <p className="text-green-500 text-center mb-4">{success}</p>}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-pink-700 font-bold mb-2">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-pink-300 rounded focus:outline-none focus:border-pink-500"
                        placeholder="Enter your username"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-pink-700 font-bold mb-2">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-pink-300 rounded focus:outline-none focus:border-pink-500"
                        placeholder="Enter your email"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-pink-700 font-bold mb-2">Password:</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-pink-300 rounded focus:outline-none focus:border-pink-500"
                        placeholder="Enter your password"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-pink-700 font-bold mb-2">Confirm Password:</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-pink-300 rounded focus:outline-none focus:border-pink-500"
                        placeholder="Confirm your password"
                    />
                </div>

                <div className="flex justify-between items-center mb-4">
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-pink-500 hover:text-pink-700 transition"
                    >
                        {showPassword ? "Hide Password" : "Show Password"}
                    </button>
                </div>

                <button
                    type="submit"
                    className="w-full bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600 transition"
                >
                    Register
                </button>
            </form>
        </div>
    );
}

export default Register;
