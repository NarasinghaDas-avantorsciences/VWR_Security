import * as storage from "../../Service/AsyncStoreConfig";
import { ApiConfig } from "../../Service/Api";
import {
  login,
  client_secret,
  client_id,
  authBaseUrl,
  loginNew,
  baseUrl,
  get_org,
  get_stockrooms,
  get_userEmailInfo,
  app_version_check,
} from "../../Service/ApiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as EncryptedStorage from '../../Service/EncryptedStorageConfig';
import * as Keychain from "react-native-keychain";
import NetInfo from "@react-native-community/netinfo";

import {
  getUserPrivilege,
  actionTypes as userAction,
  getOrg as orgRefresh,
} from "./userAction";
import { getAccountDetails } from "./accountAction";
export const actionTypes = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  RETRIEVE_TOKEN: "RETRIEVE_TOKEN",
  SET_LOADER: "SET_LOADER",
  ACTIVE: "ACTIVE",
  SET_SPLASH: "SET_SPLASH",
  BIOMETRICS: "BIOMETRICS",
  BIOMETRICS_HIDE: "BIOMETRICS_HIDE",
  BIOMETRICS_AVAILABLE: "BIOMETRICS_AVAILABLE",
  INTERNET: "INTERNET",
  UPDATE_ALERT: "UPDATE_ALERT",
  SHOW_TOKEN_MODAL: "SHOW_TOKEN_MODAL",
  UPDATE_TOKEN: "UPDATE_TOKEN",
};
import { pushNotificationLogOutAction } from "./pushNotificationAction";
import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";
import authenticate from "../../Service/Biometric";
import { emailValadation } from "../../Utils/validation";
import Toast from "react-native-toast-message";

export const setToken = (token: any, org: any) => {
  new ApiConfig().setToken(token, org);
  return {
    type: actionTypes.RETRIEVE_TOKEN,
    token: token,
  };
};

export const refreshTokenData = (token: any, org: any) => {
  new ApiConfig().setToken(token, org);
  return {
    type: actionTypes.UPDATE_TOKEN,
    token: token,
  };
};

export const setBiometricsStatus = (value: any) => {
  return {
    type: actionTypes.BIOMETRICS_AVAILABLE,
    value: value,
  };
};
export const setInternet = (value: any) => {
  return {
    type: actionTypes.INTERNET,
    value: value,
  };
};
export const hideBiometricsFirstTime = (val: any) => {
  return {
    type: actionTypes.BIOMETRICS_HIDE,
    value: val,
  };
};

export const setBiometrics = (val: any) => {
  return {
    type: actionTypes.BIOMETRICS,
    value: val,
  };
};

export const setActive = (isActive: boolean) => {
  return {
    type: actionTypes.ACTIVE,
    active: isActive,
  };
};

export const setLoader = (isLoader: boolean) => {
  return {
    type: actionTypes.SET_LOADER,
    value: isLoader,
  };
};

export const setLogin = (
  data: any,
  successCallBack: any,
  errorCallBack: Function,
  accountCallback: Function
) => {
  return async (dispatch: any) => {
    dispatch(setLoader(true));
    new ApiConfig()
      .postJSON(data, baseUrl + loginNew)
      .then(async (response: any) => {
        new ApiConfig().setToken(response?.data?.idToken);
        console.log("setToken",response?.data?.idToken)
        await EncryptedStorage.setItem(
          "refreshToken",
          response?.data?.refreshToken
        );
        dispatch(
          getAccountDetails((acctData: any) => {
            accountCallback(acctData);
            AsyncStorage.setItem("userID", acctData.id ?? "");
            dispatch(
              getOrg(
                successCallBack,
                response?.data?.idToken,
                errorCallBack,
                acctData
              )
            );
          })
        );

        dispatch(setLoader(false));
      })

      .catch((error) => {
        console.log(
          "MAIN ERROR ACTIOn: ",
          error?.message?.toLowerCase() == "network error"
        );
        errorCallBack(
          error?.message?.toLowerCase() == "network error"
            ? error?.message
            : error?.response?.data,
          error
        );
        dispatch(setLoader(false));
      });
  };
};

