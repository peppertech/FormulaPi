import { h } from "preact";
import { useState, useReducer, useEffect } from "preact/hooks";
import * as trackData from "text!./data/fastestlap.json";
import "ojs/ojgauge";

export function Content() {
  const [frameNum, setFrameNum] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [throttle, setThrottle] = useState("");
  const [brake, setBrake] = useState("");
  const [gear, setGear] = useState(0);
  const [rpm, setRPM] = useState(0);
  const [steer, setSteer] = useState(0);
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

  const [steeringStyles, setsteeringStyles] = useReducer(
    getStyles,
    "steering-size"
  );

  useEffect(() => {
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
      } else {
        clearInterval(dataFlow);
      }
    };
    const dataFlow = setInterval(throttleDataFlow, frameRate / 1000); // read the fasteslap data at one 18 frames per second.
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
  return (
    <div class="">
      <div class="oj-panel oj-panel-shadow-xs oj-bg-neutral-20 f1-dashboard">
        <div style="margin-bottom:20px;">
          Current Frame({frameRate}/sec): {frameNum}{" "}
        </div>
        <div class="oj-flex oj-flex-init oj-md-justify-content-space-between oj-sm-only-flex-direction-column">
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top">
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              <div class="oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom">
                <oj-status-meter-gauge
                  class="f1-meter-large"
                  min={0}
                  max={350}
                  value={speed}
                  startAngle={180}
                  labelledBy="startAngle"
                  angleExtent={180}
                  innerRadius={0.7}
                  metricLabel={{position:'center', style:{color:'black',fontSize:'2rem'}}}
                  orientation="circular"></oj-status-meter-gauge>
              </div>
              <div class="oj-flex-item">
                <div class="oj-flex-item">Speed: {speed}</div>
                <div class="oj-flex-item">
                  Throttle:{" "}
                  <span
                    class={throttle ? "on" : "clear"}
                    style="display:inline-block;width:30px;height:1rem"></span>
                </div>
                <div class="oj-flex-item">
                  Brake:{" "}
                  <span
                    class={brake ? "off" : "clear"}
                    style="display:inline-block;width:30px;height:1rem"></span>
                </div>
              </div>
            </div>
          </div>
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top">
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              <div class="oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom">
                <img src="styles/images/F1.png" class={steeringStyles} />
              </div>
              <div class="oj-flex-item">
                Gear:{" " + gear}
                <oj-rating-gauge
                  value={gear}
                  labelledBy="maxValue"
                  selectedState={{ shape: "rectangle" }}
                  hoverState={{ shape: "rectangle" }}
                  unselectedState={{ shape: "dot" }}
                  min={0}
                  max={8}
                  size="medium"></oj-rating-gauge>
              </div>
              <div class="oj-flex-item">Stear: {" " + steer}</div>
            </div>
          </div>
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top">
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              <div class="oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom">
                <oj-status-meter-gauge
                  class="f1-meter-large"
                  min={0}
                  max={15000}
                  value={rpm}
                  startAngle={180}
                  labelledBy="startAngle"
                  angleExtent={180}
                  innerRadius={0.7}
                  metricLabel={{position:'center', style:{color:'black',fontSize:'2rem'}}}
                  thresholds={thresholdValues}
                  referenceLines={referenceLines}
                  orientation="circular"></oj-status-meter-gauge>
              </div>
              <div class="oj-flex-item">
                <div>RPM: {rpm}</div>
                <div>Testing</div>
                <div>Testing</div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
