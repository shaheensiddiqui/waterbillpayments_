import React from "react";
import { useLocation } from "react-router-dom";

export default function ThankYou() {
  const query = new URLSearchParams(useLocation().search);
  const billNumber = query.get("bill");

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      <div className="card p-5 shadow-sm text-center">
        <h2 className="text-success fw-bold mb-3">Payment Successful!</h2>
        {billNumber && <p>Your bill <strong>{billNumber}</strong> has been marked as paid.</p>}
        <p className="text-muted">You may now close this window or return to the portal.</p>
      </div>
    </div>
  );
}
