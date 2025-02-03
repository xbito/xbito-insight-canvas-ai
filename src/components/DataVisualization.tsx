import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { ChartData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DataVisualizationProps {
  data: ChartData;
  title?: string;
  suggestions?: string[];
}

function DisclaimerNote() {
  return (
    <div className="mt-2 text-center text-red-600 text-md font-semibold">
      Disclaimer: The data in this graph is fictitious and should not be used for any decisions.
    </div>
  );
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ 
  data
}) => {
  const isBarChart = Array.isArray(data.datasets?.[0]?.backgroundColor);

  let chartJsData;
  if (isBarChart) {
    chartJsData = {
      labels: data.labels,
      datasets: data.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor,
        borderColor: ds.borderColor,
        borderWidth: ds.borderWidth
      }))
    };
  } else {
    chartJsData = {
      labels: data.labels,
      datasets: data.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.backgroundColor,
        borderColor: ds.borderColor,
        borderWidth: ds.borderWidth,
        fill: false
      }))
    };
  }

  const chartOptions = {
    responsive: true,
    indexAxis: isBarChart ? 'y' as const : 'x' as const,
    plugins: {
      legend: {
        display: !isBarChart,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: isBarChart
        ? {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value: number | string) {
                return value + '%';
              }
            }
          }
        : {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Date'
            }
          },
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{data.title}</h2>
        <DisclaimerNote />
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">DATE RANGE</span>
            <div className="mt-1">{data.dateRange}</div>
          </div>
          <div>
            <span className="font-medium">DEMOGRAPHIC</span>
            <div className="mt-1">{data.demographic}</div>
          </div>
        </div>
      </div>
      {isBarChart ? (
        <Bar
          key="barChart"
          options={chartOptions}
          data={chartJsData}
          className="max-h-[500px]"
        />
      ) : (
        <Line
          key="lineChart"
          options={chartOptions}
          data={chartJsData}
          className="max-h-[500px]"
        />
      )}
      <DisclaimerNote />
    </div>
  );
};