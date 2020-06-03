"use strict";
import Chart from "chart.js";
document.addEventListener("DOMContentLoaded", start);

const restDBEndpoint = "https://frontendspring20-f2e0.restdb.io/rest/beers";
const APIKey = "5e957b2e436377171a0c2346";
const HTML = {};
let today = new Date().toString().substring(0, 3).toLowerCase();

function start() {
  console.log("start chart");
  HTML.chartIcon = document.querySelector("#chart-icon");
  HTML.loader = document.querySelector("#loader_container");
  HTML.main = document.querySelector("main");

  getDatabaseData();
  resetDatabase();
}

function getDatabaseData() {
  fetch(`${restDBEndpoint}?max=10`, {
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": `${APIKey}`,
      "cache-control": "no-cache",
    },
  })
    .then((e) => e.json())
    .then((e) => {
      console.log("Database data:");
      console.log(e);

      HTML.loader.setAttribute("loaded", true);

      if (HTML.main.getAttribute("loaded") == "true") {
        console.log("main og loader loaded");
        HTML.loader.className = "hide-block";
        HTML.main.className = "show-block";
      }

      HTML.chartIcon.addEventListener("click", () => {
        console.log("click chart");
        document.querySelector(".chart-container").classList.remove("hide-block");
        document.querySelector("main").classList.add("hide-block");
        showChart(e);
      });

      e.forEach((beer) => {
        document.querySelectorAll(`[data-beertype="${beer.name}"]`).forEach((DOMItem) => {
          DOMItem.style.setProperty("--beer-color", beer.color);
          DOMItem.style.setProperty("--beer-color-darken", darkenHEX(beer.color));
          console.log(DOMItem);
        });
      });
    });
}

