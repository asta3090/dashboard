"use strict";
import { gsap } from "gsap";

document.addEventListener("DOMContentLoaded", start);

const endPoint = "https://foobarexam.herokuapp.com/";
const restDBEndpoint = "https://frontendspring20-f2e0.restdb.io/rest/beers";
const APIKey = "5e957b2e436377171a0c2346";
const updateInterval = 10;
const HTML = {};
let waitingTimes = [0, 0];
let orderHistory = [];
let ordersStored = [];
let today = new Date().toString().substring(0, 3).toLowerCase();

setInterval(() => {
  const wait = document.getElementById("wait");
  wait.innerHTML.length > 2 ? (wait.innerHTML = "") : (wait.innerHTML += ".");
}, 500);

const OrderHistory = {
  name: "",
  timesOrdered: 0,
};

function start() {
  HTML.template = document.querySelector("template");
  HTML.dest = document.querySelector("#ordercontainer");
  HTML.queue = document.querySelector("#queue");
  HTML.chartIcon = document.querySelector("#chart-icon");
  HTML.main = document.querySelector("main");
  HTML.loader = document.querySelector("#loader_container");

  setInterval(() => {
    orderHistory.forEach((historyItem) => {
      updateDatabase(historyItem);
    });
    orderHistory = [];
  }, updateInterval * 60000);

  fetchSVGS();
  fetchData();
}

function fetchSVGS() {
  fetch("svgs/tap.svg", {
    method: "get",
  })
    .then((svg) => svg.text())
    .then((svg) => {
      document
        .querySelectorAll(".tap-icon")
        .forEach((tapIcon) => (tapIcon.innerHTML = svg));
    });
}

function fetchData() {
  fetch(endPoint, {
    method: "get",
  })
    .then(chechError)
    .then((data) => {
      showData(data);
      setTimeout(fetchData, 1000);
    })
    .catch((error) => {
      console.log(error);
    });
}

function chechError(response) {
  if (response.status >= 200 && response.status <= 299) {
    return response.json();
  } else {
    throw Error(response.statusText);
  }
}

function showData(data) {
  //QUEUE
  const queueLength = data.queue.length;
  HTML.queue.querySelector("h1").textContent = queueLength;
  if (queueLength === 1) {
    HTML.queue.querySelector("p").textContent = "Person in line";
  } else {
    HTML.queue.querySelector("p").textContent = "People in line";
  }
  showOrders(data);
  HTML.queue.querySelector("p+p").textContent =
    "Average queue time: " + calcAverage();

  //BARTENDERS
  data.bartenders.forEach((bartender) => {
    const bartenderNumber = data.bartenders.indexOf(bartender);
    const DOMDest = document.querySelector(
      `#workerscontainer article:nth-child(${bartenderNumber + 1})`
    );

    DOMDest.querySelector("h3").textContent =
      data.bartenders[bartenderNumber].name;

    if (data.bartenders[bartenderNumber].status === "WORKING") {
      if (data.bartenders[bartenderNumber].statusDetail === "replaceKeg") {
        DOMDest.querySelector("p").textContent = "Replacing keg";
        DOMDest.querySelector("circle").style.fill = "red";
      } else {
        DOMDest.querySelector("p").textContent =
          "Serving order #" + data.bartenders[bartenderNumber].servingCustomer;
        DOMDest.querySelector("circle").style.fill = "red";
      }
    } else if (data.bartenders[bartenderNumber].status === "READY") {
      DOMDest.querySelector("p").textContent = "Ready";
      DOMDest.querySelector("circle").style.fill = "green";
    } else if (data.bartenders[bartenderNumber].statusDetail === "replaceKeg") {
      DOMDest.querySelector("p").textContent = "Replacing keg";
      DOMDest.querySelector("circle").style.fill = "red";
    }
  });

  //TAPS
  data.taps.forEach((tap) => {
    const tapNumber = data.taps.indexOf(tap);
    const DOMDest = document.querySelector(
      `#tapcontainer article:nth-child(${tapNumber + 1})`
    );

    DOMDest.querySelector("h3").textContent = data.taps[tapNumber].beer;
    DOMDest.setAttribute("data-beertype", data.taps[tapNumber].beer);
    DOMDest.querySelector(".overlay").style.height =
      (data.taps[tapNumber].level / data.taps[0].capacity) * 100 + "%";
    DOMDest.querySelector(".level").textContent =
      data.taps[tapNumber].level / 100 + "L";

    data.storage.forEach((beer) => {
      if (beer.name === data.taps.beer) {
        DOMDest.querySelector(".storage").textContent = beer.amount + " x";
      }
    });

    // EMPTY

    if (tap.level < 500) {
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

    if (tap.inUse && tap.level > 0) {
      DOMDest.querySelector(".tap_svg").classList.remove("inactive");
      DOMDest.querySelector(".tap_svg").classList.add("active");
    } else {
      DOMDest.querySelector(".tap_svg").classList.remove("active");
      DOMDest.querySelector(".tap_svg").classList.add("inactive");
    }
  });

  HTML.main.setAttribute("loaded", true);

  if (
    HTML.loader.getAttribute("loaded") == "true" &&
    document.querySelector(".chart-container").classList.contains("hide-block")
  ) {
    HTML.loader.className = "hide-block";
    HTML.main.className = "show-block";
  }
}

function showOrders(data) {
  HTML.dest.innerHTML = "";
  if (data.queue.length > 12) {
    data.queue.length = 12;
  }
  data.queue.forEach((person) => {
    showOrder(person, data);
  });
}

function showOrder(person, data) {
  let timestamp = data.timestamp;
  let klon = HTML.template.cloneNode(true).content;

  klon.querySelector("h3").textContent = "Order #" + person.id;
  const timeMilli = timestamp - person.startTime;
  klon.querySelector(".time").textContent = millisToMinutesAndSeconds(
    timeMilli
  );

  person.order.forEach((orderItem) => {
    const li = document.createElement("li");
    li.textContent = orderItem;
    klon.querySelector("ul").appendChild(li);
  });

  HTML.dest.appendChild(klon);

  storeOrder(person);
  waitingTimes.push(timeMilli);
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
        const objIndex = orderHistory.findIndex(
          (obj) => obj.name === orderItem
        );

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

//Lånt fra https://stackoverflow.com/questions/21294302/converting-milliseconds-to-minutes-and-seconds-with-javascript
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
