import React, { useState, useEffect } from "react";
import {
  getRevenuePerMonth,
  getVisitsPerMonth,
  getMostPurchasedVaccine,
  getMostPurchasedPackage,
} from "../../config/axios";
import "./Dashboard.css";
import Layout from "../../components/Layout/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CircularProgress, Typography } from "@mui/material";
import { Select } from "antd";

const { Option } = Select;

function Dashboard() {
  const [mostPurchasedVaccine, setMostPurchasedVaccine] = useState("");
  const [mostPurchasedPackage, setMostPurchasedPackage] = useState("");
  const [combinedData, setCombinedData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const fetchData = async (year) => {
    setLoading(true);
    setError(null);
    try {
      const vaccineResult = await getMostPurchasedVaccine();
      setMostPurchasedVaccine(vaccineResult.data);

      const packageResult = await getMostPurchasedPackage();
      setMostPurchasedPackage(packageResult.data);

      const revenueResult = await getRevenuePerMonth(year);
      const visitsResult = await getVisitsPerMonth(year);
      setCombinedData(formatCombinedChartData(revenueResult.data, visitsResult.data));
    } catch (err) {
      setError(err);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCombinedChartData = (revenueData, visitsData) => {
    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: `Tháng ${i + 1}`,
      revenue: 0,
      visits: 0,
    }));

    Object.keys(revenueData).forEach((key) => {
      const monthIndex = parseInt(key) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        allMonths[monthIndex].revenue = revenueData[key];
      }
    });

    Object.keys(visitsData).forEach((key) => {
      const monthIndex = parseInt(key) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        allMonths[monthIndex].visits = visitsData[key];
      }
    });

    return allMonths;
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const formatTooltipValue = (value, name) => {
    if (name === "revenue") {
      return `${value.toLocaleString("vi-VN")} VNĐ`;
    }
    return value;
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
        <div className="dashboard-header">
          <Typography variant="h4" className="dashboard-title">
            Dashboard
          </Typography>
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            className="year-select"
          >
            {[...Array(10)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <Option key={year} value={year}>
                  {year}
                </Option>
              );
            })}
          </Select>
        </div>

        <div className="dashboard-grid">

          <div className="dashboard-charts">
            <div className="dashboard-card">
              <h2>Doanh Thu và Số Lượt Thăm Khám Theo Tháng (Năm {selectedYear})</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
                  <XAxis dataKey="month" stroke="#34495e" />
                  <YAxis yAxisId="left" stroke="#34495e" />
                  <YAxis yAxisId="right" orientation="right" stroke="#34495e" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "6px",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={formatTooltipValue}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Doanh Thu (VNĐ)"
                    fill="#3498db"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="visits"
                    name="Số Lượt Thăm Khám"
                    fill="#2ecc71"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>


          <div className="dashboard-stats">
       
            <div className="dashboard-card">
              <h2>Vaccine Được Mua Nhiều Nhất</h2>
              <p>{mostPurchasedVaccine || "Không có dữ liệu"}</p>
            </div>

       
            <div className="dashboard-card">
              <h2>Gói Dịch Vụ Được Mua Nhiều Nhất</h2>
              <p>{mostPurchasedPackage || "Không có dữ liệu"}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;