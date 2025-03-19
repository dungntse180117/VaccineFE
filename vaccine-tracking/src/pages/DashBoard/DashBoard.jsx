import React, { useState, useEffect } from "react";
import { getRevenuePerMonth, getMostPurchasedVaccine } from "../../config/axios";
import "./Dashboard.css";
import Layout from "../../components/Layout/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CircularProgress, Typography } from "@mui/material";

function Dashboard() {
  const [mostPurchasedVaccine, setMostPurchasedVaccine] = useState("");
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const vaccineResult = await getMostPurchasedVaccine();
        setMostPurchasedVaccine(vaccineResult.data);

        const currentYear = new Date().getFullYear();
        const revenueResult = await getRevenuePerMonth(currentYear);
        setRevenueData(formatChartData(revenueResult.data));
      } catch (err) {
        setError(err);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatChartData = (data) => {
    return Object.keys(data).map((key) => ({
      month: `Tháng ${key}`,
      value: data[key],
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-container">
          <Typography variant="h4" className="dashboard-title">
            Dashboard
          </Typography>
          <div className="dashboard-loading">
            <CircularProgress size={60} thickness={4} />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="dashboard-container">
          <Typography variant="h4" className="dashboard-title">
            Dashboard
          </Typography>
          <div className="dashboard-error">
            Lỗi khi tải dữ liệu dashboard: {error.message}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <Typography variant="h4" className="dashboard-title">
          Dashboard
        </Typography>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Vaccine Được Mua Nhiều Nhất</h2>
            <p>{mostPurchasedVaccine || "Không có dữ liệu"}</p>
          </div>

          <div className="dashboard-card">
            <h2>Doanh Thu Theo Tháng</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
                <XAxis dataKey="month" stroke="#34495e" />
                <YAxis stroke="#34495e" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "6px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="#3498db" /> {/* Đồng bộ màu với header bảng */}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;