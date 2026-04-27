import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ToDoInput from './components/ToDoInput';
import ToDoItem from './components/ToDoItem';
import './App.css';

function App() {
	return (
		<BrowserRouter
			future={{
				v7_startTransition: true,
				v7_relativeSplatPath: true,
			}}
		>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route path="/auth/reset" element={<ResetPassword />} />
				
				<Route 
					path="/" 
					element={
						<PrivateRoute>
							<Navigate to="/dashboard" replace />
						</PrivateRoute>
					} 
				/>
				<Route 
					path="/dashboard" 
					element={
						<PrivateRoute>
							<Dashboard />
						</PrivateRoute>
					} 
				/>
				<Route 
					path="/todoinput" 
					element={
						<PrivateRoute>
							<ToDoInput />
						</PrivateRoute>
					} 
				/>
				<Route 
					path="/todoitem/:id" 
					element={
						<PrivateRoute>
							<ToDoItem />
						</PrivateRoute>
					} 
				/>

				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;

