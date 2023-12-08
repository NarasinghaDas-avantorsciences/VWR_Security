import * as Storage from "./AsyncStoreConfig";
import * as EncryptedStorage from "./EncryptedStorageConfig";
import axios from "axios";
import { baseUrl, refreshTokenUrl, apiKey } from "./ApiConfig";
import { Platform } from "react-native";
import { store } from "../Redux/store";
const state = store.getState();

const instance = axios.create({
  headers: {
    "x-api-key": apiKey,
    "im-channel": Platform.OS == "ios" ? "MOBILE-IOS" : "MOBILE-ANDROID",
    timeout:10000
  },
});

export class ApiConfig {
  appVersionPost(URL, data) {
    return new Promise((resolve, reject) => {
      instance({
        method: "POST",
        url: URL,
        data: data,
      })
        .then((res) => {
          resolve(res);
        })
        .catch((ERROR) => {
          reject(ERROR);
          // if (
          //   ERROR?.response?.data?.errorMessage?.toLowerCase() ==
          //   "invalid token"
          // ) {
          //   state.loginReducer.showTokenModal = true;
          // } else {
          //   reject(ERROR);
          // }
        });
    });
  }
  postPriceJSON(header,params = {}, URL) {
    return new Promise((resolve, reject) => {
      EncryptedStorage.getItem("userToken").then((authtoken) => {
      instance({
        method: "POST",
        url: URL,
        headers: { "im-context": header,"authToken": authtoken },
        data: params,
      })
        .then((res) => {
          resolve(res);
        })
        .catch((ERROR) => {
        console.log("Error",ERROR)
          reject(ERROR);
        });
    });
  });
  }
  
  postJSON(params = {}, URL) {
    return new Promise((resolve, reject) => {
      instance({
        method: "POST",
        url: URL,
        data: params,
      })
        .then((res) => {
          resolve(res);
        })
        .catch((ERROR) => {
          // if (
          //   ERROR?.response?.data?.errorMessage?.toLowerCase() ==
          //   "invalid token"
          // ) {
          //   state.loginReducer.showTokenModal = true;
          // } else {
          //   reject(ERROR);
          // }
          reject(ERROR);
        });
    });
  }

  getParamsJSON(URL) {
    return new Promise(async (resolve, reject) => {
      instance({
        method: "GET",
        url: URL,
      })
        .then((res) => {
          resolve(JSON.stringify(res.data));
        })
        .catch((ERROR) => {
          // if (
          //   ERROR?.response?.data?.errorMessage?.toLowerCase() ==
          //   "invalid token"
          // ) {
          //   state.loginReducer.showTokenModal = true;
          // } else {
          //   reject(ERROR);
          // }
          reject(ERROR);
        });
    });
  }

  getJSON(URL) {
    return new Promise(async (resolve, reject) => {
      instance({
        method: "GET",
        url: URL,
      })
        .then((res) => {
          resolve(res);
        })
        .catch((ERROR) => {
          reject(ERROR);

          // if (
          //   ERROR?.response?.data?.errorMessage?.toLowerCase() ==
          //   "invalid token"
          // ) {
          //   console.log("token---");

          //   state.loginReducer.showTokenModal = true;
          // } else {
          //   reject(ERROR);
          // }
        });
    });
  }

  getProductJSON(header, URL) {
    return new Promise(async (resolve, reject) => {
      instance({
        method: "GET",
        url: URL,
        headers: { "im-context": header },
      })
        .then((res) => {
          resolve(res);
        })
        .catch((ERROR) => {
          // if (
          //   ERROR?.response?.data?.errorMessage?.toLowerCase() ==
          //   "invalid token"
          // ) {
          //   state.loginReducer.showTokenModal = true;
          // } else {
          //   reject(ERROR);
          // }
          reject(ERROR);
        });
    });
  }

