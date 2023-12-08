import React, { useEffect, useState } from "react";
import {
  AppState,
  View,
  Platform,
  Text,
  NativeModules,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import messaging from "@react-native-firebase/messaging";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as storage from "../Service/AsyncStoreConfig";
import * as EncryptedStorage from "../Service/EncryptedStorageConfig";
import { Loader } from "../Components/Loader";
import AuthNavigator from "./authNavigator";
import AppNavigator from "./appNavigator";
import {
  getConsumeList,
  getOrderList,
  getPOUList,
} from "../Redux/Action/approvalsAction";
import { getDetail } from "../Redux/Action/approvalsAction";
import {
  setBiometrics,
  setBiometricsStatus,
  setToken,
  setInternet,
  refreshToken,
  logout,
  refreshTokenData,
  setLoginBiometric,
} from "../Redux/Action/loginAction";
import NavigationService from "./NavigationService";
import { getLanguages, setLanguageData } from "../Redux/Action/languageAction";
import authenticate from "../Service/Biometric";
import styles from "./styles";
import { getAppVersion } from "../Redux/Action/loginAction";
import { getOrg, getUserPrivilege } from "../Redux/Action/userAction";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ReactNativeBiometrics from "react-native-biometrics";
import NetInfo from "@react-native-community/netinfo";
import TokenExpire from "../Components/TokenExpire";
import useTokenExpiration from "./checkToken";
import * as Keychain from "react-native-keychain";
import { emailValadation } from "../Utils/validation";
import Toast from "react-native-toast-message";
import { getAccountDetails } from "../Redux/Action/accountAction";
import { pushNotificationNavigationService } from "../Service/pushNotificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import RNExitApp from "react-native-exit-app";
const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});
const RootStack = createNativeStackNavigator();
const SplashScreen = () => (
  <View style={styles.splash}>
    <Loader show={true} />
  </View>
);
const Navigator = () => {
  const dispatch = useDispatch<any>();
  const {
    userToken,
    showSplash,
    biometrics,
    biometricsHide,
    showTokenModal,
    internet,
  } = useSelector((state: any) => state.loginReducer);
  const { showTermsAgreed } = useSelector((state: any) => state.accountReducer);
  const appState = React.useRef(AppState.currentState);
  const [refresh, doRefresh] = useState(0);
  const isTokenAboutToExpire = useTokenExpiration(userToken, 16);
  const Strings = useSelector((state: any) => state.languageReducer?.data);
  const [showTokenExpire, setShowTokenExpire] = useState(false);
  const [isRunningEmulater, setIsRunningEmulater] = useState(false);

  useEffect(() => {
    const checkEmulator = async () => {
      const isEmulator = await DeviceInfo.isEmulator();
      setIsRunningEmulater(isEmulator);
      //setIsRunningEmulater(false);
    };
    checkEmulator();
  }, []);

  const EmulaterWarnView = () => {
    var CryptoJS = require("crypto-js");
const mydata = "narasingha@gmail.com"
    var ciphertext = CryptoJS.AES.encrypt(mydata, 'mysecureData');
    console.log("encrypted text", ciphertext.toString());
    
    var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), 'mysecureData');
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    console.log("decrypted text", plaintext);
    
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Emulator Warning: Please launch the app on a real device</Text>
      </View>
    );
  };

  // Notifications
  useEffect(() => {
    if (Platform.OS == "ios") {
      registerDeviceForRemoteMessages();
    }

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      //pushNotificationServiceHandler(remoteMessage);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    renderAlert();
  }, [userToken]);

  const renderAlert = () => {
    if (userToken) {
      setTimeout(() => {
        setShowTokenExpire(true);
      }, 1000);
    }
  };

  // console.log("showTokenExpire", showTokenExpire);

  async function registerDeviceForRemoteMessages() {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }
  }
  useEffect(() => {
    // 'Notification caused app to open from background state:',
    messaging().onNotificationOpenedApp((remoteMessage) => {
      pushNotificationServiceHandler(remoteMessage, false);
    });
    //'Notification caused app to open from quit state:
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        pushNotificationServiceHandler(remoteMessage, true);
      });
  }, []);

  const pushNotificationServiceHandler = (
    notification: any,
    isAppExited: boolean
  ) => {
    if (notification) {
      let message =
        JSON.stringify(notification?.notification ?? {}).length > 0
          ? notification?.notification
          : notification;

      //console.log('message', message)
      // message = {
      //   deviceId:
      //     "dcd9wMHYSG6zeV6ouuTfpN:-PFx3irOLuxKmWfS",
      //   title: "Consume Request",

      //   data: {
      //     orderId: "123456",
      //   },

      //   body: "Test user has requested 2 products(s) for Consume Approval",
      // };
      if (isAppExited) {
        //console.log('isAppExited', isAppExited)
        AsyncStorage.setItem("notificationData", JSON.stringify(message));
      } else {
        pushNotificationNavigationService(message);
      }
    }
  };

  // Internet check
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(setInternet(state.isConnected && state?.isInternetReachable));
    });
    // Unsubscribe
    return () => {
      unsubscribe();
    };
  }, []);
  const getRooms = () => {
    dispatch(getUserPrivilege());
    NetInfo.fetch().then((state) => {
      dispatch(getOrg(state.isConnected));
    });
    // dispatch(getStockrooms());
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    dispatch(setBiometrics(true));
    _handleAppStateChange();
  }, []);

  useEffect(() => {
    checkBiommetrics();

    if (biometrics) {
      _handleAppStateChange();
    }
  }, [refresh]);
  //console.log("biometrics-----",biometrics)
  useEffect(() => {
    checkBiommetrics();
  }, [userToken]);

  const checkBiommetrics = () => {
    // rnBiometrics.isSensorAvailable().then((res) => {
    //   dispatch(setBiometricsStatus(res?.available));
    // });
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        doRefresh((prv) => prv + 1);
      } else {
        appState.current == "active" &&
          rnBiometrics.isSensorAvailable().then((res) => {
            dispatch(setBiometricsStatus(res?.available));
          });
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const _handleAppStateChange = async () => {
    const biometrics = await storage.getItem("biometrics");
    if (biometrics == "true" && !biometricsHide) {
      authenticate(async (result: any) => {
        const { error, success } = result;
        console.log("result", error, success);
        if (success == true) {
          if (!userToken) {
            checkAuth1();
          }
          dispatch(setBiometrics(false));
        } else {
          dispatch({
            type: "SET_ACCOUNT_DATA",
            data: null,
          });
          dispatch(setToken(null, {}));
          dispatch(setToken(null, {}));
          if (error == "User cancellation") {
            dispatch(setBiometrics(false));
          } else {
            dispatch(setBiometrics(true));
          }
        }
      });
    }
  };
  //Arun
  const checkAuth = async () => {
    try {
      const biometrics: any = await storage.getItem("biometrics");
      const NewUserToken = await EncryptedStorage.getItem("userToken");
      const org: any = await storage.getItem("org");
      !JSON.parse(biometrics) && dispatch(setToken(NewUserToken, org));
      getRooms();
      checkLanguage();
    } catch (e) {
      console.log(e);
    }
  };
  const errorCallBack = (err: {
    errorMessage: any;
    error: any;
    error_description: any;
  }) => {
    let errorMessageValue = "";

    if (
      err?.errorMessage?.includes("503") ||
      err?.error?.includes("503") ||
      err?.error_description?.includes("503")
    ) {
      errorMessageValue = "503 Service Unavailable";
    } else {
      errorMessageValue = err?.errorMessage || err;
    }
    Toast.show({
      type: "alertToast",
      text1: Strings["ime.error.occured"] || "Error Occurred",
      text2: errorMessageValue,
    });
  };

  const checkAuth1 = async () => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials && emailValadation(credentials?.username)) {
        // const body = {
        //   username: credentials?.username,
        //   password: credentials.password,
        // };
        dispatch(
          setLoginBiometric(
            //body,
            async (res: any) => {
              const org: any = await storage.getItem("org");
              dispatch(setToken(res, org));
              getRooms();
              dispatch(getAccountDetails((acctData: any) => {}));
            },
            errorCallBack
          )
        );
      } else {
        const NewUserToken = await EncryptedStorage.getItem("userToken");
        const org: any = await storage.getItem("org");
        console.log(
          "NewUserToken Getting from EncryptedStorage 222",
          EncryptedStorage
        );
        dispatch(setToken(NewUserToken, org));
        getRooms();
        checkLanguage();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const checkLanguage = async () => {
    let list: any = await storage.getItem("languageList");
    list = JSON.parse(list);
    if (list?.length) {
      storage.getItem("language").then((res) => {
        if (res) {
          dispatch(setLanguageData(res));
          dispatch({
            type: "SET_LANGUAGE_LIST",
            value: list,
          });
        } else {
          dispatch(getLanguages());
        }
      });
    } else {
      dispatch(getLanguages());
    }
  };

  return (
    <SafeAreaProvider>
      {!isRunningEmulater ? (
        <NavigationContainer
          ref={(navigatorRef) => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
        >
          {showSplash ? (
            <RootStack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              <RootStack.Screen name="SplashScreen" component={SplashScreen} />
            </RootStack.Navigator>
          ) : userToken && !showTermsAgreed ? (
            <AppNavigator />
          ) : (
            <AuthNavigator />
          )}
          {userToken &&
            (showTokenExpire ||
              (isTokenAboutToExpire?.visible &&
                isTokenAboutToExpire?.time < 1)) &&
            internet && (
              <TokenExpire
                visible={isTokenAboutToExpire?.visible}
                expireTime={
                  isTokenAboutToExpire?.time > 0
                    ? isTokenAboutToExpire?.time
                    : 0
                }
                onPress={() => {
                  setShowTokenExpire(false);
                  NavigationService?.navigate("Dashboard");
                  dispatch(
                    refreshToken(async (res: any) => {
                      const org: any = await storage.getItem("org");
                      dispatch(refreshTokenData(res, org));
                    })
                  );
                }}
                dismiss={(res: any) => {
                  res && dispatch(logout(true));
                  setShowTokenExpire(false);
                }}
              />
            )}
        </NavigationContainer>
      ) : (
        <EmulaterWarnView />
      )}
    </SafeAreaProvider>
  );
};
export default Navigator;