export const setLoginBiometric = (
  //data: any,
  successCallBack: any,
  errorCallBack: Function
) => {
  console.log("%%^%^%^%^%^  setLoginBiometric call");
  return async (dispatch: any) => {
    const credentials = await Keychain.getGenericPassword();
    console.log("Login Action credentials");
    const data = {
      username: credentials?.username,
      password: credentials.password,
    };
    dispatch(setLoader(true));
    console.log("Alldata Are",data,baseUrl,loginNew);
    new ApiConfig()
      .postJSON(data, baseUrl + loginNew,)
      .then(async (response: any) => {
        new ApiConfig().setToken(response?.data?.idToken);
        await EncryptedStorage.setItem(
          "refreshToken",
          response?.data?.refreshToken
        );
       await EncryptedStorage.setItem("userToken", response?.data?.idToken);
        dispatch(setLoader(false));
        successCallBack(response?.data?.idToken);
      })
      .catch((error) => {
        console.log("MAIN ERROR ACTIOn:*** ", error);
        console.log("MAIN ERROR ACTIOn:*** ", error?.message);
        errorCallBack(
          
          error?.message?.toLowerCase() == "network error"
          ? error?.message
          : error?.response?.data
          , error);
        dispatch(setLoader(false));
      });
  };
};
export const getOrg = (
  callBack: (arg0: any) => void,
  token: any,
  errorCallBack: Function,
  acctData: any
) => {
  return async (dispatch: any) => {
    new ApiConfig()
      .getJSON(baseUrl + get_org)
      .then((response: any) => {
        dispatch({
          type: userAction.SET_ORG,
          value: response?.data,
        });
        const data = {
          org: response?.data,
          token: token,
          accountData: acctData,
        };
        let orgId = data.org?.rememberOrganization?.id
          ? data.org?.rememberOrganization?.id
          : "";

           let org = response?.data?.imeorganizationBaseDTO ?? []
           let isAvailable = org.some((e:any) => e.id == orgId)

        dispatch(
          getStockroomsLogin(
            response?.data?.imeorganizationBaseDTO,
            callBack,
            data,
            errorCallBack,
            isAvailable  ? orgId : ''
          )
        );
      })
      .catch((ERROR) => {
        console.log('ERROR orgAPi',ERROR?.response?.data)
        errorCallBack(ERROR?.response?.data);
        dispatch(setLoader(false));
      });
  };
};
export const getStockroomsLogin = (
  orgData: string | any[],
  callBack: (arg0: any) => void,
  data: { org: any; token: any },
  errorCallBack: any,
  orgID: string = ""
) => {
  return async (dispatch: any) => {
    let prevOrgId =
      orgID.length > 0 ? orgID : orgData?.length == 1 ? orgData[0]?.id : "";

    if (prevOrgId.length == 0) {
      dispatch(setLoader(false));
      dispatch({
        type: userAction.SET_STOCKROOMS,
        value: { stockroomHierarchy: [] },
      });
      const obj = {
        ...data,
        stockRooms: { stockroomHierarchy: [] },
      };
      callBack(obj);
      return;
    } else {
      new ApiConfig()
        .getJSON(baseUrl + get_stockrooms + `${prevOrgId}/stockrooms`)
        .then((response: any) => {
          dispatch({
            type: userAction.SET_STOCKROOMS,
            value: response?.data,
          });
          const obj = {
            ...data,
            stockRooms: response?.data,
          };
          callBack(obj);
          dispatch(setLoader(false));
        })
        .catch((ERROR) => {
          console.log('ERROR stkroom',ERROR)
          errorCallBack(ERROR?.response?.data);
          dispatch(setLoader(false));
        });
    }
  };
};

export const logout = (askForBiometrics = false) => {
  return async (dispatch: any) => {
    dispatch(setLoader(true));
    dispatch(pushNotificationLogOutAction());
    let keys = [
      "userToken",
      "user",
      "consume_offline_data",
      "replenish_offline_data",
      "offlineData",
      "userAsyncData",
    ];
    storage.multiRemove(keys).then((res) => {
      dispatch({ type: actionTypes.LOGOUT });
      dispatch({
        type: "SET_USER_PRIVILAGE",
        value: [],
      });
    });
    // askForBiometrics &&  dispatch(_handleAppLogout());
  };
};