function showChart(data) {
  const chartData = createChartData(data);

  Chart.defaults.global.defaultFontFamily = '"Roboto"';

  let chartDest = document.getElementById("myChart");
  let dailyChart;
  let weekChart;

  if (document.querySelector("#chart-select").value === "weekly") {
    weekChart = new Chart(chartDest, {
      type: window.innerWidth > 730 ? "bar" : "horizontalBar",
      data: {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        datasets: [
          {
            backgroundColor: data[0].color,
            borderColor: data[0].color,
            fill: false,
            label: [data[0].name],
            data: [data[0].salesMon, data[0].salesTue, data[0].salesWed, data[0].salesThu, data[0].salesFri, data[0].salesSat, data[0].salesSun],
          },
          {
            backgroundColor: data[1].color,
            borderColor: data[1].color,
            fill: false,
            label: [data[1].name],
            data: [data[1].salesMon, data[1].salesTue, data[1].salesWed, data[1].salesThu, data[1].salesFri, data[1].salesSat, data[1].salesSun],
          },
          {
            backgroundColor: data[2].color,
            borderColor: data[2].color,
            fill: false,
            label: [data[2].name],
            data: [data[2].salesMon, data[2].salesTue, data[2].salesWed, data[2].salesThu, data[2].salesFri, data[2].salesSat, data[2].salesSun],
          },
          {
            backgroundColor: data[3].color,
            borderColor: data[3].color,
            fill: false,
            label: [data[3].name],
            data: [data[3].salesMon, data[3].salesTue, data[3].salesWed, data[3].salesThu, data[3].salesFri, data[3].salesSat, data[3].salesSun],
          },
          {
            backgroundColor: data[4].color,
            borderColor: data[4].color,
            fill: false,
            label: [data[4].name],
            data: [data[4].salesMon, data[4].salesTue, data[4].salesWed, data[4].salesThu, data[4].salesFri, data[4].salesSat, data[4].salesSun],
          },
          {
            backgroundColor: data[5].color,
            borderColor: data[5].color,
            fill: false,
            label: [data[5].name],
            data: [data[5].salesMon, data[5].salesTue, data[5].salesWed, data[5].salesThu, data[5].salesFri, data[5].salesSat, data[5].salesSun],
          },
          {
            backgroundColor: data[6].color,
            borderColor: data[6].color,
            fill: false,
            label: [data[6].name],
            data: [data[6].salesMon, data[6].salesTue, data[6].salesWed, data[6].salesThu, data[6].salesFri, data[6].salesSat, data[6].salesSun],
          },
          {
            backgroundColor: data[7].color,
            borderColor: data[7].color,
            fill: false,
            label: [data[7].name],
            data: [data[7].salesMon, data[7].salesTue, data[7].salesWed, data[7].salesThu, data[7].salesFri, data[7].salesSat, data[7].salesSun],
          },
          {
            backgroundColor: data[8].color,
            borderColor: data[8].color,
            fill: false,
            label: [data[8].name],
            data: [data[8].salesMon, data[8].salesTue, data[8].salesWed, data[8].salesThu, data[8].salesFri, data[8].salesSat, data[8].salesSun],
          },
          {
            backgroundColor: data[9].color,
            borderColor: data[9].color,
            fill: false,
            label: [data[9].name],
            data: [data[9].salesMon, data[9].salesTue, data[9].salesWed, data[9].salesThu, data[9].salesFri, data[9].salesSat, data[9].salesSun],
          },
        ],
      },

      options: {
        maintainAspectRatio: false,
        title: {
          display: true,
          text: "This weeks sales",
          fontSize: 35,
          fontColor: "#000",
        },
        legend: {
          display: false,
        },
      },
    });
  } else {
    dailyChart = new Chart(chartDest, {
      type: window.innerWidth > 730 ? "bar" : "horizontalBar",
      data: {
        labels: [chartData[0].name, chartData[1].name, chartData[2].name, chartData[3].name, chartData[4].name, chartData[5].name, chartData[6].name, chartData[7].name, chartData[8].name, chartData[9].name],
        datasets: [
          {
            label: "Beers sold today",
            data: [chartData[0].sales, chartData[1].sales, chartData[2].sales, chartData[3].sales, chartData[4].sales, chartData[5].sales, chartData[6].sales, chartData[7].sales, chartData[8].sales, chartData[9].sales],
            backgroundColor: [chartData[0].color, chartData[1].color, chartData[2].color, chartData[3].color, chartData[4].color, chartData[5].color, chartData[6].color, chartData[7].color, chartData[8].color, chartData[9].color],
          },
        ],
      },

      options: {
        maintainAspectRatio: false,
        title: {
          display: true,
          text: "Beers sold today",
          fontSize: 35,
          fontColor: "#000",
        },
        legend: {
          display: false,
        },
      },
    });
  }

  document.querySelector("#back-btn").addEventListener("click", () => {
    document.querySelector(".chart-container").classList.add("hide-block");
    document.querySelector("main").classList.remove("hide-block");
  });

  document.querySelector("#chart-select").addEventListener("change", () => {
    if (document.querySelector("#chart-select").value === "weekly") {
      dailyChart.destroy();
      weekChart = new Chart(chartDest, {
        type: window.innerWidth > 730 ? "bar" : "horizontalBar",
        data: {
          labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          datasets: [
            {
              backgroundColor: data[0].color,
              borderColor: data[0].color,
              fill: false,
              label: [data[0].name],
              data: [data[0].salesMon, data[0].salesTue, data[0].salesWed, data[0].salesThu, data[0].salesFri, data[0].salesSat, data[0].salesSun],
            },
            {
              backgroundColor: data[1].color,
              borderColor: data[1].color,
              fill: false,
              label: [data[1].name],
              data: [data[1].salesMon, data[1].salesTue, data[1].salesWed, data[1].salesThu, data[1].salesFri, data[1].salesSat, data[1].salesSun],
            },
            {
              backgroundColor: data[2].color,
              borderColor: data[2].color,
              fill: false,
              label: [data[2].name],
              data: [data[2].salesMon, data[2].salesTue, data[2].salesWed, data[2].salesThu, data[2].salesFri, data[2].salesSat, data[2].salesSun],
            },
            {
              backgroundColor: data[3].color,
              borderColor: data[3].color,
              fill: false,
              label: [data[3].name],
              data: [data[3].salesMon, data[3].salesTue, data[3].salesWed, data[3].salesThu, data[3].salesFri, data[3].salesSat, data[3].salesSun],
            },
            {
              backgroundColor: data[4].color,
              borderColor: data[4].color,
              fill: false,
              label: [data[4].name],
              data: [data[4].salesMon, data[4].salesTue, data[4].salesWed, data[4].salesThu, data[4].salesFri, data[4].salesSat, data[4].salesSun],
            },
            {
              backgroundColor: data[5].color,
              borderColor: data[5].color,
              fill: false,
              label: [data[5].name],
              data: [data[5].salesMon, data[5].salesTue, data[5].salesWed, data[5].salesThu, data[5].salesFri, data[5].salesSat, data[5].salesSun],
            },
            {
              backgroundColor: data[6].color,
              borderColor: data[6].color,
              fill: false,
              label: [data[6].name],
              data: [data[6].salesMon, data[6].salesTue, data[6].salesWed, data[6].salesThu, data[6].salesFri, data[6].salesSat, data[6].salesSun],
            },
            {
              backgroundColor: data[7].color,
              borderColor: data[7].color,
              fill: false,
              label: [data[7].name],
              data: [data[7].salesMon, data[7].salesTue, data[7].salesWed, data[7].salesThu, data[7].salesFri, data[7].salesSat, data[7].salesSun],
            },
            {
              backgroundColor: data[8].color,
              borderColor: data[8].color,
              fill: false,
              label: [data[8].name],
              data: [data[8].salesMon, data[8].salesTue, data[8].salesWed, data[8].salesThu, data[8].salesFri, data[8].salesSat, data[8].salesSun],
            },
            {
              backgroundColor: data[9].color,
              borderColor: data[9].color,
              fill: false,
              label: [data[9].name],
              data: [data[9].salesMon, data[9].salesTue, data[9].salesWed, data[9].salesThu, data[9].salesFri, data[9].salesSat, data[9].salesSun],
            },
          ],
        },

        options: {
          maintainAspectRatio: false,
          title: {
            display: true,
            text: "This weeks sales",
            fontSize: 35,
            fontColor: "#000",
          },
          legend: {
            display: false,
          },
        },
      });
    } else {
      weekChart.destroy();
      dailyChart = new Chart(chartDest, {
        type: window.innerWidth > 730 ? "bar" : "horizontalBar",
        data: {
          labels: [chartData[0].name, chartData[1].name, chartData[2].name, chartData[3].name, chartData[4].name, chartData[5].name, chartData[6].name, chartData[7].name, chartData[8].name, chartData[9].name],
          datasets: [
            {
              label: "Beers sold today",
              data: [chartData[0].sales, chartData[1].sales, chartData[2].sales, chartData[3].sales, chartData[4].sales, chartData[5].sales, chartData[6].sales, chartData[7].sales, chartData[8].sales, chartData[9].sales],
              backgroundColor: [chartData[0].color, chartData[1].color, chartData[2].color, chartData[3].color, chartData[4].color, chartData[5].color, chartData[6].color, chartData[7].color, chartData[8].color, chartData[9].color],
              borderWidth: 1,
            },
          ],
        },

        options: {
          maintainAspectRatio: false,
          title: {
            display: true,
            text: "Beers sold today",
            fontSize: 35,
            fontColor: "#000",
          },
          legend: {
            display: false,
          },
        },
      });
    }
  });
}

