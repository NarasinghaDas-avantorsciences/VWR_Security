import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Keyboard,
  AppState,
  Alert,
} from "react-native";
import { hasNotificaitonPermission } from "../../../Service/PushNotificationServiceHandler";

import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  getOrgDetails,
  getOrgLevelCurrencyData,
  setSelectedOrgandStockRoom,
} from "../../../Redux/Action/userAction";
import * as storage from "../../../Service/AsyncStoreConfig";
import * as EncryptedStorage from "../../../Service/EncryptedStorageConfig"
import { getDashboardKPIsLogic, applyPushNotification } from "./logic"; //checkUserPrivilege
import { setNavigationData } from "../../../Redux/Action/navigationRouteAction";
import {
  Header,
  Subheader,
  SearchBar,
  AlertModal,
  MainButton,
  ToastComponent,
  ListItem,
  ProductDetails,
  DashboardCardList,
  Loader,
  WalkthroughTips,
  AnimatedSearch,
} from "../../../Components";
import KPIBlock from "../../../Components/Dashboard/KPIBlock";
import EmptyDivider from "../../../Components/Common/EmptyDivider";
import {
  wp,
  isProductFreezed,
  checkUserPrivileges,
  getMultiplier,
} from "../../../Utils/globalFunction";
import {
  AccountIcon,
  ApprovalIcon,
  ConsumeIcon,
  DefaultProductImage,
  HelpIcon,
  Locked,
  PiCountIcon,
  ReceiveIcon,
  RedWarning,
  ReplenishIcon,
  StockCorrectionIcon,
  StockTransferIcon,
  YellowWarning,
  StockCorrectionIconOffline,
  PiCountOffline,
  Approvaloffline,
  Stocktransferoffline,
  ReceiveOffline,
  Accountoffline,
} from "../../../Utils/images";
import styles from "./styles";
import { FONTS, SIZES } from "../../../Utils/theme";
import { clearAllCommunicationCenterData } from "../../../Redux/Action/communicationActions";
import {
  getProductDetails,
  getProductList,
  setProductLoader,
  emptyProductData,
} from "../../../Redux/Action/searchAction";
import { getAccountDetails } from "../../../Redux/Action/accountAction";
import { useDebounceHook } from "../../../Hooks";
import { getCountApproval } from "../../../Redux/Action/approvalsAction";
import { getReceiveHeaderKPIs } from "../../../Redux/Action/receiveAction";
import CustomText from "../../../Components/CustomText";
import OfflineToast from "../../../Components/Offline";
import ConfirmationAlert from "../../../Components/ConfirmationPopup";
import { getAppVersion } from "../../../Redux/Action/loginAction";
import UpdateAlertBox from "../../../Components/AppUpdateAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pushNotificationNavigationService } from "../../../Service/pushNotificationService";
import { clearStockLevelData } from "../../../Redux/Action/dashboardAction";
import {
  getLanguages,
  getLanguagesFromDashboard,
  setLanguageData,
} from "../../../Redux/Action/languageAction";
import { log } from "../../../Utils/logger";

