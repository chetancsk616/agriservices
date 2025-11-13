import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext.jsx';
import { ThemeProvider } from './ThemeContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageSelection from './LanguageSelection'; 
import HomePage from './HomePage';
import FarmerSignup from './FarmerSignup';
import FarmerLogin from './FarmerLogin';
import MerchantLogin from './MerchantLogin';
import MerchantSignup from './MerchantSignup';
import ResetPassword from './ResetPassword';
import Cart from './Cart';
import ProductList from './ProductList';
import Profile from './Profile'
import ProductInfo from './ProductInfo';
import VehicleList from './VehicleList';
import VehicleDetail from './VehicleDetail';
import MyBookings from './MyBookings';
import AIAssistantPage from './AIAssistantPage';
import AddVehicle from './AddVehicle';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import EditVehicle from './EditVehicle';

const App = () => {
  return (
    <ThemeProvider>
    <LanguageProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LanguageSelection />} />
        <Route path="/main/:id" element={<HomePage />} />
        <Route path="/farmersignup" element={<FarmerSignup />} />
        <Route path="/farmerlogin" element={<FarmerLogin />} />
        <Route path="/merchantlogin" element={<MerchantLogin />} />
        <Route path="/merchantsignup" element={<MerchantSignup />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product/:id" element={<ProductInfo />} />
  <Route path="/add-product" element={<AddProduct />} />
  <Route path="/edit-product/:id" element={<EditProduct />} />
  <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/vehicles" element={<VehicleList />} />
        <Route path="/vehicle/:id" element={<VehicleDetail />} />
        <Route path="/mybookings" element={<MyBookings />} />
        <Route path="/aiassistantpage" element={<AIAssistantPage />} />
        <Route path="/add-vehicle" element={<AddVehicle />} />
        <Route path="/edit-vehicle/:id" element={<EditVehicle />} />
      </Routes>
    </Router>
    </LanguageProvider>
    <div className="theme-toggle-wrapper">
      <ThemeToggle />
    </div>
    </ThemeProvider>
  );
};

export default App;
