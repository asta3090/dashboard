"use strict";
document.addEventListener("DOMContentLoaded", start);

const endPoint = "https://foobarexam.herokuapp.com/";
const HTML = {};

function start() {
  console.log("START");
  HTML.queue = document.querySelector("#queue");
  HTML.tap0 = document.querySelector("#tapcontainer article:nth-child(1)");
  HTML.tap1 = document.querySelector("#tapcontainer article:nth-child(2)");
  HTML.tap2 = document.querySelector("#tapcontainer article:nth-child(3)");
  HTML.tap3 = document.querySelector("#tapcontainer article:nth-child(4)");
  HTML.tap4 = document.querySelector("#tapcontainer article:nth-child(5)");
  HTML.tap5 = document.querySelector("#tapcontainer article:nth-child(6)");
  HTML.tap6 = document.querySelector("#tapcontainer article:nth-child(7)");

  fetchData();
}

function fetchData() {
  fetch(endPoint, {
    method: "get",
  })
    .then((data) => data.json())
    .then((data) => {
      showData(data);
      setTimeout(fetchData, 5000);
    });
}

function showData(data) {
  console.log(data);

  //QUEUE
  HTML.queue.querySelector("h1").textContent = data.queue.length;

  //TAP 1
  HTML.tap0.querySelector("h3").textContent = data.taps[0].beer;
  HTML.tap0.setAttribute("data-beertype", data.taps[0].beer);
  HTML.tap0.querySelector(".overlay").style.height =
    (data.taps[0].level / data.taps[0].capacity) * 100 + "%";
  HTML.tap0.querySelector(".level").textContent =
    data.taps[0].level / 100 + "L";

  data.storage.forEach((beer) => {
    if (beer.name === data.taps[0].beer) {
      HTML.tap0.querySelector(".storage").textContent = beer.amount + " x";
    }
  });

  //TAP 2
  HTML.tap1.querySelector("h3").textContent = data.taps[1].beer;
  HTML.tap1.setAttribute("data-beertype", data.taps[1].beer);
  HTML.tap1.querySelector(".overlay").style.height =
    (data.taps[1].level / data.taps[1].capacity) * 100 + "%";
  HTML.tap1.querySelector(".level").textContent =
    data.taps[1].level / 100 + "L";

  data.storage.forEach((beer) => {
    if (beer.name === data.taps[1].beer) {
      HTML.tap1.querySelector(".storage").textContent = beer.amount + " x";
    }
  });

  //TAP 3
  HTML.tap2.querySelector("h3").textContent = data.taps[2].beer;
  HTML.tap2.setAttribute("data-beertype", data.taps[2].beer);
  HTML.tap2.querySelector(".overlay").style.height =
    (data.taps[2].level / data.taps[2].capacity) * 100 + "%";
  HTML.tap2.querySelector(".level").textContent =
    data.taps[2].level / 100 + "L";

  data.storage.forEach((beer) => {
    if (beer.name === data.taps[2].beer) {
      HTML.tap2.querySelector(".storage").textContent = beer.amount + " x";
    }
  });

  //TAP 4
  HTML.tap3.querySelector("h3").textContent = data.taps[3].beer;
  HTML.tap3.setAttribute("data-beertype", data.taps[3].beer);
  HTML.tap3.querySelector(".overlay").style.height =
    (data.taps[3].level / data.taps[3].capacity) * 100 + "%";
  HTML.tap3.querySelector(".level").textContent =
    data.taps[3].level / 100 + "L";

  data.storage.forEach((beer) => {
    if (beer.name === data.taps[3].beer) {
      HTML.tap3.querySelector(".storage").textContent = beer.amount + " x";
    }
  });

  //TAP 5
  HTML.tap4.querySelector("h3").textContent = data.taps[4].beer;
  HTML.tap4.setAttribute("data-beertype", data.taps[4].beer);
  HTML.tap4.querySelector(".overlay").style.height =
    (data.taps[4].level / data.taps[4].capacity) * 100 + "%";
  HTML.tap4.querySelector(".level").textContent =
    data.taps[4].level / 100 + "L";

  data.storage.forEach((beer) => {
    if (beer.name === data.taps[4].beer) {
      HTML.tap4.querySelector(".storage").textContent = beer.amount + " x";
    }
  });

  //TAP 6
  HTML.tap5.querySelector("h3").textContent = data.taps[5].beer;
  HTML.tap5.setAttribute("data-beertype", data.taps[5].beer);
  HTML.tap5.querySelector(".overlay").style.height =
    (data.taps[5].level / data.taps[5].capacity) * 100 + "%";
  HTML.tap5.querySelector(".level").textContent =
    data.taps[5].level / 100 + "L";

  data.storage.forEach((beer) => {
    if (beer.name === data.taps[5].beer) {
      HTML.tap5.querySelector(".storage").textContent = beer.amount + " x";
    }
  });

  //TAP 7
  HTML.tap6.querySelector("h3").textContent = data.taps[6].beer;
  HTML.tap6.setAttribute("data-beertype", data.taps[6].beer);
  HTML.tap6.querySelector(".overlay").style.height =
    (data.taps[6].level / data.taps[6].capacity) * 100 + "%";
  HTML.tap6.querySelector(".level").textContent =
    data.taps[6].level / 100 + "L";

  data.storage.forEach((beer) => {
    if (beer.name === data.taps[6].beer) {
      HTML.tap6.querySelector(".storage").textContent = beer.amount + " x";
    }
  });
}
