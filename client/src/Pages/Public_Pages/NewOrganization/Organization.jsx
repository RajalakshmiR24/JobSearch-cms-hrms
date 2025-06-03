import React from "react";
import Home from "../../../Pages/Public_Pages/NewOrganization/Home/Home"; // Make sure the path is correct

const Organization = () => {
  return (
    <div>
      
      <section id="home">
        <Home />
      </section>

      <section id="features" className="min-h-screen bg-teal-100 flex items-center justify-center">
        <h1 className="text-2xl font-bold">Features</h1>
      </section>

      <section id="pricing" className="min-h-screen bg-yellow-100 flex items-center justify-center">
        <h1 className="text-2xl font-bold">Pricing</h1>
      </section>

      <section id="blog" className="min-h-screen bg-yellow-100 flex items-center justify-center">
        <h1 className="text-2xl font-bold">Blog</h1>
      </section>

      <section id="contact" className="min-h-screen bg-red-100 flex items-center justify-center">
        <h1 className="text-2xl font-bold">Contact Us</h1>
      </section>

    </div>
  );
};

export default Organization;
