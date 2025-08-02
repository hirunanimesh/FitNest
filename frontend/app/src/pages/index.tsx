import React from 'react';
import Navbar from '../components/common/Navbar';

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome to FitNest</h1>
        <div style={{ marginTop: '20px' }}>
          <button style={{ marginRight: '10px', padding: '10px 20px' }}>Sign Up</button>
          <button style={{ padding: '10px 20px' }}>Log In</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;