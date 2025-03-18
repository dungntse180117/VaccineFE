import React, { useState, useEffect } from 'react';
import { getRevenuePerMonth, getMostPurchasedVaccine } from '../../config/axios'; // Bỏ import getVisitsPerMonth
import './Dashboard.css';
import Layout from '../../components/Layout/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
    const [mostPurchasedVaccine, setMostPurchasedVaccine] = useState('');
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch most purchased vaccine
                const vaccineResult = await getMostPurchasedVaccine();
                setMostPurchasedVaccine(vaccineResult.data);

                // Fetch revenue per month for the current year
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

    // Format data for Recharts
    const formatChartData = (data) => {
        return Object.keys(data).map((key) => ({
            month: `Tháng ${key}`,
            value: data[key],
        }));
    };

    if (loading) {
        return <div>Loading dashboard data...</div>;
    }

    if (error) {
        return <div>Error loading dashboard data: {error.message}</div>;
    }

    return (
        <Layout>
            <div className="dashboard-container">
                <h1>Dashboard</h1>

                <div className="dashboard-grid">
                    {/* Most Purchased Vaccine */}
                    <div className="dashboard-card">
                        <h2>Most Purchased Vaccine</h2>
                        <p>{mostPurchasedVaccine || "No data available"}</p>
                    </div>

                    {/* Revenue Chart */}
                    <div className="dashboard-card">
                        <h2>Doanh thu theo tháng</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Dashboard;