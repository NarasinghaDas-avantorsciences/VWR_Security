import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Pressable,
  BackHandler,
  Keyboard,
} from "react-native";
import Text from "../../../../Components/CustomText";
import { useSelector, useDispatch } from "react-redux";
import {
  AnimatedSearch,
  Header,
  Loader,
  SearchBar,
  Subheader,
  ToastComponent,
} from "../../../../Components";
import RenderItem from "./renderItem";
import { COLORS, SIZES } from "../../../../Utils/theme";
import { filterDataByName, wp } from "../../../../Utils/globalFunction";
import { WhiteLeftArrow } from "../../../../Utils/images";
import styles from "./styles";
import {
  getConsumeList,
  getOrderList,
  getPOUList,
  toggleApprovalToast,
  getDetail,
  ReadytobeApprovedList,
  PartialApprovedList,
  OutofstockList,
} from "../../../../Redux/Action/approvalsAction";
import Toast from "react-native-toast-message";
import { consumeDetail } from "../../../../Service/ApiConfig";
import { newLoadData, onChangeBtnPress } from "./logic";
import { useIsFocused } from "@react-navigation/native";
import { API_CONSTANTS, SEARCH_KEY } from "../../../../Constants/ApiConstant";

const OrderRequestApproval = (props: any) => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [search, setSearch] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  //const approvalsData = useSelector((state: any) => state.approvalsReducer);
  const [currentPageReady, setCurrentPageReady] = useState(1);
  const [currentPagePartial, setCurrentPagePartial] = useState(1);
  const [currentPageOutofStock, setCurrentPageOutofstock] = useState(1);
  const [filterDataReady, setFilterDataReady] = useState<number[]>([]);
  const [filterDataPartial, setFilterDataPartial] = useState<number[]>([]);
  const [filterDataOutofStock, setFilterDataOutofStock] = useState<number[]>(
    []
  );
  const itemsPerPage = 10;
  const [apploader, setApploader] = useState(false);
  const { currency } = useSelector((state: any) => state.userReducer);

  const {
    loader,
    consumeList,
    orderList,
    pouList,
    consumeCount,
    orderRequestCount,
    pouCount,
    readyApprovedList,
    partialApprovedList,
    outofStockList,
  } = useSelector((state: any) => state.approvalsReducer);
  const Strings = useSelector((state: any) => state.languageReducer?.data);
  const dispatch = useDispatch<any>();
  const [limit, setLimit] = useState(10);
  const { stockRoomDetail } = useSelector((state: any) => state.userReducer);
  const isFocused = useIsFocused();
  let { type, screen } = props.route?.params;
  type = type?.replace(/\s/g, "")?.toLowerCase();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  const backAction = () => {
    props.navigation.navigate("Approvals");
    return true;
  };

  useEffect(()=>{
 console.log("orderRequestCount *******",orderRequestCount);
 console.log("partialApprovedList",partialApprovedList);
 //console.log("outofStockList",outofStockList);
  },[readyApprovedList,
    partialApprovedList,
    outofStockList,]);

  useLayoutEffect(() => {
    setLimit(10);
    loadApprovalsApi();
    setSearchKey("");
  }, [isFocused, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(1);
    onsearch("");
  }, [isFocused]);
  const showToast = (text1: string, text2: string) => {
    Toast.show({
      type: "alertToast",
      text1: text1,
      text2: text2,
      position: "bottom",
      bottomOffset: SIZES.padding * 2,
    });
  };

  const onChangeBtn = (item: any) => {
    //console.log("item", item);
    onChangeBtnPress(
      screen,
      item,
      dispatch,
      getDetail,
      props.route?.params,
      showToast
    );
  };

  const loadApprovalsApi = () => {
    if (screen == 1) {
      let url = `?limit=${10}&sortBy=createdDate:desc`;
      dispatch(getConsumeList(url, ""));
      let Ready_Url = API_CONSTANTS.CONSUME_READY_URL;
      let Partial_Url = API_CONSTANTS.CONSUME_PARTIAL_URL;
      let OutofStock_Url = API_CONSTANTS.CONSUME_OUTOF_STOCK_URL;
      let Type_req = "CONSUME";
      dispatch(ReadytobeApprovedList(Ready_Url, Type_req));
      dispatch(PartialApprovedList(Partial_Url, Type_req));
      dispatch(OutofstockList(OutofStock_Url, Type_req));
    } else if (screen == 2) {
      let url = `?limit=${10}&sortBy=createdDate:desc`;
      dispatch(getOrderList(url, ""));
      let Ready_Url = API_CONSTANTS.ORDER_READY_URL;
      let Partial_Url = API_CONSTANTS.ORDER_PARTIAL_URL;

      dispatch(ReadytobeApprovedList(Ready_Url, ""));
      dispatch(PartialApprovedList(Partial_Url, ""));
    } else if (screen == 3) {
      let url = `?limit=${10}&sortBy=createdDate:desc`;
      dispatch(getPOUList(url, ""));
      let Ready_Url = API_CONSTANTS.POU_READY_URL;
      let Partial_Url = API_CONSTANTS.POU_PARTIAL_URL;
      let OutofStock_Url = API_CONSTANTS.POU_OUTOF_STOCK_URL;
      dispatch(ReadytobeApprovedList(Ready_Url, ""));
      dispatch(PartialApprovedList(Partial_Url, ""));
      dispatch(OutofstockList(OutofStock_Url, ""));
    }
  };

  const onsearch = (searchKey: string) => {
    let url = `?limit=${10}&sortBy=createdDate:desc`;
    if (searchKey) {
      url += `&multiSearchKey=${searchKey?.toLowerCase()}`;
    }
    if (screen == 1) {
      dispatch(getConsumeList(url, ""));
      let Type_req = "CONSUME";
      let Ready_Url = API_CONSTANTS.CONSUME_READY_URL;
      let Partial_Url = API_CONSTANTS.CONSUME_PARTIAL_URL;
      let OutofStock_Url = API_CONSTANTS.CONSUME_OUTOF_STOCK_URL;
      if (searchKey) {
        Ready_Url += `${SEARCH_KEY}${searchKey?.toLowerCase()}`;
        Partial_Url += `${SEARCH_KEY}${searchKey?.toLowerCase()}`;
        OutofStock_Url += `${SEARCH_KEY}${searchKey?.toLowerCase()}`;
      }
      if (selectedIndex === 2) {
        dispatch(ReadytobeApprovedList(Ready_Url, Type_req));
      } else if (selectedIndex === 3) {
        dispatch(PartialApprovedList(Partial_Url, Type_req));
      } else if (selectedIndex === 4) {
        dispatch(OutofstockList(OutofStock_Url, Type_req));
      }
    } else if (screen == 2) {
      dispatch(getOrderList(url, ""));
      let Ready_Url = API_CONSTANTS.ORDER_READY_URL;
      let Partial_Url = API_CONSTANTS.ORDER_PARTIAL_URL;
      if (searchKey) {
        Ready_Url += `${SEARCH_KEY}${searchKey?.toLowerCase()}`;
        Partial_Url += `${SEARCH_KEY}${searchKey?.toLowerCase()}`;
      }
      if (selectedIndex === 2) {
        dispatch(ReadytobeApprovedList(Ready_Url, ""));
      } else if (selectedIndex === 3) {
        dispatch(PartialApprovedList(Partial_Url, ""));
      }
    } else {
      dispatch(getPOUList(url, ""));
      let Ready_Url = API_CONSTANTS.POU_READY_URL;
      let Partial_Url = API_CONSTANTS.POU_PARTIAL_URL;
      let OutofStock_Url = API_CONSTANTS.POU_OUTOF_STOCK_URL;
      if (searchKey) {
        Ready_Url += `${SEARCH_KEY}${searchKey?.toLowerCase()}`;
        Partial_Url += `${SEARCH_KEY}${searchKey?.toLowerCase()}`;
        OutofStock_Url += `${SEARCH_KEY}${searchKey?.toLowerCase()}`;
      }
      if (selectedIndex === 2) {
        dispatch(ReadytobeApprovedList(Ready_Url, ""));
      } else if (selectedIndex === 3) {
        dispatch(PartialApprovedList(Partial_Url, ""));
      } else if (selectedIndex === 4) {
        dispatch(OutofstockList(OutofStock_Url, ""));
      }
    }
  };

  const debounce = (
    func: { (res: string): void; (arg0: any): void },
    delay: number | undefined
  ) => {
    let timeoutId: number;
    return (...args: any) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  const onChangeSearchKey = async (searckKey: string) => {
    onsearch(searckKey);
  };
  const debounceOnSearch = debounce(onChangeSearchKey, 400);

  const onLoadData = () => {
    let totalCount;
    if (screen == 1) {
      totalCount = consumeCount?.count;
    } else if (screen == 2) {
      totalCount = orderRequestCount?.count;
    } else {
      totalCount = pouCount?.count;
    }
    //console.log("totalCount---", totalCount);
    newLoadData(
      screen,
      limit,
      selectedIndex,
      totalCount,
      dispatch,
      getConsumeList,
      getOrderList,
      getPOUList,
      searchKey?.toLowerCase(),
      () => {
        if (selectedIndex == 1) {
          setLimit((limit) => limit + 10);
        }
      }
    );
  };

  const filterLogic = () => {
    if (screen === 1) {
      const initialReadyData = readyApprovedList?.consumeReqHdrDtl?.slice(
        0,
        itemsPerPage
      );
      setFilterDataReady(initialReadyData);
      const initialPartialData = partialApprovedList?.consumeReqHdrDtl?.slice(
        0,
        itemsPerPage
      );
      setFilterDataPartial(initialPartialData);
      const initialOutofStockData = outofStockList?.consumeReqHdrDtl?.slice(
        0,
        itemsPerPage
      );
      setFilterDataOutofStock(initialOutofStockData);
    } else if (screen === 2) {
      const initialReadyData = readyApprovedList?.orderApprovalHdr?.slice(
        0,
        itemsPerPage
      );
      setFilterDataReady(initialReadyData);
      const initialPartialData = partialApprovedList?.orderApprovalHdr?.slice(
        0,
        itemsPerPage
      );
      setFilterDataPartial(initialPartialData);
    } else if (screen === 3) {
      const initialReadyData = readyApprovedList?.orderApprovalHdr?.slice(
        0,
        itemsPerPage
      );
      setFilterDataReady(initialReadyData);
      const initialPartialData = partialApprovedList?.orderApprovalHdr?.slice(
        0,
        itemsPerPage
      );
      setFilterDataPartial(initialPartialData);
      const initialOutofStockData = outofStockList?.orderApprovalHdr?.slice(
        0,
        itemsPerPage
      );
      setFilterDataOutofStock(initialOutofStockData);
    }
  };
  useEffect(() => {
    filterLogic();
    setCurrentPageReady(1);
    setCurrentPagePartial(1);
    setCurrentPageOutofstock(1);
  }, [
    isFocused,
    selectedIndex,
    searchKey,
    readyApprovedList,
    partialApprovedList,
    outofStockList,
  ]);

  const onScrollLoadRestData = () => {
    if (screen == 1) {
      if (
        selectedIndex == 2 &&
        filterDataReady.length < readyApprovedList?.count
      ) {
        const nextPageData = readyApprovedList?.consumeReqHdrDtl?.slice(
          currentPageReady * itemsPerPage,
          (currentPageReady + 1) * itemsPerPage
        );
        setFilterDataReady([...filterDataReady, ...nextPageData]);
        setCurrentPageReady(currentPageReady + 1);
        if (filterDataReady.length > 0) {
          apploaderFn();
        }
      } else if (
        selectedIndex == 3 &&
        filterDataPartial.length < partialApprovedList?.count
      ) {
        const nextPageData = partialApprovedList?.consumeReqHdrDtl?.slice(
          currentPagePartial * itemsPerPage,
          (currentPagePartial + 1) * itemsPerPage
        );
        setFilterDataPartial([...filterDataPartial, ...nextPageData]);
        setCurrentPagePartial(currentPagePartial + 1);
        if (filterDataPartial.length > 0) {
          apploaderFn();
        }
      } else if (
        selectedIndex == 4 &&
        filterDataOutofStock.length < outofStockList?.count
      ) {
        const nextPageData = outofStockList?.consumeReqHdrDtl?.slice(
          currentPageOutofStock * itemsPerPage,
          (currentPageOutofStock + 1) * itemsPerPage
        );
        setFilterDataOutofStock([...filterDataOutofStock, ...nextPageData]);
        setCurrentPageOutofstock(currentPageOutofStock + 1);
        if (filterDataOutofStock.length > 0) {
          apploaderFn();
        }
      }
    } else if (screen == 2) {
      if (
        selectedIndex == 2 &&
        filterDataReady.length < readyApprovedList?.count
      ) {
        const nextPageData = readyApprovedList?.orderApprovalHdr?.slice(
          currentPageReady * itemsPerPage,
          (currentPageReady + 1) * itemsPerPage
        );
        setFilterDataReady([...filterDataReady, ...nextPageData]);
        if (filterDataReady.length > 0) {
          apploaderFn();
        }
        setCurrentPageReady(currentPageReady + 1);
      } else if (
        selectedIndex == 3 &&
        filterDataPartial.length < partialApprovedList?.count
      ) {
        const nextPageData = partialApprovedList?.orderApprovalHdr?.slice(
          currentPagePartial * itemsPerPage,
          (currentPagePartial + 1) * itemsPerPage
        );
        setFilterDataPartial([...filterDataPartial, ...nextPageData]);
        setCurrentPagePartial(currentPagePartial + 1);
        if (filterDataPartial.length > 0) {
          apploaderFn();
        }
      }
    } else if (screen == 3) {
      if (
        selectedIndex == 2 &&
        filterDataReady.length < readyApprovedList?.count
      ) {
        const nextPageData = readyApprovedList?.orderApprovalHdr?.slice(
          currentPageReady * itemsPerPage,
          (currentPageReady + 1) * itemsPerPage
        );
        setFilterDataReady([...filterDataReady, ...nextPageData]);
        setCurrentPageReady(currentPageReady + 1);
        if (filterDataReady.length > 0) {
          apploaderFn();
        }
      } else if (
        selectedIndex == 3 &&
        filterDataPartial.length < partialApprovedList?.count
      ) {
        const nextPageData = partialApprovedList?.orderApprovalHdr?.slice(
          currentPagePartial * itemsPerPage,
          (currentPagePartial + 1) * itemsPerPage
        );
        setFilterDataPartial([...filterDataPartial, ...nextPageData]);
        setCurrentPagePartial(currentPagePartial + 1);
        if (filterDataPartial.length > 0) {
          apploaderFn();
        }
      } else if (
        selectedIndex == 4 &&
        filterDataOutofStock.length < outofStockList?.count
      ) {
        const nextPageData = outofStockList?.orderApprovalHdr?.slice(
          currentPageOutofStock * itemsPerPage,
          (currentPageOutofStock + 1) * itemsPerPage
        );
        setFilterDataOutofStock([...filterDataOutofStock, ...nextPageData]);
        setCurrentPageOutofstock(currentPageOutofStock + 1);
        if (filterDataOutofStock.length > 0) {
          apploaderFn();
        }
      }
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [isFocused, selectedIndex]);

  const apploaderFn = () => {
    setApploader(true);
    setTimeout(() => {
      setApploader(false);
    }, 200);
  };

  const __renderData = (filteredData: any, type: string, itemIndex: number) => {
    return (
      <ScrollView
        ref={scrollViewRef}
        style={{ flexGrow: 1 }}
        keyboardShouldPersistTaps={"handled"}
        onScroll={({ nativeEvent }) => {
          Keyboard.dismiss();
          if (isCloseToBottom(nativeEvent)) {
            onLoadData();
            onScrollLoadRestData();
          }
        }}
        scrollEventThrottle={400}
      >
        {__renderSearch(type)}
        {filteredData?.map((item: any, index: number) => (
          <RenderItem
            // disabled={isutOfStockData(item)}
            item={{ ...item, type: status(item) }}
            key={index}
            onChangeBtnPress={() => onChangeBtn(item)}
            screen={screen}
            showPrice={stockRoomDetail?.isApprovalIndividual}
            currency={currency}
          />
        ))}
        {countAll(itemIndex) == 0 ||
        (countAll(itemIndex) && searchKey?.length && !filteredData?.length)
          ? noDataFound()
          : null}
      </ScrollView>
    );
  };
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const __renderSearch = (type: string) => (
    <View
      style={styles.serachMain}
      accessible={true}
      accessibilityLabel={`${type}-searchBar-wrapper`}
    >
      {/* <SearchBar
        idLabel={type}
        search={searchKey}
        onSearch={(res) => {
          setSearchKey(res);
          debounceOnSearch(res);
        }}
        placeholder={Strings["search_product"] ?? "Search"}
        onBarcodeDetected={(barcode) => {
          setSearchKey(barcode);
          debounceOnSearch(barcode);
        }}
        from={"approvals"}
      /> */}
      <AnimatedSearch
        idLabel={type}
        search={searchKey}
        onSearch={(res) => {
          setSearchKey(res);
          debounceOnSearch(res);
        }}
        // containerStyle={[styles.searchMain]}
        cancelBtnStyle={{ paddingRight: 0 }}
        placeholder={Strings["search_product"] ?? "Search"}
        clearText={() => {
          setSearchKey("");
          // Keyboard.dismiss();
          onsearch("");
        }}
        onBarcodeDetected={(barcode) => {
          setSearchKey(barcode);
          debounceOnSearch(barcode);
        }}
        onCancel={() => {
          setSearchKey("");
          onsearch("");

          Keyboard.dismiss();
        }}
        from="approvals"
      />
    </View>
  );
  const noDataFound = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{Strings["no.records.found"]}</Text>
      </View>
    );
  };
  const RenderPartial = () => {
    const filteredData: any = filterByMultipleKeys(
      partiallyData(),
      "firstName",
      "lastName",
      search?.replace(/\s/g, "")
    );
    //console.log("filteredData", filteredData?.length);
    return __renderData(filteredData, "partial", 3);
  };

  const RenderReady = () => {
    const filteredData: any = filterByMultipleKeys(
      readyData(),
      "firstName",
      "lastName",
      search
    );
    return __renderData(filteredData, "ready", 2);
  };

  function filterByMultipleKeys(
    blockData: any,
    firstKey: string,
    secondKey: string,
    searchText: any
  ) {
    let filteredData = null;
    if (blockData) {
      filteredData = blockData?.filter((element) => {
        return (
          element?.[firstKey]?.toLowerCase() +
          " " +
          element?.[secondKey]?.toLowerCase()
        ).includes(searchText?.toLowerCase());
      });
    }
    return filteredData;
  }

  const RenderAll = () => {
    const filteredData: any = filterByMultipleKeys(
      allDataArray(),
      "firstName",
      "lastName",
      search?.replace(/\s/g, "")
    );
    return __renderData(filteredData, "all", 1);
  };

  const RenderOutOfStock = () => {
    const filteredData: any = filterByMultipleKeys(
      outOfStockData(),
      "firstName",
      "lastName",
      search?.replace(/\s/g, "")
    );
    return __renderData(filteredData, "out", 4);
  };

  function status(item: any) {
    if (screen == 1) {
      if (item?.consumeApprovalStatus == "Ready To Be Approved") {
        return "ready";
      } else if (item?.consumeApprovalStatus == "Partially Available") {
        return "partial";
      } else {
        return "out";
      }
    } else if (screen == 2) {
      if (item?.orderApprovalStatus == "Ready To Be Approved") {
        return "ready";
      } else if (item?.orderApprovalStatus == "Partially Approved") {
        return "partial";
      } else {
        return "out";
      }
    } else {
      if (item?.pouOrderApprovalStatus == "Available") {
        return "ready";
      } else if (item?.pouOrderApprovalStatus == "Partial Available") {
        return "partial";
      } else {
        return "out";
      }
    }
  }

  const readyData = () => {
    if (screen == 1) {
      const data = filterDataReady?.filter(
        (item: any) => item?.consumeApprovalStatus == "Ready To Be Approved"
      );
      return data;
    } else if (screen == 2) {
      const data = filterDataReady?.filter(
        (item: any) => item?.orderApprovalStatus == "Ready To Be Approved"
      );
      return data;
    } else {
      const data = filterDataReady?.filter(
        (item: any) => item?.pouOrderApprovalStatus == "Available"
      );
      return data;
    }
  };

  const partiallyData = () => {
    if (screen == 1) {
      const data = filterDataPartial?.filter(
        (item: any) => item?.consumeApprovalStatus == "Partially Available"
      );
      return data;
    } else if (screen == 2) {
      const data = filterDataPartial?.filter(
        (item: any) => item?.orderApprovalStatus == "Partially Approved"
      );
      return data;
    } else {
      const data = filterDataPartial?.filter(
        (item: any) => item?.pouOrderApprovalStatus == "Partial Available"
      );
      return data;
    }
  };
  const outOfStockData = () => {
    if (screen == 1) {
      const data = filterDataOutofStock?.filter(
        (item: any) => item?.consumeApprovalStatus == "out of stock"
      );
      return data;
    } else if (screen == 3) {
      const data = filterDataOutofStock?.filter(
        (item: any) => item?.pouOrderApprovalStatus == "Not Available"
      );
      return data;
    }
  };
  function isutOfStockData(item: any) {
    if (screen == 1) {
      return item?.consumeApprovalStatus == "out of stock";
    } else if (screen == 3) {
      return item?.pouOrderApprovalStatus == "Not Available";
    }
  }
  const allDataArray = () => {
    if (screen == 1) {
      return consumeList?.consumeReqHdrDtl;
    } else if (screen == 2) {
      return orderList?.orderApprovalHdr;
    } else {
      return pouList?.orderApprovalHdr;
    }
  };
  const countAll = (type: number) => {
    if (screen == 1) {
      if (type == 1) {
        const count =
          consumeCount?.data?.readyToBeReceivedCount +
          consumeCount?.data?.partiallyAvailableCount +
          consumeCount?.data?.outOfStockCount;
        return count;
      } else if (type == 2) {
        const count = consumeCount?.data?.readyToBeReceivedCount;
        return count;
      } else if (type == 3) {
        const count = consumeCount?.data?.partiallyAvailableCount;
        return count;
      } else if (type == 4) {
        const count = consumeCount?.data?.outOfStockCount;
        return count;
      }
    }
    if (screen == 2) {
      if (type == 1) {
        const count =
          orderRequestCount?.data?.readyToBeReceivedCount +
          orderRequestCount?.data?.readyToBeReceivedCount +
          orderRequestCount?.data?.partiallyApprovedCount;
        return count;
      } else if (type == 2) {
        const count = orderRequestCount?.data?.readyToBeReceivedCount;
        return count;
      } else if (type == 3) {
        const count = orderRequestCount?.data?.partiallyApprovedCount;
        return count;
      }
    }
    if (screen == 3) {
      if (type == 1) {
        const count =
          pouCount?.data?.readyToBeReceivedCount +
          pouCount?.data?.partiallyApprovedCount +
          pouCount?.data?.outOfStockCount;
        return count;
      } else if (type == 2) {
        const count = pouCount?.data?.readyToBeReceivedCount;
        return count;
      } else if (type == 3) {
        const count = pouCount?.data?.partiallyApprovedCount;
        return count;
      } else if (type == 4) {
        const count = pouCount?.data?.outOfStockCount;
        return count;
      }
    }
  };
  const renderOrderRequests = [
    {
      name: Strings["all"],
      count:
        orderRequestCount?.data?.readyToBeReceivedCount +
        orderRequestCount?.data?.partiallyApprovedCount,
      id: 1,
    },
    {
      name: "Ready to Approve",
      count: orderRequestCount?.data?.readyToBeReceivedCount,
      id: 2,
    },
    {
      name: Strings["ime.partially.approved"],
      count: orderRequestCount?.data?.partiallyApprovedCount,
      id: 3,
    },
  ];
  const pouRequests = [
    {
      name: Strings["all"],
      count:
        pouCount?.data?.readyToBeReceivedCount +
        pouCount?.data?.partiallyApprovedCount +
        pouCount?.data?.outOfStockCount,
      id: 1,
    },
    {
      name: Strings["ime.scanner.ready"] ?? "Ready",
      count: pouCount?.data?.readyToBeReceivedCount,
      id: 2,
    },
    {
      name: Strings["store.availability.status.partialDiscontinued"],
      count: pouCount?.data?.partiallyApprovedCount,
      id: 3,
    },
    {
      name: Strings["ime.out.of.stock"],
      count: pouCount?.data?.outOfStockCount,
      id: 4,
    },
  ];

  const consumeRequests = [
    {
      name: Strings["all"],
      count:
        consumeCount?.data?.readyToBeReceivedCount +
        consumeCount?.data?.partiallyAvailableCount +
        consumeCount?.data?.outOfStockCount,
      id: 1,
    },
    {
      name: Strings["ime.scanner.ready"] ?? "Ready",
      count: consumeCount?.data?.readyToBeReceivedCount,
      id: 2,
    },
    {
      name: Strings["store.availability.status.partialDiscontinued"],
      count: consumeCount?.data?.partiallyAvailableCount,
      id: 3,
    },
    {
      name: Strings["ime.out.of.stock"],
      count: consumeCount?.data?.outOfStockCount,
      id: 4,
    },
  ];

  const getTabs = () => {
    const tabList =
      screen == 2
        ? renderOrderRequests
        : screen == 3
        ? pouRequests
        : consumeRequests;
    return (
      <View style={styles.tabContainer}>
        {tabList.map((v, i) => {
          return (
            <Pressable
              accessible={true}
              accessibilityLabel={`${v.name}-${props.route?.params?.type}-tabBtn`}
              onPress={() => {
                setSearchKey("");
                setSelectedIndex(v.id);
              }}
              style={[
                styles.tabContentContainer,
                {
                  borderBottomColor:
                    selectedIndex == v.id ? COLORS.scienceBlue : COLORS.white,
                },
              ]}
            >
              <Text
                accessible={true}
                accessibilityLabel={`${v.name}-${props.route?.params?.type}-tab-text-count`}
                style={
                  selectedIndex == v.id
                    ? styles.tabTitleText
                    : styles.unSelectedText
                }
              >
                {v.count}
              </Text>
              <Text
                accessible={true}
                accessibilityLabel={`${v.name}-${props.route?.params?.type}-tab-text-label`}
                style={
                  selectedIndex == v.id
                    ? styles.tabTitleText
                    : styles.unSelectedText
                }
              >
                {(" " + v.name)?.length > 10
                  ? (" " + v.name).substring(0, 10) + "..."
                  : " " + v.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const getTabData = () => {
    switch (selectedIndex) {
      case 1:
        return <>{RenderAll()}</>;
      case 2:
        return <View style={{ flex: 1 }}>{RenderReady()}</View>;
      case 3:
        return <>{RenderPartial()}</>;
      case 4:
        return <>{RenderOutOfStock()}</>;
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={props.route?.params?.type}
        LeftIcon={() => <WhiteLeftArrow />}
        onLeftIconPress={() =>
          // props.navigation.getParent("Drawer").openDrawer()
          props.navigation.navigate("Approvals")
        }
        statusBar={true}
        statusBarColor={"blue"}
        iconLeft={true}
        iconRight={true}
      />
      <Subheader />
      {getTabs()}
      {getTabData()}
      {/* <ToastComponent /> */}
      <Loader show={loader} />
      <Loader show={apploader} />
    </View>
  );
};

export default OrderRequestApproval;
