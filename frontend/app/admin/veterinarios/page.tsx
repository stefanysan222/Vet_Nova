import React from "react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import VetPanel from "../../components/admin/VetPanel";

const VeterinariosPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="mx-6 mt-6">
          <VetPanel />
        </div>
      </div>
    </div>
  );
};

export default VeterinariosPage;