const Dashboard = (props: any) => {
  const profileData = useSelector((state: any) => state.accountReducer?.data);
  const { navigate } = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const Strings = useSelector((state: any) => state.languageReducer?.data);
  const productDetails = useSelector(
    (state: any) => state.searchReducer?.productDetails
  );
  const { languageList } = useSelector((state: any) => state.languageReducer);

  const productDetailsLoading = useSelector(
    (state: any) => state.searchReducer?.loader
  );
  const productsData = useSelector(
    (state: any) => state.searchReducer?.searchList
  );
  const [flag, setFlag] = useState(0);
  const [showPushLoader, setShowPushLoader] = useState(false);
  const [replenishroute, setReplenishroute] = useState("");
  const { userPrivilege, currency } = useSelector(
    (state: any) => state.userReducer
  );
  const { outOfStock, runningLow, firstLogin } = useSelector(
    (state: any) => state.dashboardReducer
  );
  const { userToken, internet } = useSelector(
    (state: any) => state.loginReducer
  );
  const itemDetailsRef = useRef<any>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { loader, approvalCount } = useSelector(
    (state: any) => state.approvalsReducer
  );
  const loaderLogin = useSelector((state: any) => state.loginReducer?.loader);
  const isFocused = useIsFocused();
  const [isFirstLogin, setFirstLogin] = useState<null | boolean | string>(
    false
  );
  const appState = React.useRef(AppState.currentState);

  const { notificationList, messagesList, newsList } = useSelector(
    (state: any) => state.communicationReducer
  );

  const checkUserExist = async (userID: string) => {
    const isIntialLogin: any = await storage.getItem("firstLogin");
    setFirstLogin(isIntialLogin);
    /*storage.getItem("savedIds").then((res: any) => {
      const id = [userID];

      if (res !== null) {
        let newIds: any = JSON.parse(res);

        if (!newIds.includes(userID)) {
          if (isFirstLogin == "false" || isFirstLogin == null) {
            setFirstLogin(null);
          }
          newIds = newIds.concat(userID);
        } else {
          setFirstLogin(isFirstLogin);
        }
        storage.setItem("savedIds", JSON.stringify(newIds));
      } else {
        setFirstLogin(isFirstLogin);
        storage.setItem("savedIds", JSON.stringify(id));
      }
    });*/
  };

  useFocusEffect(
    useCallback(() => {
      checkLanguage();
    }, [])
  );
  const checkLanguage = async () => {
    let list: any = await storage.getItem("languageList");
    list = JSON.parse(list);
    if (languageList?.length > 0) {
    } else {
      if (list?.length) {
        storage.getItem("language").then((res) => {
          if (res) {
            dispatch(setLanguageData(res));
            dispatch({
              type: "SET_LANGUAGE_LIST",
              value: list,
            });
          } else {
            dispatch(getLanguagesFromDashboard());
          }
        });
      } else {
        dispatch(getLanguagesFromDashboard());
      }
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        dispatch(getAppVersion());
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    callPushnotificaitonAPIBackground();
    AsyncStorage.getItem("notificationData").then((blockData) => {
      if (blockData) {
        let notificationData = JSON.parse(blockData);
        if (notificationData) {
          setTimeout(() => {
            pushNotificationNavigationService(notificationData);
          }, 1000);
        }
      }
      AsyncStorage.removeItem("notificationData");
    });
  }, []);

  useEffect(() => {
    internet && dispatch(getCountApproval());
    internet && dispatch(getAppVersion());
  }, [isFocused]);

  const checkToShowPushNotificationModal = async () => {
    // const isFirstLogin: any = await storage.getItem("firstLogin");
    // if (isFirstLogin == null) {
    //   //walktrought is showing
    //   return;
    // }

    // need to show only after the walkthrought.
    const isshownotification = (await storage.getItem(
      "show_notification_modal"
    )) as string;
    const boolshownotificationValue = JSON.parse(isshownotification) as boolean;
    if (!boolshownotificationValue) {
      setShowModal(true);
      await storage.setItem("show_notification_modal", JSON.stringify(true));
    } else {
      setShowModal(false);
    }
  };
  const debouncedSearchTerm = useDebounceHook(search, 800);

  useFocusEffect(
    useCallback(() => {
      getStorageReplenishData();
      (messagesList?.data?.length > 0 ||
        newsList?.data?.length > 0 ||
        notificationList?.data?.length > 0) &&
        dispatch(clearAllCommunicationCenterData());
      //checkToShowPushNotificationModal();
      return async () => {
        getStorageReplenishData();
      };
    }, [])
  );

  const getStorageReplenishData = () => {
    storage.getItem("replenish_offline_data").then((res: any) => {
      if (res?.length) {
        const dataJSON = JSON.parse(res);
        if (!dataJSON?.length && internet) setReplenishroute("Replenish");
        else setReplenishroute("ReplenishOffline");
      } else setReplenishroute("Replenish");
      setSearch("");
      dispatch(setNavigationData("Dashboard"));
      //========Changed by kiran due to log out issue;- after logout this will redirect to select store view
      EncryptedStorage.getItem("userToken").then((res) => {
        if (res) {
          getAccountData();
        }
      });
      //================
      getOrganizationDetails();
      getDashboardKPIs();
      dispatch(getReceiveHeaderKPIs());
    });
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      dispatch(getProductList(debouncedSearchTerm));
    } else {
      dispatch(setProductLoader(false));
    }
  }, [debouncedSearchTerm]);

  async function callPushnotificaitonAPIBackground() {
    // this will call the pushnotification api if the user has already logged in and then logOut
    let userAsyncData: any = await storage.getItem("userAsyncData");
    const isIntialLogin: any = await storage.getItem("firstLogin");

    if (isIntialLogin == null) {
      return;
    } else {
      setShowPushLoader(true);
      const isshownotification = (await storage.getItem(
        "show_notification_modal"
      )) as string;
      const boolshownotificationValue = JSON.parse(
        isshownotification
      ) as boolean;

      const isEnablednotification = (await storage.getItem(
        "enabled_push_notification"
      )) as string;
      const boolEnabledNotificationValue = JSON.parse(
        isEnablednotification
      ) as boolean;

      if (!isshownotification || !boolEnabledNotificationValue) {
        return;
      }

      const hasOsPermission = await hasNotificaitonPermission();
      if (hasOsPermission) {

        const apprvlsEnbl = (await storage.getItem(
          "approvals_notification_enabled"
        )) as string;

        const OutStckEnbl = (await storage.getItem(
          "out_of_stock_notification_enabled"
        )) as string;

        let runningLowEnbl = (await storage.getItem(
          "running_low_notification_enabled"
        )) as string;

        if (
          apprvlsEnbl == null &&
          OutStckEnbl == null &&
          runningLowEnbl == null
        ) {
          await storage.setItem(
            "out_of_stock_notification_enabled",
            JSON.stringify(true)
          );
          await storage.setItem(
            "approvals_notification_enabled",
            JSON.stringify(true)
          );
          await storage.setItem(
            "running_low_notification_enabled",
            JSON.stringify(true)
          );
          applyPushNotification(
            JSON.parse(userAsyncData).id ?? "",
            setShowModal,
            dispatch,
            setShowPushLoader,
            Strings,
            internet
          );
        } else {
          setShowPushLoader(false);
        }
      } else {
        setShowPushLoader(false);
        console.log("Notificaiton permission not enable");
      }
    }
  }

  const getDashboardKPIs = async () => {
    const org = (await storage.getItem("org")) || "";
    getDashboardKPIsLogic(userToken, org, dispatch);
  };

  const getAccountData = async () => {
    let userAsyncData: any = await storage.getItem("userAsyncData");
    checkUserExist(JSON.parse(userAsyncData).id);
    dispatch(getAccountDetails());
  };
  const getOrganizationDetails = async () => {
    const orgData = await storage.getItem("orgDetails").then((res) => {
      return JSON.parse(res);
    });
    await dispatch(setSelectedOrgandStockRoom(orgData));
    await dispatch(getOrgDetails());
    currency == "" && (await dispatch(getOrgLevelCurrencyData()));
  };

  var CardsData = [
    {
      title: Strings["ime.account"] || "Account",
      icon: internet ? AccountIcon : Accountoffline,
      route: "Account",
      disabled: internet ? false : true,
    },
    {
      title: Strings["help"] || "Help",
      icon: HelpIcon,
      route: "Help",
    },
  ];
  const onPressItem = async (route: string) => {
    let dataJSON = null;
    if (internet) {
      if (route == "Replenish" || route == "ReplenishOffline") {
        await storage.getItem("replenish_offline_data").then((res: any) => {
          if (JSON.parse(res)?.length) {
            dataJSON = JSON.parse(res);
            navigate("ReplenishOffline", { fromScreen: "Dashboard" });
          } else {
            navigate(route, { fromScreen: "Dashboard" });
          }
        });
      } else if (route == "Receive") {
        navigate(route, { fromScreen: "Dashboard" });
      } else {
        route == "Receive" && dispatch(getReceiveHeaderKPIs());
        navigate(route);
      }
    } else {
      if (route == "Replenish" || route == "ReplenishOffline") {
        navigate("ReplenishOffline", { fromScreen: "Dashboard" });
      } else {
        navigate(route);
      }
    }
    // if (route == "Replenish" || route == "Receive") {
    //   navigate(route, { fromScreen: "Dashboard" });
    // } else if (route == "ReplenishOffline") {
    //   navigate(route, { fromScreen: "Dashboard" });
    // } else {
    //   route == "Receive" && dispatch(getReceiveHeaderKPIs());
    //   navigate(route);
    // }
  };

  const _renderList = () => {
    const filteredData = productsData && productsData?.data;

    return (
      filteredData &&
      filteredData?.map((item: any, index: number) => {
        return renderItem(item, index);
      })
    );
  };

  async function closeWalkThrought() {
    await storage.setItem("firstLogin", "false");
    setFirstLogin(false);

    setTimeout(() => {
      checkToShowPushNotificationModal();
    }, 1000);
  }

  const renderItem = (item: any, index: number) => {
    return (
      <ListItem
        idLabel={`dashboard-${index}`}
        key={`${index}`}
        leftIcon={
          <View
            style={styles.leftIconContainer}
            accessible={true}
            accessibilityLabel="dashboard-left-icon-container"
          >
            {item?.imageURL ? (
              <Image
                source={{
                  uri: item?.imageURL.replace("http://", "https://"),
                }}
                style={styles.leftIcon}
                resizeMode={"contain"}
                accessible={true}
                accessibilityLabel="dashboard-left-icon"
              />
            ) : (
              <DefaultProductImage
                width={wp(18)}
                height={wp(18)}
                accessible={true}
                accessibilityLabel="dashboard-default-image"
              />
            )}
          </View>
        }
        rightIcon={
          isProductFreezed(item) ? (
            <Locked
              accessible={true}
              accessibilityLabel="dashboard-listitem-locked-image"
            />
          ) : null
        }
        headerContent={
          <View>
            <CustomText
              style={styles.catalogNumber}
              accessibilityLabel="dashboard-item-catalogno"
            >
              {item?.catalogNo}
            </CustomText>
            <TouchableOpacity
              onPress={async () => {
                itemDetailsRef?.current?.open();
                await dispatch(getProductDetails(item?.id));
                dispatch(setProductLoader(false));
              }}
            >
              <CustomText
                style={styles.itemHeaderContent}
                accessibilityLabel="dashboard-item-description"
              >
                {item?.description}
              </CustomText>
            </TouchableOpacity>
            <View
              style={styles.qtyInfoContainer}
              accessible={true}
              accessibilityLabel="dashboard-qtyinfo-container"
            >
              <CustomText
                style={styles.itemSubHeaderStyle}
                accessibilityLabel="dashboard-item-uomid"
              >
                {`(${item?.uomId})`}
              </CustomText>
            </View>
          </View>
        }
        customStyles={{ container: styles.itemContainerStyle }}
        onPress={() => {}}
      >
        <View
          style={styles.flexRowContainer}
          accessible={true}
          accessibilityLabel="dashboard-flexrow-container"
        >
          <View
            style={[styles.itemChildContainer]}
            accessible={true}
            accessibilityLabel="dashboard-itemchild-container"
          >
            <CustomText
              style={styles.itemChildTitleText}
              accessibilityLabel="dashboard-avail-qty-label"
            >
              {Strings["ime.availqty"] ?? "Avail Qty"}
            </CustomText>
            <CustomText
              style={styles.itemChildValueText}
              accessibilityLabel="dashboard-avail-qty-value"
            >
              {`${item?.availableQty + " "}${
                getMultiplier(item) == null ? " " : getMultiplier(item)
              }`}
              {/* {item?.availableQtyForDisplay} */}
            </CustomText>
          </View>
          <View
            style={[styles.itemChildContainer]}
            accessible={true}
            accessibilityLabel="dashboard-vendor-container"
          >
            <CustomText
              style={styles.itemChildTitleText}
              accessibilityLabel="dashboard-vendor-label"
            >
              {Strings["vendor"] ?? "Vendor"}
            </CustomText>
            <CustomText
              style={styles.itemChildValueText}
              accessibilityLabel="dashboard-vendor-value"
            >
              {item?.vendorName}
            </CustomText>
          </View>
        </View>
      </ListItem>
    );
  };
  const CardsDataFilter = () => {
    let data: any = [];

    checkUserPrivileges(userPrivilege, "consume.scanner") &&
      data.push({
        title: Strings["consume"] || "Consume",
        icon: ConsumeIcon,
        route: "Consume",
        disabled: false,
      });
    checkUserPrivileges(userPrivilege, "replenish.scanner") &&
      data.push({
        title: Strings["replenish"] || "Replenish",
        icon: ReplenishIcon,
        route: replenishroute,
        disabled: false,
      });
    checkUserPrivileges(userPrivilege, "receive.scanner") &&
      data.push({
        title: Strings["receive"] || "Receive",
        icon: internet ? ReceiveIcon : ReceiveOffline,
        route: "Receive",
        disabled: internet ? false : true,
      });
    checkUserPrivileges(userPrivilege, "stock.correction(scanner)") &&
      data.push({
        title: Strings["stock_correction"] || "Stock Correction",
        icon: internet ? StockCorrectionIcon : StockCorrectionIconOffline,
        route: "StockCorrection",
        disabled: internet ? false : true,
      });
    checkUserPrivileges(userPrivilege, "show.scanner.PI.Count") &&
      data.push({
        // title: Strings["show.scanner.PI.Count"] || "PI Count",
        title: Strings["pi.count"] || "PI Count",
        icon: internet ? PiCountIcon : PiCountOffline,
        route: "PiCount",
        disabled: internet ? false : true,
      });
    if (checkUserPrivileges(userPrivilege, "approval.scanner")) {
      data.push({
        // title: Strings["lime.scanner.approvals"] ?? "Approvals",
        title: Strings["approval"] ?? "Approvals",
        icon: internet ? ApprovalIcon : Approvaloffline,
        count: approvalCount || 0,
        route: "Approvals",
        disabled: internet ? false : true,
      });
    }
    checkUserPrivileges(userPrivilege, "stock.transfer.scanner") &&
      data.push({
        // title: Strings["ime.stock.transfer"] ?? "Stock Transfer",
        title: Strings["stock.transfer.scanner"] ?? "Stock Transfer",
        icon: internet ? StockTransferIcon : Stocktransferoffline,
        route: "StockTransfer",
        disabled: internet ? false : true,
      });
    return [...data, ...CardsData];
  };

  const resetProductData = (value) => {
    dispatch(setProductLoader(value));
    dispatch(emptyProductData());
  };

