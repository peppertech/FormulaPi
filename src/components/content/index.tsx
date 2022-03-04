import { h } from "preact";
import { useState, useReducer, useEffect } from "preact/hooks";
import * as trackData from "text!./data/fastestlap.json";
import { ojButton } from "ojs/ojbutton";
import "ojs/ojgauge";
import "ojs/ojbutton";
import "ojs/ojtoolbar";

// const wsServiceUrl = "ws://130.61.139.189:8001"; Nacho
const wsServiceUrl = "ws://130.61.139.189:8001";
let carData = null;
let socket = null;
let timerId = null;
let dataFlow = null;
let flowIndex = 0;
const imgPath = "styles/images/car/";

export function Content() {
  /* car behavior states  */
  const [speed, setSpeed] = useState(0);
  const [throttle, setThrottle] = useState("");
  const [brake, setBrake] = useState("");
  const [gear, setGear] = useState(0);
  const [rpm, setRPM] = useState(0);
  const [steer, setSteer] = useState(0);

  /* session data states  
    0 = unknown, 
    1 = P1, 
    2 = P2, 
    3 = P3, 
    4 = Short P, 
    5 = Q1, 
    6 = Q2, 
    7 = Q3, 
    8 = Short Q, 
    9 = OSQ,  
    10 = R, 
    11 = R2, 
    12 = R3, 
    13 = Time Trial
  */
  const [sessionType, setSessionType] = useState(0);
  

  /* Run mode  */
  const [mode, setMode] = useState("simulator");

  /* Simulator data and config  */
  const [frameNum, setFrameNum] = useState(0);
  const data = JSON.parse(trackData);
  const frameRate = 40;

  /* Connect to Websocket relay for live data  */
  const connectToServer = () => {
    setMode("live");
    if (!socket || socket.readyState !== 1) {
      socket = new WebSocket(wsServiceUrl);
    }
    socket.addEventListener("open", (event) => {
      socket.send("getPacketSessionData");
      timerId = setInterval(
        () => socket.send("getPacketCarTelemetryData"),
        1000 / frameRate
      );
    });

    /* Listen for data coming from socket request */
    socket.addEventListener("message", function (event) {
      let jsonData = JSON.parse(event.data);
      if (typeof jsonData === "string") {
        jsonData = JSON.parse(jsonData);
      }
      if (jsonData.m_session_type) {
        setSessionType(jsonData.m_session_type);
        setweatherStyles({ type: jsonData.m_weather });
        console.log('Session Data: ' + JSON.stringify(jsonData));
      } 
      if (jsonData.m_car_telemetry_data) {
        carData = jsonData;
        console.log('Car Data: '+JSON.stringify(carData));
        if (Object.keys(carData).length !== 0) {
          setSpeed(carData.m_car_telemetry_data[0].m_speed);
          setThrottle(carData.m_car_telemetry_data[0].m_throttle);
          setBrake(carData.m_car_telemetry_data[0].m_brake);
          setGear(carData.m_car_telemetry_data[0].m_gear);
          setRPM(carData.m_car_telemetry_data[0].m_engine_rpm);
          setSteer(carData.m_car_telemetry_data[0].m_steer);
          setsteeringStyles({ type: carData.m_car_telemetry_data[0].m_steer });
          if (sessionType != 13) {
            settyreTempRL({
              type: carData.m_car_telemetry_data[0]
                .m_tyres_surface_temperature[0],
              location: "03",
            });
            settyreTempRR({
              type: carData.m_car_telemetry_data[0]
                .m_tyres_surface_temperature[1],
              location: "02",
            });
            setTyreTempFL({
              type: carData.m_car_telemetry_data[0]
                .m_tyres_surface_temperature[2],
              location: "04",
            });
            setTyreTempFR({
              type: carData.m_car_telemetry_data[0]
                .m_tyres_surface_temperature[3],
              location: "01",
            });
          }
        }
      }
    });
  };

  /* Process simulated fastestlap data  */
  const runSimulation = () => {
    setMode("simulator");
    flowIndex = 0;
    let randomWeather = Math.floor(Math.random() * 6);
    setweatherStyles({ type: randomWeather });
    const throttleDataFlow = () => {
      if (flowIndex < data.length) {
        setFrameNum(data[flowIndex].M_FRAME);
        setSpeed(data[flowIndex].M_SPEED);
        setThrottle(data[flowIndex].M_THROTTLE);
        setBrake(data[flowIndex].M_BRAKE);
        setGear(data[flowIndex].M_GEAR);
        setRPM(data[flowIndex].M_ENGINERPM);
        setSteer(data[flowIndex].M_STEER);
        setsteeringStyles({ type: data[flowIndex].M_STEER });
        flowIndex++;
      } else {
        clearInterval(dataFlow);
      }
    };
    dataFlow = setInterval(throttleDataFlow, 1000 / frameRate); // read the fasteslap data at one 18 frames per second.
  };

  /* Stop simulator or live connection  */
  const disconnectFromServer = (event: ojButton.ojAction) => {
    if (mode === "simulator") {
      clearInterval(dataFlow);
      flowIndex = 9999999;
      console.log("Simulator stopped");
    } else {
      if (socket != null && socket.readyState === 1) {
        clearInterval(timerId);
        socket.close();
        console.log("Server connection closed");
      }
      if(socket.readyState === 3){console.log('Server connection was already closed.')};
    }
  };

  /* Weather types
    0 = clear/sunny, 
    1 = light cloud, 
    2 = overcast 
    3 = light rain, 
    4 = heavy rain, 
    5 = storm
  */
  const defineWeatherStyle = (state, action) => {
    switch (action.type) {
      case 1:
        return "weather light-clouds";
      case 2:
        return "weather overcast";
      case 3:
        return "weather light-rain";
      case 4:
        return "weather heavy-rain";
      case 5:
        return "weather storms";
      default:
        return "weather sunny";
    }
  };

  /* setup steering wheel animation styles  */
  const getStyles = (state, action) => {
    let steerDirection = 0;
    if (action.type < 0) steerDirection = -1;
    if (action.type > 0) steerDirection = 1;
    switch (steerDirection) {
      case -1:
        return "steering-size steer-left";
      case 1:
        return "steering-size steer-right";
      default:
        return "steering-size steer-straight";
    }
  };

  /* Tyre temp color coding is
   **  Less than 100 degrees : Green
   **  Greater than 100 but less than 125 : Yellow / Sand
   **  Greater than or equal to 125 : Red
   */
  const defineTyreColor = (state, action) => {
    let code = "";
    if (action.type <= 86) {
      code = "green";
    } else if (action.type < 96) {
      code = "yellow";
    } else if (action.type >= 96) {
      code = "red";
    }
    switch (code) {
      case "red":
        return imgPath + "red_" + action.location + ".png";
      case "yellow":
        return imgPath + "yellow_" + action.location + ".png";
      case "green":
        return imgPath + "green_" + action.location + ".png";
      default:
        return imgPath + "sand_" + action.location + ".png";
    }
  };

  /* Tyre temperature */
  const [tyreTempFR, setTyreTempFR] = useReducer(
    defineTyreColor,
    imgPath + "sand_01.png"
  ); // Front Right
  const [tyreTempRR, settyreTempRR] = useReducer(
    defineTyreColor,
    imgPath + "sand_02.png"
  ); // Rear Right
  const [tyreTempRL, settyreTempRL] = useReducer(
    defineTyreColor,
    imgPath + "sand_03.png"
  ); // Rear Left
  const [tyreTempFL, setTyreTempFL] = useReducer(
    defineTyreColor,
    imgPath + "sand_04.png"
  ); // Front Left

  const [steeringStyles, setsteeringStyles] = useReducer(
    getStyles,
    "steering-size"
  );

  const [weatherStyles, setweatherStyles] = useReducer(defineWeatherStyle, "weather sunny");

  useEffect(() => {}, []);

  const thresholdValues = [
    { max: 11500, color: "#77b0b8" },
    { max: 13500, color: "#e6cc87" },
    { max: 15000, color: "#c74634" },
  ];
  const referenceLines = [
    { value: 11500, color: "#e6cc87" },
    { value: 13500, color: "#c74634" },
  ];
  return (
    <div class="">
      {/* outer panel styling and sizing */}
      <div class="oj-flex oj-sm-flex-direction-column oj-flex-align oj-panel oj-panel-shadow-xs oj-bg-neutral-20 f1-dashboard bg-fiber">
        {/* Control buttons and framerate status text */}
        <div class="oj-flex-item oj-flex-bar" style="max-height:25px;">
          <div class="oj-flex-bar-start">
            <div class={weatherStyles} title={weatherStyles}></div>
          </div>
          {/* <div class="oj-flex-bar-middle">
            <div style="margin-bottom:13px; color:white">
              Current Frame({frameRate}/sec): {frameNum}
            </div>
          </div> */}
          <div class="oj-flex-bar-end">
            <oj-toolbar class="oj-color-invert">
              <oj-button onojAction={runSimulation} chroming="callToAction">
                Simulator
              </oj-button>
              <oj-button onojAction={connectToServer} chroming="callToAction">
                Live
              </oj-button>
              <oj-button
                onojAction={disconnectFromServer}
                chroming="callToAction"
              >
                Disconnect
              </oj-button>
            </oj-toolbar>
          </div>
        </div>

        {/* Parent container for top row of elements */}
        <div class="oj-flex oj-flex-init oj-md-justify-content-space-between oj-sm-only-flex-direction-column">
          {/* Child container for first column of elements: car visualisation */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center ">
            {/* Stack elements in this column so that they layout vertically */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              <div class="oj-flex-item">
                <img src={tyreTempFR} class="f1-meter-tire" />
              </div>
              <div class="oj-flex-item">
                <img src={tyreTempRL} class="f1-meter-tire" />
              </div>
            </div>
            {/* Stack elements in this column so that they layout vertically */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              <div class="oj-flex-item">
                <img src={tyreTempRR} class="f1-meter-tire" />
              </div>
              <div class="oj-flex-item">
                <img src={tyreTempFL} class="f1-meter-tire" />
              </div>
            </div>
          </div>
          {/* Center column of elements: Speed gauge */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center center-sizing">
            {/* Force the content into a vertical column layout  */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              <div class="oj-flex-item position-center">
                <oj-status-meter-gauge
                  class="f1-meter-lg"
                  min={0}
                  max={350}
                  value={speed}
                  startAngle={180}
                  labelledBy="startAngle"
                  angleExtent={180}
                  metricLabel={{
                    style: {
                      color: "#f9f9f6",
                      fontSize: "1.2rem",
                      fontFamily: "sans-comic",
                    },
                  }}
                  orientation="circular"
                ></oj-status-meter-gauge>
              </div>
            </div>
          </div>

          {/* Third column of elements: RPM gauge */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing">
            {/* Force the content into a vertical column layout  */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              <div class="oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom">
                <oj-status-meter-gauge
                  class="f1-meter-md"
                  min={0}
                  max={15000}
                  value={rpm}
                  startAngle={180}
                  labelledBy="startAngle"
                  angleExtent={180}
                  metricLabel={{
                    position: "outsidePlotArea",
                    style: {
                      color: "#f9f9f6",
                      fontSize: "1.2rem",
                      fontFamily: "sans-comic",
                    },
                  }}
                  thresholds={thresholdValues}
                  referenceLines={referenceLines}
                  orientation="circular"
                ></oj-status-meter-gauge>
              </div>
            </div>
          </div>
        </div>

        {/* Parent container for bottom row of elements */}
        <div class="oj-flex oj-flex-init oj-md-justify-content-space-between oj-sm-only-flex-direction-column bottom-row-alignment">
          {/* Child container for first column of elements: Throttle and Brake status text */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing">
            {/* Stack elements in this column so that they layout vertically */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              <div class="oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom">
                <div class="oj-flex-item">
                  <span class="oj-typography-subheading-md oj-color-invert">
                    Throttle{" "}
                  </span>
                  <span
                    class={throttle ? "on" : "clear"}
                    style="display:inline-block;width:30px;height:1rem"
                  ></span>
                </div>
                <div class="oj-flex-item">
                  <span class="oj-typography-subheading-md oj-color-invert">
                    Brake{" "}
                  </span>
                  <span
                    class={brake ? "off" : "clear"}
                    style="display:inline-block;width:30px;height:1rem"
                  ></span>
                </div>
              </div>
            </div>
          </div>

          {/* Center column of elements: steering animation */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top center-sizing">
            {/* Force the content into a vertical column layout  */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              <div class="oj-flex-item">
                <img
                  src="styles/images/sw.png"
                  alt="steering wheel"
                  class={steeringStyles}
                />
              </div>
            </div>
          </div>

          {/* Third column of elements: Gear gauge */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing">
            {/* Force the content into a vertical column layout  */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              <div class="oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom">
                <oj-status-meter-gauge
                  class="f1-meter-gear"
                  min={0}
                  max={10}
                  value={gear}
                  startAngle={180}
                  labelledBy="startAngle"
                  angleExtent={180}
                  metricLabel={{
                    position: "outsidePlotArea",
                    style: {
                      color: "#f9f9f6",
                      fontSize: "1.2rem",
                      fontFamily: "sans-comic",
                    },
                  }}
                  orientation="circular"
                ></oj-status-meter-gauge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