  getJSONWithAuth(URL) {
    return new Promise(async (resolve, reject) => {
      EncryptedStorage.getItem("userToken").then((authtoken) => {
        instance({
          method: "GET",
          headers: authtoken
            ? {
                "Content-Type": "application/json",
                Authorization: "Bearer " + authtoken,
              }
            : {
                "Content-Type": "application/json",
              },
          url: URL,
        })
          .then((res) => {
            console.log(res);
            resolve(res);
          })
          .catch((ERROR) => {
            // if (
            //   ERROR?.response?.data?.errorMessage?.toLowerCase() ==
            //   "invalid token"
            // ) {
            //   state.loginReducer.showTokenModal = true;
            // } else {
            //   reject(ERROR);
            // }
            reject(ERROR);
          });
      });
    });
  }

  putJSON(params = {}, URL) {
    return new Promise((resolve, reject) => {
      EncryptedStorage.getItem("userToken").then((authtoken) => {
        instance({
          method: "PUT",
          headers: authtoken
            ? {
                "Content-Type": "application/json",
                Authorization: "Bearer " + authtoken,
              }
            : {
                "Content-Type": "application/json",
              },
          url: URL,
          data: params,
        })
          .then((res) => {
            resolve(res);
          })
          .catch((ERROR) => {
            // if (
            //   ERROR?.response?.data?.errorMessage?.toLowerCase() ==
            //   "invalid token"
            // ) {
            //   state.loginReducer.showTokenModal = true;
            // } else {
            //   reject(ERROR);
            // }
            reject(ERROR);
          });
      });
    });
  }

  deleteJSON(URL) {
    return new Promise((resolve, reject) => {
      Storage.getItem("authToken").then((authtoken) => {
        instance({
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + authtoken,
          },
          url: URL,
        })
          .then((res) => {
            resolve(res);
          })
          .catch((ERROR) => {
            // if (
            //   ERROR?.response?.data?.errorMessage?.toLowerCase() ==
            //   "invalid token"
            // ) {
            //   state.loginReducer.showTokenModal = true;
            // } else {
            //   reject(ERROR);
            // }
            reject(ERROR);
          });
      });
    });
  }

  patchJSON(params = {}, URL) {
    return new Promise((resolve, reject) => {
      Storage.getItem("authToken").then((authtoken) => {
        instance({
          method: "PATCH",
          headers: authtoken
            ? {
                "Content-Type": "application/json",
                Authorization: "Bearer " + authtoken,
              }
            : {
                "Content-Type": "application/json",
              },
          url: URL,
          data: params,
        })
          .then((res) => {
            resolve(res);
          })
          .catch((ERROR) => {
            // if (
            //   ERROR?.response?.data?.errorMessage?.toLowerCase() ==
            //   "invalid token"
            // ) {
            //   state.loginReducer.showTokenModal = true;
            // } else {
            //   reject(ERROR);
            // }
            reject(ERROR);
          });
      });
    });
  }

  refreshtoken() {
    return new Promise((resolve, reject) => {
      EncryptedStorage.getItem("refreshToken").then((token) => {
        console.log("refreshToken", token);
        const header = { "Content-Type": "application/json" };
        const tokenParams = {
          refreshToken: token,
        };
        instance({
          method: "POST",
          url: baseUrl + refreshTokenUrl,
          headers: header,
          data: JSON.stringify(tokenParams),
        })
          .then(async (res) => {
            // console.log("----------res", res);
            resolve(res);
            instance.defaults.headers.common["authtoken"] = res?.data?.idToken;
          })
          .catch((ERROR) => {
            console.log("ERROR-------", ERROR?.response?.data);
            reject(ERROR);
          });
      });
    });
  }

  setToken(token, org) {
    instance.defaults.headers.common["im-context"] = org;
    instance.defaults.headers.common["authtoken"] = token;
  }

  setOrgAsNil() {
    data = { stockroomId: "", orgId: "" };
    instance.defaults.headers.common["im-context"] = JSON.stringify(data);
  }
}
