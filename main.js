"use strict";
document.addEventListener("DOMContentLoaded", start);

const endPoint = "https://foobarexam.herokuapp.com/";
const HTML = {};

function start() {
  console.log("START");
  HTML.template = document.querySelector("template");
  HTML.dest = document.querySelector("#ordercontainer");
  HTML.queue = document.querySelector("#queue");
  HTML.worker0 = document.querySelector(
    "#workerscontainer article:nth-child(1)"
  );
  HTML.worker1 = document.querySelector(
    "#workerscontainer article:nth-child(2)"
  );
  HTML.worker2 = document.querySelector(
    "#workerscontainer article:nth-child(3)"
  );
  HTML.tap0 = document.querySelector("#tapcontainer article:nth-child(1)");
  HTML.tap1 = document.querySelector("#tapcontainer article:nth-child(2)");
  HTML.tap2 = document.querySelector("#tapcontainer article:nth-child(3)");
  HTML.tap3 = document.querySelector("#tapcontainer article:nth-child(4)");
  HTML.tap4 = document.querySelector("#tapcontainer article:nth-child(5)");
  HTML.tap5 = document.querySelector("#tapcontainer article:nth-child(6)");
  HTML.tap6 = document.querySelector("#tapcontainer article:nth-child(7)");

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
  // console.log(data);
  showOrders(data.queue);

  //QUEUE
  const queueLength = data.queue.length;
  HTML.queue.querySelector("h1").textContent = queueLength;
  if (queueLength === 1) {
    HTML.queue.querySelector("p").textContent = "Person in line";
  } else {
    HTML.queue.querySelector("p").textContent = "People in line";
  }

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

  // //BARTENDER 1
  // HTML.worker0.querySelector(
  //   "h3"
  // ).textContent = data.bartenders[0].name.toUpperCase();

  // if (data.bartenders[0].status === "WORKING") {
  //   if (data.bartenders[0].statusDetail === "replaceKeg") {
  //     HTML.worker0.querySelector("p").textContent = "REPLACING KEG";
  //     HTML.worker0.querySelector("circle").style.fill = "red";
  //   } else {
  //     HTML.worker0.querySelector("p").textContent =
  //       "SERVING ORDER #" + data.bartenders[0].servingCustomer;
  //     HTML.worker0.querySelector("circle").style.fill = "red";
  //   }
  // } else if (data.bartenders[0].status === "READY") {
  //   HTML.worker0.querySelector("p").textContent = "READY";
  //   HTML.worker0.querySelector("circle").style.fill = "green";
  // } else if (data.bartenders[0].statusDetail === "replaceKeg") {
  //   HTML.worker0.querySelector("p").textContent = "REPLACING KEG";
  //   HTML.worker0.querySelector("circle").style.fill = "red";
  // }

  // //BARTENDER 2
  // HTML.worker1.querySelector(
  //   "h3"
  // ).textContent = data.bartenders[1].name.toUpperCase();

  // if (data.bartenders[1].status === "WORKING") {
  //   if (data.bartenders[1].statusDetail === "replaceKeg") {
  //     HTML.worker1.querySelector("p").textContent = "REPLACING KEG";
  //     HTML.worker1.querySelector("circle").style.fill = "red";
  //   } else {
  //     HTML.worker1.querySelector("p").textContent =
  //       "SERVING ORDER #" + data.bartenders[1].servingCustomer;
  //     HTML.worker1.querySelector("circle").style.fill = "red";
  //   }
  // } else if (data.bartenders[1].status === "READY") {
  //   HTML.worker1.querySelector("p").textContent = "READY";
  //   HTML.worker1.querySelector("circle").style.fill = "green";
  // }

  // //BARTENDER 3
  // HTML.worker2.querySelector(
  //   "h3"
  // ).textContent = data.bartenders[2].name.toUpperCase();

  // if (data.bartenders[2].status === "WORKING") {
  //   if (data.bartenders[2].statusDetail === "replaceKeg") {
  //     HTML.worker2.querySelector("p").textContent = "REPLACING KEG";
  //     HTML.worker2.querySelector("circle").style.fill = "red";
  //   } else {
  //     HTML.worker2.querySelector("p").textContent =
  //       "SERVING ORDER #" + data.bartenders[2].servingCustomer;
  //     HTML.worker2.querySelector("circle").style.fill = "red";
  //   }
  // } else if (data.bartenders[2].status === "READY") {
  //   HTML.worker2.querySelector("p").textContent = "READY";
  //   HTML.worker2.querySelector("circle").style.fill = "green";
  // } else if (data.bartenders[2].statusDetail === "replaceKeg") {
  //   HTML.worker2.querySelector("p").textContent = "REPLACING KEG";
  //   HTML.worker2.querySelector("circle").style.fill = "red";
  // }

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

  // //TAP 1
  // HTML.tap0.querySelector("h3").textContent = data.taps[0].beer;
  // HTML.tap0.setAttribute("data-beertype", data.taps[0].beer);
  // HTML.tap0.querySelector(".overlay").style.height =
  //   (data.taps[0].level / data.taps[0].capacity) * 100 + "%";
  // HTML.tap0.querySelector(".level").textContent =
  //   data.taps[0].level / 100 + "L";

  // data.storage.forEach((beer) => {
  //   if (beer.name === data.taps[0].beer) {
  //     HTML.tap0.querySelector(".storage").textContent = beer.amount + " x";
  //   }
  // });

  // if (data.taps[0].inUse && data.taps[0].level > 0) {
  //   HTML.tap0.querySelector(".tap_svg").classList.remove("inactive");
  //   HTML.tap0.querySelector(".tap_svg").classList.add("active");
  // } else {
  //   HTML.tap0.querySelector(".tap_svg").classList.remove("active");
  //   HTML.tap0.querySelector(".tap_svg").classList.add("inactive");
  // }

  // //TAP 2
  // HTML.tap1.querySelector("h3").textContent = data.taps[1].beer;
  // HTML.tap1.setAttribute("data-beertype", data.taps[1].beer);
  // HTML.tap1.querySelector(".overlay").style.height =
  //   (data.taps[1].level / data.taps[1].capacity) * 100 + "%";
  // HTML.tap1.querySelector(".level").textContent =
  //   data.taps[1].level / 100 + "L";

  // data.storage.forEach((beer) => {
  //   if (beer.name === data.taps[1].beer) {
  //     HTML.tap1.querySelector(".storage").textContent = beer.amount + " x";
  //   }
  // });

  // if (data.taps[1].inUse && data.taps[1].level > 0) {
  //   HTML.tap1.querySelector(".tap_svg").classList.remove("inactive");
  //   HTML.tap1.querySelector(".tap_svg").classList.add("active");
  // } else {
  //   HTML.tap1.querySelector(".tap_svg").classList.remove("active");
  //   HTML.tap1.querySelector(".tap_svg").classList.add("inactive");
  // }

  // //TAP 3
  // HTML.tap2.querySelector("h3").textContent = data.taps[2].beer;
  // HTML.tap2.setAttribute("data-beertype", data.taps[2].beer);
  // HTML.tap2.querySelector(".overlay").style.height =
  //   (data.taps[2].level / data.taps[2].capacity) * 100 + "%";
  // HTML.tap2.querySelector(".level").textContent =
  //   data.taps[2].level / 100 + "L";

  // data.storage.forEach((beer) => {
  //   if (beer.name === data.taps[2].beer) {
  //     HTML.tap2.querySelector(".storage").textContent = beer.amount + " x";
  //   }
  // });

  // if (data.taps[2].inUse && data.taps[2].level > 0) {
  //   HTML.tap2.querySelector(".tap_svg").classList.remove("inactive");
  //   HTML.tap2.querySelector(".tap_svg").classList.add("active");
  // } else {
  //   HTML.tap2.querySelector(".tap_svg").classList.remove("active");
  //   HTML.tap2.querySelector(".tap_svg").classList.add("inactive");
  // }

  // //TAP 4
  // HTML.tap3.querySelector("h3").textContent = data.taps[3].beer;
  // HTML.tap3.setAttribute("data-beertype", data.taps[3].beer);
  // HTML.tap3.querySelector(".overlay").style.height =
  //   (data.taps[3].level / data.taps[3].capacity) * 100 + "%";
  // HTML.tap3.querySelector(".level").textContent =
  //   data.taps[3].level / 100 + "L";

  // data.storage.forEach((beer) => {
  //   if (beer.name === data.taps[3].beer) {
  //     HTML.tap3.querySelector(".storage").textContent = beer.amount + " x";
  //   }
  // });

  // if (data.taps[3].inUse && data.taps[3].level > 0) {
  //   HTML.tap3.querySelector(".tap_svg").classList.remove("inactive");
  //   HTML.tap3.querySelector(".tap_svg").classList.add("active");
  // } else {
  //   HTML.tap3.querySelector(".tap_svg").classList.remove("active");
  //   HTML.tap3.querySelector(".tap_svg").classList.add("inactive");
  // }

  // //TAP 5
  // HTML.tap4.querySelector("h3").textContent = data.taps[4].beer;
  // HTML.tap4.setAttribute("data-beertype", data.taps[4].beer);
  // HTML.tap4.querySelector(".overlay").style.height =
  //   (data.taps[4].level / data.taps[4].capacity) * 100 + "%";
  // HTML.tap4.querySelector(".level").textContent =
  //   data.taps[4].level / 100 + "L";

  // data.storage.forEach((beer) => {
  //   if (beer.name === data.taps[4].beer) {
  //     HTML.tap4.querySelector(".storage").textContent = beer.amount + " x";
  //   }
  // });

  // if (data.taps[4].inUse && data.taps[4].level > 0) {
  //   HTML.tap4.querySelector(".tap_svg").classList.remove("inactive");
  //   HTML.tap4.querySelector(".tap_svg").classList.add("active");
  // } else {
  //   HTML.tap4.querySelector(".tap_svg").classList.remove("active");
  //   HTML.tap4.querySelector(".tap_svg").classList.add("inactive");
  // }

  // //TAP 6
  // HTML.tap5.querySelector("h3").textContent = data.taps[5].beer;
  // HTML.tap5.setAttribute("data-beertype", data.taps[5].beer);
  // HTML.tap5.querySelector(".overlay").style.height =
  //   (data.taps[5].level / data.taps[5].capacity) * 100 + "%";
  // HTML.tap5.querySelector(".level").textContent =
  //   data.taps[5].level / 100 + "L";

  // data.storage.forEach((beer) => {
  //   if (beer.name === data.taps[5].beer) {
  //     HTML.tap5.querySelector(".storage").textContent = beer.amount + " x";
  //   }
  // });

  // if (data.taps[5].inUse && data.taps[5].level > 0) {
  //   HTML.tap5.querySelector(".tap_svg").classList.remove("inactive");
  //   HTML.tap5.querySelector(".tap_svg").classList.add("active");
  // } else {
  //   HTML.tap5.querySelector(".tap_svg").classList.remove("active");
  //   HTML.tap5.querySelector(".tap_svg").classList.add("inactive");
  // }

  // //TAP 7
  // HTML.tap6.querySelector("h3").textContent = data.taps[6].beer;
  // HTML.tap6.setAttribute("data-beertype", data.taps[6].beer);
  // HTML.tap6.querySelector(".overlay").style.height =
  //   (data.taps[6].level / data.taps[6].capacity) * 100 + "%";
  // HTML.tap6.querySelector(".level").textContent =
  //   data.taps[6].level / 100 + "L";

  // data.storage.forEach((beer) => {
  //   if (beer.name === data.taps[6].beer) {
  //     HTML.tap6.querySelector(".storage").textContent = beer.amount + " x";
  //   }
  // });

  // if (data.taps[6].inUse && data.taps[6].level > 0) {
  //   HTML.tap6.querySelector(".tap_svg").classList.remove("inactive");
  //   HTML.tap6.querySelector(".tap_svg").classList.add("active");
  // } else {
  //   HTML.tap6.querySelector(".tap_svg").classList.remove("active");
  //   HTML.tap6.querySelector(".tap_svg").classList.add("inactive");
  // }
}

function showOrders(data) {
  // console.log(data);
  HTML.dest.innerHTML = "";
  data.forEach((person) => showOrder(person));
}

function showOrder(person) {
  // console.log(person);
  let klon = HTML.template.cloneNode(true).content;

  klon.querySelector("h2").textContent = "ORDER #" + person.id;
  person.order.forEach((orderItem) => {
    const li = document.createElement("li");
    li.textContent = orderItem;
    klon.querySelector("ul").appendChild(li);
  });
  HTML.dest.appendChild(klon);
}