function compareNumbers(a, b) {
  return b.sales - a.sales;
}

function createChartData(data) {
  if (today === "mon") {
    const localChartData = [
      {
        name: data[0].name,
        sales: data[0].salesMon,
        color: data[0].color,
      },
      {
        name: data[1].name,
        sales: data[1].salesMon,
        color: data[1].color,
      },
      {
        name: data[2].name,
        sales: data[2].salesMon,
        color: data[2].color,
      },
      {
        name: data[3].name,
        sales: data[3].salesMon,
        color: data[3].color,
      },
      {
        name: data[4].name,
        sales: data[4].salesMon,
        color: data[4].color,
      },
      {
        name: data[5].name,
        sales: data[5].salesMon,
        color: data[5].color,
      },
      {
        name: data[6].name,
        sales: data[6].salesMon,
        color: data[6].color,
      },
      {
        name: data[7].name,
        sales: data[7].salesMon,
        color: data[7].color,
      },
      {
        name: data[8].name,
        sales: data[8].salesMon,
        color: data[8].color,
      },
      {
        name: data[9].name,
        sales: data[9].salesMon,
        color: data[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);
    return sortedChartData;
  } else if (today === "tue") {
    const localChartData = [
      {
        name: data[0].name,
        sales: data[0].salesTue,
        color: data[0].color,
      },
      {
        name: data[1].name,
        sales: data[1].salesTue,
        color: data[1].color,
      },
      {
        name: data[2].name,
        sales: data[2].salesTue,
        color: data[2].color,
      },
      {
        name: data[3].name,
        sales: data[3].salesTue,
        color: data[3].color,
      },
      {
        name: data[4].name,
        sales: data[4].salesTue,
        color: data[4].color,
      },
      {
        name: data[5].name,
        sales: data[5].salesTue,
        color: data[5].color,
      },
      {
        name: data[6].name,
        sales: data[6].salesTue,
        color: data[6].color,
      },
      {
        name: data[7].name,
        sales: data[7].salesTue,
        color: data[7].color,
      },
      {
        name: data[8].name,
        sales: data[8].salesTue,
        color: data[8].color,
      },
      {
        name: data[9].name,
        sales: data[9].salesTue,
        color: data[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  } else if (today === "wed") {
    const localChartData = [
      {
        name: data[0].name,
        sales: data[0].salesWed,
        color: data[0].color,
      },
      {
        name: data[1].name,
        sales: data[1].salesWed,
        color: data[1].color,
      },
      {
        name: data[2].name,
        sales: data[2].salesWed,
        color: data[2].color,
      },
      {
        name: data[3].name,
        sales: data[3].salesWed,
        color: data[3].color,
      },
      {
        name: data[4].name,
        sales: data[4].salesWed,
        color: data[4].color,
      },
      {
        name: data[5].name,
        sales: data[5].salesWed,
        color: data[5].color,
      },
      {
        name: data[6].name,
        sales: data[6].salesWed,
        color: data[6].color,
      },
      {
        name: data[7].name,
        sales: data[7].salesWed,
        color: data[7].color,
      },
      {
        name: data[8].name,
        sales: data[8].salesWed,
        color: data[8].color,
      },
      {
        name: data[9].name,
        sales: data[9].salesWed,
        color: data[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  } else if (today === "thu") {
    const localChartData = [
      {
        name: data[0].name,
        sales: data[0].salesThu,
        color: data[0].color,
      },
      {
        name: data[1].name,
        sales: data[1].salesThu,
        color: data[1].color,
      },
      {
        name: data[2].name,
        sales: data[2].salesThu,
        color: data[2].color,
      },
      {
        name: data[3].name,
        sales: data[3].salesThu,
        color: data[3].color,
      },
      {
        name: data[4].name,
        sales: data[4].salesThu,
        color: data[4].color,
      },
      {
        name: data[5].name,
        sales: data[5].salesThu,
        color: data[5].color,
      },
      {
        name: data[6].name,
        sales: data[6].salesThu,
        color: data[6].color,
      },
      {
        name: data[7].name,
        sales: data[7].salesThu,
        color: data[7].color,
      },
      {
        name: data[8].name,
        sales: data[8].salesThu,
        color: data[8].color,
      },
      {
        name: data[9].name,
        sales: data[9].salesThu,
        color: data[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  } else if (today === "fri") {
    const localChartData = [
      {
        name: data[0].name,
        sales: data[0].salesFri,
        color: data[0].color,
      },
      {
        name: data[1].name,
        sales: data[1].salesFri,
        color: data[1].color,
      },
      {
        name: data[2].name,
        sales: data[2].salesFri,
        color: data[2].color,
      },
      {
        name: data[3].name,
        sales: data[3].salesFri,
        color: data[3].color,
      },
      {
        name: data[4].name,
        sales: data[4].salesFri,
        color: data[4].color,
      },
      {
        name: data[5].name,
        sales: data[5].salesFri,
        color: data[5].color,
      },
      {
        name: data[6].name,
        sales: data[6].salesFri,
        color: data[6].color,
      },
      {
        name: data[7].name,
        sales: data[7].salesFri,
        color: data[7].color,
      },
      {
        name: data[8].name,
        sales: data[8].salesFri,
        color: data[8].color,
      },
      {
        name: data[9].name,
        sales: data[9].salesFri,
        color: data[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  } else if (today === "sat") {
    const localChartData = [
      {
        name: data[0].name,
        sales: data[0].salesSat,
        color: data[0].color,
      },
      {
        name: data[1].name,
        sales: data[1].salesSat,
        color: data[1].color,
      },
      {
        name: data[2].name,
        sales: data[2].salesSat,
        color: data[2].color,
      },
      {
        name: data[3].name,
        sales: data[3].salesSat,
        color: data[3].color,
      },
      {
        name: data[4].name,
        sales: data[4].salesSat,
        color: data[4].color,
      },
      {
        name: data[5].name,
        sales: data[5].salesSat,
        color: data[5].color,
      },
      {
        name: data[6].name,
        sales: data[6].salesSat,
        color: data[6].color,
      },
      {
        name: data[7].name,
        sales: data[7].salesSat,
        color: data[7].color,
      },
      {
        name: data[8].name,
        sales: data[8].salesSat,
        color: data[8].color,
      },
      {
        name: data[9].name,
        sales: data[9].salesSat,
        color: data[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  } else if (today === "sun") {
    const localChartData = [
      {
        name: data[0].name,
        sales: data[0].salesSun,
        color: data[0].color,
      },
      {
        name: data[1].name,
        sales: data[1].salesSun,
        color: data[1].color,
      },
      {
        name: data[2].name,
        sales: data[2].salesSun,
        color: data[2].color,
      },
      {
        name: data[3].name,
        sales: data[3].salesSun,
        color: data[3].color,
      },
      {
        name: data[4].name,
        sales: data[4].salesSun,
        color: data[4].color,
      },
      {
        name: data[5].name,
        sales: data[5].salesSun,
        color: data[5].color,
      },
      {
        name: data[6].name,
        sales: data[6].salesSun,
        color: data[6].color,
      },
      {
        name: data[7].name,
        sales: data[7].salesSun,
        color: data[7].color,
      },
      {
        name: data[8].name,
        sales: data[8].salesSun,
        color: data[8].color,
      },
      {
        name: data[9].name,
        sales: data[9].salesSun,
        color: data[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  }
}

function resetDatabase() {
  if (today === "mon") {
    setInterval(function () {
      var date = new Date();
      if (date.getHours() === 10 && date.getMinutes() === 0) {
        console.log("Resetting database");
        const data = {
          salesMon: 0,
          salesTue: 0,
          salesWed: 0,
          salesThu: 0,
          salesFri: 0,
          salesSat: 0,
          salesSun: 0,
        };

        const postData = JSON.stringify(data);

        fetch(`https://frontendspring20-f2e0.restdb.io/rest/beers?max=10`, {
          method: "get",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": `5e957b2e436377171a0c2346`,
            "cache-control": "no-cache",
          },
        })
          .then((e) => e.json())
          .then((e) => {
            console.log(e);
            e.forEach((beer) => {
              fetch(`https://frontendspring20-f2e0.restdb.io/rest/beers/${beer._id}`, {
                method: "put",
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                  "x-apikey": `5e957b2e436377171a0c2346`,
                  "cache-control": "no-cache",
                },
                body: postData,
              })
                .then((e) => e.json())
                .then((e) => console.log(e));
            });
          });
      }
    }, 60000);
  }
}

//Borrowed from https://css-tricks.com/converting-color-spaces-in-javascript/
function darkenHEX(H) {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1) - 10;

  return "hsl(" + h + "," + s + "%," + l + "%)";
}
