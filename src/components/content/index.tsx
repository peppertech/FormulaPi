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
    { max: 11500, color: '#77b0b8' },
    { max: 13500, color: '#e6cc87' },
    { max: 15000, color: '#c74634' }
  ];
  const referenceLines = [
    { value: 11500, color: '#e6cc87' },
    { value: 13500, color: '#c74634' }
  ];
  return (
    <div class="">
      {/* outer panel styling and sizing */}
      <div class="oj-panel oj-panel-shadow-xs oj-bg-neutral-20 f1-dashboard bg-fiber">
        {/* <div style="margin-bottom:13px;">
          Current Frame({frameRate}/sec): {frameNum}{" "}
        </div> */}
        
        {/* Parent container for top row of elements */}
        <div class="oj-flex oj-flex-init oj-md-justify-content-space-between oj-sm-only-flex-direction-column">

          
          {/* Child container for first column of elements */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing">

            {/* Stack elements in this column so that they layout vertically */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">

              {/* Top half of the column with bottom spacing */}
              {/* <div class="oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom">
                <div class="oj-flex-item">
                  <span class="oj-typography-subheading-md">Throttle </span>
                  <span
                    class={throttle ? "on" : "clear"}
                    style="display:inline-block;width:30px;height:1rem"></span>
                </div>
                <div class="oj-flex-item">
                <span class="oj-typography-subheading-md">Brake </span>
                  <span
                    class={brake ? "off" : "clear"}
                    style="display:inline-block;width:30px;height:1rem"></span>
                </div>
              </div> */}
            </div>
          </div>

          {/* Center column of elements */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top center-sizing">

            {/* Force the content into a vertical column layout  */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">

              {/* Top half of center column */}
              <div class="oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom position-center">
                <oj-status-meter-gauge
                  class="f1-meter-lg"
                  min={0}
                  max={350}
                  value={speed}
                  startAngle={180}
                  labelledBy="startAngle"
                  angleExtent={180}
                  metricLabel={{
                    position: "center",
                    style: { color: "black", fontSize: "3.5rem", fontFamily: 'sans-comic' }
                  }}
                  orientation="circular"></oj-status-meter-gauge>
              </div>
            </div>
          </div>

          {/* Third column of elements */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing">

            {/* Force the content into a vertical column layout  */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">

              {/* Top half of column */}
              {/* <div class="oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom">
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
                    style: { color: "black", fontSize: "1.5rem", fontFamily: 'sans-comic' }
                  }}
                  thresholds={thresholdValues}
                  referenceLines={referenceLines}
                  orientation="circular"></oj-status-meter-gauge>
              </div> */}
            </div>
          </div>
        </div>

        {/* Parent container for bottom row of elements */}
        <div class="oj-flex oj-flex-init oj-md-justify-content-space-between oj-sm-only-flex-direction-column">

          {/* Child container for first column of elements */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing">
            {/* Stack elements in this column so that they layout vertically */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              {/* Bottom half of the first column */}
              <div class="oj-flex-item oj-sm-margin-4x-bottom oj-md-margin-10x-bottom">
                <div class="oj-flex-item">
                  <span class="oj-typography-subheading-md">Throttle </span>
                  <span
                    class={throttle ? "on" : "clear"}
                    style="display:inline-block;width:30px;height:1rem"></span>
                </div>
                <div class="oj-flex-item">
                <span class="oj-typography-subheading-md">Brake </span>
                  <span
                    class={brake ? "off" : "clear"}
                    style="display:inline-block;width:30px;height:1rem"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Center column of elements */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top center-sizing">
            {/* Force the content into a vertical column layout  */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              {/* Bottom half of center column */}
              <div class="oj-flex-item">
                <img src="styles/images/sw.png" class={steeringStyles} />
              </div>
            </div>
          </div>
          
          {/* Third column of elements */}
          <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-only-margin-6x-top side-sizing">
            {/* Force the content into a vertical column layout  */}
            <div class="oj-flex-item oj-flex oj-sm-flex-items-initial oj-sm-justify-content-center oj-sm-flex-direction-column">
              {/* Bottom half of column elements */}
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
                    style: { color: "black", fontSize: "1.5rem", fontFamily: 'sans-comic' }
                  }}
                  thresholds={thresholdValues}
                  referenceLines={referenceLines}
                  orientation="circular"></oj-status-meter-gauge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
