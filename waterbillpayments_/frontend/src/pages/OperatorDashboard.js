import React, { useState } from "react";
import Sidebar from "../components/operator/Sidebar";
import FetchBill from "../components/operator/FetchBill";
import CreateBill from "../components/operator/CreateBill";

export default function OperatorDashboard() {
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("fetch");

  const renderContent = () => {
    switch (activeTab) {
      case "fetch":
        return <FetchBill token={token} />;
      case "create":
        return <CreateBill token={token} />;
      case "view":
        return <p className="text-muted">Coming soon: View all bills</p>;
      default:
        return <FetchBill token={token} />;
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f0f8ff" }}>
      <Sidebar active={activeTab} onSelect={setActiveTab} />
      <div className="flex-grow-1 p-5" style={{ background: "#fff" }}>
        {renderContent()}
      </div>
    </div>
  );
}
