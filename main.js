"use strict";
document.addEventListener("DOMContentLoaded", start);

const endPoint = "https://foobarexam.herokuapp.com/";
const HTML = {};
let currentTaps = [];
let waitingTimes = [0, 0];

function start() {
  console.log("START");
  HTML.template = document.querySelector("template");
  HTML.dest = document.querySelector("#ordercontainer");
  HTML.queue = document.querySelector("#queue");

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
    .then((data) => data.json())
    .then((data) => {
      showData(data);
      setTimeout(fetchData, 1000);
    });
}

function showData(data) {
  console.log(data);
  showOrders(data);

  //QUEUE
  const queueLength = data.queue.length;
  HTML.queue.querySelector("h1").textContent = queueLength;
  if (queueLength === 1) {
    HTML.queue.querySelector("p").textContent = "Person in line";
  } else {
    HTML.queue.querySelector("p").textContent = "People in line";
  }

  HTML.queue.querySelector("p+p").textContent =
    "Average queue time: " + calcAverage();

  //BARTENDERS
  data.bartenders.forEach((bartender) => {
    const bartenderNumber = data.bartenders.indexOf(bartender);
    const DOMDest = document.querySelector(
      `#workerscontainer article:nth-child(${bartenderNumber + 1})`
    );

    DOMDest.querySelector("h3").textContent = data.bartenders[
      bartenderNumber
    ].name.toUpperCase();

    if (data.bartenders[bartenderNumber].status === "WORKING") {
      if (data.bartenders[bartenderNumber].statusDetail === "replaceKeg") {
        DOMDest.querySelector("p").textContent = "REPLACING KEG";
        DOMDest.querySelector("circle").style.fill = "red";
      } else {
        DOMDest.querySelector("p").textContent =
          "SERVING ORDER #" + data.bartenders[bartenderNumber].servingCustomer;
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
      if (beer.name === data.taps[tapNumber].beer) {
        DOMDest.querySelector(".storage").textContent = beer.amount + " x";
      }
    });

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
  // console.log(data);
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
  klon.querySelector(".time").textContent = millisToMinutesAndSeconds(
    timeMilli
  );

  person.order.forEach((orderItem) => {
    const li = document.createElement("li");
    li.textContent = orderItem;
    klon.querySelector("ul").appendChild(li);
  });
  HTML.dest.appendChild(klon);

  waitingTimes.push(timestamp - person.startTime);
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
