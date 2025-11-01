import React, { useState, useEffect } from "react";
import LOGO from "../../../assets/headerlogo.png";
import ReCAPTCHA from "react-google-recaptcha";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../components/toast/Toast";

import "./Login.css";
import useAuth from "../../../hooks/userAuth"

function LoginPage() {
  const { login, loading, error, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ userName: "", password: "" });
  const navigate = useNavigate();
  const { showToaster } = useToast();
  

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(form);
    console.log("Login result:", result);

    // If login succeeded (useAuth returns a truthy response and no error flag)
    if (result && !result.error) {
      showToaster("Login successful", "success");
      // useAuth will store token; navigate on success
      return;
    }

    // Otherwise show an error toaster. Prefer the `error` from the hook if available.
    showToaster(
      error || "Invalid credentials. Please check your User ID and Password.",
      "error"
    );
  };

  return (
    <div className="login-wrapper font-size">
      <div className="container-fluid vh-100 d-flex p-0">
        {/* Left Section */}
        <div className="col-md-7 d-flex flex-column align-items-center justify-content-center bg-light">
          <div className="d-flex align-items-center mb-3 logo-section">
            <img src={LOGO} alt="DBT Bharat" className="logo-img me-3" />
            <div className="logo-text">
              <h5 className="mb-0 fw-semibold text-success">
                Direct Benefit Transfer
              </h5>
              <h6 className="mb-0 fw-semibold text-success">
                Himachal Pradesh
              </h6>
            </div>
          </div>

          <div className="card login-card shadow rounded-3">
            <div className="card-header text-white text-center fw-bold primary-color p-3">
              LOGIN
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-person-fill"></i> User ID
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="User ID"
                    value={form.userName}
                    onChange={(e) =>
                      setForm({ ...form, userName: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-lock-fill"></i> Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>

                {/* <div className="mb-3 d-flex justify-content-center">
                  <ReCAPTCHA sitekey="6LepnysrAAAAADj1FZX9RAJGCGAj0UZsqA3e7TnK" />
                </div> */}

                {/* ✅ Error show */}
                {error && (
                  <p className="text-danger small text-center mb-2">{error}</p>
                )}

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn w-100"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "LOGIN"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <p className="mt-4 text-muted small">
            © 2025, Maintained by HPSEDC. All Rights Reserved.
          </p>
        </div>

        {/* Right Section */}
        <div className="col-md-5 d-flex align-items-center justify-content-center primary-color text-white">
          <h3 className="fw-bold text-center">
            Welcome to DBT Himachal Pradesh
          </h3>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
