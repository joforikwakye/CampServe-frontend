import React, { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Text,
} from "react-native";
import { Image } from "react-native-elements";

const CustomHeader = ({
  showMenuIcon = false,
  showBackIcon = false,
  OpenDrawer,
  GoBack,
  updateSearchQuery,
  screen,
}) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
  };

  useEffect(() => {
    const toValue = showSearchInput ? 1 : 0;

    Animated.timing(fadeAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showSearchInput]);

  const renderLeftIcon = () => {
    if (showMenuIcon) {
      return (
        <TouchableOpacity className="mr-4 " onPress={OpenDrawer}>
          <Ionicons name="menu" size={24} />
        </TouchableOpacity>
      );
    } else if (showBackIcon) {
      return (
        <TouchableOpacity className="mr-4 " onPress={GoBack}>
          <Ionicons name="arrow-left" size={24} />
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  const handleSearchQueryChange = (query) => {
    updateSearchQuery(screen, query);
  };

  const handleClearSearch = () => {
    toggleSearchInput();
    updateSearchQuery(screen, "");
  };

  const renderSearchInput = () => {
    return (
      <Animated.View
        className="rounded-lg px-4 py-1 bg-white border-b border-gray-200 focus:border-gray-400"
        style={{
          flexDirection: "row",
          alignItems: "center",
          opacity: fadeAnim,
          transform: [
            {
              translateX: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        }}
      >
        <TextInput
          style={{
            flex: 1,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: "#FFFFFF",
            marginRight: 8,
          }}
          placeholder="Search"
          onChangeText={handleSearchQueryChange}
        />
        <TouchableOpacity onPress={handleClearSearch}>
          <Ionicons name="close" size={24} color="gray" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const displaySearchIcon = typeof screen !== "undefined";
  const notification = !showBackIcon && showMenuIcon;

  return (
    <View className="flex-row items-center justify-between py-2 bg-white">
      {showSearchInput ? (
        renderSearchInput()
      ) : (
        <>
          {renderLeftIcon()}

          {notification && (
            <>
              <Image
                source={require("../../assets/CampServe.png")}
                className="w-24 h-7 rounded-full"
                resizeMode="contain"
              />
              {displaySearchIcon ? (
                <TouchableOpacity onPress={toggleSearchInput}>
                  <Ionicons name="search" size={24} />
                </TouchableOpacity>
              ) : (
                <View className="pl-6"></View>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
};

export default CustomHeader;
