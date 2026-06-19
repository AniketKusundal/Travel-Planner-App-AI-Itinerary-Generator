const dashboardServices = require("../services/dashboard.service");

const getDashboardStats = async (req, res) => {

    try {

        const userId = req.user.id;

        const stats =
            await dashboardServices.getDashboardStats(
                userId
            );

        return res.status(200).json({
            success: true,
            data: stats,
        });

    }
    catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });

    }
};

module.exports = {
    getDashboardStats,
};