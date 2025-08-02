import React from 'react';

const Navbar = () => {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: '#f8f9fa' }}>
      <div style={{ fontWeight: 'bold', fontSize: '20px' }}>FitNest</div>
      <div>
        <button style={{ marginRight: '10px', padding: '5px 15px' }}>Sign Up</button>
        <button style={{ padding: '5px 15px' }}>Log In</button>
      </div>
    </nav>
  );
};

export default Navbar;