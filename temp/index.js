import "react-native-reanimated";
import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
// import NewRelic from 'newrelic-react-native-agent';
// import * as appVersion from './package.json';
// import {Platform} from 'react-native';

// let appToken;
// if (Platform.OS === 'ios') {
//     appToken = 'AA0868ac0f57122b051597c716e569d4adae557a55-NRMA';
// } else {
//     appToken = 'AA03a6a700e79c0cfb9a8eddca455bb61f27884f1f-NRMA';
// }

// const agentConfiguration = {
//   analyticsEventEnabled: true,
//   crashReportingEnabled: true,
//   interactionTracingEnabled: true,
//   networkRequestEnabled: true,
//   networkErrorRequestEnabled: true,
//   httpResponseBodyCaptureEnabled: true,
//   loggingEnabled: true,
//   logLevel: NewRelic.LogLevel.INFO,
//   webViewInstrumentation: true,
// };


// NewRelic.startAgent(appToken,agentConfiguration);
// NewRelic.setJSAppVersion(appVersion.version);
AppRegistry.registerComponent(appName, () => App);