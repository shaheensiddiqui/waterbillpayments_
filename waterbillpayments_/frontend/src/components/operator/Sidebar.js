import React from "react";

export default function Sidebar({ active, onSelect }) {
  const menu = [
    { key: "fetch", label: "Fetch Bill" },
    { key: "create", label: "Create Bill" },
    { key: "view", label: "View All Bills" },
    { key: "transactions", label: "Transactions Dashboard" },
  ];

  return (
    <div
      className="bg-light-blue text-white d-flex flex-column p-3"
      style={{ width: "300px", minHeight: "100vh",background_color: "black" }}
    >
      <h4 className="fw-bold mb-4 text-center fs-5">Operator Dashboard</h4>

      {menu.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={`btn text-start mb-2 fw-semibold  ${
            active === item.key ? "btn-light text-primary" : "btn-outline-light"
          }`}
        >
          {item.label}
        </button>
      ))}

      <div className="mt-auto text-center">
        <button
          className="btn btn-danger w-100 mt-3  fs-9"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
