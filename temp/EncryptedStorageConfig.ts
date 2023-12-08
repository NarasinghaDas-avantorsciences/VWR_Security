import EncryptedStorage from 'react-native-encrypted-storage';

export async function setItem(key: string, value: string) {
    await EncryptedStorage.setItem(key,value);
}

export async function getItem(key: string) {
  const val = await EncryptedStorage.getItem(key);
  try {
    if (val !== null || val !== "") {
      return val;
    } else {
      return false;
    }
  } catch (error) {
    console.log("error");
  }
}
export async function removeData(key: string) {
  try {
    await EncryptedStorage.removeItem(key);
    return true;
  } catch (exception) {
    return false;
  }
}
export async function clear() {
  try {
    EncryptedStorage.clear();
    return true;
  } catch (exception) {
    return false;
  }
}
