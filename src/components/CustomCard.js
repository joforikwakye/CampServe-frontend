import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import { useState } from "react";

const CustomCard = ({
  image,
  businessName,
  bio,
  contactNumber,
  ratings,
  onPress,
}) => {
  const MAX_BIO_LENGTH = 25;

  const truncatedBio =
    bio.length > MAX_BIO_LENGTH ? `${bio.slice(0, MAX_BIO_LENGTH)}...` : bio;

  const truncatedbusinessName =
    businessName.length > MAX_BIO_LENGTH
      ? `${bio.slice(0, MAX_BIO_LENGTH)}...`
      : businessName;

  const [imageLoading, setImageLoading] = useState(false);
  const isNumber = typeof image === "number";
  const imageSource = isNumber ? image : { uri: `${image}` };

  const onLoad = () => {
    setImageLoading(false);
  };

  return (
    <TouchableOpacity
      className="flex flex-1 ml-[2px]"
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: "white",
        borderRadius: 8,
        margin: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        width: 250,
        height: 250,
      }}
    >
      <View className="flex-1 h-1/2">
        {imageLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="green" />
          </View>
        ) : (
          <Image
            source={imageSource}
            style={{
              flex: 1,
              width: "100%",
              height: undefined,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
            resizeMode="contain"
            onLoad={onLoad}
          />
        )}
      </View>
      <View className="flex-1 pb-4 px-4 h-1/2">
        <View className="flex-row gap-1" style={{ marginTop: 6 }}>
          <Ionicons
            name="business-outline"
            size={20}
            color="#0A4014"
            style={{ paddingTop: 2 }}
          />
          <Text
            className="capitalize"
            style={{ fontSize: 20, fontWeight: "bold" }}
          >
            {truncatedbusinessName}
          </Text>
        </View>

        <View className="flex-row gap-1" style={{ marginTop: 6 }}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#0A4014"
          />
          <Text className="capitalize pl-1" style={{ color: "gray" }}>
            {truncatedBio}
          </Text>
        </View>

        <View className="flex-row gap-1" style={{ marginTop: 6 }}>
          <Ionicons name="call-outline" size={18} color="#0A4014" />
          <Text className="pl-1" style={{ color: "gray" }}>
            {contactNumber}
          </Text>
        </View>

        <View className="flex-row gap-1" style={{ marginTop: 6 }}>
          <Ionicons name="star" size={18} color="gold" />
          <Text className="pl-1" style={{ color: "gray" }}>
            {ratings || "N/A"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CustomCard;
