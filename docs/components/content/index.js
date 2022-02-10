define(["require", "exports", "preact", "preact/hooks", "text!./data/fastestlap.json", "ojs/ojgauge"], function (require, exports, preact_1, hooks_1, trackData) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Content = void 0;
    function Content() {
        const [frameNum, setFrameNum] = hooks_1.useState(0);
        const [speed, setSpeed] = hooks_1.useState(0);
        const [throttle, setThrottle] = hooks_1.useState("");
        const [brake, setBrake] = hooks_1.useState("");
        const [gear, setGear] = hooks_1.useState(0);
        const [rpm, setRPM] = hooks_1.useState(0);
        const [steer, setSteer] = hooks_1.useState(0);
        const data = JSON.parse(trackData);
        const frameRate = 18;
        const getStyles = (state, action) => {
            switch (action.type) {
                case -1:
                    return "steering-size steer-left";
                case 1:
                    return "steering-size steer-right";
                default:
                    return "steering-size steer-straight";
            }
        };
        const [steeringStyles, setsteeringStyles] = hooks_1.useReducer(getStyles, "steering-size");
        hooks_1.useEffect(() => {
            let i = 0;
            const throttleDataFlow = () => {
                if (i < data.length) {
                    setFrameNum(data[i].M_FRAME);
                    setSpeed(data[i].M_SPEED);
                    setThrottle(data[i].M_THROTTLE);
                    setBrake(data[i].M_BRAKE);
                    setGear(data[i].M_GEAR);
                    setRPM(data[i].M_ENGINERPM);
                    setSteer(data[i].M_STEER);
                    setsteeringStyles({ type: data[i].M_STEER });
                    i++;
                }
                else {
                    clearInterval(dataFlow);
                }
            };
            const dataFlow = setInterval(throttleDataFlow, frameRate / 1000); // read the fastestlap data at one 18 frames per second.
        }, []);
        const thresholdValues = [
            { max: 11500, color: "green" },
            { max: 13500, color: "orange" },
            { max: 15000, color: "red" }
        ];
        const referenceLines = [
            { value: 11500, color: "orange" },
            { value: 13500, color: "red" }
        ];
        return (preact_1.h("div", { class: "" },
            preact_1.h("div", { class: "oj-panel oj-panel-shadow-xs oj-bg-neutral-20 f1-dashboard" },
                preact_1.h("div", { style: "margin-bottom:20px;" },
                    "Current Frame(",
                    frameRate,
                    "/sec): ",
                    frameNum,
                    " "),
                preact_1.h("div", { class: "oj-flex oj-flex-init oj-md-justify-content-space-between oj-sm-only-flex-direction-column" },
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing" },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom" },
                                preact_1.h("div", { class: "oj-flex-item" },
                                    preact_1.h("span", { class: "oj-typography-subheading-md" }, "Throttle "),
                                    preact_1.h("span", { class: throttle ? "on" : "clear", style: "display:inline-block;width:30px;height:1rem" })),
                                preact_1.h("div", { class: "oj-flex-item" },
                                    preact_1.h("span", { class: "oj-typography-subheading-md" }, "Brake "),
                                    preact_1.h("span", { class: brake ? "off" : "clear", style: "display:inline-block;width:30px;height:1rem" }))))),
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top center-sizing" },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom position-center" },
                                preact_1.h("oj-status-meter-gauge", { class: "f1-meter-lg", min: 0, max: 350, value: speed, startAngle: 180, labelledBy: "startAngle", angleExtent: 180, metricLabel: {
                                        position: "center",
                                        style: { color: "black", fontSize: "3.5rem", fontFamily: 'sans-comic' }
                                    }, orientation: "circular" })))),
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing" },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom" },
                                preact_1.h("oj-status-meter-gauge", { class: "f1-meter-md", min: 0, max: 15000, value: rpm, startAngle: 180, labelledBy: "startAngle", angleExtent: 180, metricLabel: {
                                        position: "outsidePlotArea",
                                        style: { color: "black", fontSize: "1.5rem", fontFamily: 'sans-comic' }
                                    }, thresholds: thresholdValues, referenceLines: referenceLines, orientation: "circular" }))))),
                preact_1.h("div", { class: "oj-flex oj-flex-init oj-md-justify-content-space-between oj-sm-only-flex-direction-column" },
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing" },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item" }, "TBD"))),
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top center-sizing" },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item" },
                                preact_1.h("img", { src: "styles/images/SW.png", class: steeringStyles })))),
                    preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing" },
                        preact_1.h("div", { class: "oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column" },
                            preact_1.h("div", { class: "oj-flex-item" },
                                preact_1.h("div", null, "TBD"))))))));
    }
    exports.Content = Content;
});