//  const get_Data = async () =>{
//   const credentials = await Keychain.getGenericPassword();
//   console.log("HELLO WORLD GUYS",credentials);
//  };
//  get_Data();
  return (
    <View
      style={[styles.container]}
      accessible={true}
      accessibilityLabel="dashboard-main-container"
    >
      {isFirstLogin == null ? (
        <WalkthroughTips onFinish={closeWalkThrought} />
      ) : (
        <>
          <Header
            idLabel={"dashboard"}
            statusBar={true}
            statusBarColor={"blue"}
            iconLeft={true}
            iconRight={true}
            title={Strings?.["dashboard"]}
            onLeftIconPress={() => {
              dispatch(emptyProductData());
              setSearch("");
              Keyboard.dismiss();
              props.navigation.getParent("Drawer").openDrawer();
            }}
            {...props}
          />
          {!internet && <OfflineToast login={false} />}
          <Subheader
            idLabel={"dashboard"}
            distance={1}
            offset={[0, 1]}
            mainContainer={styles.subHeaderContainer}
          />

          {internet && (
            <View style={styles.animatedSearchContainer}>
              <AnimatedSearch
                idLabel={"dashboard"}
                search={search}
                onSearch={(text: string) => {
                  resetProductData(!!text);
                  setSearch(text);
                }}
                containerStyle={styles.searchBarContainer}
                cancelBtnStyle={{ paddingRight: wp(5) }}
                placeholder={
                  Strings["ime.scanner.search.stockroom.products"] ??
                  "Search stockroom products"
                }
                clearText={() => {
                  setSearch("");
                  setFlag(0);
                }}
                onBarcodeDetected={(barcode) => {
                  setFlag(flag + 1);
                  resetProductData(!!barcode);
                  flag > 0 && dispatch(getProductList(barcode));
                  setSearch(barcode.replace(/[\x00-\x1F\x7F]/g, ""));
                }}
                onCancel={() => {
                  setSearch("");
                  setFlag(0);
                  Keyboard.dismiss();
                }}
              />
            </View>
          )}

          {search != "" && (
            <ScrollView
              style={styles.dataContainer}
              showsVerticalScrollIndicator={false}
              accessible={true}
              accessibilityLabel="dashboard-scroll-container"
              onScroll={() => Keyboard.dismiss()}
            >
              {_renderList()}
            </ScrollView>
          )}
          {search === "" ? (
            <>
              {internet && (
                <View
                  style={styles.kpiContainer}
                  accessible={true}
                  accessibilityLabel="dashboard-kpi-container"
                >
                  <KPIBlock
                    LeftIcon={RedWarning}
                    title={Strings?.["ime.out.of.stock"] || "Out of stock"}
                    value={outOfStock || 0}
                    onClick={() => {
                      dispatch(clearStockLevelData());
                      props.navigation.navigate("StockLevel", {
                        route: 0,
                        replenish: checkUserPrivileges(
                          userPrivilege,
                          "replenish.scanner"
                        ),
                      });
                    }}
                  />
                  <EmptyDivider width={wp(3.2)} />
                  <KPIBlock
                    LeftIcon={YellowWarning}
                    title={Strings?.["ime.running.low"] || "Running low"}
                    value={runningLow || 0}
                    onClick={() => {
                      dispatch(clearStockLevelData());
                      props.navigation.navigate("StockLevel", {
                        route: 1,
                        replenish: checkUserPrivileges(
                          userPrivilege,
                          "replenish.scanner"
                        ),
                      });
                    }}
                  />
                </View>
              )}
              <DashboardCardList
                list={CardsDataFilter()}
                onPressItem={onPressItem}
              />
            </>
          ) : null}

          <AlertModal
            isShow={showModal}
            customStyles={{ width: SIZES.width * 0.9 }}
          >
            <CustomText
              style={styles.modalHeaderText}
              accessibilityLabel="dashboard-modal-header-text"
            >
              {Strings["scanner.important.updates"] ?? "Get Important Updates"}
            </CustomText>
            <CustomText
              style={styles.modalBodyText}
              accessibilityLabel="dashboard-modal-bodytext"
            >
              {Strings["ime.scanner.notification.msg"] ??
                "We'll notify you about approval requests, stock running low, and out of stock changes."}
            </CustomText>
            <MainButton
              title={Strings["ime.scanner.notify.me"] ?? "Yes, notify me"}
              buttonTextStyle={{ ...FONTS.title }}
              onChangeBtnPress={() => {
                setShowPushLoader(true);
                applyPushNotification(
                  profileData?.id ?? "",
                  setShowModal,
                  dispatch,
                  setShowPushLoader,
                  Strings,
                  internet
                );
              }}
              buttonStyle={styles.modalMainButton}
              accessibilityLabel={"dashboard-notifyme-btn"}
            />
            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={async () => {
                await storage.setItem(
                  "enabled_push_notification",
                  JSON.stringify(false)
                );
                setShowModal(false);
              }}
              accessible={true}
              accessibilityLabel="dashboard-modal-secondary-btn"
            >
              <CustomText
                style={styles.modalSecondaryButtonText}
                accessibilityLabel="dashboard-modal-secondary-text"
              >
                {Strings["ime.scanner.maybe.later"] ?? "Maybe later"}
              </CustomText>
            </TouchableOpacity>

            <CustomText
              style={styles.modalFooterText}
              accessibilityLabel="dashboard-modal-footer-txt"
            >
              {Strings["ime.scanner.notification.pref.msg"] ??
                "You can change notification preferences at any time in your account settings."}
            </CustomText>
            <Loader show={showPushLoader} />
          </AlertModal>

          <ProductDetails
            itemDetailsRef={itemDetailsRef}
            productDetailsList={productDetails}
          />
          {/* Toast */}
          {/* <ToastComponent /> */}
          <Loader show={loader || loaderLogin || productDetailsLoading} />
          <UpdateAlertBox />
        </>
      )}
    </View>
  );
};

export default Dashboard;
