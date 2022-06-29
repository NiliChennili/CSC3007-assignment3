import * as d3 from "d3";
import { useState, useEffect} from "react";
import Papa from "papaparse";

function DemoChoroplethMap() {
  const [mapData, setMapData] = useState([]);
  const [csvData, setCsvData] = useState([]);

  useEffect(()=>{
    getLocalJSONData();
    getLocalCSVData();
  },[])


  let width = 1000,
      height = 450;

  let svg = d3.select("svg").attr("viewBox", "0 0 " + width + " " + height);

  //get the map data
  const getLocalJSONData = () => {
    Promise.all([require("./sgmap.json"), ,]).then((data) => {
      setMapData(data);
    });
  }; 
  //get the population data 
  const getLocalCSVData = () => {
    Papa.parse(
      "https://chi-loong.github.io/CSC3007/assignments/population2021.csv",
      {
        download: true,
        complete: function (results) {
      

          setCsvData(results.data);
        },
      }
    );
  };

  

  var projection = d3
    .geoMercator()
    .center([103.851959, 1.29027])
    .fitExtent(
      [
        [100, 20],
        [980, 480],
      ],
      mapData[0]
    );

  if (mapData.length === 0) {
  } else {
    
   

    let geopath = d3.geoPath().projection(projection);

    svg.selectAll("*").remove();

    const test = mapData[0].features;

    if (csvData.length !== 0) {
      test.forEach((i) => {
        let TooltipData = csvData.filter(function (data) {
          return (
            (String(data[0]).toUpperCase() === i.properties["Subzone Name"]) &
            (String(data[1]).toUpperCase() ===
              i.properties["Planning Area Name"])
          );
        });

        
        if (TooltipData.length > 0) {
          i.properties.Population = TooltipData[0][2];
        } else {
          i.properties.Population = "-";
        }
      });
//Map configure 
    svg.append("g")
        .attr("id", "districts")
        .selectAll("path")
        .data(mapData[0].features)
        .enter()
        .append("path")
        .attr("d", geopath)
        .attr("fill", "white")
        .attr("stroke", "#0570b0")
        .style("fill", function (d) {
          switch (true) {
            case parseInt(d.properties["Population"]) >= 40000:
              return "#782618";
            case parseInt(d.properties["Population"]) >= 30000:
              return "#9a311f";
            case parseInt(d.properties["Population"]) >= 20000:
              return "#be3d26";
            case parseInt(d.properties["Population"]) >= 10000:
              return "#e2492d";
            case parseInt(d.properties["Population"]) >= 5000:
              return "#ff5533";
            case parseInt(d.properties["Population"]) >= 1000:
              return "#ff8a75";
            case parseInt(d.properties["Population"]) >= 10:
              return "#ffad9f";
          }
          
        })
        .on("mouseover", function (d, i) {
          d3.select(this).attr("stroke", "#e31a1c").attr("stroke-width", "3");

          d3.select("#tooltip")
            .text(`${i.properties["Subzone Name"]},${i.properties["Population"]}`)
            .style("opacity", 1)
            .style("color", "black")
            .style("position", "absolute")
            .style("left", (d.pageX) + "px")
            .style("top", (d.pageY) + "px")
            .style("padding","10px")
            .style("background", "rgba(255, 255, 255, 0.9)")
            .style("box-shadow","1px 1px 10px rgba(128, 128, 128, 0.6)")
            .style("border","0px")
            .style("border-radius","5px");
        })
        .on("mouseout", function (d, i) {
          d3.select(this).attr("stroke", "#0570b0").attr("stroke-width", "1");

          d3.select("#tooltip").style("opacity", 0).text(d);
        });
    }
  }

  return (
    <div className="App">
      <br />
      <p
        style={{
          position: "absolute",
          color: "white",
          fontSize: "22px",
          textAlign: "center",
          marginTop: "20px",
          marginright:"10px",
          marginbottom:"40px",
          marginleft:"100px"

        }}
      >
        <b class="page-title">Singapore Population Density Map</b>
        <br />
        <span style={{ fontSize: "16px"}}>
          <div id="tooltip" />
        </span>
      </p>
      <div class="legend">
        <div class="legend-title"> Population Density Chart</div>
        <div class="legend-scale">
          <ul class="legend-labels">
            <li>
              <span style={{ background: "#f1eef6" }}></span>
              {"<1"}
            </li>
            <li>
              <span style={{ background: "#ff8a75" }}></span>
              {"1-5"}
            </li>
            <li>
              <span style={{ background: "#ff5533" }}></span>
              {"5-10"}
            </li>
            <li>
              <span style={{ background: "#e2492d" }}></span>
              {"10-20"}
            </li>
            <li>
              <span style={{ background: "#be3d26" }}></span>
              {"20-30"}
            </li>
            <li>
              <span style={{ background: "#9a311f" }}></span>
              {"30-40"}
            </li>
            <li>
              <span style={{ background: "#782618" }}></span>
              {">40"}
            </li>
          </ul>
        </div>
        <div class="legend-source"></div>
      </div>
      <br /> <br />
      
      <svg></svg>
    </div>
  );
}

export default DemoChoroplethMap;