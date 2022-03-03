define(["require", "exports", "preact", "preact/hooks", "text!./data/fastestlap.json", "ojs/ojgauge", "ojs/ojbutton", "ojs/ojtoolbar"], function (require, exports, preact_1, hooks_1, trackData) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Content = void 0;
    // const wsServiceUrl = "ws://130.61.139.189:8001"; Nacho
    const wsServiceUrl = "ws://130.61.139.189:8001";
    let carData = null;
    let socket = null;
    let timerId = null;
    let dataFlow = null;
    let flowIndex = 0;
    const imgPath = "styles/images/car/";
    function Content() {
        /* car behavior states  */
        const [speed, setSpeed] = hooks_1.useState(0);
        const [throttle, setThrottle] = hooks_1.useState("");
        const [brake, setBrake] = hooks_1.useState("");
        const [gear, setGear] = hooks_1.useState(0);
        const [rpm, setRPM] = hooks_1.useState(0);
        const [steer, setSteer] = hooks_1.useState(0);
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
        const [sessionType, setSessionType] = hooks_1.useState(0);
        /* Run mode  */
        const [mode, setMode] = hooks_1.useState("simulator");
        /* Simulator data and config  */
        const [frameNum, setFrameNum] = hooks_1.useState(0);
        const data = JSON.parse(trackData);
        const frameRate = 40;
        /* Connect to Websocket relay for live data  */
        const connectToServer = () => {
            setMode("live");
            if (!socket || socket.readyState !== 1) {
                socket = new WebSocket(wsServiceUrl);
            }
            socket.addEventListener("open", (event) => {
                () => socket.send("getPacketSessionData");
                timerId = setInterval(() => socket.send("getPacketCarTelemetryData"), 1000 / frameRate);
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
                }
                if (jsonData.m_car_telemetry_data) {
                    carData = jsonData;
                    console.log(JSON.stringify(carData));
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
                }
                else {
                    clearInterval(dataFlow);
                }
            };
            dataFlow = setInterval(throttleDataFlow, 1000 / frameRate); // read the fasteslap data at one 18 frames per second.
        };
        /* Stop simulator or live connection  */
        const disconnectFromServer = (event) => {
            if (mode === "simulator") {
                clearInterval(dataFlow);
                flowIndex = 9999999;
                console.log("Simulator stopped");
            }
            else {
                if (socket != null && socket.readyState === 1) {
                    clearInterval(timerId);
                    socket.close();
                    console.log("Server connection closed");
                }
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
            if (action.type < 0)
                steerDirection = -1;
            if (action.type > 0)
                steerDirection = 1;
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
            }
            else if (action.type < 96) {
                code = "yellow";
            }
            else if (action.type >= 96) {
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
        const [tyreTempFR, setTyreTempFR] = hooks_1.useReducer(defineTyreColor, imgPath + "sand_01.png"); // Front Right
        const [tyreTempRR, settyreTempRR] = hooks_1.useReducer(defineTyreColor, imgPath + "sand_02.png"); // Rear Right
        const [tyreTempRL, settyreTempRL] = hooks_1.useReducer(defineTyreColor, imgPath + "sand_03.png"); // Rear Left
        const [tyreTempFL, setTyreTempFL] = hooks_1.useReducer(defineTyreColor, imgPath + "sand_04.png"); // Front Left
        const [steeringStyles, setsteeringStyles] = hooks_1.useReducer(getStyles, "steering-size");
        const [weatherStyles, setweatherStyles] = hooks_1.useReducer(defineWeatherStyle, "weather sunny");
        hooks_1.useEffect(() => { }, []);
        const thresholdValues = [
            { max: 11500, color: "#77b0b8" },
            { max: 13500, color: "#e6cc87" },
            { max: 15000, color: "#c74634" },
        ];
        const referenceLines = [
            { value: 11500, color: "#e6cc87" },
            { value: 13500, color: "#c74634" },
        ];
        return (preact_1.h("div", { class: "" },
            preact_1.h("div", { class: "oj-flex oj-sm-flex-direction-column oj-flex-align oj-panel oj-panel-shadow-xs oj-bg-neutral-20 f1-dashboard bg-fiber" },
                preact_1.h("div", { class: "oj-flex-item oj-flex-bar", style: "max-height:25px;" },
                    preact_1.h("div", { class: "oj-flex-bar-start" },
                        preact_1.h("div", { class: weatherStyles })),
                    preact_1.h("div", { class: "oj-flex-bar-end" },
                        preact_1.h("oj-toolbar", { class: "oj-color-invert" },
                            preact_1.h("oj-button", { onojAction: runSimulation, chroming: "callToAction" }, "Simulator"),
                            preact_1.h("oj-button", { onojAction: connectToServer, chroming: "callToAction" }, "Live"),
                            preact_1.h("oj-button", { onojAction: disconnectFromServer, chroming: "callToAction" }, "Disconnect")))),
                preact_1.h("div", { class: "oj-flex oj-flex-init oj-md-justify-content-space-between oj-sm-only-flex-direction-column" },
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center " },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item" },
                                preact_1.h("img", { src: tyreTempFR, class: "f1-meter-tire" })),
                            preact_1.h("div", { class: "oj-flex-item" },
                                preact_1.h("img", { src: tyreTempRL, class: "f1-meter-tire" }))),
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item" },
                                preact_1.h("img", { src: tyreTempRR, class: "f1-meter-tire" })),
                            preact_1.h("div", { class: "oj-flex-item" },
                                preact_1.h("img", { src: tyreTempFL, class: "f1-meter-tire" })))),
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center center-sizing" },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item position-center" },
                                preact_1.h("oj-status-meter-gauge", { class: "f1-meter-lg", min: 0, max: 350, value: speed, startAngle: 180, labelledBy: "startAngle", angleExtent: 180, metricLabel: {
                                        style: {
                                            color: "#f9f9f6",
                                            fontSize: "1.2rem",
                                            fontFamily: "sans-comic",
                                        },
                                    }, orientation: "circular" })))),
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing" },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom" },
                                preact_1.h("oj-status-meter-gauge", { class: "f1-meter-md", min: 0, max: 15000, value: rpm, startAngle: 180, labelledBy: "startAngle", angleExtent: 180, metricLabel: {
                                        position: "outsidePlotArea",
                                        style: {
                                            color: "#f9f9f6",
                                            fontSize: "1.2rem",
                                            fontFamily: "sans-comic",
                                        },
                                    }, thresholds: thresholdValues, referenceLines: referenceLines, orientation: "circular" }))))),
                preact_1.h("div", { class: "oj-flex oj-flex-init oj-md-justify-content-space-between oj-sm-only-flex-direction-column bottom-row-alignment" },
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing" },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom" },
                                preact_1.h("div", { class: "oj-flex-item" },
                                    preact_1.h("span", { class: "oj-typography-subheading-md oj-color-invert" },
                                        "Throttle",
                                        " "),
                                    preact_1.h("span", { class: throttle ? "on" : "clear", style: "display:inline-block;width:30px;height:1rem" })),
                                preact_1.h("div", { class: "oj-flex-item" },
                                    preact_1.h("span", { class: "oj-typography-subheading-md oj-color-invert" },
                                        "Brake",
                                        " "),
                                    preact_1.h("span", { class: brake ? "off" : "clear", style: "display:inline-block;width:30px;height:1rem" }))))),
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top center-sizing" },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item" },
                                preact_1.h("img", { src: "styles/images/sw.png", alt: "steering wheel", class: steeringStyles })))),
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing" },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom" },
                                preact_1.h("oj-status-meter-gauge", { class: "f1-meter-gear", min: 0, max: 10, value: gear, startAngle: 180, labelledBy: "startAngle", angleExtent: 180, metricLabel: {
                                        position: "outsidePlotArea",
                                        style: {
                                            color: "#f9f9f6",
                                            fontSize: "1.2rem",
                                            fontFamily: "sans-comic",
                                        },
                                    }, orientation: "circular" }))))))));
    }
    exports.Content = Content;
});
