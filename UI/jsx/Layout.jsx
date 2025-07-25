import React from "react";
import Footer from "./Footer.jsx";

const Layout = ({ children }) => {
  return (
    <div className="page-wrapper d-flex flex-column min-vh-100">
      <main className="flex-fill">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
