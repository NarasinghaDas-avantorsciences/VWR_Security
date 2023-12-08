import React from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { hp, wp } from "../../Utils/globalFunction";
import { FONTFAMILY, FONTS, COLORS } from "../../Utils/theme";
import ScannerButton from "../ScannerButton";
import CustomText from "../CustomText";

interface AuthInputBox {
  lable: string;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "number-pad"
    | "decimal-pad";
  onChangeText?: ((text: string) => void) | undefined;
  secureTextEntry?: boolean | undefined;
  value?: string;
  placeholder?: string;
  onBarcodeDetected?: (barcode: string) => void;
  hideBarCode?: boolean;
}

const AuthInputBox = (props: AuthInputBox) => {
  const {
    lable,
    keyboardType,
    onChangeText,
    secureTextEntry,
    value,
    placeholder,
    onBarcodeDetected,
    hideBarCode,
  } = props;
  return (
    <View style={styles.container}>
      <CustomText
        style={styles.labelStyle}
        allowFontScaling={false}
        accessibilityLabel={`authInputBox-${lable?.replace(" ", "")}`}
      >
        {lable}
      </CustomText>
      <View
        style={styles.inputContainer}
        accessible={true}
        removeClippedSubviews={true}
        accessibilityLabel={`authInputBox-${lable?.replace(" ", "")}-container`}
      >
        <TextInput
          keyboardType={keyboardType}
          contextMenuHidden={true}
          style={styles.inputStyle}
          secureTextEntry={secureTextEntry}
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          selectTextOnFocus={false}
          allowFontScaling={false}
          accessible={true}
          accessibilityLabel={`authInputBox-${lable?.replace(" ", "")}-input`}
        />
        {!hideBarCode && (
          <TouchableOpacity>
            {!secureTextEntry && (
              <ScannerButton
                idLabel={"email-address"}
                from="auth"
                onBarcodeDetected={onBarcodeDetected}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: hp(1),
  },
  labelStyle: {
    fontFamily: FONTFAMILY.averta_semibold,
    fontSize: FONTS.h1_7,
    marginBottom: hp(1),
    color: COLORS.abbey,
  },
  inputContainer: {
    borderColor: "#8F8F8F",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
  },
  inputStyle: {
    paddingVertical: wp(3),
    flex: 1,
    fontFamily: FONTFAMILY.averta_semibold,
    fontSize: FONTS.h1_7,
    color: COLORS.abbey,
  },
  scanIcon: {
    resizeMode: "contain",
    width: wp(5),
    height: wp(5),
    marginLeft: wp(3),
  },
});

export default AuthInputBox;
