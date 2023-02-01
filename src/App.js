import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { dateFormatHelper } from "./helper";
import { data } from "./data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


/**
 * @param {Array} response the response from server
 * @returns {Object} a objct that format the response data
 *  contain keyObj and timeArray
 *  keyObj = {
 *              '2': {
 *                  '6': { t: [2,2,NaN,...], m: [9,3,NaN,...] },
 *                  '7': { t: [1,5,88,...], m: [30,33,74,...] },
 *                  ......
 *               }
 *               ......
 *          }
 * if need "cable 2","np 6" "temperature" data
 * call keyObj["2"]["6"]["t"];
 * timeArray = ['2022-12-16 15:15:20', ......]
 */
const binDataConversion = (response) => {
  const cableCount = 10;
  const allCableObj = {};

  for (let i = 1; i <= cableCount; i++) {
    allCableObj["cable" + i] = [];
  }

  /** loop node id and time Array */

  const timeArray = [];
  const keyObj = {};
  const aveMoisArray = [];
  const aveTempArray = [];
  const maxMoisArray = [];
  const minMoisArray = [];
  const maxTempArray = [];
  const minTempArray = [];

  response.map((x) => {
    const attr = x.attributes;

    const timeObj = new Date(x["fixTime"]);
    const temp = dateFormatHelper(timeObj);
    const label =
      temp.year +
      "-" +
      temp.month +
      "-" +
      temp.date +
      " " +
      temp.hour +
      ":" +
      temp.minute +
      ":" +
      temp.second +
      temp.subfix;

    timeArray.push(label);
    aveMoisArray.push(Number(attr.avm));
    aveTempArray.push(Number(attr.avt));
    maxMoisArray.push(Number(attr.mam));
    minMoisArray.push(Number(attr.mim));
    maxTempArray.push(Number(attr.mat));
    minTempArray.push(Number(attr.mit));

    for (let i = 1; i <= 10; i++) {
      if (typeof attr["Port" + i + "dataInfo"] !== "undefined") {
        const temp = attr["Port" + i + "dataInfo"];
        if (typeof keyObj["" + i] === "undefined") {
          keyObj["" + i] = {};
        }
        let jsonData = null;
        try {
          jsonData = JSON.parse(temp);
        } catch (error) {
          jsonData = null;
        }
        if (Array.isArray(jsonData)) {
          jsonData.map((x) => {
            keyObj["" + i]["" + x.np] = {
              t: [],
              m: [],
            };
          });
        }
      }
    }
  });

  response.map((x) => {
    const attr = x.attributes;

    const cableKeys = Object.keys(keyObj);
    cableKeys.forEach((key) => {
      const temp = attr["Port" + key + "dataInfo"];
      let jsons = [];
      try {
        jsons = JSON.parse(temp);
      } catch (error) {
        jsons = [];
      }

      const nodeKeys = Object.keys(keyObj[key]);
      nodeKeys.forEach((key2) => {
        let temperature = NaN;
        let moisture = NaN;
        for (let i = 0; i < jsons.length; i++) {
          if ("" + jsons[i]["np"] === key2) {
            temperature = jsons[i]["t"];
            moisture = jsons[i]["m"];
            break;
          }
        }
        keyObj[key][key2]["t"].push(temperature);
        keyObj[key][key2]["m"].push(moisture);
      });
    });
  });

  return {
    keyObj, timeArray,
    aveMoisArray,
    aveTempArray,
    maxMoisArray,
    minMoisArray,
    maxTempArray,
    minTempArray,
  };
};

const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

// const titleTooltip = (tooltipItems) => {
//   // console.log(tooltipItems);
//   return 'Test';
// }

const labelTooltip = (tooltipItems) => {
  const label = tooltipItems.dataset.label;
  let value = tooltipItems.formattedValue;
  if (label.toLowerCase().indexOf("temperature") > -1) {
    const fahDegree = ((value * 1.8) + 32).toFixed(2);
    value = value + "°C" + " (" + fahDegree + "°F)";
  } else if (label.toLowerCase().indexOf("moisture") > -1) {
    value = value + "%";
  }
  // console.log("tooltipItems", tooltipItems);
  return label + ' : ' + value;
  // return '';
}

export const options = {
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  stacked: true,
  plugins: {
    title: {
      display: true,
      text: 'Bin Report',
    },
    tooltip: {
      yAlign: 'bottom',
      callbacks: {
        // title: titleTooltip,
        label: labelTooltip,
      }
    },
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      min: -30,
      max: 50,
      ticks: {
        callback: function(value, index, values) {
          return `${value}°C`;
        }
      },
      title: {
        display: true,
        text: 'Temperature in °C',
      },
    },
    y1: {
      type: 'linear',
      display: true,
      min: 0,
      max: 100,
      position: 'right',
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        callback: function(value, index, values) {
          return `${value}%`;
        }
      },
      title: {
        display: true,
        text: 'Moisture in %',
      },
    },
  },
};


const { keyObj, timeArray,
  aveMoisArray,
  aveTempArray,
  maxMoisArray,
  minMoisArray,
  maxTempArray,
  minTempArray } = binDataConversion(data);

export const chartData = {
  labels: timeArray,
  datasets: [
    {
      label: 'Max Temperature',
      data: maxTempArray,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      yAxisID: 'y',
      segment: {
        borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
        borderDash: ctx => skipped(ctx, [6, 6]),
      },
      spanGaps: true,
      tension: 0.4,
    },
    {
      label: 'Ave Temperature',
      data: aveTempArray,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      yAxisID: 'y',
      segment: {
        borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
        borderDash: ctx => skipped(ctx, [6, 6]),
      },
      spanGaps: true,
      tension: 0.4,
    },
    {
      label: 'Min Temperature',
      data: minTempArray,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      yAxisID: 'y',
      segment: {
        borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
        borderDash: ctx => skipped(ctx, [6, 6]),
      },
      spanGaps: true,
      tension: 0.4,
    },
    {
      label: 'Max Moisture',
      data: maxMoisArray,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      yAxisID: 'y1',
      segment: {
        borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
        borderDash: ctx => skipped(ctx, [6, 6]),
      },
      spanGaps: true,
      tension: 0.4,

    },
    {
      label: 'Ave Moisture',
      data: aveMoisArray,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      yAxisID: 'y1',
      segment: {
        borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
        borderDash: ctx => skipped(ctx, [6, 6]),
      },
      spanGaps: true,
      tension: 0.4,
    },
    {
      label: 'Min Moisture',
      data: minMoisArray,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      yAxisID: 'y1',
      segment: {
        borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
        borderDash: ctx => skipped(ctx, [6, 6]),
      },
      spanGaps: true,
      tension: 0.4,
    },
  ],
};

export default function App() {
  return <Line options={options} data={chartData} />;
}
