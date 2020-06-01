"use strict";
import Chart from "chart.js";
document.addEventListener("DOMContentLoaded", start);

const endPoint = "https://foobarexam.herokuapp.com/";
const restDBEndpoint = "https://frontendspring20-f2e0.restdb.io/rest/beers";
const APIKey = "5e957b2e436377171a0c2346";
const updateInterval = 1;
const HTML = {};
let currentTaps = [];
let waitingTimes = [0, 0];
let orderHistory = [];
let ordersStored = [];
let today = new Date().toString().substring(0, 3).toLowerCase();

const OrderHistory = {
  name: "",
  timesOrdered: 0,
};

function start() {
  console.log("START");
  HTML.template = document.querySelector("template");
  HTML.dest = document.querySelector("#ordercontainer");
  HTML.queue = document.querySelector("#queue");
  HTML.chartIcon = document.querySelector("#chart-icon");

  console.log(today);

  setInterval(() => {
    orderHistory.forEach((historyItem) => {
      updateDatabase(historyItem);
    });
    orderHistory = [];
    console.log("Updating database");
    console.log(`Total orders stored: ${ordersStored.length}`);
  }, updateInterval * 60000);

  fetchSVGS();
  fetchData();
  getDatabaseData();
  resetDatabase();
}

function fetchSVGS() {
  fetch("svgs/tap.svg", {
    method: "get",
  })
    .then((svg) => svg.text())
    .then((svg) => {
      document.querySelectorAll(".tap-icon").forEach((tapIcon) => (tapIcon.innerHTML = svg));
    });
}

function fetchData() {
  fetch(endPoint, {
    method: "get",
  })
    .then((data) => data.json())
    .then((data) => {
      showData(data);
      setTimeout(fetchData, 1000);
    });
}

function showData(data) {
  showOrders(data);

  //QUEUE
  const queueLength = data.queue.length;
  HTML.queue.querySelector("h1").textContent = queueLength;
  if (queueLength === 1) {
    HTML.queue.querySelector("p").textContent = "Person in line";
  } else {
    HTML.queue.querySelector("p").textContent = "People in line";
  }

  HTML.queue.querySelector("p+p").textContent = "Average queue time: " + calcAverage();

  //BARTENDERS
  data.bartenders.forEach((bartender) => {
    const bartenderNumber = data.bartenders.indexOf(bartender);
    const DOMDest = document.querySelector(`#workerscontainer article:nth-child(${bartenderNumber + 1})`);

    DOMDest.querySelector("h3").textContent = data.bartenders[bartenderNumber].name.toUpperCase();

    if (data.bartenders[bartenderNumber].status === "WORKING") {
      if (data.bartenders[bartenderNumber].statusDetail === "replaceKeg") {
        DOMDest.querySelector("p").textContent = "REPLACING KEG";
        DOMDest.querySelector("circle").style.fill = "red";
      } else {
        DOMDest.querySelector("p").textContent = "SERVING ORDER #" + data.bartenders[bartenderNumber].servingCustomer;
        DOMDest.querySelector("circle").style.fill = "red";
      }
    } else if (data.bartenders[bartenderNumber].status === "READY") {
      DOMDest.querySelector("p").textContent = "READY";
      DOMDest.querySelector("circle").style.fill = "green";
    } else if (data.bartenders[bartenderNumber].statusDetail === "replaceKeg") {
      DOMDest.querySelector("p").textContent = "REPLACING KEG";
      DOMDest.querySelector("circle").style.fill = "red";
    }
  });

  //TAPS
  data.taps.forEach((tap) => {
    const tapNumber = data.taps.indexOf(tap);
    const DOMDest = document.querySelector(`#tapcontainer article:nth-child(${tapNumber + 1})`);

    DOMDest.querySelector("h3").textContent = data.taps[tapNumber].beer;
    DOMDest.setAttribute("data-beertype", data.taps[tapNumber].beer);
    DOMDest.querySelector(".overlay").style.height = (data.taps[tapNumber].level / data.taps[0].capacity) * 100 + "%";
    DOMDest.querySelector(".level").textContent = data.taps[tapNumber].level / 100 + "L";

    data.storage.forEach((beer) => {
      if (beer.name === data.taps.beer) {
        DOMDest.querySelector(".storage").textContent = beer.amount + " x";
      }
    });

    // EMPTY

    if (tap.level < 600) {
      DOMDest.querySelector(".tap").classList.add("empty");
      DOMDest.querySelector(".level").classList.add("change");
      DOMDest.querySelector(".storage").classList.add("change");
      DOMDest.querySelector(".keg-icon").src = "svgs/kegblack copy.svg";
    } else {
      DOMDest.querySelector(".tap").classList.remove("empty");
      DOMDest.querySelector(".level").classList.remove("change");
      DOMDest.querySelector(".storage").classList.remove("change");
      DOMDest.querySelector(".keg-icon").src = "svgs/keg copy.svg";
    }

    if (data.taps[tapNumber].inUse && data.taps[tapNumber].level > 0) {
      DOMDest.querySelector(".tap_svg").classList.remove("inactive");
      DOMDest.querySelector(".tap_svg").classList.add("active");
    } else {
      DOMDest.querySelector(".tap_svg").classList.remove("active");
      DOMDest.querySelector(".tap_svg").classList.add("inactive");
    }
  });
}