export const _handleAppLogout = () => {
  return async (dispatch: any) => {
    const biometrics = await storage.getItem("biometrics");
    if (biometrics == "true") {
      authenticate(async (result: any) => {
        const { error, success } = result;
        if (success == true) {
          try {
            dispatch(setBiometrics(false));
            console.log("here 1");
            const credentials = await Keychain.getGenericPassword();
            console.log("Checked ** credentials Action file",credentials);
            if (credentials && emailValadation(credentials?.username)) {
              console.log("here 2");
              // const body = {
              //   username: credentials?.username,
              //   password: credentials.password,
              // };
              console.log("After logout **************************** Again Login");
              dispatch(
                setLoginBiometric(
                  //body,
                  async (res: any) => {
                    const org: any = await storage.getItem("org");
                    dispatch(setToken(res, org));
                    dispatch(getUserPrivilege());
                    NetInfo.fetch().then((state) => {
                      dispatch(orgRefresh(state.isConnected));
                    });
                    dispatch(
                      getAccountDetails((acctData: any) => {
                        AsyncStorage.setItem("userID", acctData.id ?? "");
                      })
                    );
                  },
                  (err: any) => {
                    Toast.show({
                      type: "alertToast",
                      text1: "Error Occured",
                      text2: err?.errorMessage,
                    });
                  }
                )
              );
            }
          } catch (e) {
            console.log("eeee",e)
            console.log(e);
          }
        } else {
          if(error == "User cancellation"){
          dispatch(setBiometrics(false));
          }else{
            dispatch(setBiometrics(true));
          }
        }
      });
    }
  };
};

export const getUserEmailInfo = (request) => {
  const { params, onSuccess, onFail } = request;
  return async (dispatch: any) => {
    new ApiConfig()
      .postJSON(params, baseUrl + get_userEmailInfo)
      .then((response: any) => {
        onSuccess?.(response?.data);
      })
      .catch((ERROR) => {
        const errorMessage =
          ERROR?.response?.data?.errorMessage || "Something went wrong";
        onFail?.(errorMessage);
      });
  };
};

export const getAppVersion = () => {
  const version = DeviceInfo.getVersion();
  const channelName = Platform.OS === "ios" ? "iOS" : "Android";
  return async (dispatch: any) => {
    new ApiConfig()
      .appVersionPost(baseUrl + app_version_check, {
        channelName: channelName,
        version: version,
      })
      .then((res: any) => {
        const data = res.data;
        if (data.isMandatory == "Y" && data.updatedVersion == false) {
          dispatch({
            type: "UPDATE_ALERT",
            value: true,
          });
        } else {
          dispatch({
            type: "UPDATE_ALERT",
            value: false,
          });
        }
      })
      .catch((ERROR) => {
        dispatch({
          type: "UPDATE_ALERT",
          value: false,
        });
        console.log("getAppVersion", ERROR);
      });
  };
};

export const refreshToken = (callBack: any) => {
  return async (dispatch: any) => {
    dispatch({
      type: "SHOW_TOKEN_MODAL",
      value: false,
    });
    dispatch(setLoader(true));
    new ApiConfig()
      .refreshtoken()
      .then(async (res: any) => {
        //console.log("here------");
        dispatch(setLoader(false));
        console.log(
          "refreshToken ===== ====================",
          res?.data?.refreshToken,
          res?.data?.idToken
        );
        await EncryptedStorage.setItem("userToken", res?.data?.idToken);
        await EncryptedStorage.setItem("refreshToken", res?.data?.refreshToken);
        callBack(res?.data?.idToken);
      })
      .catch((ERROR: any) => {
        dispatch(logout(true))
        dispatch(setLoader(false));
        dispatch({
          type: "SHOW_TOKEN_MODAL",
          value: false,
        });
        console.log("refreshToken", ERROR);
      });
  };
};
