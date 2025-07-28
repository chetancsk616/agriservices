import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext.jsx';
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

const App = () => {
  return (
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
        <Route path="/vehicles" element={<VehicleList />} />
        <Route path="/vehicle/:id" element={<VehicleDetail />} />
        <Route path="/mybookings" element={<MyBookings />} />
        <Route path="/aiassistantpage" element={<AIAssistantPage />} />
      </Routes>
    </Router>
    </LanguageProvider>
  );
};

export default App;
