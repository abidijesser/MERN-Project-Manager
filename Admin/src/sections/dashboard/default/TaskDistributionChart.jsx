import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// API function
import { getTaskDistribution } from 'utils/dashboardApi';

// ==============================|| TASK DISTRIBUTION CHART ||============================== //

const TaskDistributionChart = () => {
  const theme = useTheme();
  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    series: [],
    categories: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTaskDistribution();

        // Process data for the chart
        const categories = data.distribution.map((project) => project.projectName);

        // Create series for each status
        const series = data.statuses.map((status) => {
          return {
            name: status,
            data: data.distribution.map((project) => project.tasks[status] || 0)
          };
        });

        setChartData({
          series,
          categories
        });
      } catch (error) {
        console.error('Error fetching task distribution data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart options
  const options = {
    chart: {
      type: 'bar',
      height: 450,
      stacked: true,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '70%',
        barHeight: '80%'
      }
    },
    xaxis: {
      type: 'category',
      categories: chartData.categories,
      labels: {
        style: {
          colors: Array(chartData.categories.length).fill(secondary)
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: [secondary]
        }
      }
    },
    legend: {
      show: true,
      position: 'right',
      offsetY: 40,
      labels: {
        colors: secondary
      }
    },
    fill: {
      opacity: 1
    },
    colors: [theme.palette.primary.main, theme.palette.warning.main, theme.palette.success.main],
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: line
    },
    tooltip: {
      theme: 'light'
    }
  };

  return (
    <Box id="chart" sx={{ p: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 450 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ReactApexChart options={options} series={chartData.series} type="bar" height={450} />
      )}
    </Box>
  );
};

export default TaskDistributionChart;