function showOrders(data) {
  HTML.dest.innerHTML = "";
  data.queue.forEach((person) => {
    showOrder(person, data);
  });
}

function showOrder(person, data) {
  let timestamp = data.timestamp;
  let klon = HTML.template.cloneNode(true).content;

  klon.querySelector("h3").textContent = "ORDER #" + person.id;
  const timeMilli = timestamp - person.startTime;
  klon.querySelector(".time").textContent = millisToMinutesAndSeconds(timeMilli);

  person.order.forEach((orderItem) => {
    const li = document.createElement("li");
    li.textContent = orderItem;
    klon.querySelector("ul").appendChild(li);
  });

  HTML.dest.appendChild(klon);

  storeOrder(person);
  waitingTimes.push(timestamp - person.startTime);
}

function storeOrder(person) {
  if (ordersStored.includes(person.id) === false) {
    ordersStored.push(person.id);

    person.order.forEach((orderItem) => {
      let alreadyInArray = orderHistory.some((historyArr) => {
        return historyArr.name === orderItem;
      });

      if (!alreadyInArray) {
        let orderHistoryItem = Object.create(OrderHistory);
        orderHistoryItem.name = orderItem;
        orderHistoryItem.timesOrdered = 1;

        orderHistory.push(orderHistoryItem);
      } else {
        const objIndex = orderHistory.findIndex((obj) => obj.name === orderItem);

        let timesOrdered = orderHistory[objIndex].timesOrdered;

        orderHistory[objIndex].timesOrdered = timesOrdered + 1;
      }
    });
  }
}

function calcAverage() {
  const sum = waitingTimes.reduce((a, b) => a + b);
  const avg = sum / waitingTimes.length;

  return millisToMinutesAndSeconds(avg);
}

//Hugget fra https://stackoverflow.com/questions/21294302/converting-milliseconds-to-minutes-and-seconds-with-javascript
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function setDatabaseData(item) {
  if (today === "mon") {
    return {
      $inc: {
        salesMon: item.timesOrdered,
      },
    };
  } else if (today === "tue") {
    return {
      $inc: {
        salesTue: item.timesOrdered,
      },
    };
  } else if (today === "wed") {
    return {
      $inc: {
        salesWed: item.timesOrdered,
      },
    };
  } else if (today === "thu") {
    return {
      $inc: {
        salesThu: item.timesOrdered,
      },
    };
  } else if (today === "fri") {
    return {
      $inc: {
        salesFri: item.timesOrdered,
      },
    };
  } else if (today === "sat") {
    return {
      $inc: {
        salesSat: item.timesOrdered,
      },
    };
  } else if (today === "sun") {
    return {
      $inc: {
        salesSun: item.timesOrdered,
      },
    };
  }
}

