import { customElement, ExtendGlobalProps } from "ojs/ojvcomponent";
import { h, Component, ComponentChild } from "preact";
import Context = require("ojs/ojcontext");
import { Header } from "./header";
import { Content } from "./content/index";

type Props = {
  appName?: string;
  userLogin?: string;
}

@customElement("app-root")
export class App extends Component<ExtendGlobalProps<Props>> {
  static defaultProps: Props = {
    appName: 'Formula Pi',
    userLogin: "john.hancock@oracle.com"
  };

  render(props: ExtendGlobalProps<Props>): ComponentChild {
    return (
      <div id="appContainer" class="oj-web-applayout-page">
        <Header
          appName={props.appName} 
          userLogin={props.userLogin} 
        />
        <Content />
      </div>
    );
  }

  componentDidMount() {
    Context.getPageContext().getBusyContext().applicationBootstrapComplete();
  }
}