function updateDatabase(item) {
  const data = setDatabaseData(item);

  const postData = JSON.stringify(data);

  fetch(`${restDBEndpoint}?max=10&q={"name":"${item.name}"}`, {
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-apikey": `${APIKey}`,
      "cache-control": "no-cache",
    },
  })
    .then((e) => e.json())
    .then((e) => {
      console.log(e);

      let userID = e[0]._id;

      fetch(`${restDBEndpoint}/${userID}`, {
        method: "put",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "x-apikey": `${APIKey}`,
          "cache-control": "no-cache",
        },
        body: postData,
      })
        .then((e) => e.json())
        .then((e) => console.log(e));
    });
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
      HTML.chartIcon.addEventListener("click", () => {
        document.querySelector(".chart-container").classList.remove("hide-block");
        document.querySelector("main").classList.add("hide-block");
        showChart(e);
      });
    });
}

function showChart(e) {
  const chartData = createChartData(e);

  Chart.defaults.global.defaultFontFamily = '"Roboto"';

  let ctx = document.getElementById("myChart");
  let myChart;
  let weekChart;

  if (document.querySelector("#chart-select").value === "weekly") {
    weekChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        datasets: [
          {
            backgroundColor: e[0].color,
            borderColor: e[0].color,
            fill: false,
            label: [e[0].name],
            data: [e[0].salesMon, e[0].salesTue, e[0].salesWed, e[0].salesThu, e[0].salesFri, e[0].salesSat, e[0].salesSun],
          },
          {
            backgroundColor: e[1].color,
            borderColor: e[1].color,
            fill: false,
            label: [e[1].name],
            data: [e[1].salesMon, e[1].salesTue, e[1].salesWed, e[1].salesThu, e[1].salesFri, e[1].salesSat, e[1].salesSun],
          },
          {
            backgroundColor: e[2].color,
            borderColor: e[2].color,
            fill: false,
            label: [e[2].name],
            data: [e[2].salesMon, e[2].salesTue, e[2].salesWed, e[2].salesThu, e[2].salesFri, e[2].salesSat, e[2].salesSun],
          },
          {
            backgroundColor: e[3].color,
            borderColor: e[3].color,
            fill: false,
            label: [e[3].name],
            data: [e[3].salesMon, e[3].salesTue, e[3].salesWed, e[3].salesThu, e[3].salesFri, e[3].salesSat, e[3].salesSun],
          },
          {
            backgroundColor: e[4].color,
            borderColor: e[4].color,
            fill: false,
            label: [e[4].name],
            data: [e[4].salesMon, e[4].salesTue, e[4].salesWed, e[4].salesThu, e[4].salesFri, e[4].salesSat, e[4].salesSun],
          },
          {
            backgroundColor: e[5].color,
            borderColor: e[5].color,
            fill: false,
            label: [e[5].name],
            data: [e[5].salesMon, e[5].salesTue, e[5].salesWed, e[5].salesThu, e[5].salesFri, e[5].salesSat, e[5].salesSun],
          },
          {
            backgroundColor: e[6].color,
            borderColor: e[6].color,
            fill: false,
            label: [e[6].name],
            data: [e[6].salesMon, e[6].salesTue, e[6].salesWed, e[6].salesThu, e[6].salesFri, e[6].salesSat, e[6].salesSun],
          },
          {
            backgroundColor: e[7].color,
            borderColor: e[7].color,
            fill: false,
            label: [e[7].name],
            data: [e[7].salesMon, e[7].salesTue, e[7].salesWed, e[7].salesThu, e[7].salesFri, e[7].salesSat, e[7].salesSun],
          },
          {
            backgroundColor: e[8].color,
            borderColor: e[8].color,
            fill: false,
            label: [e[8].name],
            data: [e[8].salesMon, e[8].salesTue, e[8].salesWed, e[8].salesThu, e[8].salesFri, e[8].salesSat, e[8].salesSun],
          },
          {
            backgroundColor: e[9].color,
            borderColor: e[9].color,
            fill: false,
            label: [e[9].name],
            data: [e[9].salesMon, e[9].salesTue, e[9].salesWed, e[9].salesThu, e[9].salesFri, e[9].salesSat, e[9].salesSun],
          },
        ],
      },

      options: {
        maintainAspectRatio: false,
        title: {
          display: true,
          text: "This weeks sales",
          fontSize: 35,
        },
        legend: {
          display: false,
        },
      },
    });
  } else {
    myChart = new Chart(ctx, {
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
      myChart.destroy();
      weekChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          datasets: [
            {
              backgroundColor: e[0].color,
              borderColor: e[0].color,
              fill: false,
              label: [e[0].name],
              data: [e[0].salesMon, e[0].salesTue, e[0].salesWed, e[0].salesThu, e[0].salesFri, e[0].salesSat, e[0].salesSun],
            },
            {
              backgroundColor: e[1].color,
              borderColor: e[1].color,
              fill: false,
              label: [e[1].name],
              data: [e[1].salesMon, e[1].salesTue, e[1].salesWed, e[1].salesThu, e[1].salesFri, e[1].salesSat, e[1].salesSun],
            },
            {
              backgroundColor: e[2].color,
              borderColor: e[2].color,
              fill: false,
              label: [e[2].name],
              data: [e[2].salesMon, e[2].salesTue, e[2].salesWed, e[2].salesThu, e[2].salesFri, e[2].salesSat, e[2].salesSun],
            },
            {
              backgroundColor: e[3].color,
              borderColor: e[3].color,
              fill: false,
              label: [e[3].name],
              data: [e[3].salesMon, e[3].salesTue, e[3].salesWed, e[3].salesThu, e[3].salesFri, e[3].salesSat, e[3].salesSun],
            },
            {
              backgroundColor: e[4].color,
              borderColor: e[4].color,
              fill: false,
              label: [e[4].name],
              data: [e[4].salesMon, e[4].salesTue, e[4].salesWed, e[4].salesThu, e[4].salesFri, e[4].salesSat, e[4].salesSun],
            },
            {
              backgroundColor: e[5].color,
              borderColor: e[5].color,
              fill: false,
              label: [e[5].name],
              data: [e[5].salesMon, e[5].salesTue, e[5].salesWed, e[5].salesThu, e[5].salesFri, e[5].salesSat, e[5].salesSun],
            },
            {
              backgroundColor: e[6].color,
              borderColor: e[6].color,
              fill: false,
              label: [e[6].name],
              data: [e[6].salesMon, e[6].salesTue, e[6].salesWed, e[6].salesThu, e[6].salesFri, e[6].salesSat, e[6].salesSun],
            },
            {
              backgroundColor: e[7].color,
              borderColor: e[7].color,
              fill: false,
              label: [e[7].name],
              data: [e[7].salesMon, e[7].salesTue, e[7].salesWed, e[7].salesThu, e[7].salesFri, e[7].salesSat, e[7].salesSun],
            },
            {
              backgroundColor: e[8].color,
              borderColor: e[8].color,
              fill: false,
              label: [e[8].name],
              data: [e[8].salesMon, e[8].salesTue, e[8].salesWed, e[8].salesThu, e[8].salesFri, e[8].salesSat, e[8].salesSun],
            },
            {
              backgroundColor: e[9].color,
              borderColor: e[9].color,
              fill: false,
              label: [e[9].name],
              data: [e[9].salesMon, e[9].salesTue, e[9].salesWed, e[9].salesThu, e[9].salesFri, e[9].salesSat, e[9].salesSun],
            },
          ],
        },

        options: {
          maintainAspectRatio: false,
          title: {
            display: true,
            text: "This weeks sales",
            fontSize: 35,
          },
          legend: {
            display: false,
          },
        },
      });
    } else {
      weekChart.destroy();
      myChart = new Chart(ctx, {
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

function createChartData(e) {
  if (today === "mon") {
    const localChartData = [
      {
        name: e[0].name,
        sales: e[0].salesMon,
        color: e[0].color,
      },
      {
        name: e[1].name,
        sales: e[1].salesMon,
        color: e[1].color,
      },
      {
        name: e[2].name,
        sales: e[2].salesMon,
        color: e[2].color,
      },
      {
        name: e[3].name,
        sales: e[3].salesMon,
        color: e[3].color,
      },
      {
        name: e[4].name,
        sales: e[4].salesMon,
        color: e[4].color,
      },
      {
        name: e[5].name,
        sales: e[5].salesMon,
        color: e[5].color,
      },
      {
        name: e[6].name,
        sales: e[6].salesMon,
        color: e[6].color,
      },
      {
        name: e[7].name,
        sales: e[7].salesMon,
        color: e[7].color,
      },
      {
        name: e[8].name,
        sales: e[8].salesMon,
        color: e[8].color,
      },
      {
        name: e[9].name,
        sales: e[9].salesMon,
        color: e[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  } else if (today === "tue") {
    const localChartData = [
      {
        name: e[0].name,
        sales: e[0].salesTue,
        color: e[0].color,
      },
      {
        name: e[1].name,
        sales: e[1].salesTue,
        color: e[1].color,
      },
      {
        name: e[2].name,
        sales: e[2].salesTue,
        color: e[2].color,
      },
      {
        name: e[3].name,
        sales: e[3].salesTue,
        color: e[3].color,
      },
      {
        name: e[4].name,
        sales: e[4].salesTue,
        color: e[4].color,
      },
      {
        name: e[5].name,
        sales: e[5].salesTue,
        color: e[5].color,
      },
      {
        name: e[6].name,
        sales: e[6].salesTue,
        color: e[6].color,
      },
      {
        name: e[7].name,
        sales: e[7].salesTue,
        color: e[7].color,
      },
      {
        name: e[8].name,
        sales: e[8].salesTue,
        color: e[8].color,
      },
      {
        name: e[9].name,
        sales: e[9].salesTue,
        color: e[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  } else if (today === "wed") {
    const localChartData = [
      {
        name: e[0].name,
        sales: e[0].salesWed,
        color: e[0].color,
      },
      {
        name: e[1].name,
        sales: e[1].salesWed,
        color: e[1].color,
      },
      {
        name: e[2].name,
        sales: e[2].salesWed,
        color: e[2].color,
      },
      {
        name: e[3].name,
        sales: e[3].salesWed,
        color: e[3].color,
      },
      {
        name: e[4].name,
        sales: e[4].salesWed,
        color: e[4].color,
      },
      {
        name: e[5].name,
        sales: e[5].salesWed,
        color: e[5].color,
      },
      {
        name: e[6].name,
        sales: e[6].salesWed,
        color: e[6].color,
      },
      {
        name: e[7].name,
        sales: e[7].salesWed,
        color: e[7].color,
      },
      {
        name: e[8].name,
        sales: e[8].salesWed,
        color: e[8].color,
      },
      {
        name: e[9].name,
        sales: e[9].salesWed,
        color: e[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  } else if (today === "thu") {
    const localChartData = [
      {
        name: e[0].name,
        sales: e[0].salesThu,
        color: e[0].color,
      },
      {
        name: e[1].name,
        sales: e[1].salesThu,
        color: e[1].color,
      },
      {
        name: e[2].name,
        sales: e[2].salesThu,
        color: e[2].color,
      },
      {
        name: e[3].name,
        sales: e[3].salesThu,
        color: e[3].color,
      },
      {
        name: e[4].name,
        sales: e[4].salesThu,
        color: e[4].color,
      },
      {
        name: e[5].name,
        sales: e[5].salesThu,
        color: e[5].color,
      },
      {
        name: e[6].name,
        sales: e[6].salesThu,
        color: e[6].color,
      },
      {
        name: e[7].name,
        sales: e[7].salesThu,
        color: e[7].color,
      },
      {
        name: e[8].name,
        sales: e[8].salesThu,
        color: e[8].color,
      },
      {
        name: e[9].name,
        sales: e[9].salesThu,
        color: e[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  } else if (today === "fri") {
    const localChartData = [
      {
        name: e[0].name,
        sales: e[0].salesFri,
        color: e[0].color,
      },
      {
        name: e[1].name,
        sales: e[1].salesFri,
        color: e[1].color,
      },
      {
        name: e[2].name,
        sales: e[2].salesFri,
        color: e[2].color,
      },
      {
        name: e[3].name,
        sales: e[3].salesFri,
        color: e[3].color,
      },
      {
        name: e[4].name,
        sales: e[4].salesFri,
        color: e[4].color,
      },
      {
        name: e[5].name,
        sales: e[5].salesFri,
        color: e[5].color,
      },
      {
        name: e[6].name,
        sales: e[6].salesFri,
        color: e[6].color,
      },
      {
        name: e[7].name,
        sales: e[7].salesFri,
        color: e[7].color,
      },
      {
        name: e[8].name,
        sales: e[8].salesFri,
        color: e[8].color,
      },
      {
        name: e[9].name,
        sales: e[9].salesFri,
        color: e[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  } else if (today === "sat") {
    const localChartData = [
      {
        name: e[0].name,
        sales: e[0].salesSat,
        color: e[0].color,
      },
      {
        name: e[1].name,
        sales: e[1].salesSat,
        color: e[1].color,
      },
      {
        name: e[2].name,
        sales: e[2].salesSat,
        color: e[2].color,
      },
      {
        name: e[3].name,
        sales: e[3].salesSat,
        color: e[3].color,
      },
      {
        name: e[4].name,
        sales: e[4].salesSat,
        color: e[4].color,
      },
      {
        name: e[5].name,
        sales: e[5].salesSat,
        color: e[5].color,
      },
      {
        name: e[6].name,
        sales: e[6].salesSat,
        color: e[6].color,
      },
      {
        name: e[7].name,
        sales: e[7].salesSat,
        color: e[7].color,
      },
      {
        name: e[8].name,
        sales: e[8].salesSat,
        color: e[8].color,
      },
      {
        name: e[9].name,
        sales: e[9].salesSat,
        color: e[9].color,
      },
    ];

    const sortedChartData = localChartData.sort(compareNumbers);

    return sortedChartData;
  } else if (today === "sun") {
    const localChartData = [
      {
        name: e[0].name,
        sales: e[0].salesSun,
        color: e[0].color,
      },
      {
        name: e[1].name,
        sales: e[1].salesSun,
        color: e[1].color,
      },
      {
        name: e[2].name,
        sales: e[2].salesSun,
        color: e[2].color,
      },
      {
        name: e[3].name,
        sales: e[3].salesSun,
        color: e[3].color,
      },
      {
        name: e[4].name,
        sales: e[4].salesSun,
        color: e[4].color,
      },
      {
        name: e[5].name,
        sales: e[5].salesSun,
        color: e[5].color,
      },
      {
        name: e[6].name,
        sales: e[6].salesSun,
        color: e[6].color,
      },
      {
        name: e[7].name,
        sales: e[7].salesSun,
        color: e[7].color,
      },
      {
        name: e[8].name,
        sales: e[8].salesSun,
        color: e[8].color,
      },
      {
        name: e[9].name,
        sales: e[9].salesSun,
        color: e[9].color,
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
